import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "acorn";
import { minify } from "terser";
import { gzipSync, gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";

const packageRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const sourcePath = path.join(packageRoot, "scripts/export-runtime.js");
const assetsRoot = path.join(packageRoot, "inst/app/assets");
const renderers = [
  "highcharts", "plotly", "d3", "vega", "observable", "chartjs",
  "echarts", "apexcharts", "googlecharts", "amcharts", "vchart",
  "anychart", "billboard"
];
const chartTypes = [
  "scatter", "line", "spline", "step", "bar", "stacked_bar",
  "area", "stacked_area", "histogram", "density", "pie", "donut",
  "bubble", "boxplot", "heatmap", "treemap", "lollipop"
];
const rendererFunctions = {
  highcharts: "renderHighcharts",
  plotly: "renderPlotly",
  d3: "renderD3",
  vega: "renderVega",
  observable: "renderObservable",
  chartjs: "renderChartJs",
  echarts: "renderECharts",
  apexcharts: "renderApexCharts",
  googlecharts: "renderGoogleCharts",
  amcharts: "renderAmCharts",
  vchart: "renderVChart",
  anychart: "renderAnyChart",
  billboard: "renderBillboard"
};

const rendererOption = process.argv.find(arg => arg.startsWith("--renderer="));
const requestedRenderers = rendererOption
  ? rendererOption.slice("--renderer=".length).split(",").map(value => value.trim()).filter(Boolean)
  : renderers;
for (const renderer of requestedRenderers) {
  if (!renderers.includes(renderer)) throw new Error(`Unknown renderer requested: ${renderer}`);
}
const buildRenderers = [...new Set(requestedRenderers)];

const source = await fs.readFile(sourcePath, "utf8");
const ast = parse(source, { ecmaVersion: "latest", sourceType: "script" });
const iife = ast.body[0]?.expression?.callee;
if (!iife || !iife.body || !Array.isArray(iife.body.body)) throw new Error("Could not locate the ChartForge runtime IIFE.");
const topLevel = iife.body.body;
const functions = new Map();
for (const node of topLevel) if (node.type === "FunctionDeclaration") functions.set(node.id.name, node);
const functionNames = new Set(functions.keys());

function referencedFunctions(node, out = new Set()) {
  if (!node || typeof node !== "object") return out;
  if (node.type === "Identifier" && functionNames.has(node.name)) out.add(node.name);
  for (const [key, value] of Object.entries(node)) {
    if (["start", "end", "loc"].includes(key)) continue;
    if (Array.isArray(value)) value.forEach(child => referencedFunctions(child, out));
    else if (value && typeof value === "object") referencedFunctions(value, out);
  }
  return out;
}
const dependencies = new Map([...functions].map(([name, node]) => [name, referencedFunctions(node)]));

const constantSource = topLevel
  .filter(node => node.type === "VariableDeclaration" && node.kind === "const" &&
    !node.declarations.some(declaration => ["BUILD_RENDERER", "BUILD_CHART_TYPE"].includes(declaration.id?.name)))
  .map(node => source.slice(node.start, node.end))
  .join("\n");

function dependencyClosure(roots) {
  const included = new Set();
  const stack = roots.slice();
  while (stack.length) {
    const name = stack.pop();
    if (included.has(name) || !functions.has(name)) continue;
    included.add(name);
    for (const dep of dependencies.get(name) || []) if (dep !== name) stack.push(dep);
  }
  return included;
}

function specializedSource(renderer, chartType) {
  const rendererFunction = rendererFunctions[renderer];
  const included = dependencyClosure([
    rendererFunction, "ensureTarget", "sortRows", "applySize", "fail", "byId"
  ]);
  const functionSource = topLevel
    .filter(node => node.type === "FunctionDeclaration" && included.has(node.id.name))
    .map(node => source.slice(node.start, node.end))
    .join("\n");
  const built = `(function(global){\n\"use strict\";\nconst BUILD_RENDERER=${JSON.stringify(renderer)};\nconst BUILD_CHART_TYPE=${JSON.stringify(chartType)};\n${constantSource}\n${functionSource}\nasync function render(data,spec,target){\n  const el=ensureTarget(target);\n  if(!el)return;\n  const rows=sortRows(data,spec);\n  applySize(el,spec);\n  try{return ${rendererFunction}(el,rows,spec);}\n  catch(err){fail(el,err&&err.message?err.message:String(err),err&&err.stack?err.stack:\"\");}\n}\nfunction renderFromScripts(dataId=\"cf-data\",specId=\"cf-spec\",target=\"chart\"){\n  const dataEl=byId(dataId),specEl=byId(specId);\n  const data=JSON.parse(dataEl?dataEl.textContent:\"[]\");\n  const spec=JSON.parse(specEl?specEl.textContent:\"{}\");\n  return render(data,spec,target);\n}\nglobal.ChartForgeRender={render,renderFromScripts};\n})(window);`;
  const typeLiteral = JSON.stringify(chartType);
  const pie = chartType === "pie" || chartType === "donut";
  const bar = ["bar", "stacked_bar", "lollipop"].includes(chartType);
  const line = ["line", "spline", "step"].includes(chartType);
  const area = chartType === "area" || chartType === "stacked_area";
  return built
    .replace(/(?<!function )chartType\(spec\)/g, typeLiteral)
    .replace(/(?<!function )isPieType\(type\)/g, String(pie))
    .replace(/(?<!function )isBarType\(type\)/g, String(bar))
    .replace(/(?<!function )isLineType\(type\)/g, String(line))
    .replace(/(?<!function )isAreaType\(type\)/g, String(area));
}

const readableOptions = {
  compress: {
    arrows: true,
    booleans: false,
    collapse_vars: true,
    comparisons: true,
    conditionals: true,
    dead_code: true,
    evaluate: true,
    hoist_funs: true,
    if_return: true,
    inline: 3,
    join_vars: true,
    passes: 2,
    properties: true,
    reduce_funcs: true,
    reduce_vars: true,
    sequences: true,
    side_effects: true,
    switches: true,
    toplevel: true,
    typeofs: true,
    unused: true
  },
  mangle: false,
  ecma: 2020,
  format: { beautify: true, comments: false, indent_level: 2, quote_style: 2, semicolons: true }
};
const compactOptions = {
  compress: false,
  mangle: { toplevel: true },
  ecma: 2020,
  format: { beautify: false, comments: false, semicolons: false, wrap_iife: false }
};

async function existingPack(mode) {
  if (buildRenderers.length === renderers.length) return {};
  try {
    const compressed = await fs.readFile(path.join(assetsRoot, `runtime-${mode}.json.gz`));
    return JSON.parse(gunzipSync(compressed).toString("utf8"));
  } catch {
    throw new Error(`A focused rebuild requires an existing runtime-${mode}.json.gz pack. Run a full build first.`);
  }
}

const readablePack = await existingPack("readable");
const minifiedPack = await existingPack("minified");
let count = 0;
for (const renderer of buildRenderers) {
  readablePack[renderer] = {};
  minifiedPack[renderer] = {};
  for (const chartType of chartTypes) {
    const readable = await minify(specializedSource(renderer, chartType), readableOptions);
    if (!readable.code) throw new Error(`Empty readable runtime for ${renderer}/${chartType}`);
    const compact = await minify(readable.code, compactOptions);
    if (!compact.code) throw new Error(`Empty minified runtime for ${renderer}/${chartType}`);
    readablePack[renderer][chartType] = readable.code;
    minifiedPack[renderer][chartType] = compact.code;
    count += 2;
  }
  console.log(`Built ${renderer}.`);
}

for (const renderer of renderers) {
  for (const chartType of chartTypes) {
    if (typeof readablePack?.[renderer]?.[chartType] !== "string") throw new Error(`Missing readable runtime for ${renderer}/${chartType}`);
    if (typeof minifiedPack?.[renderer]?.[chartType] !== "string") throw new Error(`Missing minified runtime for ${renderer}/${chartType}`);
  }
}

await fs.rm(path.join(assetsRoot, "runtime"), { recursive: true, force: true });
const manifest = { format: 1, renderers, chart_types: chartTypes, entries: {} };
for (const [mode, pack] of [["readable", readablePack], ["minified", minifiedPack]]) {
  const raw = Buffer.from(JSON.stringify(pack), "utf8");
  const compressed = gzipSync(raw, { level: 9, mtime: 0 });
  const filename = `runtime-${mode}.json.gz`;
  await fs.writeFile(path.join(assetsRoot, filename), compressed);
  manifest.entries[mode] = {
    file: filename,
    uncompressed_bytes: raw.length,
    compressed_bytes: compressed.length,
    sha256: createHash("sha256").update(compressed).digest("hex")
  };
}
await fs.writeFile(path.join(assetsRoot, "runtime-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Built ${count} specialized runtimes for ${buildRenderers.join(", ")} in two compressed packs.`);
