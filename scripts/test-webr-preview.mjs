import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import assert from "node:assert/strict";
import vm from "node:vm";
import { WebR } from "webr";

const packageRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const runtimeR = fs.readFileSync(path.join(packageRoot, "inst/app/assets/chartforge-r-runtime.R"), "utf8");
const runtimePack = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(packageRoot, "inst/app/assets/runtime-readable.json.gz"))).toString("utf8"));
const renderers = ["highcharts", "plotly", "d3", "vega", "observable", "chartjs", "echarts", "apexcharts", "googlecharts", "amcharts", "vchart", "anychart", "billboard"];
const ok = "__CHARTFORGE_WEBR_OK__";
const fail = "__CHARTFORGE_WEBR_ERROR__";
const rString = value => `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t")}"`;

let appSource = fs.readFileSync(path.join(packageRoot, "inst/app/assets/app.js"), "utf8");
const expose = `
  globalThis.__chartforgeWebRTest = { buildWebREvaluationCode };
`;
const insertionPoint = appSource.lastIndexOf("})();");
if (insertionPoint < 0) throw new Error("Could not instrument app.js.");
appSource = appSource.slice(0, insertionPoint) + expose + appSource.slice(insertionPoint);
const context = {
  console,
  document: { addEventListener() {} },
  window: {}, navigator: {},
  location: { hostname: "127.0.0.1", protocol: "http:", origin: "http://127.0.0.1" }
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(appSource, context, { filename: "app.js" });
const buildWebREvaluationCode = context.__chartforgeWebRTest.buildWebREvaluationCode;

const webR = new WebR();
await webR.init();
try {
  const loaded = await webR.evalRString(`tryCatch({\n${runtimeR}\n"OK"\n}, error=function(e) paste0("ERROR: ", conditionMessage(e)))`);
  assert.equal(loaded, "OK", loaded);

  for (const renderer of renderers) {
    const runtime = runtimePack?.[renderer]?.scatter;
    assert.equal(typeof runtime, "string", `Missing ${renderer} scatter runtime`);
    const emittedCode = `df <- data.frame(x=c(1.2,2.4,3.6), y=c(3.1,1.7,4.2), group=c("A","B","A"), stringsAsFactors=FALSE)\nchart_html <- cf_${renderer}_scatter(df, x="x", y="y", group="group", full_bundle=FALSE, embed=TRUE)`;
    const result = await webR.evalRString(buildWebREvaluationCode(runtime, emittedCode));
    assert.ok(result.startsWith(ok), `${renderer}: ${result}`);
    assert.match(result, /<script|<div/);
  }

  const brokenCode = `df <- data.frame(x=1:3)\nchart_html <- cf_plotly_scatter(df, x="missing", y="also_missing")`;
  const broken = await webR.evalRString(buildWebREvaluationCode(runtimePack.plotly.scatter, brokenCode));
  assert.ok(broken.startsWith(fail));
  assert.match(broken, /missing|column|mapping/i);

  const plotlyUrl = "https://cdn.jsdelivr.net/npm/plotly.js-dist-min@3.7.0/plotly.min.js";
  const overrideCode = `df <- data.frame(x=c(1.1,2.2,3.3),y=c(2.4,4.2,3.5))\nchart_html <- cf_plotly_scatter(df,x="x",y="y",full_bundle=TRUE,embed=TRUE)`;
  const resources = `chartforge.asset_text_override = setNames(list("window.__mockPlotly=true;"), ${rString(plotlyUrl)}),\n    chartforge.license_text_override = setNames(list("MIT License mock notice"), "plotly.js-3.7.0-LICENSE.txt")`;
  const override = await webR.evalRString(buildWebREvaluationCode(runtimePack.plotly.scatter, overrideCode, resources));
  assert.ok(override.startsWith(ok));
  assert.match(override, /window\.__mockPlotly=true/);
  assert.match(override, /MIT License mock notice/);
  const restored = await webR.evalRString(`as.character(identical(getOption("chartforge.runtime_override", NULL), NULL) && identical(getOption("chartforge.asset_text_override", NULL), NULL) && identical(getOption("chartforge.license_text_override", NULL), NULL))`);
  assert.equal(restored, "TRUE");

  console.log("WebR emitted-code preview regression test passed for all renderers.");
} finally {
  webR.close();
}
