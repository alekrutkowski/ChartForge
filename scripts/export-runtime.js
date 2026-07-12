(function (global) {
  "use strict";

  const BUILD_RENDERER = null;
  const BUILD_CHART_TYPE = null;
  const DEFAULT_PALETTE = ["#5B8DEF", "#14B8A6", "#F97316", "#A855F7", "#EF4444", "#84CC16", "#06B6D4", "#F59E0B"];
  const SVG_NS = "http://www.w3.org/2000/svg";
  const RICH_TYPES = new Set(["boxplot", "heatmap", "treemap"]);
  const SCRIPT_LOADS = new Map();

  function loadScriptOnce(src) {
    if (SCRIPT_LOADS.has(src)) return SCRIPT_LOADS.get(src);
    const p = new Promise((resolve, reject) => {
      const existing = Array.from(document.scripts).find(s => s.src === src);
      if (existing && existing.dataset.loaded === "true") return resolve();
      const node = existing || document.createElement("script");
      node.src = src;
      node.onload = () => { node.dataset.loaded = "true"; resolve(); };
      node.onerror = () => reject(new Error(`Could not load ${src}`));
      if (!existing) document.head.appendChild(node);
    });
    SCRIPT_LOADS.set(src, p);
    return p;
  }

  function byId(id) { return document.getElementById(id); }
  function asRows(data) { return Array.isArray(data) ? data : []; }
  function sortRows(data, spec) {
    const rows = asRows(data);
    const rawKeys = spec?.mappings?.sortBy;
    const keys = (Array.isArray(rawKeys) ? rawKeys : (rawKeys ? [rawKeys] : [])).filter(Boolean);
    if (!keys.length || rows.length < 2) return rows;
    const rawDesc = Array.isArray(spec?.sortDesc) ? spec.sortDesc : [Boolean(spec?.sortDesc)];
    const compareValue = (a, b) => {
      const aMissing = isMissing(a), bMissing = isMissing(b);
      if (aMissing || bMissing) return aMissing === bMissing ? 0 : aMissing ? 1 : -1;
      const an = toNumber(a), bn = toNumber(b);
      if (an !== null && bn !== null) return an === bn ? 0 : an < bn ? -1 : 1;
      const at = typeof a === "string" ? Date.parse(a) : NaN;
      const bt = typeof b === "string" ? Date.parse(b) : NaN;
      if (Number.isFinite(at) && Number.isFinite(bt)) return at === bt ? 0 : at < bt ? -1 : 1;
      return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
    };
    return rows.map((row, index) => ({ row, index })).sort((a, b) => {
      for (let i = 0; i < keys.length; i += 1) {
        const direction = Boolean(rawDesc[i % Math.max(1, rawDesc.length)]) ? -1 : 1;
        const compared = compareValue(value(a.row, keys[i]), value(b.row, keys[i]));
        if (compared) return compared * direction;
      }
      return a.index - b.index;
    }).map(entry => entry.row);
  }
  function isMissing(v) { return v === null || v === undefined || v === "" || Number.isNaN(v); }
  function text(v) { return isMissing(v) ? "" : String(v); }
  function value(row, key) { return key ? row[key] : null; }
  function toNumber(v) {
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v.replace(/,/g, ""));
      return Number.isFinite(n) ? n : null;
    }
    return null;
  }
  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
  }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function unique(values) { return Array.from(new Set(values.map(v => text(v)).filter(v => v !== ""))); }
  function specPalette(spec) { return Array.isArray(spec.palette) && spec.palette.length ? spec.palette : DEFAULT_PALETTE; }
  function themeOf(spec) {
    const supplied = spec && spec.themeValues;
    if (supplied && typeof supplied === "object") {
      return {
        bg: supplied.bg || "#f8fbff",
        panel: supplied.panel || "#ffffff",
        ink: supplied.ink || supplied.text || "#172033",
        grid: supplied.grid || "#d9e5f4",
        muted: supplied.muted || "#64748b"
      };
    }
    return { bg: "#f8fbff", panel: "#ffffff", ink: "#172033", grid: "#d9e5f4", muted: "#64748b" };
  }
  function fontFamily(spec) { return spec.fontFamily || "Inter, ui-sans-serif, system-ui, sans-serif"; }
  function textSize(spec) { return Number(spec.textSize) || 13; }
  function titleSize(spec) { return Number(spec.titleSize) || 22; }
  function subtitleSize(spec) { return Number(spec.subtitleSize) || 13; }
  function axisTextSize(spec) { return Number(spec.axisTextSize) || 11; }
  function dpi(spec) { return Math.min(3, Math.max(1, Number(spec.dpi) || 1)); }
  function decimalMark(spec) { return spec && spec.decimalMark === "," ? "," : "."; }
  function thousandsSep(spec) { return decimalMark(spec) === "," ? "." : ","; }
  function formatNum(x, spec = {}, maximumFractionDigits = 3) {
    if (!Number.isFinite(Number(x))) return String(x);
    const locale = decimalMark(spec) === "," ? "de-DE" : "en-US";
    return Number(x).toLocaleString(locale, { maximumFractionDigits, useGrouping: true });
  }
  function legendVisible(spec, dataRows) {
    if (spec.legend === "hide" || spec.legendPosition === "none") return false;
    if (spec.legend === "show") return true;
    const type = chartType(spec);
    return Boolean(spec.mappings?.group) || ["pie", "donut", "histogram", "boxplot", "treemap", "heatmap"].includes(type) || (dataRows && unique(dataRows.map(r => value(r, spec.mappings?.group))).length > 1);
  }
  function legendPosition(spec) { return spec.legendPosition || "bottom"; }
  function plotlyLegend(spec, rows) {
    const pos = legendPosition(spec);
    if (!legendVisible(spec, rows)) return { showlegend: false };
    if (pos === "right") return { showlegend: true, legend: { orientation: "v", x: 1.02, xanchor: "left", y: 1, yanchor: "top" } };
    if (pos === "left") return { showlegend: true, legend: { orientation: "v", x: -0.12, xanchor: "right", y: 1, yanchor: "top" } };
    if (pos === "top") return { showlegend: true, legend: { orientation: "h", x: 0, xanchor: "left", y: 1.12, yanchor: "bottom" } };
    return { showlegend: true, legend: { orientation: "h", x: 0, xanchor: "left", y: -0.18, yanchor: "top" } };
  }
  function highchartsLegend(spec, rows) {
    const pos = legendPosition(spec);
    const base = { enabled: legendVisible(spec, rows), itemStyle: { fontSize: `${textSize(spec)}px`, fontFamily: fontFamily(spec) } };
    if (!base.enabled) return base;
    if (pos === "right") return Object.assign(base, { align: "right", verticalAlign: "middle", layout: "vertical" });
    if (pos === "left") return Object.assign(base, { align: "left", verticalAlign: "middle", layout: "vertical" });
    if (pos === "top") return Object.assign(base, { align: "center", verticalAlign: "top", layout: "horizontal", y: 62 });
    return Object.assign(base, { align: "center", verticalAlign: "bottom", layout: "horizontal" });
  }
  function googleLegend(spec, rows) {
    if (!legendVisible(spec, rows)) return { position: "none" };
    const pos = legendPosition(spec);
    return { position: pos === "left" ? "left" : pos === "top" ? "top" : pos === "bottom" ? "bottom" : "right" };
  }
  function mergeDeep(target, source) {
    const out = Object.assign({}, target || {});
    if (!source || typeof source !== "object" || Array.isArray(source)) return out;
    Object.keys(source).forEach(k => {
      const sv = source[k], tv = out[k];
      if (sv && typeof sv === "object" && !Array.isArray(sv) && tv && typeof tv === "object" && !Array.isArray(tv)) out[k] = mergeDeep(tv, sv);
      else out[k] = sv;
    });
    return out;
  }
  function optionFor(spec, key) {
    const opts = spec.options || {};
    return mergeDeep(opts.renderer_options || {}, opts[key] || {});
  }
  function rendererStyle(spec) { return spec && spec.rendererStyle && typeof spec.rendererStyle === "object" ? spec.rendererStyle : {}; }
  function boolStyle(spec, key, fallback = false) { const v = rendererStyle(spec)[key]; return v === undefined || v === null ? fallback : Boolean(v); }
  function numStyle(spec, key, fallback) { const n = Number(rendererStyle(spec)[key]); return Number.isFinite(n) ? n : fallback; }
  function strStyle(spec, key, fallback = "") { const v = rendererStyle(spec)[key]; return v === undefined || v === null || v === "" ? fallback : String(v); }
  function dimensions(spec) { return { width: Number(spec.width) || 960, height: Number(spec.height) || 560 }; }
  function applySize(el, spec) {
    const dim = dimensions(spec);
    if (el) {
      el.style.width = `${dim.width}px`;
      el.style.maxWidth = "none";
      el.style.height = `${dim.height}px`;
      el.style.minHeight = `${dim.height}px`;
      el.style.boxSizing = "border-box";
      el.style.position = "relative";
    }
    return dim;
  }
  function labelKeys(spec) {
    const raw = spec?.mappings?.label;
    const keys = Array.isArray(raw) ? raw : (raw ? [raw] : []);
    const mapped = new Set([spec?.mappings?.x, spec?.mappings?.y, spec?.mappings?.group].filter(Boolean));
    return unique(keys).filter(k => !mapped.has(k));
  }
  function pointLabel(row, spec, fallback = "") {
    const keys = labelKeys(spec);
    const seen = new Set();
    const parts = [];
    keys.forEach(key => {
      const val = value(row, key);
      if (isMissing(val)) return;
      const rendered = text(val);
      const token = rendered.trim().toLocaleLowerCase();
      if (seen.has(token)) return;
      seen.add(token);
      parts.push(`${key}: ${rendered}`);
    });
    return parts.length ? parts.join("\n") : text(fallback);
  }
  function tooltipText(d, spec) {
    const xName = spec?.mappings?.x || "x";
    const yName = spec?.mappings?.y || "y";
    const gName = spec?.mappings?.group || "group";
    const parts = [];
    const seenKeys = new Set();
    const seenValues = new Set();
    const add = (key, val) => {
      if (isMissing(val)) return;
      const rendered = typeof val === "number" ? formatNum(val, spec) : text(val);
      const keyToken = text(key).trim().toLocaleLowerCase();
      const valueToken = rendered.trim().toLocaleLowerCase();
      if ((keyToken && seenKeys.has(keyToken)) || seenValues.has(valueToken)) return;
      if (keyToken) seenKeys.add(keyToken);
      seenValues.add(valueToken);
      parts.push(key ? `${key}: ${rendered}` : rendered);
    };
    if (d.label) String(d.label).split("\n").forEach(line => {
      const idx = line.indexOf(": ");
      add(idx > 0 ? line.slice(0, idx) : "", idx > 0 ? line.slice(idx + 2) : line);
    });
    add(xName, d.x);
    add(yName, Number.isFinite(Number(d.y)) ? Number(d.y) : d.y);
    add(gName, d.group);
    return parts.join("\n");
  }
  function chartType(spec) { return BUILD_CHART_TYPE || spec.chartType || spec.type || "scatter"; }
  function isPieType(type) { return type === "pie" || type === "donut"; }
  function isLineType(type) { return ["line", "spline", "step"].includes(type); }
  function isAreaType(type) { return type === "area" || type === "stacked_area"; }
  function isBarType(type) { return type === "bar" || type === "stacked_bar" || type === "lollipop"; }
  function groups(rows, spec) {
    const g = spec?.mappings?.group;
    if (!g) return [{ name: spec?.mappings?.y || "Series", rows }];
    return unique(rows.map(r => value(r, g))).map(name => ({ name, rows: rows.filter(r => text(value(r, g)) === name) }));
  }
  function xyRows(rows, spec) {
    const x = spec?.mappings?.x;
    const y = spec?.mappings?.y;
    const g = spec?.mappings?.group;
    return rows.map((r, i) => {
      const xv = x ? value(r, x) : i + 1;
      return {
        row: r,
        x: xv,
        y: y ? toNumber(value(r, y)) : 1,
        group: g ? value(r, g) : null,
        label: pointLabel(r, spec, text(xv) || `Row ${i + 1}`),
        idx: i
      };
    }).filter(d => d.y !== null && !isMissing(d.x));
  }
  function aggregationMethod(spec) {
    const method = String(spec?.aggregate || "sum").toLowerCase();
    return ["sum", "mean", "count"].includes(method) ? method : "sum";
  }
  function summarizeValues(values, rowCount, method) {
    if (method === "count") return rowCount;
    const nums = values.filter(Number.isFinite);
    if (!nums.length) return 0;
    const total = nums.reduce((sum, v) => sum + v, 0);
    return method === "mean" ? total / nums.length : total;
  }
  function aggregate(rows, xKey, yKey, spec = {}) {
    const buckets = new Map();
    rows.forEach(r => {
      const k = text(xKey ? value(r, xKey) : "All");
      if (!k) return;
      if (!buckets.has(k)) buckets.set(k, { values: [], rows: 0 });
      const bucket = buckets.get(k);
      bucket.rows += 1;
      const y = yKey ? toNumber(value(r, yKey)) : 1;
      if (y !== null) bucket.values.push(y);
    });
    const method = aggregationMethod(spec);
    return Array.from(buckets, ([x, bucket]) => ({
      x,
      y: summarizeValues(bucket.values, bucket.rows, method),
      n: bucket.rows
    }));
  }
  function aggregateGrouped(rows, spec) {
    const xKey = spec.mappings?.x, yKey = spec.mappings?.y;
    const cats = unique(rows.map(r => value(r, xKey)));
    const gs = groups(rows, spec).map((g, i) => {
      const vals = aggregate(g.rows, xKey, yKey, spec);
      const map = new Map(vals.map(d => [d.x, d.y]));
      return { name: g.name, index: i, data: cats.map(c => map.get(c) || 0) };
    });
    return { categories: cats, series: gs };
  }
  function niceStep(range, targetBins) {
    if (!Number.isFinite(range) || range <= 0) return 1;
    const raw = range / Math.max(1, targetBins);
    const power = Math.pow(10, Math.floor(Math.log10(raw)));
    const fraction = raw / power;
    const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
    return nice * power;
  }
  function histogram(rows, spec) {
    const key = spec?.mappings?.x;
    const nums = rows.map(r => toNumber(value(r, key))).filter(v => v !== null).sort((a, b) => a - b);
    if (!nums.length) return [];
    const dataMin = nums[0], dataMax = nums[nums.length - 1];
    const target = clamp(Math.round(Number(spec.bins) || 12), 4, 80);
    if (dataMin === dataMax) {
      const span = Math.max(1, Math.abs(dataMin) * 0.1);
      const step = niceStep(span * 2, 1);
      const x0 = Math.floor((dataMin - step / 2) / step) * step;
      const x1 = x0 + step;
      return [{ x: (x0 + x1) / 2, x0, x1, width: step, y: nums.length, label: `${formatNum(x0, spec)} – ${formatNum(x1, spec)}` }];
    }
    let step = niceStep(dataMax - dataMin, target);
    let lower = Math.floor(dataMin / step) * step;
    let upper = Math.ceil(dataMax / step) * step;
    let nBins = Math.max(1, Math.round((upper - lower) / step));
    while (nBins > 80) {
      step = niceStep(step * 2, 1);
      lower = Math.floor(dataMin / step) * step;
      upper = Math.ceil(dataMax / step) * step;
      nBins = Math.max(1, Math.round((upper - lower) / step));
    }
    const clean = value => Number(Number(value).toPrecision(14));
    lower = clean(lower); upper = clean(upper); step = clean(step);
    const out = Array.from({ length: nBins }, (_, i) => {
      const x0 = clean(lower + i * step);
      const x1 = clean(i === nBins - 1 ? upper : lower + (i + 1) * step);
      return { x: clean((x0 + x1) / 2), x0, x1, width: clean(x1 - x0), y: 0, label: `${formatNum(x0, spec)} – ${formatNum(x1, spec)}` };
    });
    nums.forEach(v => {
      const idx = Math.max(0, Math.min(out.length - 1, Math.floor((v - lower) / step)));
      out[idx].y += 1;
    });
    return out;
  }
  function standardDeviation(values) {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1));
  }
  function numericQuantile(values, p) {
    if (!values.length) return null;
    const idx = (values.length - 1) * p, lo = Math.floor(idx), hi = Math.ceil(idx);
    return lo === hi ? values[lo] : values[lo] + (values[hi] - values[lo]) * (idx - lo);
  }
  function density(rows, spec) {
    const key = spec?.mappings?.x;
    const nums = rows.map(r => toNumber(value(r, key))).filter(v => v !== null).sort((a, b) => a - b);
    if (!nums.length) return [];
    const n = nums.length;
    const min = nums[0], max = nums[n - 1];
    const sd = standardDeviation(nums);
    const iqr = n > 1 ? numericQuantile(nums, 0.75) - numericQuantile(nums, 0.25) : 0;
    const candidates = [sd, iqr > 0 ? iqr / 1.34 : Infinity].filter(v => Number.isFinite(v) && v > 0);
    const fallbackScale = Math.max(Math.abs(min), Math.abs(max), 1) / 10;
    const sigma = candidates.length ? Math.min(...candidates) : (max > min ? (max - min) / 4 : fallbackScale);
    const bandwidth = Math.max(Number.EPSILON, 0.9 * sigma * Math.pow(Math.max(2, n), -0.2));
    const rawLo = min - 3 * bandwidth, rawHi = max + 3 * bandwidth;
    const boundaryStep = niceStep(rawHi - rawLo, Math.max(12, Number(spec.bins) || 12));
    const lo = Math.floor(rawLo / boundaryStep) * boundaryStep;
    const hi = Math.ceil(rawHi / boundaryStep) * boundaryStep;
    const points = clamp(Math.round((Number(spec.bins) || 12) * 8), 64, 256);
    const normalizer = n * bandwidth * Math.sqrt(2 * Math.PI);
    return Array.from({ length: points }, (_, i) => {
      const x = lo + (hi - lo) * i / Math.max(1, points - 1);
      const y = nums.reduce((sum, v) => {
        const z = (x - v) / bandwidth;
        return sum + Math.exp(-0.5 * z * z);
      }, 0) / normalizer;
      return { x, y, label: formatNum(x, spec), bandwidth };
    });
  }
  function quantile(values, p) {
    const a = values.filter(v => Number.isFinite(v)).sort((x, y) => x - y);
    if (!a.length) return null;
    const idx = (a.length - 1) * p, lo = Math.floor(idx), hi = Math.ceil(idx);
    if (lo === hi) return a[lo];
    return a[lo] + (a[hi] - a[lo]) * (idx - lo);
  }
  function boxData(rows, spec) {
    const xKey = spec.mappings?.x, yKey = spec.mappings?.y;
    const cats = xKey ? unique(rows.map(r => value(r, xKey))) : [yKey || "Values"];
    return cats.map(cat => {
      const vals = rows.filter(r => !xKey || text(value(r, xKey)) === cat).map(r => toNumber(value(r, yKey))).filter(v => v !== null).sort((a, b) => a - b);
      if (!vals.length) return null;
      return { x: cat, low: vals[0], q1: quantile(vals, 0.25), median: quantile(vals, 0.5), q3: quantile(vals, 0.75), high: vals[vals.length - 1], values: vals };
    }).filter(Boolean);
  }
  function heatmapData(rows, spec) {
    const xKey = spec.mappings?.x, yKey = spec.mappings?.y, gKey = spec.mappings?.group;
    const xCats = unique(rows.map(r => value(r, xKey)));
    const yCats = gKey ? unique(rows.map(r => value(r, gKey))) : [yKey || "Value"];
    const buckets = new Map();
    rows.forEach(r => {
      const x = text(value(r, xKey));
      const yCat = gKey ? text(value(r, gKey)) : (yKey || "Value");
      const z = toNumber(value(r, yKey));
      if (!x || !yCat || z === null) return;
      const key = `${x}\u0001${yCat}`;
      if (!buckets.has(key)) buckets.set(key, { values: [], rows: 0 });
      const bucket = buckets.get(key);
      bucket.rows += 1;
      bucket.values.push(z);
    });
    const method = aggregationMethod(spec);
    const cells = [];
    xCats.forEach((x, xi) => yCats.forEach((y, yi) => {
      const bucket = buckets.get(`${x}\u0001${y}`) || { values: [], rows: 0 };
      cells.push({ x, y, xi, yi, value: summarizeValues(bucket.values, bucket.rows, method) });
    }));
    return { xCats, yCats, cells };
  }
  function treemapData(rows, spec) {
    const xKey = spec.mappings?.x, yKey = spec.mappings?.y;
    return aggregate(rows, xKey, yKey, spec).filter(d => d.y > 0);
  }
  function tableForSimple(rows, spec) {
    const type = chartType(spec), xKey = spec.mappings?.x, yKey = spec.mappings?.y;
    if (isPieType(type) || type === "treemap") return aggregate(rows, xKey, yKey, spec).map(d => ({ x: d.x, y: d.y, group: d.x, label: d.x }));
    if (type === "histogram") return histogram(rows, spec).map(d => ({ x: d.x, x0: d.x0, x1: d.x1, width: d.width, y: d.y, group: "Count", label: d.label }));
    if (type === "density") return density(rows, spec).map(d => ({ x: d.x, y: d.y, group: "Density", label: d.label }));
    if (isBarType(type)) {
      const ag = aggregateGrouped(rows, spec);
      return ag.series.flatMap(s => ag.categories.map((cat, i) => ({ x: cat, y: s.data[i], group: s.name, label: `${cat} · ${s.name}` })));
    }
    return xyRows(rows, spec).map(d => ({ x: d.x, y: d.y, group: text(d.group || spec.mappings?.y || "Series"), z: Math.abs(d.y), label: d.label }));
  }
  function titleHtml(spec) {
    const title = esc(spec.title || "Untitled chart");
    const subtitle = spec.subtitle ? `<p style="margin:6px 0 0;color:inherit;opacity:.68;font-size:${subtitleSize(spec)}px">${esc(spec.subtitle)}</p>` : "";
    return `<div style="font-family:${esc(fontFamily(spec))};margin:0 0 18px"><h1 style="font-size:${titleSize(spec)}px;line-height:1.1;margin:0;font-weight:800">${title}</h1>${subtitle}</div>`;
  }
  function fail(el, message, details) {
    if (!el) return;
    const det = details ? `<pre style="white-space:pre-wrap;margin:12px 0 0;font-size:12px;line-height:1.45">${esc(details)}</pre>` : "";
    el.innerHTML = `<div class="cf-error"><strong>ChartForge could not render this chart.</strong><br>${esc(message || "Unknown error")}${det}</div>`;
  }
  function ensureTarget(target) { return typeof target === "string" ? byId(target) : target; }

  async function render(data, spec, target) {
    const el = ensureTarget(target);
    if (!el) return;
    const rows = sortRows(data, spec);
    applySize(el, spec);
    const lib = BUILD_RENDERER || spec.library || spec.renderer || "highcharts";
    try {
      if (lib === "highcharts") return renderHighcharts(el, rows, spec);
      if (lib === "plotly") return renderPlotly(el, rows, spec);
      if (lib === "d3") return renderD3(el, rows, spec);
      if (lib === "vega") return renderVega(el, rows, spec);
      if (lib === "observable") return renderObservable(el, rows, spec);
      if (lib === "chartjs") return renderChartJs(el, rows, spec);
      if (lib === "echarts") return renderECharts(el, rows, spec);
      if (lib === "apexcharts") return renderApexCharts(el, rows, spec);
      if (lib === "google" || lib === "googlecharts") return renderGoogleCharts(el, rows, spec);
      if (lib === "amcharts") return renderAmCharts(el, rows, spec);
      if (lib === "vchart") return renderVChart(el, rows, spec);
      if (lib === "anychart") return renderAnyChart(el, rows, spec);
      if (lib === "billboard") return renderBillboard(el, rows, spec);
      fail(el, `Unknown renderer: ${lib}`);
    } catch (err) {
      fail(el, err && err.message ? err.message : String(err), err && err.stack ? err.stack : "");
    }
  }

  function renderPlotly(el, rows, spec) {
    if (!global.Plotly) throw new Error("Plotly.js is not loaded.");
    const palette = specPalette(spec), t = themeOf(spec), type = chartType(spec), st = rendererStyle(spec);
    const xKey = spec.mappings?.x, yKey = spec.mappings?.y;
    let traces = [];
    if (isPieType(type)) {
      const a = aggregate(rows, xKey, yKey, spec);
      traces = [{ type: "pie", labels: a.map(d => d.x), values: a.map(d => d.y), hole: type === "donut" ? 0.48 : 0, marker: { colors: palette } }];
    } else if (type === "histogram") {
      const h = histogram(rows, spec);
      traces = [{ type: "bar", x: h.map(d => d.x), y: h.map(d => d.y), width: h.map(d => d.width), text: h.map(d => d.label), customdata: h.map(d => d.label), hovertemplate: "<b>%{customdata}</b><br>Count: %{y}<extra></extra>", name: "Count", marker: { color: palette[0], line: { width: 0 } }, opacity: 0.9 }];
    } else if (type === "density") {
      const d = density(rows, spec);
      traces = [{ type: "scatter", mode: "lines", fill: "tozeroy", x: d.map(v => v.x), y: d.map(v => v.y), name: "Density", line: { color: palette[0] } }];
    } else if (type === "boxplot") {
      traces = groups(rows, spec).map((g, i) => ({ type: "box", name: g.name, x: xyRows(g.rows, spec).map(d => text(d.x)), y: xyRows(g.rows, spec).map(d => d.y), marker: { color: palette[i % palette.length] } }));
    } else if (type === "heatmap") {
      const hm = heatmapData(rows, spec);
      traces = [{ type: "heatmap", x: hm.xCats, y: hm.yCats, z: hm.yCats.map(y => hm.xCats.map(x => hm.cells.find(c => c.x === x && c.y === y)?.value || 0)), colorscale: "Viridis" }];
    } else if (type === "treemap") {
      const tr = treemapData(rows, spec);
      traces = [{ type: "treemap", labels: tr.map(d => d.x), parents: tr.map(() => ""), values: tr.map(d => d.y), marker: { colors: palette } }];
    } else if (type === "bar" || type === "stacked_bar" || type === "lollipop") {
      const ag = aggregateGrouped(rows, spec);
      traces = ag.series.flatMap((series, i) => {
        const color = palette[i % palette.length];
        if (type === "lollipop") {
          return [{ type: "scatter", mode: "lines+markers", x: ag.categories.flatMap(x => [x, x, null]), y: series.data.flatMap(y => [0, y, null]), name: series.name, line: { color, width: numStyle(spec, "line_width", 3) }, marker: { color, size: Number(spec.markerSize) || 8 }, hovertemplate: `${xKey || "x"}: %{x}<br>${yKey || "y"}: %{y}<extra>${series.name}</extra>` }];
        }
        return [{ type: "bar", x: ag.categories, y: series.data, name: series.name, marker: { color } }];
      });
    } else {
      traces = groups(rows, spec).map((g, i) => {
        const xy = xyRows(g.rows, spec);
        const base = { x: xy.map(d => d.x), y: xy.map(d => d.y), text: xy.map(d => d.label), customdata: xy.map(d => [text(d.group)]), hovertemplate: `<b>%{text}</b><br>${xKey || "x"}: %{x}<br>${yKey || "y"}: %{y}<extra>%{fullData.name}</extra>`, name: g.name, marker: { color: palette[i % palette.length], symbol: strStyle(spec, "marker_symbol", "circle"), opacity: numStyle(spec, "marker_opacity", 0.9), size: type === "bubble" ? xy.map(d => Math.max(8, Math.sqrt(Math.abs(d.y)) * (Number(spec.markerSize) || 8))) : (Number(spec.markerSize) || 8) }, line: { color: palette[i % palette.length], width: numStyle(spec, "line_width", 3), dash: strStyle(spec, "line_dash", "solid"), shape: type === "step" ? "hv" : "linear" } };
        if (isBarType(type)) return Object.assign(base, { type: "bar" });
        if (isAreaType(type)) return Object.assign(base, { type: "scatter", mode: "lines", fill: "tozeroy", stackgroup: type === "stacked_area" ? "one" : undefined });
        if (isLineType(type)) return Object.assign(base, { type: "scatter", mode: "lines+markers", line: Object.assign(base.line, { shape: type === "spline" ? "spline" : (type === "step" ? "hv" : "linear") }) });
        if (type === "bubble") return Object.assign(base, { type: "scatter", mode: "markers" });
        return Object.assign(base, { type: "scatter", mode: "markers" });
      });
    }
    let layout = {
      title: { text: spec.title || "", subtitle: { text: spec.subtitle || "" }, font: { color: t.ink, size: titleSize(spec), family: fontFamily(spec) } },
      paper_bgcolor: t.panel, plot_bgcolor: t.panel,
      font: { color: t.ink, size: textSize(spec), family: fontFamily(spec) },
      xaxis: { title: xKey || "", gridcolor: spec.grid === false ? "rgba(0,0,0,0)" : t.grid, zerolinecolor: t.grid, tickfont: { size: axisTextSize(spec) } },
      yaxis: { title: type === "histogram" ? "Count" : type === "density" ? "Density" : (yKey || ""), gridcolor: spec.grid === false ? "rgba(0,0,0,0)" : t.grid, zerolinecolor: t.grid, tickfont: { size: axisTextSize(spec) } },
      width: dimensions(spec).width, height: dimensions(spec).height,
      colorway: palette, margin: { l: 68, r: legendPosition(spec) === "right" ? 150 : 36, t: legendPosition(spec) === "top" ? 116 : 92, b: legendPosition(spec) === "bottom" ? 112 : 68 },
      barmode: type === "stacked_bar" ? "stack" : "group", bargap: type === "histogram" ? 0 : undefined, bargroupgap: type === "histogram" ? 0 : undefined, hovermode: spec.tooltip === false ? false : strStyle(spec, "hovermode", "closest"), dragmode: strStyle(spec, "dragmode", "zoom"),
      separators: decimalMark(spec) === "," ? ",." : ".,"
    };
    layout = mergeDeep(layout, plotlyLegend(spec, rows));
    layout = mergeDeep(layout, optionFor(spec, "plotly_layout"));
    const config = mergeDeep({ responsive: Boolean(st.responsive ?? false), displaylogo: false, displayModeBar: st.modebar !== false, scrollZoom: Boolean(st.scroll_zoom), staticPlot: Boolean(st.static_plot) }, optionFor(spec, "plotly_config"));
    global.Plotly.newPlot(el, traces, layout, config);
  }

  function renderHighcharts(el, rows, spec) {
    if (!global.Highcharts) throw new Error("Highcharts is not loaded.");
    const palette = specPalette(spec), t = themeOf(spec), type = chartType(spec);
    const xKey = spec.mappings?.x, yKey = spec.mappings?.y, st = rendererStyle(spec);
    const lineWidth = numStyle(spec, "line_width", 3);
    const dashStyle = ({ solid: "Solid", dashed: "Dash", dotted: "Dot", dash: "Dash", dot: "Dot" }[strStyle(spec, "line_dash", "solid")] || "Solid");
    const markerRadius = Number(spec.markerSize) || 5;
    const opts = {
      chart: {
        backgroundColor: t.panel,
        width: dimensions(spec).width,
        height: dimensions(spec).height,
        zooming: {
          type: ["none", ""].includes(strStyle(spec, "zoom_type", "")) ? undefined : strStyle(spec, "zoom_type", ""),
          mouseWheel: { enabled: Boolean(st.mouse_wheel_zoom) }
        },
        panning: { enabled: Boolean(st.panning), type: strStyle(spec, "pan_type", "x") },
        panKey: strStyle(spec, "pan_key", "shift"),
        style: { fontFamily: fontFamily(spec), fontSize: `${textSize(spec)}px` },
        animation: spec.animation !== false,
        spacingTop: legendPosition(spec) === "top" && legendVisible(spec, rows) ? 88 : 20
      },
      title: { text: spec.title || "", style: { color: t.ink, fontWeight: "800", fontSize: `${titleSize(spec)}px` } },
      subtitle: { text: spec.subtitle || "", style: { color: t.muted, fontSize: `${subtitleSize(spec)}px` } },
      colors: palette,
      credits: { enabled: true },
      exporting: { enabled: st.exporting !== false },
      lang: { decimalPoint: decimalMark(spec), thousandsSep: thousandsSep(spec) },
      tooltip: {
        enabled: spec.tooltip !== false,
        shared: Boolean(st.shared_tooltip),
        split: Boolean(st.split_tooltip),
        crosshairs: Boolean(st.crosshair),
        valueDecimals: 3,
        pointFormatter: function () {
          const customLabel = this.custom && this.custom.label ? String(this.custom.label).replace(/\n/g, "<br>") : "";
          const name = this.name || this.category || "";
          const val = Number.isFinite(this.y) ? formatNum(this.y, spec) : this.value;
          const head = customLabel || esc(name);
          return `${head ? `<span>${head}</span><br>` : ""}<b>${esc(yKey || (type === "density" ? "Density" : type === "histogram" ? "Count" : "y"))}</b>: ${esc(val)}`;
        }
      },
      plotOptions: {
        series: {
          turboThreshold: 0,
          animation: spec.animation !== false,
          shadow: Boolean(st.shadow),
          dataLabels: { enabled: Boolean(st.data_labels), style: { fontSize: `${textSize(spec)}px`, fontFamily: fontFamily(spec) } }
        },
        line: { lineWidth, dashStyle, marker: { radius: markerRadius } },
        spline: { lineWidth, dashStyle, marker: { radius: markerRadius } },
        area: { lineWidth, dashStyle, marker: { radius: markerRadius }, stacking: type === "stacked_area" ? "normal" : undefined, fillOpacity: numStyle(spec, "area_opacity", 0.28) },
        areaspline: { lineWidth, dashStyle, marker: { enabled: false }, fillOpacity: numStyle(spec, "area_opacity", 0.22) },
        scatter: { lineWidth: 0, marker: { radius: markerRadius } },
        bubble: { lineWidth: 0, marker: { radius: markerRadius } },
        column: { stacking: type === "stacked_bar" ? "normal" : undefined, borderRadius: numStyle(spec, "column_radius", 0) },
        pie: { innerSize: type === "donut" ? "48%" : "0%", showInLegend: true, allowPointSelect: true },
        heatmap: { lineWidth: 0 },
        treemap: { lineWidth: 0 }
      }
    };

    if (isPieType(type)) {
      const a = aggregate(rows, xKey, yKey, spec);
      opts.chart.type = "pie";
      opts.series = [{
        name: yKey || (aggregationMethod(spec) === "count" ? "Count" : "Value"),
        colorByPoint: true,
        showInLegend: legendVisible(spec, rows),
        data: a.map(d => ({ name: d.x, y: d.y, custom: { label: d.x } }))
      }];
    } else if (type === "histogram") {
      const h = histogram(rows, spec);
      if (!h.length) throw new Error("No continuous numeric values were found for the histogram.");
      const width = h[0].width;
      opts.chart.type = "column";
      opts.xAxis = { type: "linear", min: h[0].x0, max: h[h.length - 1].x1, tickInterval: width, title: { text: xKey || "" } };
      opts.yAxis = { min: 0, allowDecimals: false, title: { text: "Count" } };
      opts.plotOptions.column = mergeDeep(opts.plotOptions.column, { pointPadding: 0, groupPadding: 0, borderWidth: 0, pointRange: width });
      opts.series = [{ name: "Count", pointRange: width, data: h.map(d => ({ x: d.x, y: d.y, name: d.label, custom: { label: d.label } })) }];
    } else if (type === "density") {
      const d = density(rows, spec);
      if (!d.length) throw new Error("No continuous numeric values were found for the density estimate.");
      opts.chart.type = "areaspline";
      opts.xAxis = { type: "linear", title: { text: xKey || "" } };
      opts.yAxis = { min: 0, title: { text: "Density" } };
      opts.series = [{ name: "Density", type: "areaspline", data: d.map(v => ({ x: v.x, y: v.y, custom: { label: v.label } })) }];
    } else if (type === "boxplot") {
      const b = boxData(rows, spec);
      opts.chart.type = "boxplot";
      opts.xAxis = { categories: b.map(d => d.x), title: { text: xKey || "" } };
      opts.yAxis = { title: { text: yKey || "" } };
      opts.series = [{ name: yKey || "Values", data: b.map(d => [d.low, d.q1, d.median, d.q3, d.high]) }];
    } else if (type === "heatmap") {
      const hm = heatmapData(rows, spec);
      opts.chart.type = "heatmap";
      opts.xAxis = { categories: hm.xCats, title: { text: xKey || "" } };
      opts.yAxis = { categories: hm.yCats, title: { text: spec.mappings?.group || "" }, reversed: true };
      opts.colorAxis = { min: 0, minColor: "#ffffff", maxColor: palette[0] };
      opts.series = [{ type: "heatmap", name: yKey || "Value", lineWidth: 0, borderWidth: 1, data: hm.cells.map(c => [c.xi, c.yi, c.value]), dataLabels: { enabled: false } }];
    } else if (type === "treemap") {
      const tr = treemapData(rows, spec);
      opts.chart.type = "treemap";
      opts.series = [{ type: "treemap", lineWidth: 0, layoutAlgorithm: "squarified", showInLegend: false, data: tr.map((d, i) => ({ name: d.x, value: d.y, color: palette[i % palette.length] })) }];
    } else if (type === "lollipop") {
      const ag = aggregateGrouped(rows, spec);
      opts.chart.type = "column";
      opts.xAxis = { categories: ag.categories, title: { text: xKey || "" } };
      opts.yAxis = { title: { text: yKey || "" } };
      opts.plotOptions.column = mergeDeep(opts.plotOptions.column, { grouping: true, pointPadding: 0.45, groupPadding: 0.12, borderWidth: 0 });
      opts.series = ag.series.flatMap((series, i) => {
        const color = palette[i % palette.length];
        return [
          { type: "column", name: `${series.name} stem`, data: series.data, color, pointWidth: Math.max(2, lineWidth), showInLegend: false, enableMouseTracking: false },
          { type: "scatter", name: series.name, data: series.data.map((y, x) => ({ x, y })), color, marker: { enabled: true, radius: markerRadius, symbol: "circle" }, lineWidth: 0, showInLegend: legendVisible(spec, rows) }
        ];
      });
    } else if (type === "bar" || type === "stacked_bar") {
      const ag = aggregateGrouped(rows, spec);
      opts.chart.type = "column";
      opts.xAxis = { categories: ag.categories, title: { text: xKey || "" } };
      opts.yAxis = { title: { text: yKey || (aggregationMethod(spec) === "count" ? "Count" : "") } };
      opts.series = ag.series.map((series, i) => ({ name: series.name, data: series.data, color: palette[i % palette.length] }));
    } else {
      const highType = type === "area" || type === "stacked_area" ? "area" : type === "spline" ? "spline" : type === "bubble" ? "bubble" : type === "step" || type === "line" ? "line" : "scatter";
      opts.chart.type = highType;
      const allPoints = xyRows(rows, spec);
      const allNumeric = allPoints.every(d => toNumber(d.x) !== null);
      const allDates = !allNumeric && allPoints.every(d => !Number.isNaN(Date.parse(text(d.x))));
      const categories = !allNumeric && !allDates ? unique(allPoints.map(d => d.x)) : null;
      opts.xAxis = { type: allDates ? "datetime" : allNumeric ? "linear" : "category", categories: categories || undefined, title: { text: xKey || "" }, gridLineColor: t.grid, lineColor: t.grid, labels: { style: { color: t.muted } } };
      opts.yAxis = { title: { text: yKey || "" }, gridLineColor: t.grid, labels: { style: { color: t.muted } } };
      opts.series = groups(rows, spec).map((g, i) => ({
        name: g.name,
        type: highType,
        lineWidth: highType === "scatter" || highType === "bubble" ? 0 : lineWidth,
        step: type === "step" ? "left" : undefined,
        data: xyRows(g.rows, spec).map((d, j) => {
          const xn = toNumber(d.x);
          const x = allNumeric ? xn : allDates ? Date.parse(text(d.x)) : categories.indexOf(text(d.x));
          return { x, y: d.y, z: type === "bubble" ? Math.max(1, Math.abs(d.y)) : undefined, name: d.label || text(d.x), custom: { label: d.label, group: text(d.group) } };
        }),
        marker: { enabled: true, radius: markerRadius },
        color: palette[i % palette.length]
      }));
    }
    opts.legend = mergeDeep(highchartsLegend(spec, rows), { itemStyle: { color: t.ink } });
    global.Highcharts.chart(el, mergeDeep(opts, optionFor(spec, "highcharts_options")));
  }

  function renderD3(el, rows, spec) {
    if (!global.d3) throw new Error("D3.js is not loaded.");
    const d3 = global.d3, type = chartType(spec), st = rendererStyle(spec);
    if (isPieType(type) || ["boxplot", "heatmap", "treemap"].includes(type)) return renderNativeSvg(el, rows, spec);
    const dim = dimensions(spec), t = themeOf(spec), palette = specPalette(spec);
    const xKey = spec.mappings?.x, yKey = spec.mappings?.y;
    const margin = {
      top: numStyle(spec, "margin_top", spec.subtitle ? 84 : 66),
      right: numStyle(spec, "margin_right", legendPosition(spec) === "right" ? 150 : 34),
      bottom: numStyle(spec, "margin_bottom", legendPosition(spec) === "bottom" ? 92 : 62),
      left: numStyle(spec, "margin_left", 72)
    };
    const width = Math.max(80, dim.width - margin.left - margin.right);
    const height = Math.max(80, dim.height - margin.top - margin.bottom);
    el.innerHTML = "";
    const svg = d3.select(el).append("svg").attr("width", dim.width).attr("height", dim.height).attr("viewBox", `0 0 ${dim.width} ${dim.height}`).style("background", t.panel).style("font-family", fontFamily(spec));
    if (spec.title) svg.append("text").attr("x", 18).attr("y", 30).attr("fill", t.ink).attr("font-size", titleSize(spec)).attr("font-weight", 800).text(spec.title);
    if (spec.subtitle) svg.append("text").attr("x", 18).attr("y", 53).attr("fill", t.muted).attr("font-size", subtitleSize(spec)).text(spec.subtitle);
    const plot = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const marks = plot.append("g").attr("class", "cf-d3-marks");
    const color = d3.scaleOrdinal().range(palette);
    const axisColor = t.muted;
    const styleAxis = selection => selection.selectAll("text").attr("fill", axisColor).attr("font-size", axisTextSize(spec)).attr("font-family", fontFamily(spec));
    const styleGrid = selection => selection.selectAll("line").attr("stroke", spec.grid === false ? "transparent" : t.grid);
    const xLabel = () => svg.append("text").attr("x", margin.left + width / 2).attr("y", dim.height - 12).attr("text-anchor", "middle").attr("fill", t.muted).attr("font-size", axisTextSize(spec)).text(xKey || "");
    const yLabel = () => svg.append("text").attr("transform", `translate(18 ${margin.top + height / 2}) rotate(-90)`).attr("text-anchor", "middle").attr("fill", t.muted).attr("font-size", axisTextSize(spec)).text(yKey || "");
    const curveMap = {
      linear: d3.curveLinear, basis: d3.curveBasis, cardinal: d3.curveCardinal,
      "catmull-rom": d3.curveCatmullRom, "monotone-x": d3.curveMonotoneX,
      step: d3.curveStepAfter
    };
    const symbolMap = {
      circle: d3.symbolCircle, square: d3.symbolSquare, diamond: d3.symbolDiamond,
      triangle: d3.symbolTriangle, star: d3.symbolStar, cross: d3.symbolCross
    };
    const tooltip = (selection, accessor) => selection.append("title").text(accessor);

    if (type === "histogram") {
      const h = histogram(rows, spec);
      if (!h.length) throw new Error("No continuous numeric values were found for the histogram.");
      const x = d3.scaleLinear().domain([h[0].x0, h[h.length - 1].x1]).range([0, width]);
      const y = d3.scaleLinear().domain([0, d3.max(h, d => d.y) || 1]).nice().range([height, 0]);
      const xAxis = plot.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).ticks(Math.min(h.length, numStyle(spec, "x_ticks", 8))).tickFormat(v => formatNum(v, spec)));
      const yAxis = plot.append("g").call(d3.axisLeft(y).ticks(numStyle(spec, "y_ticks", 6)).tickSize(spec.grid === false ? 0 : -width));
      styleAxis(xAxis); styleAxis(yAxis); styleGrid(yAxis); xLabel();
      svg.append("text").attr("transform", `translate(18 ${margin.top + height / 2}) rotate(-90)`).attr("text-anchor", "middle").attr("fill", t.muted).attr("font-size", axisTextSize(spec)).text("Count");
      const rects = marks.selectAll("rect.cf-histogram").data(h).join("rect")
        .attr("class", "cf-histogram").attr("x", d => x(d.x0)).attr("width", d => Math.max(0, x(d.x1) - x(d.x0)))
        .attr("y", d => y(d.y)).attr("height", d => height - y(d.y)).attr("fill", palette[0]).attr("opacity", numStyle(spec, "opacity", 0.9));
      tooltip(rects, d => `${d.label}
Count: ${formatNum(d.y, spec, 0)}`);
      return;
    }

    if (type === "density") {
      const den = density(rows, spec);
      if (!den.length) throw new Error("No continuous numeric values were found for the density estimate.");
      const x = d3.scaleLinear().domain(d3.extent(den, d => d.x)).nice().range([0, width]);
      const y = d3.scaleLinear().domain([0, d3.max(den, d => d.y) || 1]).nice().range([height, 0]);
      const xAxis = plot.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).ticks(numStyle(spec, "x_ticks", 8)).tickFormat(v => formatNum(v, spec)));
      const yAxis = plot.append("g").call(d3.axisLeft(y).ticks(numStyle(spec, "y_ticks", 6)).tickSize(spec.grid === false ? 0 : -width).tickFormat(v => formatNum(v, spec)));
      styleAxis(xAxis); styleAxis(yAxis); styleGrid(yAxis); xLabel();
      svg.append("text").attr("transform", `translate(18 ${margin.top + height / 2}) rotate(-90)`).attr("text-anchor", "middle").attr("fill", t.muted).attr("font-size", axisTextSize(spec)).text("Density");
      const curve = curveMap[strStyle(spec, "curve", "monotone-x")] || d3.curveMonotoneX;
      const area = d3.area().x(d => x(d.x)).y0(height).y1(d => y(d.y)).curve(curve);
      const line = d3.line().x(d => x(d.x)).y(d => y(d.y)).curve(curve);
      marks.append("path").datum(den).attr("d", area).attr("fill", palette[0]).attr("fill-opacity", numStyle(spec, "area_opacity", 0.22));
      marks.append("path").datum(den).attr("d", line).attr("fill", "none").attr("stroke", palette[0]).attr("stroke-width", numStyle(spec, "line_width", 3));
      return;
    }

    if (isBarType(type)) {
      const ag = aggregateGrouped(rows, spec);
      const x = d3.scaleBand().domain(ag.categories.map(text)).range([0, width]).padding(0.16);
      const ymax = d3.max(ag.series, series => d3.max(series.data, Number)) || 1;
      const y = d3.scaleLinear().domain([0, ymax]).nice().range([height, 0]);
      const xAxis = plot.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
      const yAxis = plot.append("g").call(d3.axisLeft(y).ticks(numStyle(spec, "y_ticks", 6)).tickSize(spec.grid === false ? 0 : -width));
      styleAxis(xAxis); styleAxis(yAxis); styleGrid(yAxis); xLabel(); yLabel();
      if (type === "stacked_bar") {
        const table = ag.categories.map((category, i) => Object.assign({ category }, Object.fromEntries(ag.series.map(series => [series.name, Number(series.data[i]) || 0]))));
        const stack = d3.stack().keys(ag.series.map(series => series.name))(table);
        stack.forEach((layer, li) => {
          const rect = marks.selectAll(`rect.cf-stack-${li}`).data(layer).join("rect")
            .attr("x", d => x(text(d.data.category))).attr("width", x.bandwidth())
            .attr("y", d => y(d[1])).attr("height", d => Math.max(0, y(d[0]) - y(d[1])))
            .attr("rx", numStyle(spec, "column_radius", 0)).attr("fill", palette[li % palette.length]).attr("opacity", numStyle(spec, "opacity", 0.9));
          tooltip(rect, d => `${layer.key}\n${xKey || "x"}: ${d.data.category}\n${yKey || "y"}: ${formatNum(d[1] - d[0], spec)}`);
        });
      } else {
        const inner = d3.scaleBand().domain(ag.series.map(series => series.name)).range([0, x.bandwidth()]).padding(0.08);
        ag.series.forEach((series, si) => {
          if (type === "lollipop") {
            const lines = marks.selectAll(`line.cf-lolli-${si}`).data(ag.categories.map((category, i) => ({ category, y: Number(series.data[i]) || 0 }))).join("line")
              .attr("x1", d => x(text(d.category)) + inner(series.name) + inner.bandwidth() / 2).attr("x2", d => x(text(d.category)) + inner(series.name) + inner.bandwidth() / 2)
              .attr("y1", y(0)).attr("y2", d => y(d.y)).attr("stroke", palette[si % palette.length]).attr("stroke-width", numStyle(spec, "line_width", 3));
            const dots = marks.selectAll(`circle.cf-lolli-${si}`).data(ag.categories.map((category, i) => ({ category, y: Number(series.data[i]) || 0 }))).join("circle")
              .attr("cx", d => x(text(d.category)) + inner(series.name) + inner.bandwidth() / 2).attr("cy", d => y(d.y)).attr("r", numStyle(spec, "point_size", Number(spec.markerSize) || 6)).attr("fill", palette[si % palette.length]);
            tooltip(dots, d => `${series.name}\n${xKey || "x"}: ${d.category}\n${yKey || "y"}: ${formatNum(d.y, spec)}`);
          } else {
            const rect = marks.selectAll(`rect.cf-bar-${si}`).data(ag.categories.map((category, i) => ({ category, y: Number(series.data[i]) || 0 }))).join("rect")
              .attr("x", d => x(text(d.category)) + inner(series.name)).attr("width", inner.bandwidth())
              .attr("y", d => y(d.y)).attr("height", d => height - y(d.y))
              .attr("rx", numStyle(spec, "column_radius", 0)).attr("fill", palette[si % palette.length]).attr("opacity", numStyle(spec, "opacity", 0.9));
            tooltip(rect, d => `${series.name}\n${xKey || "x"}: ${d.category}\n${yKey || "y"}: ${formatNum(d.y, spec)}`);
          }
        });
      }
      drawD3Legend(svg, ag.series.map(series => series.name), palette, spec, dim, margin);
      return;
    }

    const all = groups(rows, spec).flatMap(g => xyRows(g.rows, spec).map((d, index) => Object.assign({}, d, { series: g.name, index })));
    if (!all.length) throw new Error("No plottable rows were found for this mapping.");
    const requestedX = strStyle(spec, "x_scale", "auto");
    const allNumeric = all.every(d => toNumber(d.x) !== null);
    const allDates = all.every(d => !Number.isNaN(Date.parse(text(d.x))));
    const xKind = requestedX === "auto" ? (allNumeric ? "linear" : allDates ? "time" : "band") : requestedX;
    const xValue = d => xKind === "time" ? new Date(d.x) : (xKind === "band" ? text(d.x) : Number(d.x));
    let x;
    if (xKind === "band") x = d3.scalePoint().domain(unique(all.map(d => text(d.x)))).range([0, width]).padding(0.5);
    else if (xKind === "time") x = d3.scaleTime().domain(d3.extent(all, d => new Date(d.x))).nice().range([0, width]);
    else if (xKind === "log") x = d3.scaleLog().domain(d3.extent(all.filter(d => Number(d.x) > 0), d => Number(d.x))).nice().range([0, width]);
    else if (xKind === "sqrt") x = d3.scaleSqrt().domain(d3.extent(all, d => Number(d.x))).nice().range([0, width]);
    else x = d3.scaleLinear().domain(d3.extent(all, d => Number(d.x))).nice().range([0, width]);
    const requestedY = strStyle(spec, "y_scale", "linear");
    let y;
    if (requestedY === "log") y = d3.scaleLog().domain(d3.extent(all.filter(d => d.y > 0), d => d.y)).nice().range([height, 0]);
    else if (requestedY === "sqrt") y = d3.scaleSqrt().domain(d3.extent(all, d => d.y)).nice().range([height, 0]);
    else y = d3.scaleLinear().domain(d3.extent(all, d => d.y)).nice().range([height, 0]);
    const xAxis = plot.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).ticks(numStyle(spec, "x_ticks", 6)));
    const yAxis = plot.append("g").call(d3.axisLeft(y).ticks(numStyle(spec, "y_ticks", 6)).tickSize(spec.grid === false ? 0 : -width).tickFormat(v => formatNum(v, spec)));
    styleAxis(xAxis); styleAxis(yAxis); styleGrid(yAxis); xLabel(); yLabel();
    const curve = curveMap[strStyle(spec, "curve", type === "spline" ? "catmull-rom" : type === "step" ? "step" : "linear")] || d3.curveLinear;
    groups(rows, spec).forEach((g, gi) => {
      const pts = xyRows(g.rows, spec).map((d, index) => Object.assign({}, d, { series: g.name, index })).sort((a, b) => {
        const av = xValue(a), bv = xValue(b); return av < bv ? -1 : av > bv ? 1 : 0;
      });
      const line = d3.line().defined(d => Number.isFinite(d.y)).x(d => x(xValue(d))).y(d => y(d.y)).curve(curve);
      if (isAreaType(type)) {
        const baseline = y.domain().includes(0) ? y(0) : y(y.domain()[0]);
        const area = d3.area().defined(d => Number.isFinite(d.y)).x(d => x(xValue(d))).y0(baseline).y1(d => y(d.y)).curve(curve);
        marks.append("path").datum(pts).attr("d", area).attr("fill", palette[gi % palette.length]).attr("fill-opacity", numStyle(spec, "area_opacity", 0.28));
      }
      if (isLineType(type) || isAreaType(type)) marks.append("path").datum(pts).attr("d", line).attr("fill", "none").attr("stroke", palette[gi % palette.length]).attr("stroke-width", numStyle(spec, "line_width", 3)).attr("stroke-dasharray", strStyle(spec, "line_dash", "solid") === "dashed" ? "7 5" : null).attr("stroke-linejoin", "round").attr("stroke-linecap", "round");
      const pointSize = numStyle(spec, "point_size", Number(spec.markerSize) || 7);
      const symbol = d3.symbol().type(symbolMap[strStyle(spec, "point_symbol", "circle")] || d3.symbolCircle);
      const point = marks.selectAll(`path.cf-point-${gi}`).data(pts).join("path")
        .attr("class", `cf-point-${gi}`).attr("transform", d => `translate(${x(xValue(d))},${y(d.y)})`)
        .attr("d", d => symbol.size(type === "bubble" ? Math.max(36, Math.abs(d.y) * pointSize * 2) : pointSize * pointSize)())
        .attr("fill", palette[gi % palette.length]).attr("opacity", numStyle(spec, "opacity", 0.88));
      tooltip(point, d => tooltipText(d, spec));
    });
    drawD3Legend(svg, groups(rows, spec).map(g => g.name), palette, spec, dim, margin);
    if (Boolean(st.zoom)) {
      svg.call(d3.zoom().scaleExtent([0.5, 20]).translateExtent([[margin.left, margin.top], [margin.left + width, margin.top + height]]).on("zoom", event => marks.attr("transform", event.transform)));
    }
    if (Boolean(st.brush)) plot.append("g").attr("class", "cf-d3-brush").call(d3.brush().extent([[0, 0], [width, height]]));
  }

  function drawD3Legend(svg, names, palette, spec, dim, margin) {
    const d3 = global.d3;
    if (!legendVisible(spec) || !names || names.length < 2) return;
    const uniqueNames = unique(names);
    const pos = legendPosition(spec);
    const vertical = pos === "left" || pos === "right";
    const x0 = pos === "right" ? dim.width - margin.right + 18 : pos === "left" ? 10 : margin.left;
    const y0 = pos === "top" ? 58 : pos === "bottom" ? dim.height - 42 : margin.top;
    const legend = svg.append("g").attr("class", "cf-d3-legend");
    uniqueNames.forEach((name, i) => {
      const x = x0 + (vertical ? 0 : i * Math.max(90, (dim.width - margin.left - margin.right) / Math.max(1, uniqueNames.length)));
      const y = y0 + (vertical ? i * 23 : 0);
      legend.append("circle").attr("cx", x).attr("cy", y).attr("r", 5).attr("fill", palette[i % palette.length]);
      legend.append("text").attr("x", x + 10).attr("y", y + 4).attr("fill", themeOf(spec).ink).attr("font-size", textSize(spec)).text(name);
    });
  }

  function renderVega(el, rows, spec) {
    if (!global.vegaEmbed) throw new Error("vega-embed is not loaded.");
    const type = chartType(spec), x = spec.mappings?.x, y = spec.mappings?.y, group = spec.mappings?.group, labels = labelKeys(spec), dim = dimensions(spec), st = rendererStyle(spec);
    if (type === "treemap") return renderNativeSvg(el, rows, spec);
    let vl;
    if (isPieType(type)) {
      vl = { $schema: "https://vega.github.io/schema/vega-lite/v6.json", width: dim.width - 120, height: dim.height - 100, title: titleObject(spec), data: { values: aggregate(rows, x, y, spec) }, mark: { type: "arc", innerRadius: type === "donut" ? 70 : 0, tooltip: true }, encoding: { theta: { field: "y", type: "quantitative" }, color: { field: "x", type: "nominal", scale: { range: specPalette(spec) } } } };
    } else if (type === "histogram") {
      const h = histogram(rows, spec);
      vl = { $schema: "https://vega.github.io/schema/vega-lite/v6.json", width: dim.width - 120, height: dim.height - 120, title: titleObject(spec), data: { values: h }, mark: { type: "bar", tooltip: true }, encoding: { x: { field: "x0", type: "quantitative", title: x || "" }, x2: { field: "x1" }, y: { field: "y", type: "quantitative", title: "Count" }, tooltip: [{ field: "label", type: "nominal", title: "Bin" }, { field: "y", type: "quantitative", title: "Count" }] } };
    } else if (type === "density") {
      const d = density(rows, spec);
      vl = { $schema: "https://vega.github.io/schema/vega-lite/v6.json", width: dim.width - 120, height: dim.height - 120, title: titleObject(spec), data: { values: d }, mark: { type: "area", line: true, tooltip: true, opacity: numStyle(spec, "opacity", 0.35) }, encoding: { x: { field: "x", type: "quantitative", title: x || "" }, y: { field: "y", type: "quantitative", title: "Density" }, tooltip: [{ field: "x", type: "quantitative" }, { field: "y", type: "quantitative", title: "Density" }] } };
    } else if (type === "boxplot") {
      vl = { $schema: "https://vega.github.io/schema/vega-lite/v6.json", width: dim.width - 120, height: dim.height - 120, title: titleObject(spec), data: { values: rows }, mark: { type: "boxplot", extent: "min-max" }, encoding: { x: { field: x, type: "nominal" }, y: { field: y, type: "quantitative" }, color: group ? { field: group, type: "nominal", scale: { range: specPalette(spec) } } : undefined } };
    } else if (type === "heatmap") {
      const hm = heatmapData(rows, spec);
      vl = { $schema: "https://vega.github.io/schema/vega-lite/v6.json", width: dim.width - 120, height: dim.height - 120, title: titleObject(spec), data: { values: hm.cells }, mark: "rect", encoding: { x: { field: "x", type: "nominal" }, y: { field: "y", type: "nominal" }, color: { field: "value", type: "quantitative" }, tooltip: [{ field: "x" }, { field: "y" }, { field: "value" }] } };
    } else if (isBarType(type)) {
      const values = tableForSimple(rows, spec);
      const encoding = { x: { field: "x", type: "nominal", title: x || "" }, y: { field: "y", type: "quantitative", title: y || (aggregationMethod(spec) === "count" ? "Count" : ""), stack: type === "stacked_bar" ? "zero" : null }, color: { field: "group", type: "nominal", scale: { range: specPalette(spec) } }, tooltip: [{ field: "x" }, { field: "group" }, { field: "y", type: "quantitative" }] };
      if (type === "lollipop") {
        vl = { $schema: "https://vega.github.io/schema/vega-lite/v6.json", width: dim.width - 120, height: dim.height - 120, title: titleObject(spec), data: { values }, encoding, layer: [{ mark: { type: "rule", strokeWidth: numStyle(spec, "stroke_width", 3) }, encoding: { y2: { datum: 0 } } }, { mark: { type: "point", filled: true, size: Math.pow(Number(spec.markerSize) || 8, 2) } }] };
      } else {
        vl = { $schema: "https://vega.github.io/schema/vega-lite/v6.json", width: dim.width - 120, height: dim.height - 120, title: titleObject(spec), data: { values }, mark: { type: "bar", tooltip: true, opacity: numStyle(spec, "opacity", 0.9) }, encoding };
      }
    } else {
      const mark = isAreaType(type) ? "area" : isLineType(type) ? "line" : "point";
      vl = { $schema: "https://vega.github.io/schema/vega-lite/v6.json", width: dim.width - 120, height: dim.height - 120, title: titleObject(spec), data: { values: rows }, mark: mark === "point" ? { type: "point", filled: st.filled !== false, size: type === "bubble" ? 160 : numStyle(spec, "point_size", 80), opacity: numStyle(spec, "opacity", 0.9), tooltip: true } : { type: mark, tooltip: true, strokeWidth: numStyle(spec, "stroke_width", 3), opacity: numStyle(spec, "opacity", 0.9), interpolate: type === "spline" ? "monotone" : (type === "step" ? "step-after" : "linear") }, encoding: { x: { field: x, type: inferType(rows, x) }, y: { field: y, type: "quantitative", stack: type === "stacked_area" ? "zero" : undefined }, color: group ? { field: group, type: "nominal", scale: { range: specPalette(spec) } } : undefined, size: type === "bubble" ? { field: y, type: "quantitative" } : undefined, tooltip: [...labels.map(field => ({ field, type: "nominal" })), x ? { field: x, type: inferType(rows, x) } : undefined, y ? { field: y, type: "quantitative" } : undefined, group ? { field: group, type: "nominal" } : undefined].filter(Boolean) } };
    }
    const selectionMode = strStyle(spec, "selection", st.interval_selection ? "interval" : st.nearest_selection ? "nearest" : "none");
    if (selectionMode === "interval") vl.params = [{ name: "brush", select: { type: "interval" } }];
    if (selectionMode === "nearest") vl.params = (vl.params || []).concat([{ name: "nearest", select: { type: "point", nearest: true, on: "pointerover", clear: "pointerout" } }]);
    const xScaleType = strStyle(spec, "x_scale", "auto"), yScaleType = strStyle(spec, "y_scale", "linear");
    if (vl.encoding?.x) {
      vl.encoding.x.scale = mergeDeep(vl.encoding.x.scale || {}, { type: xScaleType === "auto" ? undefined : xScaleType, zero: Boolean(st.scale_zero), nice: st.scale_nice !== false });
      if (["quantitative", "temporal"].includes(vl.encoding.x.type)) {
        const desiredXTicks = Math.max(2, Math.round(numStyle(spec, "x_ticks", Math.min(10, Math.max(5, dim.width / 115)))));
        vl.encoding.x.axis = mergeDeep({ tickCount: desiredXTicks, labelFontSize: axisTextSize(spec), titleFontSize: textSize(spec) }, vl.encoding.x.axis || {});
      }
    }
    if (vl.encoding?.y) {
      vl.encoding.y.scale = mergeDeep(vl.encoding.y.scale || {}, { type: yScaleType === "auto" ? undefined : yScaleType, zero: Boolean(st.scale_zero), nice: st.scale_nice !== false });
      if (vl.encoding.y.type === "quantitative") {
        const desiredYTicks = Math.max(2, Math.round(numStyle(spec, "y_ticks", 6)));
        vl.encoding.y.axis = mergeDeep({ tickCount: desiredYTicks, labelFontSize: axisTextSize(spec), titleFontSize: textSize(spec) }, vl.encoding.y.axis || {});
      }
    }
    vl.autosize = { type: strStyle(spec, "autosize", "fit"), contains: "padding" };
    vl.config = mergeDeep({ axis: { labelAngle: numStyle(spec, "axis_label_angle", numStyle(spec, "axis_angle", 0)), grid: spec.grid !== false }, numberFormat: decimalMark(spec) === "," ? ",.3f" : ",.3f" }, vl.config || {});
    const embedOptions = mergeDeep({ actions: st.actions !== false, renderer: strStyle(spec, "renderer", "svg") }, optionFor(spec, "vega_config"));
    global.vegaEmbed(el, vl, embedOptions);
  }
  function titleObject(spec) { return { text: spec.title || "", subtitle: spec.subtitle || "" }; }
  function inferType(rows, key) {
    if (!key) return "nominal";
    if (rows.every(r => toNumber(value(r, key)) !== null)) return "quantitative";
    if (rows.every(r => { const v = value(r, key); return isMissing(v) || !Number.isNaN(Date.parse(text(v))); })) return "temporal";
    return "nominal";
  }

  function renderObservable(el, rows, spec) {
    if (!global.Plot) throw new Error("Observable Plot is not loaded.");
    const Plot = global.Plot, type = chartType(spec), x = spec.mappings?.x, y = spec.mappings?.y, group = spec.mappings?.group, st = rendererStyle(spec);
    const palette = specPalette(spec), t = themeOf(spec), dim = dimensions(spec);
    if (isPieType(type) || ["boxplot", "heatmap", "treemap", "lollipop"].includes(type)) return renderNativeSvg(el, rows, spec);
    let marks;
    if (type === "histogram") {
      const h = histogram(rows, spec);
      marks = [Plot.rectY(h, { x1: "x0", x2: "x1", y: "y", fill: palette[0], title: d => `${d.label}
Count: ${d.y}` })];
    }
    else if (type === "density") {
      const d = density(rows, spec);
      marks = [Plot.areaY(d, { x: "x", y: "y", fill: palette[0], fillOpacity: numStyle(spec, "opacity", 0.25) }), Plot.lineY(d, { x: "x", y: "y", stroke: palette[0], strokeWidth: numStyle(spec, "line_width", 3) })];
    }
    else if (isBarType(type)) {
      const values = tableForSimple(rows, spec);
      marks = [Plot.barY(values, { x: "x", y: "y", fill: "group", title: d => `${d.label}
${formatNum(d.y, spec)}` })];
    }
    else if (isLineType(type)) marks = [Plot.lineY(rows, { x, y, stroke: group, marker: true, curve: strStyle(spec, "curve", type === "spline" ? "catmull-rom" : (type === "step" ? "step-after" : "linear")), strokeWidth: numStyle(spec, "line_width", 2.5) })];
    else if (isAreaType(type)) marks = [Plot.areaY(rows, { x, y, fill: group || palette[0], fillOpacity: numStyle(spec, "opacity", 0.35) }), Plot.lineY(rows, { x, y, stroke: group || palette[0], strokeWidth: numStyle(spec, "line_width", 2.5) })];
    else marks = [Plot.dot(rows, { x, y, fill: group || palette[0], fillOpacity: numStyle(spec, "opacity", 0.88), r: type === "bubble" ? d => Math.max(3, Math.sqrt(Math.abs(toNumber(value(d, y)) || 1)) * 1.8) : Number(spec.markerSize) || 5, title: d => tooltipText({ x: value(d, x), y: value(d, y), group: group ? value(d, group) : null, label: pointLabel(d, spec, "") }, spec) })];
    if (Boolean(st.tip) && Plot.tip && Plot.pointer && !["histogram", "density"].includes(type)) marks.push(Plot.tip(rows, Plot.pointer({ x, y, title: d => pointLabel(d, spec, "") })));
    if (Boolean(st.crosshair) && Plot.crosshair && x && y) marks.push(Plot.crosshair(rows, { x, y }));
    const plot = Plot.plot({ width: dim.width, height: dim.height, marginLeft: numStyle(spec, "margin_left", 64), marginRight: numStyle(spec, "margin_right", 28), marginTop: numStyle(spec, "margin_top", 42), marginBottom: numStyle(spec, "margin_bottom", 52), color: { range: palette, legend: legendVisible(spec, rows) }, style: { background: t.panel, color: t.ink, fontFamily: fontFamily(spec) }, grid: spec.grid !== false, x: { label: x, type: strStyle(spec, "x_scale", "auto") === "auto" ? undefined : strStyle(spec, "x_scale", "auto"), nice: st.scale_nice !== false, zero: Boolean(st.scale_zero) }, y: { label: y, type: strStyle(spec, "y_scale", "linear"), nice: st.scale_nice !== false, zero: Boolean(st.scale_zero) }, marks: [st.frame === false ? null : Plot.frame(), ...marks].filter(Boolean) });
    el.innerHTML = titleHtml(spec);
    el.appendChild(plot);
  }

  function renderChartJs(el, rows, spec) {
    if (!global.Chart) throw new Error("Chart.js is not loaded.");
    const type = chartType(spec), st = rendererStyle(spec);
    if (["boxplot", "heatmap", "treemap", "lollipop"].includes(type)) return renderNativeSvg(el, rows, spec);
    el.innerHTML = "";
    const canvas = document.createElement("canvas");
    const dim = dimensions(spec);
    canvas.width = Math.round(dim.width * dpi(spec));
    canvas.height = Math.round(dim.height * dpi(spec));
    canvas.style.width = `${dim.width}px`;
    canvas.style.maxWidth = "none";
    canvas.style.height = `${dim.height}px`;
    el.appendChild(canvas);
    const palette = specPalette(spec), xKey = spec.mappings?.x, yKey = spec.mappings?.y;
    let cfg;
    if (isPieType(type)) {
      const a = aggregate(rows, xKey, yKey, spec);
      cfg = { type: type === "donut" ? "doughnut" : "pie", data: { labels: a.map(d => d.x), datasets: [{ data: a.map(d => d.y), backgroundColor: palette }] } };
    } else if (type === "histogram") {
      const d = histogram(rows, spec);
      cfg = { type: "bar", data: { labels: d.map(v => v.label), datasets: [{ label: "Count", data: d.map(v => v.y), backgroundColor: palette[0], borderWidth: 0, categoryPercentage: 1, barPercentage: 1 }] } };
    } else if (type === "density") {
      const d = density(rows, spec);
      cfg = { type: "line", data: { datasets: [{ label: "Density", data: d.map(v => ({ x: v.x, y: v.y, label: v.label })), borderColor: palette[0], backgroundColor: palette[0] + "44", fill: true, pointRadius: 0, borderWidth: numStyle(spec, "border_width", 3), tension: numStyle(spec, "tension", 0.25) }] } };
    } else if (isBarType(type)) {
      const ag = aggregateGrouped(rows, spec);
      cfg = { type: "bar", data: { labels: ag.categories, datasets: ag.series.map((s, i) => ({ label: s.name, data: s.data, backgroundColor: palette[i % palette.length] })) } };
    } else {
      cfg = { type: isAreaType(type) ? "line" : isLineType(type) ? "line" : "scatter", data: { datasets: groups(rows, spec).map((g, i) => ({ label: g.name, data: xyRows(g.rows, spec).map((d, j) => ({ x: toNumber(d.x) ?? j + 1, y: d.y, label: d.label, group: text(d.group) })), borderColor: palette[i % palette.length], backgroundColor: palette[i % palette.length] + "55", showLine: isLineType(type) || isAreaType(type), fill: isAreaType(type), tension: numStyle(spec, "tension", type === "spline" ? 0.35 : 0), borderWidth: numStyle(spec, "border_width", 3), pointStyle: strStyle(spec, "point_style", "circle"), pointRadius: type === "bubble" ? (ctx => Math.max(4, Math.sqrt(Math.abs(ctx.raw?.y || 1)))) : numStyle(spec, "point_radius", Number(spec.markerSize) || 5), stepped: type === "step" })) } };
    }
    cfg.options = mergeDeep({ responsive: false, maintainAspectRatio: false, devicePixelRatio: dpi(spec), animation: spec.animation === false ? false : { duration: numStyle(spec, "animation_duration", 800), easing: strStyle(spec, "easing", "easeOutQuart") }, interaction: { mode: strStyle(spec, "interaction_mode", "nearest"), intersect: st.intersect !== false }, plugins: { title: { display: Boolean(spec.title), text: spec.title || "", font: { size: titleSize(spec), family: fontFamily(spec) } }, subtitle: { display: Boolean(spec.subtitle), text: spec.subtitle || "", font: { size: subtitleSize(spec), family: fontFamily(spec) } }, legend: { display: legendVisible(spec, rows), position: legendPosition(spec) === "left" ? "left" : legendPosition(spec) === "right" ? "right" : legendPosition(spec) === "top" ? "top" : "bottom", labels: { font: { size: textSize(spec), family: fontFamily(spec) } } }, decimation: { enabled: strStyle(spec, "decimation", "none") !== "none", algorithm: strStyle(spec, "decimation", "min-max"), samples: numStyle(spec, "decimation_samples", 500) }, tooltip: { enabled: spec.tooltip !== false, callbacks: { label: ctx => { const raw = ctx.raw || {}; const label = raw.label ? `${raw.label}: ` : ""; const y = raw.y ?? ctx.parsed?.y; return `${label}${ctx.dataset?.label || ""} ${formatNum(Number(y), spec)}`; } } } }, scales: { x: { stacked: type === "stacked_bar", grid: { display: spec.grid !== false }, ticks: { font: { size: axisTextSize(spec) }, callback: v => typeof v === "number" ? formatNum(v, spec) : v } }, y: { stacked: type === "stacked_bar" || type === "stacked_area", grid: { display: spec.grid !== false }, ticks: { font: { size: axisTextSize(spec) }, callback: v => typeof v === "number" ? formatNum(v, spec) : v } } } }, optionFor(spec, "chartjs_options"));
    if (type === "density") {
      cfg.options.scales.x = mergeDeep(cfg.options.scales.x, { type: "linear", title: { display: true, text: xKey || "" } });
      cfg.options.scales.y = mergeDeep(cfg.options.scales.y, { beginAtZero: true, title: { display: true, text: "Density" } });
    } else if (type === "histogram") {
      cfg.options.scales.x = mergeDeep(cfg.options.scales.x, { offset: false, title: { display: true, text: xKey || "" } });
      cfg.options.scales.y = mergeDeep(cfg.options.scales.y, { beginAtZero: true, title: { display: true, text: "Count" } });
    }
    new global.Chart(canvas.getContext("2d"), cfg);
  }

  function renderECharts(el, rows, spec) {
    if (!global.echarts) throw new Error("Apache ECharts is not loaded.");
    if (el._cfEChart) { try { el._cfEChart.dispose(); } catch (e) {} }
    const chart = global.echarts.init(el, null, { renderer: "canvas", width: dimensions(spec).width, height: dimensions(spec).height });
    el._cfEChart = chart;
    const palette = specPalette(spec), t = themeOf(spec), type = chartType(spec), xKey = spec.mappings?.x, yKey = spec.mappings?.y, st = rendererStyle(spec);
    let option;
    if (isPieType(type)) {
      const a = aggregate(rows, xKey, yKey, spec);
      option = { title: { text: spec.title, subtext: spec.subtitle, textStyle: { color: t.ink } }, color: palette, tooltip: {}, series: [{ type: "pie", radius: type === "donut" ? ["40%", "70%"] : "68%", data: a.map(d => ({ name: d.x, value: d.y })) }] };
    } else if (type === "histogram") {
      const d = histogram(rows, spec);
      option = axisOption(spec, t, palette, d.map(v => v.label), [{ name: "Count", type: "bar", barCategoryGap: "0%", barGap: "0%", data: d.map(v => v.y) }]);
      option.yAxis.name = "Count";
    } else if (type === "density") {
      const d = density(rows, spec);
      option = axisOption(spec, t, palette, null, [{ name: "Density", type: "line", showSymbol: false, smooth: Boolean(st.smooth), areaStyle: { opacity: numStyle(spec, "area_opacity", 0.22) }, data: d.map(v => [v.x, v.y]) }]);
      option.yAxis.name = "Density";
    } else if (type === "boxplot") {
      const b = boxData(rows, spec);
      option = axisOption(spec, t, palette, b.map(v => v.x), [{ name: yKey || "Values", type: "boxplot", data: b.map(v => [v.low, v.q1, v.median, v.q3, v.high]) }]);
    } else if (type === "heatmap") {
      const hm = heatmapData(rows, spec);
      option = { backgroundColor: t.panel, color: palette, title: { text: spec.title || "", subtext: spec.subtitle || "", textStyle: { color: t.ink } }, tooltip: {}, grid: { left: 96, right: 30, top: 90, bottom: 70 }, xAxis: { type: "category", data: hm.xCats }, yAxis: { type: "category", data: hm.yCats }, visualMap: { min: 0, max: Math.max(1, ...hm.cells.map(c => c.value)), calculable: true, orient: "horizontal", left: "center", bottom: 10 }, series: [{ type: "heatmap", data: hm.cells.map(c => [c.xi, c.yi, c.value]) }] };
    } else if (type === "treemap") {
      const tr = treemapData(rows, spec);
      option = { backgroundColor: t.panel, color: palette, title: { text: spec.title || "", subtext: spec.subtitle || "", textStyle: { color: t.ink } }, series: [{ type: "treemap", data: tr.map(d => ({ name: d.x, value: d.y })) }] };
    } else if (isBarType(type)) {
      const ag = aggregateGrouped(rows, spec);
      option = axisOption(spec, t, palette, ag.categories, ag.series.map((s, i) => ({ name: s.name, type: type === "lollipop" ? "bar" : "bar", stack: type === "stacked_bar" ? "total" : undefined, data: s.data, itemStyle: { color: palette[i % palette.length] } })));
    } else {
      const series = groups(rows, spec).map((g, i) => ({ name: g.name, type: isAreaType(type) || isLineType(type) ? "line" : "scatter", smooth: type === "spline" || Boolean(st.smooth), symbol: strStyle(spec, "symbol", "circle"), lineStyle: { width: numStyle(spec, "line_width", 3), type: strStyle(spec, "line_dash", "solid") }, step: type === "step" ? "end" : false, stack: type === "stacked_area" ? "total" : undefined, areaStyle: isAreaType(type) ? { opacity: numStyle(spec, "area_opacity", 0.28) } : undefined, symbolSize: type === "bubble" ? val => Math.max(8, Math.sqrt(Math.abs(val[1] || 1)) * numStyle(spec, "bubble_scale", 3)) : numStyle(spec, "symbol_size", Number(spec.markerSize) || 8), data: xyRows(g.rows, spec).map((d, j) => ({ value: [toNumber(d.x) ?? j, d.y], name: d.label || text(d.x), group: text(d.group) })), itemStyle: { color: palette[i % palette.length] } }));
      option = axisOption(spec, t, palette, null, series);
    }
    option.animation = spec.animation !== false;
    if ((Boolean(st.data_zoom) || Boolean(st.inside_zoom)) && !isPieType(type)) option.dataZoom = [Boolean(st.inside_zoom) ? { type: "inside" } : null, Boolean(st.data_zoom) ? { type: "slider", show: true } : null].filter(Boolean);
    if (Boolean(st.toolbox)) option.toolbox = { feature: { dataZoom: {}, restore: {}, saveAsImage: {} } };
    const axisPointerType = strStyle(spec, "axis_pointer", strStyle(spec, "axis_pointer_type", "none"));
    if (axisPointerType !== "none") option.axisPointer = { show: true, type: axisPointerType };
    if (Boolean(st.labels) && option.series) option.series.forEach(series => { series.label = mergeDeep(series.label || {}, { show: true, position: "top" }); });
    chart.setOption(mergeDeep(option, optionFor(spec, "echarts_options")));
    global.addEventListener("resize", () => chart.resize(), { passive: true });
  }
  function axisOption(spec, t, palette, categories, series) {
    const pos = legendPosition(spec);
    const legend = !legendVisible(spec) ? { show: false } : { show: true, type: "scroll", orient: pos === "left" || pos === "right" ? "vertical" : "horizontal", left: pos === "left" ? 6 : (pos === "right" ? undefined : "center"), right: pos === "right" ? 8 : undefined, top: pos === "top" ? 52 : undefined, bottom: pos === "bottom" ? 8 : undefined, textStyle: { color: t.ink, fontSize: textSize(spec), fontFamily: fontFamily(spec) } };
    return mergeDeep({ backgroundColor: t.panel, color: palette, textStyle: { fontFamily: fontFamily(spec), fontSize: textSize(spec) }, title: { text: spec.title || "", subtext: spec.subtitle || "", textStyle: { color: t.ink, fontSize: titleSize(spec) }, subtextStyle: { color: t.muted, fontSize: subtitleSize(spec) } }, tooltip: { show: spec.tooltip !== false, trigger: categories ? "axis" : "item", formatter: params => { const p = Array.isArray(params) ? params[0] : params; const data = p && p.data ? p.data : {}; const value = Array.isArray(data.value) ? data.value[1] : (Array.isArray(p?.value) ? p.value[1] : p?.value); const name = data.name || p?.name || ""; return `${esc(name)}<br>${esc(p?.seriesName || "")}: ${esc(formatNum(Number(value), spec))}`; } }, legend, grid: { left: 72, right: pos === "right" ? 150 : 32, top: pos === "top" ? 116 : 92, bottom: pos === "bottom" ? 88 : 60 }, xAxis: { type: categories ? "category" : "value", data: categories || undefined, name: spec.mappings?.x || "", axisLabel: { color: t.muted, fontSize: axisTextSize(spec), formatter: v => typeof v === "number" ? formatNum(v, spec) : v }, axisLine: { lineStyle: { color: t.grid } }, splitLine: { show: spec.grid !== false, lineStyle: { color: t.grid } } }, yAxis: { type: "value", name: spec.mappings?.y || "", axisLabel: { color: t.muted, fontSize: axisTextSize(spec), formatter: v => formatNum(v, spec) }, axisLine: { lineStyle: { color: t.grid } }, splitLine: { show: spec.grid !== false, lineStyle: { color: t.grid } } }, series }, optionFor(spec, "echarts_options"));
  }


  function renderApexCharts(el, rows, spec) {
    if (!global.ApexCharts) throw new Error("ApexCharts is not loaded.");
    el.innerHTML = "";
    const palette = specPalette(spec), type = chartType(spec), xKey = spec.mappings?.x, yKey = spec.mappings?.y, st = rendererStyle(spec);
    let chartKind = "scatter", series, labels, extra = {};
    if (isPieType(type)) { const a = aggregate(rows, xKey, yKey, spec); series = a.map(d => d.y); labels = a.map(d => d.x); chartKind = type === "donut" ? "donut" : "pie"; }
    else if (type === "histogram") { const d = histogram(rows, spec); series = [{ name: "Count", data: d.map(v => ({ x: v.label, y: v.y, label: v.label })) }]; labels = d.map(v => v.label); chartKind = "bar"; extra.plotOptions = { bar: { columnWidth: "100%" } }; }
    else if (type === "density") { const d = density(rows, spec); series = [{ name: "Density", data: d.map(v => ({ x: v.x, y: v.y, label: v.label })) }]; chartKind = "area"; extra.xaxis = { type: "numeric" }; extra.yaxis = { min: 0, title: { text: "Density" } }; }
    else if (type === "boxplot") { const b = boxData(rows, spec); series = [{ name: yKey || "Values", data: b.map(v => ({ x: v.x, y: [v.low, v.q1, v.median, v.q3, v.high] })) }]; chartKind = "boxPlot"; }
    else if (type === "heatmap") { const hm = heatmapData(rows, spec); series = hm.yCats.map(y => ({ name: y, data: hm.xCats.map(x => ({ x, y: hm.cells.find(c => c.x === x && c.y === y)?.value || 0 })) })); chartKind = "heatmap"; }
    else if (type === "treemap") { const tr = treemapData(rows, spec); series = [{ data: tr.map(d => ({ x: d.x, y: d.y })) }]; chartKind = "treemap"; }
    else if (isBarType(type)) { const ag = aggregateGrouped(rows, spec); series = ag.series.map(s => ({ name: s.name, data: s.data })); labels = ag.categories; chartKind = "bar"; extra.plotOptions = { bar: { horizontal: false } }; extra.chart = { stacked: type === "stacked_bar" }; }
    else { series = groups(rows, spec).map(g => ({ name: g.name, data: xyRows(g.rows, spec).map((d, j) => ({ x: toNumber(d.x) ?? j + 1, y: d.y, z: Math.abs(d.y), label: d.label, group: text(d.group) })) })); chartKind = type === "bubble" ? "bubble" : isAreaType(type) ? "area" : isLineType(type) ? "line" : "scatter"; }
    const cfg = mergeDeep(Object.assign({ chart: Object.assign({ type: chartKind, width: dimensions(spec).width, height: dimensions(spec).height, toolbar: { show: st.toolbar !== false }, zoom: { enabled: Boolean(st.zoom), type: strStyle(spec, "zoom_type", "x"), autoScaleYaxis: Boolean(st.auto_scale_y), allowMouseWheelZoom: Boolean(st.mouse_wheel_zoom) }, sparkline: { enabled: Boolean(st.sparkline) }, animations: { enabled: spec.animation !== false, speed: numStyle(spec, "animation_duration", numStyle(spec, "animation_speed", 800)) }, fontFamily: fontFamily(spec) }, extra.chart || {}), title: { text: spec.title || "", style: { fontSize: `${titleSize(spec)}px`, fontFamily: fontFamily(spec) } }, subtitle: { text: spec.subtitle || "", style: { fontSize: `${subtitleSize(spec)}px`, fontFamily: fontFamily(spec) } }, legend: { show: legendVisible(spec, rows), position: legendPosition(spec) === "left" ? "left" : legendPosition(spec) === "right" ? "right" : legendPosition(spec) === "top" ? "top" : "bottom", fontSize: `${textSize(spec)}px`, fontFamily: fontFamily(spec) }, tooltip: { enabled: spec.tooltip !== false, custom: ({ seriesIndex, dataPointIndex, w }) => { const d = w.config.series?.[seriesIndex]?.data?.[dataPointIndex]; if (d && typeof d === "object") return `<div style="padding:8px 10px"><strong>${esc(d.label || d.x || "")}</strong><br>${esc(w.config.series?.[seriesIndex]?.name || "")}: ${esc(formatNum(d.y, spec))}</div>`; return undefined; } }, colors: palette, series, labels, xaxis: { categories: labels, title: { text: xKey || "" }, labels: { style: { fontSize: `${axisTextSize(spec)}px`, fontFamily: fontFamily(spec) } } }, yaxis: { title: { text: yKey || "" }, labels: { formatter: v => formatNum(v, spec), style: { fontSize: `${axisTextSize(spec)}px`, fontFamily: fontFamily(spec) } } }, dataLabels: { enabled: Boolean(st.data_labels) || isPieType(type) }, markers: { size: numStyle(spec, "marker_size", Number(spec.markerSize) || 6), shape: strStyle(spec, "marker_shape", "circle"), hover: { sizeOffset: numStyle(spec, "marker_hover_offset", 3) } }, stroke: { curve: strStyle(spec, "curve", type === "spline" ? "smooth" : type === "step" ? "stepline" : "straight"), width: numStyle(spec, "stroke_width", 3), dashArray: numStyle(spec, "dash_array", 0) }, fill: { type: strStyle(spec, "fill_type", "solid"), opacity: numStyle(spec, "fill_opacity", isAreaType(type) ? 0.45 : 1) }, dropShadow: { enabled: Boolean(st.drop_shadow ?? st.shadow) } }, extra), optionFor(spec, "apexcharts_options"));
    new global.ApexCharts(el, cfg).render();
  }

  function renderGoogleCharts(el, rows, spec) {
    if (!global.google || !google.charts) {
      loadScriptOnce("https://www.gstatic.com/charts/loader.js").then(() => renderGoogleCharts(el, rows, spec)).catch(err => {
        try { renderNativeSvg(el, rows, spec); } catch (fallbackErr) { fail(el, `Google Charts loader is not loaded. ${err.message || err}`); }
      });
      return;
    }
    google.charts.load("current", { packages: ["corechart", "treemap", "table"] });
    google.charts.setOnLoadCallback(() => {
      try { drawGoogle(el, rows, spec); } catch (err) { fail(el, err.message || String(err)); }
    });
  }
  function googleTooltip(d, spec) {
    const lines = tooltipText(d, spec).split("\n").filter(Boolean).map(line => `<div>${esc(line)}</div>`).join("");
    return `<div style="padding:8px 10px;white-space:nowrap">${lines}</div>`;
  }
  function drawGoogle(el, rows, spec) {
    const type = chartType(spec), xKey = spec.mappings?.x || "x", yKey = spec.mappings?.y || "y", st = rendererStyle(spec);
    if (["boxplot", "heatmap", "lollipop"].includes(type)) return renderNativeSvg(el, rows, spec);
    let ChartClass, array;
    const options = mergeDeep({
      title: spec.title || "",
      subtitle: spec.subtitle || "",
      width: dimensions(spec).width,
      height: dimensions(spec).height,
      legend: googleLegend(spec, rows),
      colors: specPalette(spec),
      fontName: fontFamily(spec),
      fontSize: textSize(spec),
      backgroundColor: themeOf(spec).panel,
      tooltip: { trigger: spec.tooltip === false ? "none" : strStyle(spec, "tooltip_trigger", "focus"), isHtml: true }, crosshair: Boolean(st.crosshair) ? { trigger: strStyle(spec, "crosshair_trigger", "both"), orientation: strStyle(spec, "crosshair_orientation", "both") } : undefined, explorer: Boolean(st.explorer) ? { actions: ["dragToZoom", "rightClickToReset"], axis: strStyle(spec, "explorer_axis", "horizontal"), keepInBounds: true } : undefined, pointSize: numStyle(spec, "point_size", Number(spec.markerSize) || 7), lineWidth: (type === "scatter" || type === "bubble") ? 0 : numStyle(spec, "line_width", 3), dataOpacity: numStyle(spec, "opacity", 0.9)
    }, optionFor(spec, "google_options"));

    if (isPieType(type)) {
      const a = aggregate(rows, xKey, yKey, spec);
      array = [[xKey, yKey], ...a.map(d => [d.x, d.y])];
      ChartClass = google.visualization.PieChart;
      options.pieHole = type === "donut" ? 0.45 : 0;
    } else if (type === "histogram") {
      const d = histogram(rows, spec);
      array = [[xKey || "Bin", "Count"], ...d.map(v => [v.label, v.y])];
      ChartClass = google.visualization.ColumnChart;
      options.bar = mergeDeep(options.bar || {}, { groupWidth: "100%" });
      options.hAxis = mergeDeep(options.hAxis || {}, { title: xKey || "" });
      options.vAxis = mergeDeep(options.vAxis || {}, { title: "Count", minValue: 0, format: "0" });
    } else if (type === "density") {
      const d = density(rows, spec);
      array = [[xKey || "x", "Density"], ...d.map(v => [v.x, v.y])];
      ChartClass = google.visualization.LineChart;
      options.pointSize = 0;
      options.lineWidth = numStyle(spec, "line_width", 3);
      options.hAxis = mergeDeep(options.hAxis || {}, { title: xKey || "" });
      options.vAxis = mergeDeep(options.vAxis || {}, { title: "Density", minValue: 0 });
    } else if (type === "treemap") {
      const a = treemapData(rows, spec);
      array = [["Label", "Parent", "Value"], ["All", null, 0], ...a.map(d => [d.x, "All", d.y])];
      ChartClass = google.visualization.TreeMap;
    } else if (type === "bubble") {
      array = [["ID", xKey, yKey, spec.mappings?.group || "Group", "Size"], ...xyRows(rows, spec).map((d, i) => [d.label || text(d.x) || `Point ${i + 1}`, toNumber(d.x) ?? i + 1, d.y, text(d.group || "Series"), Math.max(1, Math.abs(d.y))])];
      ChartClass = google.visualization.BubbleChart;
    } else if (isBarType(type) || isAreaType(type) || isLineType(type)) {
      const ag = aggregateGrouped(rows, spec);
      array = [[xKey, ...ag.series.map(s => s.name)], ...ag.categories.map((cat, i) => [cat, ...ag.series.map(s => s.data[i])])];
      ChartClass = isAreaType(type) ? google.visualization.AreaChart : isLineType(type) ? google.visualization.LineChart : google.visualization.ColumnChart;
      options.isStacked = ["stacked_bar", "stacked_area"].includes(type);
      if (type === "spline" || strStyle(spec, "curve_type", "none") === "function" || Boolean(st.curve)) options.curveType = "function";
      if (Boolean(st.trendline) || (st.trendline && st.trendline !== "none")) options.trendlines = { 0: { type: typeof st.trendline === "string" ? st.trendline : "linear", showR2: Boolean(st.trendline_r2), visibleInLegend: true } };
    } else {
      const gs = groups(rows, spec);
      const grouped = Boolean(spec.mappings?.group) && gs.length > 1;
      if (grouped) {
        const header = [xKey];
        gs.forEach(g => { header.push(g.name); header.push({ type: "string", role: "tooltip", p: { html: true } }); });
        array = [header];
        gs.forEach((g, gi) => xyRows(g.rows, spec).forEach((d, i) => {
          const row = new Array(1 + gs.length * 2).fill(null);
          row[0] = toNumber(d.x) ?? d.idx ?? i + 1;
          row[1 + gi * 2] = d.y;
          row[2 + gi * 2] = googleTooltip(d, spec);
          array.push(row);
        }));
      } else {
        const annotation = Boolean(st.annotations);
        const header = [xKey, yKey, { type: "string", role: "tooltip", p: { html: true } }];
        if (annotation) header.push({ type: "string", role: "annotation" });
        array = [header, ...xyRows(rows, spec).map((d, i) => {
          const row = [toNumber(d.x) ?? i + 1, d.y, googleTooltip(d, spec)];
          if (annotation) row.push(d.label || "");
          return row;
        })];
      }
      ChartClass = google.visualization.ScatterChart;
      options.lineWidth = 0;
    }
    const dt = google.visualization.arrayToDataTable(array);
    new ChartClass(el).draw(dt, options);
  }

  function renderVChart(el, rows, spec) {
    const VChartCtor = global.VChart && (global.VChart.default || global.VChart.VChart || global.VChart);
    if (!VChartCtor) throw new Error("VisActor VChart is not loaded.");
    if (["boxplot", "heatmap", "treemap", "lollipop", "density"].includes(chartType(spec))) return renderNativeSvg(el, rows, spec);
    el.innerHTML = "";
    const type = chartType(spec), palette = specPalette(spec), t = themeOf(spec), st = rendererStyle(spec);
    const xKey = spec.mappings?.x, yKey = spec.mappings?.y;
    let values, vSpec;
    if (isPieType(type)) {
      values = aggregate(rows, xKey, yKey, spec).map(d => ({ category: d.x, value: d.y, label: d.x }));
      vSpec = {
        type: "pie", data: [{ id: "values", values }], categoryField: "category", valueField: "value",
        innerRadius: type === "donut" ? 0.48 : 0,
        label: { visible: Boolean(st.labels), position: st.label_position || "outside" }
      };
    } else if (isBarType(type)) {
      const ag = aggregateGrouped(rows, spec);
      values = ag.series.flatMap(series => ag.categories.map((category, i) => ({ category, value: Number(series.data[i]) || 0, series: text(series.name), label: `${category} · ${series.name}` })));
      const groupedBars = Boolean(spec.mappings?.group) && type !== "stacked_bar";
      vSpec = {
        type: "bar", data: [{ id: "values", values }],
        xField: groupedBars ? ["category", "series"] : "category", yField: "value",
        seriesField: spec.mappings?.group ? "series" : undefined, stack: type === "stacked_bar",
        bar: { style: { cornerRadius: numStyle(spec, "bar_radius", 0) } },
        label: { visible: Boolean(st.labels), position: st.label_position || "top" }
      };
    } else {
      const raw = xyRows(rows, spec);
      const numericX = raw.length > 0 && raw.every(d => toNumber(d.x) !== null);
      values = groups(rows, spec).flatMap(g => xyRows(g.rows, spec).map((d, j) => ({
        x: numericX ? Number(d.x) : text(d.x),
        y: Number(d.y),
        series: text(g.name),
        label: d.label || text(d.x),
        size: type === "bubble" ? Math.max(1, Math.abs(Number(d.y))) : Number(spec.markerSize) || 8,
        order: j
      })));
      values.sort((a, b) => numericX ? a.x - b.x : a.order - b.order);
      const vType = isAreaType(type) ? "area" : isLineType(type) ? "line" : "scatter";
      const domain = valuesArray => {
        const clean = valuesArray.filter(Number.isFinite);
        if (!clean.length) return [undefined, undefined];
        let min = Math.min(...clean), max = Math.max(...clean);
        const span = max - min;
        const pad = span > 0 ? span * 0.04 : Math.max(1, Math.abs(min) * 0.04);
        return [min - pad, max + pad];
      };
      const [xMin, xMax] = numericX ? domain(values.map(d => d.x)) : [undefined, undefined];
      const [yMin, yMax] = domain(values.map(d => d.y));
      const exactDomain = st.exact_domain !== false;
      vSpec = {
        type: vType, data: [{ id: "values", values }], xField: "x", yField: "y",
        seriesField: spec.mappings?.group ? "series" : undefined,
        sizeField: type === "bubble" ? "size" : undefined,
        stack: type === "stacked_area",
        axes: [
          { orient: "bottom", type: numericX ? "linear" : "band", min: numericX && exactDomain ? xMin : undefined, max: numericX && exactDomain ? xMax : undefined, zero: false, nice: !exactDomain, expand: numericX && !exactDomain ? { min: 0.04, max: 0.04 } : undefined, tickCount: numStyle(spec, "x_tick_count", 6), title: { visible: Boolean(xKey), text: xKey || "" }, label: { style: { fontSize: axisTextSize(spec) }, autoRotate: Boolean(st.axis_auto_rotate), autoHide: Boolean(st.axis_auto_hide) }, grid: { visible: spec.grid !== false } },
          { orient: "left", type: "linear", min: exactDomain ? yMin : undefined, max: exactDomain ? yMax : undefined, zero: false, nice: !exactDomain, expand: !exactDomain ? { min: 0.04, max: 0.04 } : undefined, tickCount: numStyle(spec, "y_tick_count", 6), title: { visible: Boolean(yKey), text: yKey || "" }, label: { style: { fontSize: axisTextSize(spec) } }, grid: { visible: spec.grid !== false } }
        ],
        point: { visible: st.points !== false, style: { size: numStyle(spec, "point_size", Number(spec.markerSize) || 8), fillOpacity: numStyle(spec, "opacity", 0.9) } },
        line: { style: { lineWidth: numStyle(spec, "line_width", 3), lineDash: strStyle(spec, "line_dash", "solid") === "dashed" ? [6, 4] : undefined } },
        area: { style: { fillOpacity: numStyle(spec, "area_opacity", 0.3) } },
        smooth: type === "spline" || Boolean(st.smooth),
        label: { visible: Boolean(st.labels) }
      };
    }
    const dim = dimensions(spec);
    el.style.width = `${dim.width}px`;
    el.style.height = `${dim.height}px`;
    el.style.maxWidth = "none";
    vSpec.width = dim.width;
    vSpec.height = dim.height;
    vSpec.autoFit = false;
    vSpec.background = t.panel;
    vSpec.color = { type: "ordinal", range: palette };
    vSpec.title = { visible: Boolean(spec.title || spec.subtitle), text: spec.title || "", subtext: spec.subtitle || "" };
    vSpec.legends = [{ visible: legendVisible(spec, rows), orient: legendPosition(spec) === "right" ? "right" : legendPosition(spec) === "left" ? "left" : legendPosition(spec) === "top" ? "top" : "bottom", position: strStyle(spec, "legend_align", "middle") }];
    vSpec.tooltip = { visible: spec.tooltip !== false, trigger: st.tooltip_trigger || "hover", mark: { title: { key: "label" } } };
    if (Boolean(st.data_zoom) && !isPieType(type)) vSpec.dataZoom = [{ orient: "bottom", start: 0, end: 100 }];
    if (Boolean(st.crosshair) && !isPieType(type)) vSpec.crosshair = { xField: { visible: true }, yField: { visible: true } };
    vSpec.animation = spec.animation === false ? false : { appear: { duration: numStyle(spec, "animation_duration", 800) } };
    vSpec.padding = { top: legendPosition(spec) === "top" ? 104 : 78, right: legendPosition(spec) === "right" ? 160 : 48, bottom: legendPosition(spec) === "bottom" ? 104 : 64, left: legendPosition(spec) === "left" ? 150 : 82 };
    const chart = new VChartCtor(mergeDeep(vSpec, optionFor(spec, "vchart_options")), {
      dom: el, mode: "desktop-browser", autoFit: false, width: dim.width, height: dim.height
    });
    const rendered = chart.renderAsync ? chart.renderAsync() : chart.renderSync ? chart.renderSync() : chart.render();
    Promise.resolve(rendered).then(() => {
      if (typeof chart.resize === "function") chart.resize(dim.width, dim.height);
    }).catch(error => fail(el, error));
  }

  function renderAnyChart(el, rows, spec) {
    if (!global.anychart) {
      loadScriptOnce("https://cdn.anychart.com/releases/8.14.1/js/anychart-base.min.js").then(() => renderAnyChart(el, rows, spec)).catch(err => {
        try { renderNativeSvg(el, rows, spec); } catch (fallbackErr) { fail(el, `AnyChart is not loaded. ${err.message || err}`); }
      });
      return;
    }
    el.innerHTML = titleHtml(spec);
    const dim = dimensions(spec);
    const holder = document.createElement("div");
    holder.id = `cf-anychart-${Math.random().toString(36).slice(2)}`;
    holder.style.width = `${dim.width}px`;
    holder.style.maxWidth = "none";
    holder.style.height = `${Math.max(120, dim.height - 70)}px`;
    el.appendChild(holder);
    const type = chartType(spec), palette = specPalette(spec), xKey = spec.mappings?.x, yKey = spec.mappings?.y, st = rendererStyle(spec);
    let chart;
    if (isPieType(type)) {
      chart = global.anychart.pie(aggregate(rows, xKey, yKey, spec).map(d => ({ x: d.x, value: d.y, label: d.x })));
      if (type === "donut" && chart.innerRadius) chart.innerRadius("45%");
    } else if (type === "histogram") {
      const d = histogram(rows, spec);
      chart = global.anychart.column(d.map(v => ({ x: v.label, value: v.y, label: v.label })));
      if (chart.barGroupsPadding) chart.barGroupsPadding(0);
      if (chart.barsPadding) chart.barsPadding(0);
    } else if (type === "density") {
      const d = density(rows, spec);
      chart = global.anychart.area();
      const series = chart.area(d.map(v => ({ x: v.x, value: v.y, label: v.label })));
      if (series.stroke) series.stroke(palette[0], numStyle(spec, "line_width", 3));
      if (series.fill) series.fill(`${palette[0]}44`);
    } else if (type === "boxplot" || type === "heatmap" || type === "treemap") {
      return renderNativeSvg(el, rows, spec);
    } else if (isBarType(type)) {
      const ag = aggregateGrouped(rows, spec);
      chart = global.anychart.column();
      ag.series.forEach((s, i) => {
        const series = chart.column(ag.categories.map((cat, j) => ({ x: cat, value: s.data[j], label: `${cat} · ${s.name}` })));
        if (series.name) series.name(s.name);
        if (series.fill) series.fill(palette[i % palette.length]);
      });
      if (type === "stacked_bar" && chart.yScale && chart.yScale().stackMode) chart.yScale().stackMode("value");
    } else if (isLineType(type) || isAreaType(type)) {
      chart = isAreaType(type) ? global.anychart.area() : global.anychart.line();
      groups(rows, spec).forEach((g, i) => {
        const pts = xyRows(g.rows, spec).map((d, j) => ({ x: toNumber(d.x) ?? text(d.x || j + 1), value: d.y, label: d.label }));
        const s = isAreaType(type) ? chart.area(pts) : chart.line(pts);
        if (s.name) s.name(g.name);
        if (s.stroke) s.stroke(palette[i % palette.length], numStyle(spec, "line_width", 3));
        if (s.markers && Boolean(st.labels)) s.markers().enabled(true);
        if (s.fill && isAreaType(type)) s.fill(`${palette[i % palette.length]}66`);
      });
    } else {
      chart = global.anychart.scatter();
      groups(rows, spec).forEach((g, i) => {
        const pts = xyRows(g.rows, spec).map((d, j) => ({ x: toNumber(d.x) ?? j + 1, value: d.y, label: d.label, size: type === "bubble" ? Math.max(8, Math.sqrt(Math.abs(d.y)) * 4) : Number(spec.markerSize) || 8 }));
        const s = chart.marker(pts);
        if (s.name) s.name(g.name);
        if (s.size) s.size(type === "bubble" ? undefined : numStyle(spec, "marker_size", Number(spec.markerSize) || 8));
        if (s.type) s.type(strStyle(spec, "marker_type", strStyle(spec, "marker_shape", "circle")));
        if (s.fill) s.fill(palette[i % palette.length]);
        if (s.stroke) s.stroke(palette[i % palette.length]);
      });
    }
    if (chart.title) chart.title(spec.title || "");
    if (chart.palette) chart.palette(palette);
    if (chart.legend && chart.legend().enabled) { chart.legend().enabled(legendVisible(spec, rows)); if (chart.legend().position) chart.legend().position(legendPosition(spec)); }
    if (chart.animation) chart.animation(spec.animation !== false, numStyle(spec, "animation_duration", 600));
    if (chart.crosshair) chart.crosshair(Boolean(st.crosshair));
    if (chart.scroller && Boolean(st.scroller)) chart.scroller().enabled(true);
    if (chart.tooltip) { chart.tooltip().displayMode(strStyle(spec, "tooltip_mode", "single")); chart.tooltip().enabled(spec.tooltip !== false); chart.tooltip().format(function () { return this.getData ? (this.getData("label") || `${this.x}: ${this.value}`) : undefined; }); }
    const anyOptions = optionFor(spec, "anychart_options");
    if (anyOptions.background && chart.background) chart.background(anyOptions.background);
    if (anyOptions.title && chart.title) chart.title(anyOptions.title);
    if (anyOptions.legend && chart.legend) {
      const legend = chart.legend();
      Object.keys(anyOptions.legend).forEach(k => { if (typeof legend[k] === "function") legend[k](anyOptions.legend[k]); });
    }
    chart.container(holder.id);
    chart.draw();
  }

  function renderBillboard(el, rows, spec) {
    if (!global.bb) throw new Error("Billboard.js is not loaded.");
    if (["boxplot", "heatmap", "treemap", "lollipop", "density"].includes(chartType(spec))) return renderNativeSvg(el, rows, spec);
    el.innerHTML = "";
    const type = chartType(spec), xKey = spec.mappings?.x, yKey = spec.mappings?.y, palette = specPalette(spec), st = rendererStyle(spec);
    let cfg;
    const labelLookup = {};
    if (isPieType(type)) {
      const a = aggregate(rows, xKey, yKey, spec);
      cfg = { bindto: el, size: dimensions(spec), data: { type: type === "donut" ? "donut" : "pie", columns: a.map(d => [d.x, d.y]) }, donut: { title: spec.title || "" }, legend: { show: legendVisible(spec, rows), position: legendPosition(spec) }, color: { pattern: palette } };
    } else if (isBarType(type) || type === "histogram") {
      const hist = type === "histogram" ? histogram(rows, spec) : null;
      const ag = type === "histogram" ? { categories: hist.map(d => d.label), series: [{ name: "Count", data: hist.map(d => d.y) }] } : aggregateGrouped(rows, spec);
      const names = ag.series.map(s => s.name);
      cfg = { bindto: el, size: dimensions(spec), data: { type: "bar", columns: ag.series.map(s => [s.name, ...s.data]), groups: type === "stacked_bar" ? [names] : undefined }, bar: { width: type === "histogram" ? { ratio: 1 } : undefined }, axis: { x: { type: "category", categories: ag.categories, label: xKey || "" }, y: { label: yKey || "", tick: { format: v => formatNum(v, spec) } } }, title: { text: spec.title || "" }, legend: { show: legendVisible(spec, rows), position: legendPosition(spec) }, color: { pattern: palette } };
    } else {
      const cols = [], xs = {};
      groups(rows, spec).forEach((g, gi) => {
        const name = g.name || `Series ${gi + 1}`;
        const xName = `x_${gi}`;
        const xy = xyRows(g.rows, spec);
        xs[name] = xName;
        labelLookup[name] = xy.map(d => d.label || "");
        cols.push([xName, ...xy.map((d, i) => toNumber(d.x) ?? i + 1)]);
        cols.push([name, ...xy.map(d => d.y)]);
      });
      cfg = { bindto: el, size: dimensions(spec), data: { xs, columns: cols, type: type === "scatter" || type === "bubble" ? "scatter" : isAreaType(type) ? "area" : "line" }, point: { r: Number(spec.markerSize) || 5 }, axis: { x: { label: xKey || "", tick: { format: v => Number.isFinite(v) ? formatNum(v, spec) : v } }, y: { label: yKey || "", tick: { format: v => formatNum(v, spec) } } }, title: { text: spec.title || "" }, legend: { show: legendVisible(spec, rows), position: legendPosition(spec) }, color: { pattern: palette } };
    }
    cfg.zoom = { enabled: Boolean(st.zoom) ? strStyle(spec, "zoom_type", "wheel") : false, rescale: Boolean(st.zoom_rescale) };
    cfg.subchart = { show: Boolean(st.subchart) };
    cfg.tooltip = { show: spec.tooltip !== false, grouped: st.tooltip_grouped !== false, contents: function(items, defaultTitleFormat, defaultValueFormat, color) {
      const list = Array.isArray(items) ? items : [];
      const title = list.length ? defaultTitleFormat(list[0].x) : "";
      const body = list.map(item => {
        const label = labelLookup[item.id]?.[item.index] || "";
        const extra = label ? `<div style="color:#64748b;margin-top:2px;white-space:pre-line">${esc(label).replace(/\n/g, "<br>")}</div>` : "";
        return `<div style="display:flex;gap:8px;align-items:baseline"><span style="color:${color(item.id)}">●</span><strong>${esc(item.name || item.id)}</strong><span>${esc(formatNum(Number(item.value), spec))}</span></div>${extra}`;
      }).join("");
      return `<div class="bb-tooltip-container" style="padding:8px 10px;background:${themeOf(spec).panel};color:${themeOf(spec).ink};border:1px solid ${themeOf(spec).grid};border-radius:8px"><div style="font-weight:700;margin-bottom:4px">${esc(title)}</div>${body}</div>`;
    } };
    cfg.point = mergeDeep(cfg.point || {}, { show: st.points !== false, r: numStyle(spec, "point_radius", Number(spec.markerSize) || 5), focus: { expand: { enabled: st.point_focus !== false } } });
    cfg.axis = mergeDeep(cfg.axis || {}, { rotated: Boolean(st.axis_rotated), x: { tick: { rotate: numStyle(spec, "tick_rotation", 0), culling: st.tick_culling !== false } } });
    cfg.transition = { duration: numStyle(spec, "transition_duration", 350) };
    if (strStyle(spec, "renderer", "svg") === "canvas") cfg.render = { mode: "canvas" };
    global.bb.generate(mergeDeep(cfg, optionFor(spec, "billboard_options")));
  }

  function renderAmCharts(el, rows, spec) {
    const type = chartType(spec);
    const needsPercent = isPieType(type);
    const requiredReady = global.am5 && (needsPercent ? global.am5percent : global.am5xy);
    if (!requiredReady) {
      Promise.resolve()
        .then(() => loadScriptOnce("https://cdn.amcharts.com/lib/version/5.19.1/index.js"))
        .then(() => loadScriptOnce(needsPercent ? "https://cdn.amcharts.com/lib/version/5.19.1/percent.js" : "https://cdn.amcharts.com/lib/version/5.19.1/xy.js"))
        .then(() => loadScriptOnce("https://cdn.amcharts.com/lib/version/5.19.1/themes/Animated.js"))
        .then(() => renderAmCharts(el, rows, spec))
        .catch(err => {
          try { renderNativeSvg(el, rows, spec); } catch (fallbackErr) { fail(el, `amCharts 5 is not loaded. ${err.message || err}`); }
        });
      return;
    }
    if (["boxplot", "heatmap", "treemap", "lollipop"].includes(type)) return renderNativeSvg(el, rows, spec);
    if (el._cfAmRoot) { try { el._cfAmRoot.dispose(); } catch (e) {} }
    el.innerHTML = titleHtml(spec);
    const dim = dimensions(spec);
    const holder = document.createElement("div");
    holder.id = `cf-amcharts-${Math.random().toString(36).slice(2)}`;
    holder.style.width = `${dim.width}px`;
    holder.style.maxWidth = "none";
    holder.style.height = `${Math.max(140, dim.height - 72)}px`;
    el.appendChild(holder);
    const root = global.am5.Root.new(holder.id);
    el._cfAmRoot = root;
    const st = rendererStyle(spec), palette = specPalette(spec);
    if (global.am5themes_Animated && st.animated_theme !== false) root.setThemes([global.am5themes_Animated.new(root)]);
    const xKey = spec.mappings?.x, yKey = spec.mappings?.y;

    if (isPieType(type)) {
      const chart = root.container.children.push(global.am5percent.PieChart.new(root, { layout: root.verticalLayout, innerRadius: type === "donut" ? global.am5.percent(42) : 0 }));
      const series = chart.series.push(global.am5percent.PieSeries.new(root, { valueField: "y", categoryField: "x", tooltip: global.am5.Tooltip.new(root, { labelText: "{category}: {value}" }) }));
      series.data.setAll(aggregate(rows, xKey, yKey, spec));
      if (legendVisible(spec, rows)) {
        const legend = chart.children.push(global.am5.Legend.new(root, { centerX: global.am5.percent(50), x: global.am5.percent(50) }));
        legend.data.setAll(series.dataItems);
      }
      return;
    }

    const chart = root.container.children.push(global.am5xy.XYChart.new(root, {
      panX: Boolean(st.pan_x), panY: Boolean(st.pan_y),
      wheelX: strStyle(spec, "wheel_x", "panX") === "none" ? undefined : strStyle(spec, "wheel_x", "panX"),
      wheelY: strStyle(spec, "wheel_y", "zoomX") === "none" ? undefined : strStyle(spec, "wheel_y", "zoomX"),
      layout: root.verticalLayout
    }));
    if (Boolean(st.scrollbar_x)) chart.set("scrollbarX", global.am5.Scrollbar.new(root, { orientation: "horizontal" }));
    if (Boolean(st.scrollbar_y)) chart.set("scrollbarY", global.am5.Scrollbar.new(root, { orientation: "vertical" }));

    let numericX = false;
    let sourceData;
    if (type === "histogram") {
      sourceData = histogram(rows, spec);
      numericX = true;
    } else if (type === "density") {
      sourceData = density(rows, spec);
      numericX = true;
    } else if (type === "bar" || type === "stacked_bar") {
      sourceData = tableForSimple(rows, spec);
    } else {
      sourceData = tableForSimple(rows, spec).map(d => Object.assign({}, d, { xNumber: toNumber(d.x) }));
      numericX = sourceData.length > 0 && sourceData.every(d => d.xNumber !== null);
    }

    const xRenderer = global.am5xy.AxisRendererX.new(root, { minGridDistance: 35 });
    const numericXValues = numericX
      ? sourceData.flatMap(d => type === "histogram" ? [toNumber(d.x0), toNumber(d.x1)] : [toNumber(d.xNumber ?? d.x)]).filter(v => v !== null)
      : [];
    const numericYValues = sourceData.map(d => toNumber(d.y)).filter(v => v !== null);
    const paddedDomain = (values, includeZero = false) => {
      if (!values.length) return {};
      let min = Math.min(...values), max = Math.max(...values);
      if (includeZero) min = Math.min(0, min);
      if (min === max) {
        const pad = Math.max(1, Math.abs(min) * 0.05);
        return { min: min - pad, max: max + pad, strictMinMax: true };
      }
      const pad = (max - min) * 0.035;
      return { min: includeZero && min === 0 ? 0 : min - pad, max: max + pad, strictMinMax: true };
    };
    const xAxis = numericX
      ? chart.xAxes.push(global.am5xy.ValueAxis.new(root, Object.assign({ renderer: xRenderer }, paddedDomain(numericXValues, false))))
      : chart.xAxes.push(global.am5xy.CategoryAxis.new(root, { categoryField: "x", renderer: xRenderer }));
    const yAxis = chart.yAxes.push(global.am5xy.ValueAxis.new(root, Object.assign(
      { renderer: global.am5xy.AxisRendererY.new(root, {}) },
      paddedDomain(numericYValues, type === "histogram" || type === "density" || isBarType(type) || isAreaType(type))
    )));
    if (!numericX) xAxis.data.setAll(sourceData);

    const addBullet = series => {
      series.bullets.push(() => global.am5.Bullet.new(root, {
        sprite: global.am5.Circle.new(root, { radius: numStyle(spec, "bullet_radius", Number(spec.markerSize) || 5), fill: series.get("fill"), stroke: series.get("stroke"), strokeWidth: 1 })
      }));
    };
    const setSeriesColour = (series, index) => {
      const color = global.am5.color(palette[index % palette.length]);
      series.setAll({ fill: color, stroke: color });
    };

    if (type === "histogram") {
      const series = chart.series.push(global.am5xy.ColumnSeries.new(root, {
        name: "Count", xAxis, yAxis, valueXField: "x1", openValueXField: "x0", valueYField: "y",
        tooltip: global.am5.Tooltip.new(root, { labelText: "{label}: {valueY}" })
      }));
      setSeriesColour(series, 0);
      series.columns.template.setAll({ width: global.am5.percent(100), strokeOpacity: 0, fillOpacity: numStyle(spec, "fill_opacity", 0.9) });
      series.data.setAll(sourceData);
    } else if (type === "density") {
      const series = chart.series.push(global.am5xy.LineSeries.new(root, {
        name: "Density", xAxis, yAxis, valueXField: "x", valueYField: "y",
        tooltip: global.am5.Tooltip.new(root, { labelText: `${xKey || "x"}: {valueX}\nDensity: {valueY}` })
      }));
      setSeriesColour(series, 0);
      series.strokes.template.setAll({ strokeWidth: numStyle(spec, "stroke_width", 3) });
      series.fills.template.setAll({ visible: true, fillOpacity: numStyle(spec, "fill_opacity", 0.22) });
      series.data.setAll(sourceData);
    } else if (type === "bar" || type === "stacked_bar") {
      const ag = aggregateGrouped(rows, spec);
      ag.series.forEach((item, index) => {
        const data = ag.categories.map((x, i) => ({ x, y: Number(item.data[i]) || 0, label: x }));
        const series = chart.series.push(global.am5xy.ColumnSeries.new(root, {
          name: item.name, xAxis, yAxis, categoryXField: "x", valueYField: "y", stacked: type === "stacked_bar",
          tooltip: global.am5.Tooltip.new(root, { labelText: "{name}\n{categoryX}: {valueY}" })
        }));
        setSeriesColour(series, index);
        series.columns.template.setAll({ cornerRadiusTL: numStyle(spec, "column_radius", 0), cornerRadiusTR: numStyle(spec, "column_radius", 0), fillOpacity: numStyle(spec, "fill_opacity", 0.9) });
        series.data.setAll(data);
      });
    } else {
      const seriesNames = spec.mappings?.group ? unique(sourceData.map(d => d.group)) : [yKey || "Series"];
      seriesNames.forEach((name, index) => {
        const data = (spec.mappings?.group ? sourceData.filter(d => d.group === name) : sourceData).map(d => Object.assign({}, d, { x: numericX ? d.xNumber : text(d.x) }));
        const config = {
          name, xAxis, yAxis, valueYField: "y", stacked: type === "stacked_area",
          tooltip: global.am5.Tooltip.new(root, { labelText: "{label}\n{valueY}" })
        };
        if (numericX) config.valueXField = "x";
        else config.categoryXField = "x";
        const SeriesClass = type === "step" && global.am5xy.StepLineSeries
          ? global.am5xy.StepLineSeries
          : type === "spline" && global.am5xy.SmoothedXYLineSeries
            ? global.am5xy.SmoothedXYLineSeries
            : global.am5xy.LineSeries;
        const series = chart.series.push(SeriesClass.new(root, config));
        setSeriesColour(series, index);
        series.strokes.template.setAll({
          strokeWidth: (type === "scatter" || type === "bubble") ? 0 : numStyle(spec, "stroke_width", 3),
          strokeOpacity: (type === "scatter" || type === "bubble") ? 0 : 1,
          strokeDasharray: strStyle(spec, "line_dash", "solid") === "dashed" ? [6, 4] : undefined
        });
        if (type === "scatter" || type === "bubble" || st.bullets !== false) addBullet(series);
        if (isAreaType(type)) series.fills.template.setAll({ visible: true, fillOpacity: numStyle(spec, "fill_opacity", 0.28) });
        series.data.setAll(data);
      });
    }

    if (legendVisible(spec, rows) && chart.series.values.length) {
      const legend = chart.children.push(global.am5.Legend.new(root, { centerX: global.am5.percent(50), x: global.am5.percent(50) }));
      legend.data.setAll(chart.series.values);
    }
    if (st.cursor !== false) chart.set("cursor", global.am5xy.XYCursor.new(root, { behavior: strStyle(spec, "cursor_behavior", "zoomX") }));
    chart.appear(numStyle(spec, "animation_duration", 800), 50);
  }

  function renderNativeSvg(el, rows, spec) {
    const type = chartType(spec), dim = dimensions(spec), t = themeOf(spec), palette = specPalette(spec), st = rendererStyle(spec);
    const margin = { top: numStyle(spec, "margin_top", 88), right: numStyle(spec, "margin_right", 40), bottom: numStyle(spec, "margin_bottom", 68), left: numStyle(spec, "margin_left", 76) }, w = dim.width, h = dim.height, iw = Math.max(100, w - margin.left - margin.right), ih = Math.max(100, h - margin.top - margin.bottom);
    el.innerHTML = "";
    const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, width: w, height: h, role: "img" });
    svg.style.background = t.panel; svg.style.borderRadius = "18px"; el.appendChild(svg);
    svg.appendChild(svgEl("text", { x: 24, y: 34, "font-size": titleSize(spec), "font-weight": 800, "font-family": fontFamily(spec), fill: t.ink }, spec.title || ""));
    if (spec.subtitle) svg.appendChild(svgEl("text", { x: 24, y: 60, "font-size": subtitleSize(spec), "font-family": fontFamily(spec), fill: t.muted }, spec.subtitle));
    const plot = svgEl("g", { transform: `translate(${margin.left},${margin.top})` }); svg.appendChild(plot);
    if (isPieType(type)) return drawPie(plot, rows, spec, iw, ih, palette, t, type === "donut");
    if (type === "heatmap") return drawHeatmap(plot, rows, spec, iw, ih, palette, t);
    if (type === "treemap") return drawTreemap(plot, rows, spec, iw, ih, palette, t);
    if (type === "boxplot") return drawBoxplot(plot, rows, spec, iw, ih, palette, t);
    const xKey = spec.mappings?.x, yKey = spec.mappings?.y;
    const data = type === "histogram" ? histogram(rows, spec) : type === "density" ? density(rows, spec) : isBarType(type) ? aggregate(rows, xKey, yKey, spec) : xyRows(rows, spec);
    if (!data.length) throw new Error("No plottable rows were found for this mapping.");
    const yVals = data.map(d => d.y).filter(Number.isFinite);
    const yMin = Math.min(0, ...yVals), yMax = Math.max(1e-12, ...yVals);
    const cats = isBarType(type) ? data.map(d => text(d.x)) : unique(data.map(d => d.x));
    const xNums = data.map(d => toNumber(d.x));
    const numericX = type === "histogram" || type === "density" || (!isBarType(type) && xNums.every(v => v !== null));
    const xMin = type === "histogram" ? data[0].x0 : numericX ? Math.min(...xNums) : 0;
    const xMax = type === "histogram" ? data[data.length - 1].x1 : numericX ? Math.max(...xNums) : Math.max(1, cats.length - 1);
    const xScale = v => numericX ? ((toNumber(v) - xMin) / Math.max(1e-9, xMax - xMin)) * iw : (cats.indexOf(text(v)) + 0.5) / Math.max(1, cats.length) * iw;
    const yScale = v => ih - ((v - yMin) / Math.max(1e-12, yMax - yMin)) * ih;
    drawAxes(plot, iw, ih, t, cats, numericX, yMin, yMax, spec, xMin, xMax);
    if (type === "histogram") {
      data.forEach(d => {
        const y = yScale(d.y);
        const rect = svgEl("rect", { x: xScale(d.x0), y, width: Math.max(0, xScale(d.x1) - xScale(d.x0)), height: ih - y, fill: palette[0], opacity: 0.9 });
        rect.appendChild(svgEl("title", {}, `${d.label}
Count: ${formatNum(d.y, spec, 0)}`));
        plot.appendChild(rect);
      });
      return;
    }
    if (type === "density") {
      const pts = data.map(d => [xScale(d.x), yScale(d.y), d]);
      if (pts.length) plot.appendChild(svgEl("path", { d: `M ${pts[0][0]} ${ih} L ` + pts.map(p => `${p[0]} ${p[1]}`).join(" L ") + ` L ${pts[pts.length - 1][0]} ${ih} Z`, fill: palette[0], opacity: numStyle(spec, "area_opacity", 0.22) }));
      plot.appendChild(svgEl("path", { d: linePath(pts, "line"), fill: "none", stroke: palette[0], "stroke-width": numStyle(spec, "line_width", 3), "stroke-linejoin": "round", "stroke-linecap": "round" }));
      return;
    }
    if (isBarType(type)) {
      const slot = iw / Math.max(1, data.length);
      const bw = type === "lollipop" ? Math.max(2, numStyle(spec, "line_width", 3)) : Math.max(4, slot * 0.78);
      data.forEach((d, i) => {
        const cx = (i + 0.5) * slot;
        const y = yScale(d.y);
        if (type === "lollipop") {
          const line = svgEl("line", { x1: cx, x2: cx, y1: yScale(0), y2: y, stroke: palette[i % palette.length], "stroke-width": bw });
          const dot = svgEl("circle", { cx, cy: y, r: Number(spec.markerSize) || 6, fill: palette[i % palette.length] });
          dot.appendChild(svgEl("title", {}, `${d.x}
${formatNum(d.y, spec)}`));
          plot.appendChild(line); plot.appendChild(dot);
        } else {
          plot.appendChild(svgEl("rect", { x: cx - bw / 2, y, width: bw, height: ih - y, rx: numStyle(spec, "column_radius", 0), fill: palette[i % palette.length], opacity: 0.88 }));
        }
      });
      return;
    }
    groups(rows, spec).forEach((g, gi) => {
      const pts = xyRows(g.rows, spec).map(d => [xScale(d.x), yScale(d.y), d]).sort((a, b) => a[0] - b[0]);
      if (isAreaType(type) && pts.length) plot.appendChild(svgEl("path", { d: `M ${pts[0][0]} ${ih} L ` + pts.map(p => `${p[0]} ${p[1]}`).join(" L ") + ` L ${pts[pts.length - 1][0]} ${ih} Z`, fill: palette[gi % palette.length], opacity: 0.22 }));
      if (isLineType(type) || isAreaType(type)) plot.appendChild(svgEl("path", { d: linePath(pts, type), fill: "none", stroke: palette[gi % palette.length], "stroke-width": numStyle(spec, "line_width", 3), "stroke-dasharray": strStyle(spec, "line_dash", "solid") === "dashed" ? "7 5" : undefined, "stroke-linejoin": "round", "stroke-linecap": "round" }));
      pts.forEach(p => { const c = svgEl("circle", { cx: p[0], cy: p[1], r: type === "bubble" ? Math.max(4, Math.sqrt(Math.abs(p[2].y)) * 2.2) : Number(spec.markerSize) || 5, fill: palette[gi % palette.length], opacity: numStyle(spec, "opacity", 0.86), stroke: boolStyle(spec, "point_stroke", false) ? t.ink : undefined }); c.appendChild(svgEl("title", {}, tooltipText(p[2], spec))); plot.appendChild(c); });
    });
  }
  function svgEl(name, attrs, content) { const el = document.createElementNS(SVG_NS, name); Object.entries(attrs || {}).forEach(([k, v]) => { if (v !== undefined && v !== null) el.setAttribute(k, v); }); if (content !== undefined) el.textContent = content; return el; }
  function linePath(pts, type) { if (!pts.length) return ""; if (type === "step") return "M " + pts.map((p, i) => i ? `H ${p[0]} V ${p[1]}` : `${p[0]} ${p[1]}`).join(" "); return "M " + pts.map(p => `${p[0]} ${p[1]}`).join(" L "); }
  function drawAxes(g, iw, ih, t, cats, numericX, yMin, yMax, spec, numericXMin = 0, numericXMax = 1) {
    for (let i = 0; i <= 4; i++) { const y = ih * i / 4; g.appendChild(svgEl("line", { x1: 0, x2: iw, y1: y, y2: y, stroke: t.grid, "stroke-width": 1 })); const val = yMax - (yMax - yMin) * i / 4; g.appendChild(svgEl("text", { x: -10, y: y + 4, "text-anchor": "end", "font-size": axisTextSize(spec), "font-family": fontFamily(spec), fill: t.muted }, formatNum(val, spec))); }
    g.appendChild(svgEl("line", { x1: 0, x2: iw, y1: ih, y2: ih, stroke: t.grid })); g.appendChild(svgEl("line", { x1: 0, x2: 0, y1: 0, y2: ih, stroke: t.grid }));
    if (numericX) {
      for (let i = 0; i <= 5; i++) {
        const x = iw * i / 5;
        const val = numericXMin + (numericXMax - numericXMin) * i / 5;
        g.appendChild(svgEl("text", { x, y: ih + 22, "text-anchor": "middle", "font-size": axisTextSize(spec), "font-family": fontFamily(spec), fill: t.muted }, formatNum(val, spec)));
      }
    } else {
      const labels = cats.slice(0, 12);
      labels.forEach((c, i) => { const x = (i + 0.5) / Math.max(1, labels.length) * iw; g.appendChild(svgEl("text", { x, y: ih + 22, "text-anchor": "middle", "font-size": axisTextSize(spec), "font-family": fontFamily(spec), fill: t.muted }, c.length > 14 ? c.slice(0, 13) + "…" : c)); });
    }
    if (spec.mappings?.x) g.appendChild(svgEl("text", { x: iw / 2, y: ih + 54, "text-anchor": "middle", "font-size": textSize(spec), "font-family": fontFamily(spec), fill: t.muted }, spec.mappings.x));
    const type = chartType(spec);
    const verticalLabel = type === "histogram" ? "Count" : type === "density" ? "Density" : spec.mappings?.y;
    if (verticalLabel) { const ylab = svgEl("text", { x: -ih / 2, y: -54, transform: "rotate(-90)", "text-anchor": "middle", "font-size": textSize(spec), "font-family": fontFamily(spec), fill: t.muted }, verticalLabel); g.appendChild(ylab); }
  }
  function drawPie(g, rows, spec, iw, ih, palette, t, donut) {
    const data = aggregate(rows, spec.mappings?.x, spec.mappings?.y, spec).filter(d => d.y > 0); if (!data.length) return;
    const total = data.reduce((a, d) => a + d.y, 0), cx = iw / 2, cy = ih / 2, r = Math.min(iw, ih) * 0.42, inner = donut ? r * 0.52 : 0; let a0 = -Math.PI / 2;
    data.forEach((d, i) => { const a1 = a0 + d.y / total * Math.PI * 2; g.appendChild(svgEl("path", { d: arcPath(cx, cy, r, inner, a0, a1), fill: palette[i % palette.length], stroke: t.panel, "stroke-width": 2 })); const mid = (a0 + a1) / 2; g.appendChild(svgEl("text", { x: cx + Math.cos(mid) * r * 0.62, y: cy + Math.sin(mid) * r * 0.62, "text-anchor": "middle", "font-size": 11, fill: "#fff" }, d.x.slice(0, 16))); a0 = a1; });
  }
  function arcPath(cx, cy, r, inner, a0, a1) { const large = a1 - a0 > Math.PI ? 1 : 0; const p0 = [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r], p1 = [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r]; if (!inner) return `M ${cx} ${cy} L ${p0[0]} ${p0[1]} A ${r} ${r} 0 ${large} 1 ${p1[0]} ${p1[1]} Z`; const q0 = [cx + Math.cos(a0) * inner, cy + Math.sin(a0) * inner], q1 = [cx + Math.cos(a1) * inner, cy + Math.sin(a1) * inner]; return `M ${p0[0]} ${p0[1]} A ${r} ${r} 0 ${large} 1 ${p1[0]} ${p1[1]} L ${q1[0]} ${q1[1]} A ${inner} ${inner} 0 ${large} 0 ${q0[0]} ${q0[1]} Z`; }
  function drawHeatmap(g, rows, spec, iw, ih, palette, t) { const hm = heatmapData(rows, spec); const max = Math.max(1, ...hm.cells.map(c => c.value)), cw = iw / Math.max(1, hm.xCats.length), ch = ih / Math.max(1, hm.yCats.length); hm.cells.forEach(c => g.appendChild(svgEl("rect", { x: c.xi * cw, y: c.yi * ch, width: cw - 2, height: ch - 2, fill: palette[0], opacity: 0.12 + 0.82 * c.value / max, rx: 4 }))); hm.xCats.slice(0, 18).forEach((x, i) => g.appendChild(svgEl("text", { x: i * cw + cw / 2, y: ih + 18, "text-anchor": "middle", "font-size": 10, fill: t.muted }, x.slice(0, 10)))); hm.yCats.forEach((y, i) => g.appendChild(svgEl("text", { x: -8, y: i * ch + ch / 2 + 4, "text-anchor": "end", "font-size": 10, fill: t.muted }, y.slice(0, 14)))); }
  function drawTreemap(g, rows, spec, iw, ih, palette, t) { const data = treemapData(rows, spec), total = data.reduce((a, d) => a + d.y, 0) || 1; let x = 0, y = 0, horizontal = true, remW = iw, remH = ih; data.forEach((d, i) => { const frac = d.y / total; const area = iw * ih * frac; const w = horizontal ? Math.max(4, area / remH) : remW; const h = horizontal ? remH : Math.max(4, area / remW); g.appendChild(svgEl("rect", { x, y, width: w - 2, height: h - 2, fill: palette[i % palette.length], opacity: 0.88, rx: 8 })); g.appendChild(svgEl("text", { x: x + 10, y: y + 22, "font-size": 12, fill: "#fff", "font-weight": 700 }, d.x.slice(0, 22))); if (horizontal) { x += w; remW -= w; } else { y += h; remH -= h; } if (remW < iw * 0.35) horizontal = false; }); }
  function drawBoxplot(g, rows, spec, iw, ih, palette, t) { const data = boxData(rows, spec); if (!data.length) return; const vals = data.flatMap(d => [d.low, d.high]); const yMin = Math.min(0, ...vals), yMax = Math.max(...vals); drawAxes(g, iw, ih, t, data.map(d => d.x), false, yMin, yMax, spec); const yScale = v => ih - ((v - yMin) / Math.max(1e-9, yMax - yMin)) * ih; const bw = iw / data.length * 0.42; data.forEach((d, i) => { const x = (i + 0.5) / data.length * iw; g.appendChild(svgEl("line", { x1: x, x2: x, y1: yScale(d.low), y2: yScale(d.high), stroke: palette[i % palette.length], "stroke-width": 2 })); g.appendChild(svgEl("rect", { x: x - bw / 2, y: yScale(d.q3), width: bw, height: Math.max(2, yScale(d.q1) - yScale(d.q3)), fill: palette[i % palette.length], opacity: 0.38, stroke: palette[i % palette.length], "stroke-width": 2 })); g.appendChild(svgEl("line", { x1: x - bw / 2, x2: x + bw / 2, y1: yScale(d.median), y2: yScale(d.median), stroke: palette[i % palette.length], "stroke-width": 3 })); }); }

  function renderFromScripts(dataId = "cf-data", specId = "cf-spec", target = "chart") {
    const dataEl = byId(dataId), specEl = byId(specId);
    const data = JSON.parse(dataEl ? dataEl.textContent : "[]");
    const spec = JSON.parse(specEl ? specEl.textContent : "{}");
    return render(data, spec, target);
  }

  global.ChartForgeRender = { render, renderFromScripts };
})(window);
