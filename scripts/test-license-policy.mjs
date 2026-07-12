import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";

const packageRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const appPath = path.join(packageRoot, "inst/app/assets/app.js");
const metadata = JSON.parse(fs.readFileSync(path.join(packageRoot, "inst/app/assets/metadata.json"), "utf8"));
let source = fs.readFileSync(appPath, "utf8");
const expose = `
  globalThis.__chartforgePolicyTest = {
    assetsFor, buildAssetTags, rendererMeta,
    setMetadata(value) { metadata = value; }
  };
`;
const insertionPoint = source.lastIndexOf("})();");
if (insertionPoint < 0) throw new Error("Could not instrument app.js.");
source = source.slice(0, insertionPoint) + expose + source.slice(insertionPoint);

const fetched = [];
const context = {
  console,
  document: { addEventListener() {} },
  window: {}, navigator: {},
  location: { hostname: "127.0.0.1", protocol: "http:" },
  fetch: async url => {
    fetched.push(String(url));
    if (String(url).startsWith("licenses/")) {
      const filename = decodeURIComponent(String(url).slice("licenses/".length));
      const file = path.join(packageRoot, "inst/app/licenses", filename);
      return { ok: true, text: async () => fs.readFileSync(file, "utf8") };
    }
    return { ok: true, status: 200, statusText: "OK", text: async () => "window.__vendorMock=true;" };
  }
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(source, context, { filename: "app.js" });
const api = context.__chartforgePolicyTest;
api.setMetadata(metadata);

for (const renderer of ["highcharts", "apexcharts", "googlecharts", "anychart"]) {
  fetched.length = 0;
  const assets = api.assetsFor(renderer, "scatter", {});
  const html = await api.buildAssetTags(renderer, assets, true, false);
  assert.match(html, /intentionally kept this vendor library CDN-linked/);
  assert.ok(assets.scripts.every(url => html.includes(`<script src="${url}"></script>`)), renderer);
  assert.equal(fetched.length, 0, `${renderer} must not be fetched for inlining`);
}

fetched.length = 0;
const plotlyAssets = api.assetsFor("plotly", "scatter", {});
const plotlyHtml = await api.buildAssetTags("plotly", plotlyAssets, true, false);
assert.ok(!plotlyHtml.includes(`<script src="${plotlyAssets.scripts[0]}"></script>`));
assert.match(plotlyHtml, /data-chartforge-third-party-license="plotly"/);
assert.match(plotlyHtml, /MIT License/);
assert.ok(fetched.includes(plotlyAssets.scripts[0]));

fetched.length = 0;
const amChartsAssets = api.assetsFor("amcharts", "scatter", {});
const amChartsHtml = await api.buildAssetTags("amcharts", amChartsAssets, true, false);
assert.match(amChartsHtml, /data-chartforge-third-party-license="amcharts"/);
assert.match(amChartsHtml, /branding link/);
assert.ok(amChartsAssets.scripts.every(url => fetched.includes(url)));

console.log("Renderer licensing and delivery policy regression test passed.");
