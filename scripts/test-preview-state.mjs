import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const packageRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const app = fs.readFileSync(path.join(packageRoot, "inst/app/assets/app.js"), "utf8");
const plumber = fs.readFileSync(path.join(packageRoot, "inst/plumber/plumber.R"), "utf8");
const worker = fs.readFileSync(path.join(packageRoot, "inst/app/coi-serviceworker.js"), "utf8");

function functionBody(source, name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.ok(start >= 0, `Missing function ${name}`);
  const openParen = source.indexOf("(", start);
  let parenDepth = 0;
  let quote = "";
  let escaped = false;
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
    if (char === "(") parenDepth += 1;
    else if (char === ")") {
      parenDepth -= 1;
      if (parenDepth === 0) { brace = source.indexOf("{", i + 1); break; }
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

const localRun = functionBody(app, "runLocalPreview");
const webRRun = functionBody(app, "runWebRPreview");
const sessionApply = functionBody(app, "applyLocalSessionPayload");
const sessionDetect = functionBody(app, "detectLocalSession");
const localSchedule = functionBody(app, "scheduleLocalPreview");
const webRSchedule = functionBody(app, "scheduleWebRPreview");
const getWebR = functionBody(app, "getWebR");

assert.doesNotMatch(localRun, /detectLocalSession\s*\(/, "A successful local render must not refresh the R session");
assert.doesNotMatch(sessionApply, /scheduleLocalPreview\s*\(/, "Applying connection metadata must not schedule a render");
assert.match(sessionDetect, /requestPreview\s*&&[\s\S]*scheduleLocalPreview\s*\(/, "Session discovery may render only when explicitly requested");
assert.match(localRun, /localPreviewInFlight/);
assert.match(localRun, /lastLocalPreviewKey/);
assert.match(localRun, /requestKey\s*!==\s*previewRequestKey\(\)/);
assert.match(localSchedule, /key\s*===\s*lastLocalPreviewKey/);
assert.match(webRRun, /webRPreviewInFlight/);
assert.match(webRSchedule, /key\s*===\s*lastWebRPreviewKey/);
assert.match(webRRun, /evalRString\s*\(/, "WebR output should be returned as a raw JS string");
assert.match(webRRun, /WEBR_ERROR_MARKER/);
assert.match(webRRun, /describeWebRError/);
assert.match(getWebR, /ChannelType\.PostMessage/);
assert.match(getWebR, /for \(const source of WEBR_SOURCES\)/, "WebR startup should try every configured source");
assert.match(getWebR, /failures\.push/, "WebR startup should preserve per-source failures");
assert.match(app, /https:\/\/webr\.r-wasm\.org\/v\$\{WEBR_VERSION\}\/webr\.mjs/, "The official fixed-version WebR URL requires a v prefix");
assert.match(app, /https:\/\/cdn\.jsdelivr\.net\/npm\/webr@\$\{WEBR_VERSION\}\/dist\/webr\.mjs/, "A jsDelivr WebR fallback is required");
assert.match(app, /https:\/\/unpkg\.com\/webr@\$\{WEBR_VERSION\}\/dist\/webr\.mjs/, "An UNPKG WebR fallback is required");
assert.doesNotMatch(app, /https:\/\/webr\.r-wasm\.org\/0\.6\.0\/webr\.mjs/, "The invalid unprefixed WebR release path must not return");
assert.match(app, /retireLegacyCoiServiceWorker/);
assert.doesNotMatch(plumber, /Cross-Origin-Embedder-Policy|Cross-Origin-Opener-Policy/);
assert.match(worker, /registration\.unregister\(\)/);

console.log("Preview lifecycle and WebR integration regression test passed.");
