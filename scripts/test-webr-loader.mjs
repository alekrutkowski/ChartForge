import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = fs.readFileSync(path.join(root, "inst/app/assets/app.js"), "utf8");

function functionBody(source, name) {
  const marker = `${name}(`;
  const start = source.indexOf(`function ${marker}`);
  assert.ok(start >= 0, `Missing function ${name}`);
  const openParen = source.indexOf("(", start);
  let quote = "";
  let escaped = false;
  let parens = 0;
  let brace = -1;
  for (let i = openParen; i < source.length; i += 1) {
    const char = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'" || char === "`") { quote = char; continue; }
    if (char === "(") parens += 1;
    else if (char === ")") {
      parens -= 1;
      if (parens === 0) { brace = source.indexOf("{", i + 1); break; }
    }
  }
  assert.ok(brace >= 0, `Missing body for ${name}`);
  let depth = 0;
  quote = "";
  escaped = false;
  for (let i = brace; i < source.length; i += 1) {
    const char = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'" || char === "`") { quote = char; continue; }
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(brace + 1, i);
    }
  }
  throw new Error(`Could not extract ${name}`);
}

const getWebRBody = functionBody(app, "getWebR");

function makeHarness({ sources, importer }) {
  const factory = new Function("sources", "importer", `
    "use strict";
    const WEBR_VERSION = "0.6.0";
    const WEBR_SOURCES = sources;
    const importWebRModule = importer;
    const setPreviewStatus = () => {};
    const promiseWithTimeout = promise => promise;
    let webR = null;
    let webRInitPromise = null;
    let webRModule = null;
    let webRSource = null;
    let webRReady = false;
    async function getWebR() {${getWebRBody}}
    return {
      getWebR,
      state: () => ({ webR, webRModule, webRSource, webRReady, webRInitPromise })
    };
  `);
  return factory(sources, importer);
}

const sources = [
  { label: "official", moduleUrl: "mock://official", baseUrl: "mock://official/" },
  { label: "jsDelivr", moduleUrl: "mock://jsdelivr", baseUrl: "mock://jsdelivr/" },
  { label: "UNPKG", moduleUrl: "mock://unpkg", baseUrl: "mock://unpkg/" }
];

{
  const attempts = [];
  const instances = [];
  class FakeWebR {
    constructor(options) { this.options = options; instances.push(this); }
    async init() {}
    close() { this.closed = true; }
  }
  const harness = makeHarness({
    sources,
    importer: async url => {
      attempts.push(url);
      if (url === "mock://official") throw new Error("official module unavailable");
      return { WebR: FakeWebR, ChannelType: { PostMessage: 3 } };
    }
  });
  const instance = await harness.getWebR();
  assert.deepEqual(attempts, ["mock://official", "mock://jsdelivr"]);
  assert.equal(instance, instances[0]);
  assert.equal(instance.options.baseUrl, "mock://jsdelivr/");
  assert.equal(instance.options.channelType, 3);
  assert.equal(harness.state().webRSource.label, "jsDelivr");
}

{
  const attempts = [];
  class ConstructorFailure { constructor() { throw new Error("constructor failed"); } }
  class WorkingWebR { constructor(options) { this.options = options; } async init() {} close() {} }
  const harness = makeHarness({
    sources,
    importer: async url => {
      attempts.push(url);
      return url === "mock://official"
        ? { WebR: ConstructorFailure, ChannelType: { PostMessage: 3 } }
        : { WebR: WorkingWebR, ChannelType: { PostMessage: 3 } };
    }
  });
  const instance = await harness.getWebR();
  assert.deepEqual(attempts, ["mock://official", "mock://jsdelivr"], "A constructor failure must fall through to the next source");
  assert.equal(instance.options.baseUrl, "mock://jsdelivr/");
}

{
  const harness = makeHarness({
    sources,
    importer: async () => { throw new Error("blocked"); }
  });
  await assert.rejects(
    harness.getWebR(),
    error => {
      assert.match(error.message, /could not start WebR 0\.6\.0/i);
      assert.match(error.message, /official module: blocked/);
      assert.match(error.message, /jsDelivr module: blocked/);
      assert.match(error.message, /UNPKG module: blocked/);
      return true;
    }
  );
  assert.equal(harness.state().webR, null);
  assert.equal(harness.state().webRInitPromise, null);
}

console.log("WebR source failover regression test passed.");
