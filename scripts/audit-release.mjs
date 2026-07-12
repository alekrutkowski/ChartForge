import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const notes = [];
const fail = message => failures.push(message);
const assert = (condition, message) => { if (!condition) fail(message); };
const rel = file => path.relative(root, file).replaceAll(path.sep, "/");
const sha256 = data => crypto.createHash("sha256").update(data).digest("hex");

function assertNoDuplicateJsonKeys(text, label) {
  let index = 0;
  const skipWhitespace = () => { while (/\s/.test(text[index] || "")) index += 1; };
  const parseString = () => {
    const start = index;
    index += 1;
    let escaped = false;
    while (index < text.length) {
      const char = text[index++];
      if (escaped) { escaped = false; continue; }
      if (char === "\\") { escaped = true; continue; }
      if (char === '"') return JSON.parse(text.slice(start, index));
    }
    throw new Error("Unterminated JSON string");
  };
  const parseValue = pathParts => {
    skipWhitespace();
    const char = text[index];
    if (char === "{") return parseObject(pathParts);
    if (char === "[") return parseArray(pathParts);
    if (char === '"') { parseString(); return; }
    const token = /^(?:-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)/.exec(text.slice(index));
    if (!token) throw new Error(`Unexpected token at byte ${index}`);
    index += token[0].length;
  };
  const parseObject = pathParts => {
    index += 1;
    skipWhitespace();
    const keys = new Set();
    if (text[index] === "}") { index += 1; return; }
    while (index < text.length) {
      skipWhitespace();
      if (text[index] !== '"') throw new Error(`Expected object key at byte ${index}`);
      const key = parseString();
      const pathLabel = [...pathParts, key].join(".") || key;
      if (keys.has(key)) fail(`Duplicate JSON key '${key}' at ${pathLabel} in ${label}`);
      keys.add(key);
      skipWhitespace();
      if (text[index++] !== ":") throw new Error(`Expected ':' after object key at byte ${index - 1}`);
      parseValue([...pathParts, key]);
      skipWhitespace();
      const separator = text[index++];
      if (separator === "}") return;
      if (separator !== ",") throw new Error(`Expected ',' or '}' at byte ${index - 1}`);
    }
    throw new Error("Unterminated JSON object");
  };
  const parseArray = pathParts => {
    index += 1;
    skipWhitespace();
    if (text[index] === "]") { index += 1; return; }
    let item = 0;
    while (index < text.length) {
      parseValue([...pathParts, String(item++)]);
      skipWhitespace();
      const separator = text[index++];
      if (separator === "]") return;
      if (separator !== ",") throw new Error(`Expected ',' or ']' at byte ${index - 1}`);
    }
    throw new Error("Unterminated JSON array");
  };
  try {
    parseValue([]);
    skipWhitespace();
    if (index !== text.length) throw new Error(`Unexpected trailing content at byte ${index}`);
  } catch (error) {
    fail(`Could not inspect JSON keys in ${label}: ${error.message}`);
  }
}

const readJson = file => {
  const text = fs.readFileSync(file, "utf8");
  try {
    const value = JSON.parse(text);
    assertNoDuplicateJsonKeys(text, rel(file));
    return value;
  } catch (error) {
    fail(`Invalid JSON in ${rel(file)}: ${error.message}`);
    return null;
  }
};

function walk(directory) {
  const out = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      fail(`Symbolic links are not allowed in a release repository: ${rel(file)}`);
      continue;
    }
    if (entry.isDirectory()) out.push(...walk(file));
    else if (entry.isFile()) out.push(file);
  }
  return out;
}

assert(fs.existsSync(path.join(root, "LICENSE.md")), "Repository root must contain LICENSE.md.");
for (const duplicate of ["LICENSE", "LICENCE", "LICENCE.md"]) {
  assert(!fs.existsSync(path.join(root, duplicate)), `Remove duplicate root licence file ${duplicate}; retain LICENSE.md only.`);
}
const attributes = fs.readFileSync(path.join(root, ".gitattributes"), "utf8");
assert(/^inst\/app\/licenses\/\*\*\s+-text\s*$/m.test(attributes), ".gitattributes must preserve upstream third-party licence bytes with inst/app/licenses/** -text.");
const gitignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");
assert(/(?:^|\n)node_modules\/(?:\n|$)/.test(gitignore), ".gitignore must exclude node_modules/.");
const trackedNodeModules = spawnSync("git", ["-C", root, "ls-files", "-z", "--", "node_modules"], { encoding: "utf8" });
if (trackedNodeModules.status === 0) assert(!trackedNodeModules.stdout, "node_modules/ contains files tracked by Git.");
assert(!fs.existsSync(path.join(root, "docs")), "Generated docs/ duplicates must not be committed; GitHub Pages deploys inst/app directly.");
const ownLicence = fs.readFileSync(path.join(root, "LICENSE.md"), "utf8");
assert(/^MIT License\s*$/m.test(ownLicence), "LICENSE.md must contain the MIT License heading.");
assert(/Copyright \(c\) 2026 Alek Rutkowski/.test(ownLicence), "LICENSE.md must identify the ChartForge copyright holder.");
assert(!/[<\[](?:year|fullname|copyright holder)[>\]]/i.test(ownLicence), "LICENSE.md contains an unfilled licence placeholder.");

const files = walk(root);
const lowerCasePaths = new Map();
const invalidWindowsNames = /[<>:"|?*]/;
const reservedWindowsNames = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i;
for (const file of files) {
  const relative = rel(file);
  const folded = relative.toLowerCase();
  if (lowerCasePaths.has(folded) && lowerCasePaths.get(folded) !== relative) {
    fail(`Case-insensitive path collision: ${lowerCasePaths.get(folded)} and ${relative}`);
  } else {
    lowerCasePaths.set(folded, relative);
  }
  for (const segment of relative.split("/")) {
    assert(!invalidWindowsNames.test(segment), `Windows-incompatible path component '${segment}' in ${relative}`);
    assert(!reservedWindowsNames.test(segment), `Windows-reserved path component '${segment}' in ${relative}`);
    assert(!/[. ]$/.test(segment), `Path component ends in a dot or space: ${relative}`);
  }
}
const textNames = new Set(["DESCRIPTION", "NAMESPACE", ".gitignore", ".Rbuildignore", ".npmrc"]);
const textExtensions = new Set([".r", ".rd", ".md", ".json", ".js", ".mjs", ".css", ".html", ".yml", ".yaml", ".txt", ".csv", ".svg"]);
const forbiddenText = [
  ["applied", "caas", "gateway"].join("-"),
  ["internal", "api", "openai", "org"].join("."),
  ["/mnt", "data"].join("/"),
  ["/home", "oai"].join("/"),
  ["sandbox", ":/"].join(""),
  ["utm_source", "chatgpt.com"].join("="),
  ["myfiles", "browser"].join("_")
];
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{40,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bsk-[A-Za-z0-9]{32,}\b/
];

for (const file of files) {
  const name = path.basename(file);
  const relative = rel(file);
  assert(name === name.trim(), `File name has leading or trailing whitespace: ${relative}`);
  const stat = fs.statSync(file);
  assert(stat.size <= 5 * 1024 * 1024, `Unexpected file larger than 5 MiB: ${relative} (${stat.size} bytes)`);
  const extension = path.extname(name).toLowerCase();
  if (!textNames.has(name) && !textExtensions.has(extension)) continue;
  const buffer = fs.readFileSync(file);
  assert(!buffer.includes(0), `NUL byte found in text file ${relative}`);
  const text = buffer.toString("utf8");
  assert(!text.includes("\uFFFD"), `Invalid UTF-8 detected in ${relative}`);
  for (const marker of forbiddenText) {
    if (text.toLowerCase().includes(marker.toLowerCase())) fail(`Private build marker '${marker}' found in ${relative}`);
  }
  for (const pattern of secretPatterns) {
    if (pattern.test(text)) fail(`Possible secret matching ${pattern} found in ${relative}`);
  }
}

for (const file of files.filter(file => path.extname(file).toLowerCase() === ".json")) readJson(file);

const description = fs.readFileSync(path.join(root, "DESCRIPTION"), "utf8");
const version = /^Version:\s*(\S+)/m.exec(description)?.[1];
assert(version === "0.6.6", `DESCRIPTION Version must be 0.6.6, found ${version || "nothing"}.`);
assert(/^License:\s*MIT\s*$/m.test(description), "DESCRIPTION must use the standardized 'License: MIT' value.");
assert(!/^License:.*file\s+(?:LICENSE|LICENCE)/m.test(description), "DESCRIPTION must not refer to the removed plain licence file.");

const packageJson = readJson(path.join(root, "package.json"));
const packageLock = readJson(path.join(root, "package-lock.json"));
if (packageJson) {
  assert(packageJson.private === true, "package.json must retain private=true to prevent accidental npm publication.");
  assert(packageJson.version === version, "package.json version must match DESCRIPTION.");
  assert(packageJson.license === "MIT", "package.json licence must be MIT.");
  assert(packageJson.scripts?.["audit:release"] === "node scripts/audit-release.mjs", "package.json must expose audit:release.");
  assert(typeof packageJson.scripts?.test === "string" && packageJson.scripts.test.includes("test:webr-loader"), "package.json test script must include WebR failover coverage.");
}
if (packageLock) {
  assert(packageLock.name === packageJson?.name, "package-lock.json name must match package.json.");
  assert(packageLock.version === version, "package-lock.json version must match DESCRIPTION.");
  assert(packageLock.packages?.[""]?.version === version, "package-lock.json root package version must match DESCRIPTION.");
  assert(packageLock.packages?.[""]?.license === "MIT", "package-lock.json root package licence must be MIT.");
  assert(packageLock.lockfileVersion === 3, "package-lock.json must use lockfileVersion 3.");
  const lockedRoot = packageLock.packages?.[""] || {};
  assert(lockedRoot.version === version, "package-lock root version must match DESCRIPTION.");
  assert(JSON.stringify(lockedRoot.devDependencies || {}) === JSON.stringify(packageJson?.devDependencies || {}), "package-lock root devDependencies must exactly match package.json.");
  for (const [key, record] of Object.entries(packageLock.packages || {})) {
    if (!record || typeof record.resolved !== "string") continue;
    let url;
    try { url = new URL(record.resolved); }
    catch { fail(`Invalid resolved URL in package-lock.json for ${key}: ${record.resolved}`); continue; }
    assert(url.protocol === "https:", `Non-HTTPS package-lock URL for ${key}: ${record.resolved}`);
    assert(url.hostname === "registry.npmjs.org", `Non-public npm registry URL for ${key}: ${record.resolved}`);
  }
}
assert(fs.readFileSync(path.join(root, ".npmrc"), "utf8").includes("registry=https://registry.npmjs.org/"), ".npmrc must pin the public npm registry.");

const metadata = readJson(path.join(root, "inst/app/assets/metadata.json"));
if (metadata) {
  assert(metadata.chartforge_version === version, "metadata.json chartforge_version must match DESCRIPTION.");
  assert(metadata.license_audit_date === "2026-07-11", "metadata.json licence audit date is stale.");
  const webR = (metadata.runtime_dependencies || []).find(item => item.id === "webr");
  assert(Boolean(webR), "metadata.json must contain the webR runtime dependency.");
  assert(webR?.source_url === "https://webr.r-wasm.org/v0.6.0/webr.mjs", "metadata.json must use the official versioned webR URL.");
  assert(Array.isArray(webR?.source_urls) && webR.source_urls.length === 3, "metadata.json must describe exactly three WebR module URLs.");
  assert(webR?.source_urls?.[1] === "https://cdn.jsdelivr.net/npm/webr@0.6.0/dist/webr.mjs", "metadata.json has the wrong jsDelivr WebR module URL.");
  assert(webR?.source_urls?.[2] === "https://unpkg.com/webr@0.6.0/dist/webr.mjs", "metadata.json has the wrong UNPKG WebR module URL.");
}

const appSource = fs.readFileSync(path.join(root, "inst/app/assets/app.js"), "utf8");
for (const required of [
  "https://webr.r-wasm.org/v${WEBR_VERSION}/webr.mjs",
  "https://cdn.jsdelivr.net/npm/webr@${WEBR_VERSION}/dist/webr.mjs",
  "https://unpkg.com/webr@${WEBR_VERSION}/dist/webr.mjs",
  "ChannelType.PostMessage"
]) assert(appSource.includes(required), `app.js is missing required WebR fallback token: ${required}`);
assert(!appSource.includes("https://webr.r-wasm.org/0.6.0/"), "app.js contains the invalid unprefixed WebR release path.");

const manifestPath = path.join(root, "inst/app/assets/runtime-manifest.json");
const manifest = readJson(manifestPath);
if (manifest) {
  for (const mode of ["readable", "minified"]) {
    const entry = manifest.entries?.[mode];
    assert(Boolean(entry), `runtime-manifest.json is missing ${mode}.`);
    if (!entry) continue;
    const packedPath = path.join(path.dirname(manifestPath), entry.file);
    assert(fs.existsSync(packedPath), `Missing runtime pack ${entry.file}.`);
    if (!fs.existsSync(packedPath)) continue;
    const packed = fs.readFileSync(packedPath);
    assert(packed.length === entry.compressed_bytes, `${entry.file} compressed byte count does not match the manifest.`);
    assert(sha256(packed) === entry.sha256, `${entry.file} SHA-256 does not match the manifest.`);
    let unpacked;
    try { unpacked = zlib.gunzipSync(packed); }
    catch (error) { fail(`Could not decompress ${entry.file}: ${error.message}`); continue; }
    assert(unpacked.length === entry.uncompressed_bytes, `${entry.file} uncompressed byte count does not match the manifest.`);
    let pack;
    const unpackedText = unpacked.toString("utf8");
    try {
      pack = JSON.parse(unpackedText);
      assertNoDuplicateJsonKeys(unpackedText, entry.file);
    } catch (error) { fail(`Invalid JSON inside ${entry.file}: ${error.message}`); continue; }
    for (const renderer of manifest.renderers || []) {
      for (const chartType of manifest.chart_types || []) {
        assert(typeof pack?.[renderer]?.[chartType] === "string", `${entry.file} is missing ${renderer}/${chartType}.`);
      }
    }
  }
}

if (metadata) {
  const licenceDirectory = path.join(root, "inst/app/licenses");
  for (const artifact of metadata.notice_artifacts || []) {
    const file = path.join(licenceDirectory, artifact.filename);
    assert(fs.existsSync(file), `Missing third-party notice file ${artifact.filename}.`);
    if (fs.existsSync(file)) assert(sha256(fs.readFileSync(file)) === artifact.sha256, `Notice hash mismatch for ${artifact.filename}.`);
  }
}

const workflowFiles = files.filter(file => /\.github\/workflows\/.*\.ya?ml$/i.test(rel(file)));
for (const workflow of workflowFiles) {
  const text = fs.readFileSync(workflow, "utf8");
  for (const match of text.matchAll(/(?:node|npm run)\s+([A-Za-z0-9:._/-]+)/g)) {
    const target = match[1];
    if (match[0].startsWith("node ")) assert(fs.existsSync(path.join(root, target)), `Workflow ${rel(workflow)} references missing script ${target}.`);
    if (match[0].startsWith("npm run ")) assert(Boolean(packageJson?.scripts?.[target]), `Workflow ${rel(workflow)} references missing npm script ${target}.`);
  }
}

const rootNotices = fs.readFileSync(path.join(root, "THIRD_PARTY_NOTICES.md"));
const appNotices = fs.readFileSync(path.join(root, "inst/app/THIRD_PARTY_NOTICES.md"));
assert(rootNotices.equals(appNotices), "Root and installed THIRD_PARTY_NOTICES.md copies differ.");

const pagesWorkflow = fs.readFileSync(path.join(root, ".github/workflows/pages.yml"), "utf8");
const qualityWorkflow = fs.readFileSync(path.join(root, ".github/workflows/quality.yml"), "utf8");
for (const token of ["actions/checkout@v7.0.0", "actions/setup-node@v6.4.0", "actions/configure-pages@v6.0.0", "actions/upload-pages-artifact@v5.0.0", "actions/deploy-pages@v5.0.0", "node-version: 24"]) {
  assert(pagesWorkflow.includes(token), `Pages workflow is missing current action token: ${token}`);
}
for (const token of ["actions/checkout@v7.0.0", "actions/setup-node@v6.4.0", "node-version: 24", "npm ci --ignore-scripts", "npm test"]) {
  assert(qualityWorkflow.includes(token), `Quality workflow is missing required token: ${token}`);
}

for (const file of files.filter(file => [".js", ".mjs"].includes(path.extname(file).toLowerCase()))) {
  const check = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (check.status !== 0) fail(`JavaScript syntax check failed for ${rel(file)}: ${(check.stderr || check.stdout).trim()}`);
}

if (failures.length) {
  console.error(`Release audit failed with ${failures.length} issue${failures.length === 1 ? "" : "s"}:`);
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

notes.push(`${files.length} repository files inspected`);
notes.push("all JSON parsed without duplicate keys and compressed runtime packs verified");
notes.push("third-party notice hashes verified");
notes.push("public npm registry lockfile verified");
notes.push("no private build paths or common secret signatures found");
console.log(`ChartForge ${version} release audit passed: ${notes.join("; ")}.`);
