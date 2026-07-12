import fs from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import assert from "node:assert/strict";
import vm from "node:vm";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const app = fs.readFileSync(path.join(root, "inst/app/assets/app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "inst/app/assets/app.css"), "utf8");
const html = fs.readFileSync(path.join(root, "inst/app/index.html"), "utf8");
const meta = JSON.parse(fs.readFileSync(path.join(root, "inst/app/assets/metadata.json"), "utf8"));
const readable = JSON.parse(gunzipSync(fs.readFileSync(path.join(root, "inst/app/assets/runtime-readable.json.gz"))).toString("utf8"));

assert.match(app, /Rendered with WebR\./);
assert.doesNotMatch(app, /Preview rendered from WebR output/);
assert.match(app, /width: 840,\s*height: 480/);
assert.match(css, /grid-template-columns:\s*minmax\(300px, 1fr\)\s*minmax\(0, 2fr\)/);
assert.match(html, /id="dpi" type="range" min="1" max="3" step="0\.05"/);
assert.match(html, /Applies only to Chart\.js/);
assert.ok(meta.styles.vega.controls.some(control => control.key === "x_ticks" && control.default === 7));
assert.match(readable.vega.scatter, /tickCount/);
assert.doesNotMatch(readable.plotly.scatter, /plotGlPixelRatio/);
assert.match(readable.chartjs.scatter, /devicePixelRatio/);
let capturedVegaSpec = null;
const context = { console, setTimeout, clearTimeout };
context.window = context;
context.vegaEmbed = (_target, specification) => { capturedVegaSpec = specification; return Promise.resolve({}); };
vm.createContext(context);
vm.runInContext(readable.vega.scatter, context);
await context.ChartForgeRender.render(
  [{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }],
  { library: "vega", type: "scatter", width: 840, height: 480, mappings: { x: "x", y: "y", group: "" }, rendererStyle: { x_ticks: 7, y_ticks: 6 }, palette: ["#3366cc"] },
  { style: {}, innerHTML: "" }
);
assert.equal(capturedVegaSpec.encoding.x.type, "quantitative");
assert.equal(capturedVegaSpec.encoding.x.axis.tickCount, 7);
assert.equal(capturedVegaSpec.encoding.y.axis.tickCount, 6);

console.log("UI, rendering-scale, and Vega-axis regressions passed.");
