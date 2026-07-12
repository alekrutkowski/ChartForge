(() => {
  "use strict";

  const STORAGE_KEY = "chartforge.v0.6.6.preferences";
  const WEBR_VERSION = "0.6.0";
  const WEBR_SOURCES = Object.freeze([
    Object.freeze({
      id: "official",
      label: "official webR CDN",
      moduleUrl: `https://webr.r-wasm.org/v${WEBR_VERSION}/webr.mjs`,
      baseUrl: `https://webr.r-wasm.org/v${WEBR_VERSION}/`
    }),
    Object.freeze({
      id: "jsdelivr",
      label: "jsDelivr npm CDN",
      moduleUrl: `https://cdn.jsdelivr.net/npm/webr@${WEBR_VERSION}/dist/webr.mjs`,
      baseUrl: `https://cdn.jsdelivr.net/npm/webr@${WEBR_VERSION}/dist/`
    }),
    Object.freeze({
      id: "unpkg",
      label: "UNPKG npm CDN",
      moduleUrl: `https://unpkg.com/webr@${WEBR_VERSION}/dist/webr.mjs`,
      baseUrl: `https://unpkg.com/webr@${WEBR_VERSION}/dist/`
    })
  ]);
  const SAMPLE_TEXT = `model,mpg,cyl,disp,hp,wt,am,gear,carb
Mazda RX4,21,6,160,110,2.620,manual,4,4
Mazda RX4 Wag,21,6,160,110,2.875,manual,4,4
Datsun 710,22.8,4,108,93,2.320,manual,4,1
Hornet 4 Drive,21.4,6,258,110,3.215,automatic,3,1
Hornet Sportabout,18.7,8,360,175,3.440,automatic,3,2
Valiant,18.1,6,225,105,3.460,automatic,3,1
Duster 360,14.3,8,360,245,3.570,automatic,3,4
Merc 240D,24.4,4,146.7,62,3.190,automatic,4,2
Merc 230,22.8,4,140.8,95,3.150,automatic,4,2
Merc 280,19.2,6,167.6,123,3.440,automatic,4,4
Merc 280C,17.8,6,167.6,123,3.440,automatic,4,4
Merc 450SE,16.4,8,275.8,180,4.070,automatic,3,3
Merc 450SL,17.3,8,275.8,180,3.730,automatic,3,3
Merc 450SLC,15.2,8,275.8,180,3.780,automatic,3,3
Cadillac Fleetwood,10.4,8,472,205,5.250,automatic,3,4
Lincoln Continental,10.4,8,460,215,5.424,automatic,3,4
Chrysler Imperial,14.7,8,440,230,5.345,automatic,3,4
Fiat 128,32.4,4,78.7,66,2.200,manual,4,1
Honda Civic,30.4,4,75.7,52,1.615,manual,4,2
Toyota Corolla,33.9,4,71.1,65,1.835,manual,4,1
Toyota Corona,21.5,4,120.1,97,2.465,automatic,3,1
Dodge Challenger,15.5,8,318,150,3.520,automatic,3,2
AMC Javelin,15.2,8,304,150,3.435,automatic,3,2
Camaro Z28,13.3,8,350,245,3.840,automatic,3,4
Pontiac Firebird,19.2,8,400,175,3.845,automatic,3,2
Fiat X1-9,27.3,4,79,66,1.935,manual,4,1
Porsche 914-2,26,4,120.3,91,2.140,manual,5,2
Lotus Europa,30.4,4,95.1,113,1.513,manual,5,2
Ford Pantera L,15.8,8,351,264,3.170,manual,5,4
Ferrari Dino,19.7,6,145,175,2.770,manual,5,6
Maserati Bora,15,8,301,335,3.570,manual,5,8
Volvo 142E,21.4,4,121,109,2.780,manual,4,2`;

  const TYPE_LABELS = {
    scatter: "Scatter", line: "Line", spline: "Spline", step: "Step line",
    bar: "Bar / column", stacked_bar: "Stacked bar", area: "Area",
    stacked_area: "Stacked area", histogram: "Histogram", density: "Density",
    pie: "Pie", donut: "Donut", bubble: "Bubble", boxplot: "Box plot",
    heatmap: "Heatmap", treemap: "Treemap", lollipop: "Lollipop"
  };

  const THEME_LABELS = {
    aurora: "Aurora", paper: "Paper", midnight: "Midnight", minimal: "Minimal",
    slate: "Slate", graphite: "Graphite", cream: "Cream", solarized: "Solarized",
    candy: "Candy", contrast: "High contrast", quartz: "Quartz", charcoal: "Charcoal",
    mint: "Mint", rose: "Rose"
  };

  const PALETTE_LABELS = {
    studio: "Studio", okabe: "Okabe-Ito", tableau: "Tableau", warm: "Warm",
    mono: "Monochrome", viridis: "Viridis", plasma: "Plasma", set2: "Set 2",
    nord: "Nord", jewel: "Jewel", fire: "Fire", ocean: "Ocean", forest: "Forest",
    sunset: "Sunset", pastel: "Pastel", bold: "Bold", grayscale: "Grayscale"
  };

  const RENDERER_NOTES = {
    highcharts: "Polished interaction, accessibility, annotations, exporting and strong dashboard defaults.",
    plotly: "Rich hover, selection and zoom tools, with a broad statistical chart vocabulary.",
    d3: "Fine-grained SVG construction, scales, curves, axes, brushes and zoom behaviour.",
    vega: "Declarative Vega-Lite specifications with selections, scales and SVG or Canvas rendering.",
    observable: "Concise, composable statistical graphics built on Observable Plot.",
    chartjs: "Compact Canvas charts with responsive interactions and plugin-friendly options.",
    echarts: "High-performance interaction, data zoom, toolboxes and large-series capabilities.",
    apexcharts: "Dashboard-friendly animations, toolbars, gradients and compact sparkline modes.",
    googlecharts: "Accessible, familiar interactive charts with explorer and trendline support.",
    amcharts: "Highly interactive charts with cursors, scrollbars, wheel zoom and animated themes.",
    vchart: "Grammar-based charts with exact numeric domains, crosshairs and integrated data zoom.",
    anychart: "Broad chart coverage with scrollers, crosshairs, labels and flexible marker styling.",
    billboard: "Compact D3-based charts with subcharts, zooming and focused series interaction."
  };

  const ASSET_BASE = {
    plotly: { scripts: ["https://cdn.jsdelivr.net/npm/plotly.js-dist-min@3.7.0/plotly.min.js"], styles: [] },
    d3: { scripts: ["https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"], styles: [] },
    vega: { scripts: ["https://cdn.jsdelivr.net/npm/vega@6.2.0/build/vega.min.js", "https://cdn.jsdelivr.net/npm/vega-lite@6.4.3/build/vega-lite.min.js", "https://cdn.jsdelivr.net/npm/vega-embed@7.1.0/build/vega-embed.min.js"], styles: [] },
    observable: { scripts: ["https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js", "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6.17/dist/plot.umd.min.js"], styles: [] },
    chartjs: { scripts: ["https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js"], styles: [] },
    echarts: { scripts: ["https://cdn.jsdelivr.net/npm/echarts@6.1.0/dist/echarts.min.js"], styles: [] },
    apexcharts: { scripts: ["https://cdn.jsdelivr.net/npm/apexcharts@5.16.0/dist/apexcharts.min.js"], styles: [] },
    googlecharts: { scripts: ["https://www.gstatic.com/charts/loader.js"], styles: [] },
    vchart: { scripts: ["https://cdn.jsdelivr.net/npm/@visactor/vchart@2.1.3/build/index.min.js"], styles: [] },
    anychart: { scripts: ["https://cdn.anychart.com/releases/8.14.1/js/anychart-base.min.js"], styles: [] },
    billboard: { scripts: ["https://cdn.jsdelivr.net/npm/billboard.js@3.17.2/dist/billboard.pkgd.min.js"], styles: ["https://cdn.jsdelivr.net/npm/billboard.js@3.17.2/dist/billboard.min.css"] }
  };

  const els = {};
  let metadata = null;
  let state = null;
  let rows = [];
  let columns = [];
  let rawInputText = SAMPLE_TEXT;
  let parsedDelimiter = ",";
  let localSession = { connected: false, objects: [], rVersion: "" };
  let preferredPreview = "browser";
  let webR = null;
  let webRModule = null;
  let webRInitPromise = null;
  let webRReady = false;
  let webRSource = null;
  let rRuntimeSource = "";
  let renderTimer = null;
  let localPreviewTimer = null;
  let webRPreviewTimer = null;
  let renderToken = 0;
  let activeOutput = "r-code";
  let generatedR = "";
  let generatedHtml = "";
  let localPreviewInFlight = false;
  let webRPreviewInFlight = false;
  let localPreviewQueued = false;
  let webRPreviewQueued = false;
  let lastLocalPreviewKey = "";
  let lastWebRPreviewKey = "";
  let sessionRefreshInFlight = null;
  const runtimeCache = new Map();
  const vendorAssetCache = new Map();

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    bindElements();
    if (await retireLegacyCoiServiceWorker()) return;
    try {
      const [metaResponse, rResponse] = await Promise.all([
        fetch("assets/metadata.json", { cache: "no-store" }),
        fetch("assets/chartforge-r-runtime.R", { cache: "no-store" })
      ]);
      if (!metaResponse.ok) throw new Error(`Could not load renderer metadata (${metaResponse.status}).`);
      metadata = await metaResponse.json();
      rRuntimeSource = rResponse.ok ? await rResponse.text() : "";
    } catch (error) {
      showFatal(error);
      return;
    }

    state = mergeState(defaultState(), readState());
    applyTheme();
    populateStaticControls();
    attachEvents();
    hydrateControls();
    useDelimitedText(SAMPLE_TEXT, { quiet: true, preserveMappings: true });
    renderAll();
    const localBootstrap = readLocalBootstrap();
    if (localBootstrap) applyLocalSessionPayload(localBootstrap);
    await detectLocalSession({ quiet: true, preserveConnection: Boolean(localBootstrap), requestPreview: false });
    if (state.dataSource === "env" && localSession.connected && state.envObject) {
      await loadEnvironmentObject(state.envObject, { quiet: true });
    } else if (localSession.connected) {
      scheduleLocalPreview();
    }
  }

  function defaultState() {
    return {
      appTheme: "light",
      dataSource: "text",
      delimiter: "auto",
      inputDecimalMark: ".",
      autoDates: true,
      envObject: "",
      library: "highcharts",
      chartType: "scatter",
      mappings: { x: "wt", y: "mpg", group: "cyl", labels: ["model"], sortBy: "wt", sortDesc: false },
      title: "Fuel economy by vehicle weight",
      subtitle: "Generated by ChartForge",
      caption: "",
      markerSize: 8,
      bins: 12,
      aggregate: "sum",
      chartTheme: "aurora",
      palette: "studio",
      width: 840,
      height: 480,
      fontFamily: "Inter, sans-serif",
      textSize: 13,
      titleSize: 22,
      subtitleSize: 13,
      axisTextSize: 11,
      dpi: 1,
      decimalMark: ".",
      legendEnabled: true,
      legendPosition: "bottom",
      grid: true,
      tooltip: true,
      animation: true,
      embed: true,
      fullBundle: false,
      minified: false,
      rendererStyles: {}
    };
  }

  function mergeState(base, saved) {
    const out = Object.assign({}, base, saved || {});
    out.dataSource = scalarString(out.dataSource, base.dataSource) === "env" ? "env" : "text";
    out.envObject = scalarString(out.envObject);
    out.library = scalarString(out.library, base.library);
    out.chartType = scalarString(out.chartType, base.chartType);
    out.mappings = Object.assign({}, base.mappings, saved && saved.mappings ? saved.mappings : {});
    ["x", "y", "group", "sortBy"].forEach(key => { out.mappings[key] = scalarString(out.mappings[key]); });
    const savedLabels = Array.isArray(out.mappings.labels) ? out.mappings.labels : out.mappings.label ? [out.mappings.label] : [];
    out.mappings.labels = unique(savedLabels.map(value => scalarString(value)).filter(Boolean));
    out.mappings.sortDesc = scalarBoolean(out.mappings.sortDesc, false);
    out.rendererStyles = saved && saved.rendererStyles && typeof saved.rendererStyles === "object" ? saved.rendererStyles : {};
    return out;
  }

  function bindElements() {
    document.querySelectorAll("[id]").forEach(node => { els[toCamel(node.id)] = node; });
  }

  function toCamel(id) { return id.replace(/-([a-z])/g, (_, c) => c.toUpperCase()); }

  function unboxScalar(value) {
    let out = value;
    while (Array.isArray(out) && out.length === 1) out = out[0];
    return out;
  }

  function scalarString(value, fallback = "") {
    const out = unboxScalar(value);
    if (out === null || out === undefined) return fallback;
    if (Array.isArray(out)) return out.map(item => scalarString(item)).filter(Boolean).join(", ");
    return String(out);
  }

  function scalarBoolean(value, fallback = false) {
    const out = unboxScalar(value);
    if (Array.isArray(out) && out.length === 0) return fallback;
    if (typeof out === "boolean") return out;
    if (typeof out === "number") return Number.isFinite(out) ? out !== 0 : fallback;
    if (typeof out === "string") {
      const text = out.trim().toLowerCase();
      if (["true", "t", "1", "yes", "y"].includes(text)) return true;
      if (["false", "f", "0", "no", "n", "", "na", "null"].includes(text)) return false;
    }
    return out === null || out === undefined ? fallback : Boolean(out);
  }

  function scalarNumber(value, fallback = 0) {
    const out = unboxScalar(value);
    const number = Number(out);
    return Number.isFinite(number) ? number : fallback;
  }

  function scalarCell(value) {
    const out = unboxScalar(value);
    if (out === null || out === undefined) return null;
    if (Array.isArray(out)) {
      const values = out.map(scalarCell).filter(item => item !== null && item !== "");
      return values.length <= 1 ? (values[0] ?? null) : values.map(String).join(" | ");
    }
    if (typeof out === "object") return JSON.stringify(out);
    return out;
  }

  function recordArray(value) {
    if (Array.isArray(value)) return value.filter(item => item && typeof item === "object" && !Array.isArray(item));
    if (!value || typeof value !== "object") return [];
    const entries = Object.entries(value);
    const lengths = entries.map(([, item]) => Array.isArray(item) ? item.length : 0);
    const rowCount = Math.max(0, ...lengths);
    if (rowCount > 1 && lengths.every(length => length === rowCount)) {
      return Array.from({ length: rowCount }, (_, index) => Object.fromEntries(entries.map(([key, item]) => [key, item[index]])));
    }
    return [value];
  }

  function normalizeRows(value, columnDefs = []) {
    const names = columnDefs.map(column => scalarString(column.name)).filter(Boolean);
    return recordArray(value).map(record => {
      const out = {};
      Object.entries(record).forEach(([key, cell]) => { out[key] = scalarCell(cell); });
      names.forEach(name => { if (!Object.prototype.hasOwnProperty.call(out, name)) out[name] = null; });
      return out;
    });
  }

  async function retireLegacyCoiServiceWorker() {
    if (!("serviceWorker" in navigator)) return false;
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const legacy = registrations.filter(registration => {
        const worker = registration.active || registration.waiting || registration.installing;
        return worker && /\/coi-serviceworker\.js(?:[?#].*)?$/.test(worker.scriptURL || "");
      });
      if (!legacy.length) {
        sessionStorage.removeItem("chartforge.retired-coi-worker");
        return false;
      }
      await Promise.all(legacy.map(registration => registration.unregister()));
      if (navigator.serviceWorker.controller && !sessionStorage.getItem("chartforge.retired-coi-worker")) {
        sessionStorage.setItem("chartforge.retired-coi-worker", "1");
        location.reload();
        return true;
      }
      sessionStorage.removeItem("chartforge.retired-coi-worker");
    } catch (_) {
      // A service worker is optional. WebR uses its PostMessage channel below.
    }
    return false;
  }

  function populateStaticControls() {
    els.library.innerHTML = metadata.renderers.map(renderer => `<option value="${escapeAttr(renderer.id)}">${escapeHtml(renderer.label)}</option>`).join("");
    els.chartType.innerHTML = metadata.chart_types.map(type => `<option value="${escapeAttr(type)}">${escapeHtml(TYPE_LABELS[type] || titleCase(type))}</option>`).join("");
    els.chartTheme.innerHTML = metadata.theme_names.map(theme => `<option value="${escapeAttr(theme)}">${escapeHtml(THEME_LABELS[theme] || titleCase(theme))}</option>`).join("");
    els.palette.innerHTML = Object.keys(metadata.palettes).map(name => `<option value="${escapeAttr(name)}">${escapeHtml(PALETTE_LABELS[name] || titleCase(name))}</option>`).join("");
    els.fontFamily.innerHTML = metadata.fonts.map(font => `<option value="${escapeAttr(font.family)}">${escapeHtml(font.label)}</option>`).join("");
  }

  function hydrateControls() {
    if (!metadata.renderers.some(x => x.id === state.library)) state.library = "highcharts";
    if (!metadata.chart_types.includes(state.chartType)) state.chartType = "scatter";
    if (!metadata.theme_names.includes(state.chartTheme)) state.chartTheme = "aurora";
    if (!metadata.palettes[state.palette]) state.palette = "studio";
    if (!metadata.fonts.some(x => x.family === state.fontFamily)) state.fontFamily = metadata.fonts[0].family;

    els.library.value = state.library;
    els.chartType.value = state.chartType;
    els.title.value = state.title;
    els.subtitle.value = state.subtitle;
    els.caption.value = state.caption;
    els.markerSize.value = state.markerSize;
    els.bins.value = state.bins;
    els.aggregate.value = state.aggregate;
    els.chartTheme.value = state.chartTheme;
    els.palette.value = state.palette;
    els.width.value = state.width;
    els.height.value = state.height;
    els.fontFamily.value = state.fontFamily;
    els.textSize.value = state.textSize;
    els.titleSize.value = state.titleSize;
    els.subtitleSize.value = state.subtitleSize;
    els.axisTextSize.value = state.axisTextSize;
    els.dpi.value = state.dpi;
    els.decimalMark.value = state.decimalMark;
    els.legendEnabled.checked = state.legendEnabled !== false;
    els.legendPosition.value = state.legendPosition;
    els.grid.checked = state.grid !== false;
    els.tooltip.checked = state.tooltip !== false;
    els.animation.checked = state.animation !== false;
    els.embedOutput.checked = state.embed !== false;
    els.fullBundle.checked = Boolean(state.fullBundle);
    els.minified.checked = Boolean(state.minified);
    els.delimiter.value = state.delimiter;
    els.inputDecimalMark.value = state.inputDecimalMark;
    els.autoDates.checked = state.autoDates !== false;
    els.envObject.value = state.envObject || "";
    els.dataInput.value = rawInputText;
    setDataSourceUi();
    populateMappings();
    renderRendererStyleControls();
    updateRendererDescription();
    updatePalettePreview();
    updateConditionalChartControls();
    updateRenderingScaleControl();
  }

  function attachEvents() {
    document.querySelectorAll(".module-tab").forEach(button => button.addEventListener("click", () => switchModule(button.dataset.module)));
    document.querySelectorAll(".output-tab").forEach(button => button.addEventListener("click", () => switchOutput(button.dataset.output)));

    els.themeToggle.addEventListener("click", () => {
      state.appTheme = state.appTheme === "dark" ? "light" : "dark";
      applyTheme(); saveState();
    });
    els.resetAll.addEventListener("click", resetAll);
    els.loadDemo.addEventListener("click", loadDemo);
    els.copyCode.addEventListener("click", () => copyText(generatedR, "R code copied."));
    els.copyHtmlTop.addEventListener("click", () => copyText(generatedHtml, "HTML copied."));
    els.copyCurrent.addEventListener("click", copyCurrentOutput);
    els.downloadR.addEventListener("click", () => downloadText("chartforge-chart.R", generatedR, "text/plain"));
    els.downloadHtml.addEventListener("click", () => downloadText("chartforge-chart.html", generatedHtml, "text/html"));
    els.runLocal.addEventListener("click", () => runLocalPreview({ auto: false, force: true }));
    els.runWebr.addEventListener("click", () => runWebRPreview({ auto: false, force: true }));

    els.sourceText.addEventListener("click", () => setDataSource("text"));
    els.sourceEnv.addEventListener("click", () => setDataSource("env"));
    els.parseData.addEventListener("click", () => useDelimitedText(els.dataInput.value, { quiet: false }));
    els.clearData.addEventListener("click", () => {
      els.dataInput.value = "";
      rawInputText = "";
      rows = []; columns = [];
      state.mappings = { x: "", y: "", group: "", labels: [], sortBy: "", sortDesc: false };
      refreshDataUi(); renderAll();
    });
    els.dataFile.addEventListener("change", handleFile);
    const drop = els.dataFile.closest(".file-drop");
    ["dragenter", "dragover"].forEach(type => drop.addEventListener(type, event => { event.preventDefault(); drop.classList.add("dragover"); }));
    ["dragleave", "drop"].forEach(type => drop.addEventListener(type, event => { event.preventDefault(); drop.classList.remove("dragover"); }));
    drop.addEventListener("drop", event => {
      const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      if (file) readDataFile(file);
    });

    [els.delimiter, els.inputDecimalMark, els.autoDates].forEach(control => control.addEventListener("change", () => {
      state.delimiter = els.delimiter.value;
      state.inputDecimalMark = els.inputDecimalMark.value === "," ? "," : ".";
      state.autoDates = els.autoDates.checked;
      saveState();
    }));

    els.refreshEnv.addEventListener("click", () => detectLocalSession({ quiet: false, requestPreview: false }));
    els.loadEnvObject.addEventListener("click", () => loadEnvironmentObject(els.envObject.value, { quiet: false }));
    els.envObject.addEventListener("change", () => { state.envObject = els.envObject.value; saveState(); });

    els.library.addEventListener("change", () => {
      state.library = els.library.value;
      updateRendererDescription();
      renderRendererStyleControls();
      updateRenderingScaleControl();
      saveState();
      renderAll();
    });
    els.chartType.addEventListener("change", () => {
      state.chartType = els.chartType.value;
      applyChartTypeMappingDefaults({ force: false, typeChanged: true });
      renderRendererStyleControls();
      updateConditionalChartControls();
      populateMappings();
      saveState();
      renderAll();
    });

    [els.title, els.subtitle, els.caption].forEach(control => control.addEventListener("input", () => {
      state.title = els.title.value;
      state.subtitle = els.subtitle.value;
      state.caption = els.caption.value;
      saveState(); scheduleRender();
    }));

    [els.markerSize, els.bins].forEach(control => control.addEventListener("input", () => {
      state.markerSize = positiveNumber(els.markerSize.value, 8);
      state.bins = Math.max(2, Math.round(positiveNumber(els.bins.value, 12)));
      saveState(); scheduleRender();
    }));
    els.aggregate.addEventListener("change", () => {
      state.aggregate = ["sum", "mean", "count"].includes(els.aggregate.value) ? els.aggregate.value : "sum";
      saveState(); renderAll();
    });

    [els.mapX, els.mapY, els.mapGroup].forEach(control => control.addEventListener("change", () => {
      state.mappings.x = els.mapX.value;
      state.mappings.y = els.mapY.value;
      state.mappings.group = els.mapGroup.value;
      if (["histogram", "density"].includes(state.chartType)) {
        state.mappings.y = "";
        state.mappings.group = "";
      }
      cleanLabelMappings();
      renderLabelColumnChoices();
      saveState(); renderAll();
    }));
    els.sortBy.addEventListener("change", () => {
      state.mappings.sortBy = els.sortBy.value;
      if (!state.mappings.sortBy) state.mappings.sortDesc = false;
      updateSortControlState();
      saveState(); renderAll();
    });
    els.sortDesc.addEventListener("change", () => {
      if (!state.mappings.sortBy) {
        state.mappings.sortDesc = false;
        updateSortControlState();
        return;
      }
      state.mappings.sortDesc = els.sortDesc.checked;
      saveState(); renderAll();
    });
    els.labelColumns.addEventListener("change", event => {
      if (!event.target.matches("input[type=checkbox]")) return;
      state.mappings.labels = Array.from(els.labelColumns.querySelectorAll("input[type=checkbox]:checked")).map(x => x.value);
      cleanLabelMappings();
      saveState(); renderAll();
    });

    const generalControls = [
      els.chartTheme, els.palette, els.width, els.height, els.fontFamily, els.textSize,
      els.titleSize, els.subtitleSize, els.axisTextSize, els.dpi, els.decimalMark,
      els.legendEnabled, els.legendPosition, els.grid, els.tooltip, els.animation,
      els.embedOutput, els.fullBundle, els.minified
    ];
    generalControls.forEach(control => {
      const eventName = ["checkbox", "select-one"].includes(control.type) ? "change" : "input";
      control.addEventListener(eventName, () => {
        readGeneralControls();
        updatePalettePreview();
        saveState();
        renderAll();
      });
    });

    els.rendererStyleControls.addEventListener("input", handleStyleControl);
    els.rendererStyleControls.addEventListener("change", handleStyleControl);
    window.addEventListener("resize", fitPreviewFrame);
    els.preview.addEventListener("load", inspectPreview);
  }

  function readGeneralControls() {
    state.chartTheme = els.chartTheme.value;
    state.palette = els.palette.value;
    state.width = Math.max(120, Math.round(positiveNumber(els.width.value, 840)));
    state.height = Math.max(120, Math.round(positiveNumber(els.height.value, 480)));
    state.fontFamily = els.fontFamily.value;
    state.textSize = positiveNumber(els.textSize.value, 13);
    state.titleSize = positiveNumber(els.titleSize.value, 22);
    state.subtitleSize = positiveNumber(els.subtitleSize.value, 13);
    state.axisTextSize = positiveNumber(els.axisTextSize.value, 11);
    state.dpi = Math.min(3, Math.max(1, Math.round(positiveNumber(els.dpi.value, 1) * 20) / 20));
    state.decimalMark = els.decimalMark.value === "," ? "," : ".";
    state.legendEnabled = els.legendEnabled.checked;
    state.legendPosition = els.legendPosition.value;
    state.grid = els.grid.checked;
    state.tooltip = els.tooltip.checked;
    state.animation = els.animation.checked;
    state.embed = els.embedOutput.checked;
    state.fullBundle = els.fullBundle.checked;
    state.minified = els.minified.checked;
    els.legendPosition.disabled = !state.legendEnabled;
    updateRenderingScaleControl();
  }

  function switchModule(name) {
    document.querySelectorAll(".module-tab").forEach(button => {
      const active = button.dataset.module === name;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".module-panel").forEach(panel => panel.classList.toggle("active", panel.dataset.modulePanel === name));
  }

  function switchOutput(name) {
    activeOutput = name;
    document.querySelectorAll(".output-tab").forEach(button => {
      const active = button.dataset.output === name;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".output-panel").forEach(panel => panel.classList.toggle("active", panel.dataset.outputPanel === name));
    els.copyCurrent.textContent = name === "html-code" ? "Copy HTML" : name === "data-preview" ? "Copy data" : "Copy R";
  }

  function setDataSource(source) {
    state.dataSource = source === "env" ? "env" : "text";
    setDataSourceUi(); saveState();
    if (state.dataSource === "env") {
      if (!localSession.connected) detectLocalSession({ quiet: false });
      else if (state.envObject) loadEnvironmentObject(state.envObject, { quiet: true });
    } else if (!rows.length || !rawInputText) {
      useDelimitedText(els.dataInput.value || SAMPLE_TEXT, { quiet: true });
    } else renderAll();
  }

  function setDataSourceUi() {
    const env = state.dataSource === "env";
    els.sourceText.classList.toggle("active", !env);
    els.sourceEnv.classList.toggle("active", env);
    els.textSourcePanel.classList.toggle("active", !env);
    els.envSourcePanel.classList.toggle("active", env);
  }

  function updateConditionalChartControls() {
    const type = state.chartType;
    const distribution = ["histogram", "density"].includes(type);
    els.bins.closest(".field").style.display = distribution ? "grid" : "none";
    if (els.binsLabel) els.binsLabel.textContent = type === "density" ? "Density resolution" : "Histogram bins";
    els.markerSize.closest(".field").style.display = ["scatter", "bubble", "line", "spline", "step", "lollipop"].includes(type) ? "grid" : "none";
    els.aggregate.closest(".field").style.display = ["bar", "stacked_bar", "pie", "donut", "treemap", "heatmap", "lollipop"].includes(type) ? "grid" : "none";
    const yField = els.mapY.closest(".field");
    const groupField = els.mapGroup.closest(".field");
    if (yField) yField.style.display = distribution ? "none" : "grid";
    if (groupField) groupField.style.display = distribution ? "none" : "grid";
    els.mapY.disabled = distribution;
    els.mapGroup.disabled = distribution;
    if (distribution) {
      state.mappings.y = "";
      state.mappings.group = "";
      els.mapY.value = "";
      els.mapGroup.value = "";
    }
  }

  function updateRenderingScaleControl() {
    const chartJsOnly = state.library === "chartjs";
    const value = Math.min(3, Math.max(1, Number(state.dpi) || 1));
    if (els.dpi) {
      els.dpi.value = String(value);
      els.dpi.disabled = !chartJsOnly;
      els.dpi.setAttribute("aria-disabled", chartJsOnly ? "false" : "true");
    }
    if (els.dpiField) els.dpiField.classList.toggle("is-disabled", !chartJsOnly);
    if (els.dpiValue) els.dpiValue.textContent = `${value.toFixed(2).replace(/\.?0+$/, "")}×`;
  }

  function updateRendererDescription() {
    const renderer = rendererMeta(state.library);
    const schema = metadata.styles[state.library];
    els.libraryNote.textContent = RENDERER_NOTES[state.library] || (schema && schema.description) || "Direct JavaScript chart renderer.";
    els.styleTitle.textContent = schema ? schema.title : `${renderer.label} style`;
    els.styleDescription.textContent = schema ? schema.description : "Renderer-specific controls.";
    els.rendererDocLink.href = schema && schema.doc_url ? schema.doc_url : renderer.doc_url;
    els.rendererDocLink.textContent = `${renderer.label} manual`;

    const policy = renderer.bundle_policy || "cdn-only";
    const badge = policy === "cdn-only" ? "CDN only" : policy === "conditional" ? "Conditional bundling" : "Bundling permitted";
    els.rendererLicenseNote.className = `license-callout ${policy}`;
    els.rendererLicenseNote.innerHTML = `<div class="license-callout-head"><span class="license-badge">${escapeHtml(badge)}</span><strong>${escapeHtml(renderer.license_name || "Third-party terms")}</strong></div><p>${escapeHtml(renderer.usage_notice || "This renderer is governed by its own licence terms.")}</p><div class="license-links"><a href="${escapeAttr(renderer.license_url)}" target="_blank" rel="noopener noreferrer">Official licence terms</a><a href="THIRD_PARTY_NOTICES.md" target="_blank" rel="noopener noreferrer">Complete third-party notices</a></div>`;

    if (policy === "cdn-only") {
      els.fullBundleHelp.textContent = `${renderer.label} always remains CDN-linked. When this switch is on, ChartForge records that safeguard in the HTML instead of downloading the vendor library.`;
    } else if (policy === "conditional") {
      els.fullBundleHelp.textContent = `${renderer.label} can be inlined only with its licence conditions and notices preserved. ChartForge includes those notices in the HTML.`;
    } else {
      els.fullBundleHelp.textContent = `Inline ${renderer.label} and include its exact licence notices in the generated HTML. Leave off for smaller CDN-linked output.`;
    }
  }

  function renderRendererStyleControls() {
    const schema = metadata.styles[state.library];
    if (!schema || !Array.isArray(schema.controls)) {
      els.rendererStyleControls.innerHTML = '<div class="empty-state">No renderer-specific controls are available.</div>';
      return;
    }
    const visible = schema.controls.filter(control => !control.chart_types || control.chart_types.includes(state.chartType));
    const groups = groupBy(visible, control => control.group || "Appearance");
    els.rendererStyleControls.innerHTML = Object.entries(groups).map(([group, controls]) => `
      <section class="style-group">
        <header class="style-group-header"><h3>${escapeHtml(group)}</h3></header>
        <div class="style-group-body">${controls.map(renderStyleControl).join("")}</div>
      </section>`).join("");
  }

  function renderStyleControl(control) {
    const value = styleValue(state.library, control);
    const help = control.help ? `<p class="style-help">${escapeHtml(control.help)}</p>` : "";
    if (control.type === "switch") {
      return `<label class="switch-row compact-switch style-switch">
        <span><strong>${escapeHtml(control.label)}</strong>${help}</span>
        <input type="checkbox" data-style-key="${escapeAttr(control.key)}" ${value ? "checked" : ""}><span class="switch" aria-hidden="true"></span>
      </label>`;
    }
    if (control.type === "range") {
      return `<div class="style-control">
        <div class="range-label"><span>${escapeHtml(control.label)}</span><span class="muted-text" data-range-value="${escapeAttr(control.key)}">${escapeHtml(formatCompact(value))}</span></div>
        <div class="range-row">
          <input type="range" data-style-key="${escapeAttr(control.key)}" min="${escapeAttr(control.min)}" max="${escapeAttr(control.max)}" step="${escapeAttr(control.step)}" value="${escapeAttr(value)}">
          <input type="number" data-style-number="${escapeAttr(control.key)}" min="${escapeAttr(control.min)}" max="${escapeAttr(control.max)}" step="${escapeAttr(control.step)}" value="${escapeAttr(value)}">
        </div>${help}
      </div>`;
    }
    const choices = (control.choices || []).map(choice => `<option value="${escapeAttr(choice)}" ${String(choice) === String(value) ? "selected" : ""}>${escapeHtml(humanChoice(choice))}</option>`).join("");
    return `<div class="style-control"><label>${escapeHtml(control.label)}<select data-style-key="${escapeAttr(control.key)}">${choices}</select></label>${help}</div>`;
  }

  function handleStyleControl(event) {
    const key = event.target.dataset.styleKey || event.target.dataset.styleNumber;
    if (!key) return;
    const schema = metadata.styles[state.library];
    const control = schema.controls.find(x => x.key === key);
    if (!control) return;
    let value;
    if (control.type === "switch") value = Boolean(event.target.checked);
    else if (control.type === "range") value = Number(event.target.value);
    else value = event.target.value;
    if (!state.rendererStyles[state.library]) state.rendererStyles[state.library] = {};
    state.rendererStyles[state.library][key] = value;
    if (control.type === "range") {
      const range = els.rendererStyleControls.querySelector(`[data-style-key="${cssEscape(key)}"]`);
      const number = els.rendererStyleControls.querySelector(`[data-style-number="${cssEscape(key)}"]`);
      const badge = els.rendererStyleControls.querySelector(`[data-range-value="${cssEscape(key)}"]`);
      if (range && event.target !== range) range.value = value;
      if (number && event.target !== number) number.value = value;
      if (badge) badge.textContent = formatCompact(value);
    }
    saveState(); scheduleRender();
  }

  function styleValue(renderer, control) {
    const values = state.rendererStyles[renderer] || {};
    return Object.prototype.hasOwnProperty.call(values, control.key) ? values[control.key] : control.default;
  }

  function rendererStyleSpec() {
    const schema = metadata.styles[state.library];
    const out = {};
    (schema && schema.controls || []).forEach(control => { out[control.key] = styleValue(state.library, control); });
    return out;
  }

  function changedRendererStyle() {
    const schema = metadata.styles[state.library];
    const saved = state.rendererStyles[state.library] || {};
    const out = {};
    (schema && schema.controls || []).forEach(control => {
      if (Object.prototype.hasOwnProperty.call(saved, control.key) && !sameValue(saved[control.key], control.default)) out[control.key] = saved[control.key];
    });
    return out;
  }

  async function handleFile(event) {
    const file = event.target.files && event.target.files[0];
    if (file) await readDataFile(file);
  }

  async function readDataFile(file) {
    try {
      const text = await file.text();
      if (/\.tsv$/i.test(file.name) && state.delimiter === "auto") {
        state.delimiter = "tab";
        els.delimiter.value = "tab";
      }
      els.dataInput.value = text;
      useDelimitedText(text, { quiet: false });
    } catch (error) {
      showPreviewError("Data import error", error.message || String(error));
    }
  }

  function useDelimitedText(text, { quiet = false, preserveMappings = false } = {}) {
    try {
      if (!String(text || "").trim()) throw new Error("Paste CSV or TSV text with a header row first.");
      const result = parseDelimited(text, state.delimiter, state.inputDecimalMark, state.autoDates);
      rawInputText = text;
      parsedDelimiter = result.delimiter;
      rows = result.rows;
      columns = result.columns;
      state.dataSource = "text";
      if (!preserveMappings) assignDefaultMappings();
      else normalizeMappings();
      setDataSourceUi();
      refreshDataUi();
      saveState();
      renderAll();
      if (!quiet) toast(`${rows.length.toLocaleString()} rows imported from ${delimiterName(parsedDelimiter)} data.`);
    } catch (error) {
      showPreviewError("Data import error", error.message || String(error), "Check the delimiter, quoting and decimal-mark settings in the Data tab.");
      if (!quiet) toast("The pasted data could not be parsed.", "error");
    }
  }

  function parseDelimited(text, requestedDelimiter = "auto", decimalMark = ".", autoDates = true) {
    const normalized = String(text).replace(/^\uFEFF/, "");
    const delimiter = requestedDelimiter === "tab" ? "\t" : requestedDelimiter === "auto" ? inferDelimiter(normalized) : requestedDelimiter;
    if (![",", "\t", ";"].includes(delimiter)) throw new Error("Choose comma, tab, semicolon or automatic delimiter detection.");
    const matrix = parseDelimitedMatrix(normalized, delimiter).filter(row => row.some(cell => String(cell).trim() !== ""));
    if (matrix.length < 2) throw new Error("The data must contain a header row and at least one data row.");
    const width = Math.max(...matrix.map(row => row.length));
    const rawHeaders = matrix[0].concat(Array(Math.max(0, width - matrix[0].length)).fill(""));
    const headers = uniqueHeaders(rawHeaders.map((value, index) => String(value).trim() || `column_${index + 1}`));
    const rawRows = matrix.slice(1).map(row => {
      const record = {};
      headers.forEach((header, index) => { record[header] = row[index] === undefined ? "" : String(row[index]).trim(); });
      return record;
    });
    const inferred = headers.map(name => inferColumn(rawRows.map(row => row[name]), decimalMark, autoDates));
    const rowsOut = rawRows.map(record => {
      const out = {};
      headers.forEach((name, index) => { out[name] = convertValue(record[name], inferred[index], decimalMark); });
      return out;
    });
    const columnsOut = headers.map((name, index) => {
      const kind = inferred[index];
      const values = rowsOut.map(row => row[name]).filter(value => value !== null && value !== undefined && value !== "");
      const uniqueCount = new Set(values.map(value => typeof value === "number" ? `n:${value}` : `s:${String(value)}`)).size;
      const integerLike = kind === "number" && values.length > 0 && values.every(value => Number.isInteger(Number(value)));
      const lowCardinalityInteger = integerLike && uniqueCount > 0 && uniqueCount <= 5;
      const categorical = ["text", "logical"].includes(kind) || lowCardinalityInteger;
      const categoricalReason = kind === "logical" ? "logical" : kind === "text" ? "text" : lowCardinalityInteger ? `${uniqueCount} integer levels` : "";
      return {
        name,
        kind,
        numeric: kind === "number",
        categorical,
        categoricalReason,
        uniqueCount,
        class: kind === "number" ? "numeric" : kind === "date" ? "Date" : kind === "datetime" ? "POSIXct/POSIXt" : kind === "logical" ? "logical" : "character"
      };
    });
    return { rows: rowsOut, columns: columnsOut, delimiter };
  }

  function parseDelimitedMatrix(text, delimiter) {
    const result = [];
    let row = [];
    let field = "";
    let quoted = false;
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      if (quoted) {
        if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
        else if (char === '"') quoted = false;
        else field += char;
      } else if (char === '"' && field.length === 0) quoted = true;
      else if (char === delimiter) { row.push(field); field = ""; }
      else if (char === "\n") { row.push(field.replace(/\r$/, "")); result.push(row); row = []; field = ""; }
      else field += char;
    }
    row.push(field.replace(/\r$/, ""));
    if (row.length > 1 || row[0] !== "" || !result.length) result.push(row);
    return result;
  }

  function inferDelimiter(text) {
    const firstRecord = firstLogicalRecord(text);
    const candidates = ["\t", ",", ";"];
    const counts = candidates.map(delimiter => countOutsideQuotes(firstRecord, delimiter));
    const max = Math.max(...counts);
    if (max < 1) throw new Error("ChartForge could not detect a delimiter. Choose one explicitly.");
    return candidates[counts.indexOf(max)];
  }

  function firstLogicalRecord(text) {
    let quoted = false;
    let out = "";
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      if (char === '"') {
        if (quoted && text[i + 1] === '"') { out += '""'; i += 1; continue; }
        quoted = !quoted;
      }
      if (char === "\n" && !quoted) break;
      out += char;
    }
    return out;
  }

  function countOutsideQuotes(text, delimiter) {
    let quoted = false;
    let count = 0;
    for (let i = 0; i < text.length; i += 1) {
      if (text[i] === '"') {
        if (quoted && text[i + 1] === '"') { i += 1; continue; }
        quoted = !quoted;
      } else if (!quoted && text[i] === delimiter) count += 1;
    }
    return count;
  }

  function inferColumn(values, decimalMark, autoDates) {
    const present = values.map(value => String(value).trim()).filter(value => value !== "" && !/^NA$/i.test(value));
    if (!present.length) return "text";
    if (present.every(value => parseNumericText(value, decimalMark) !== null)) return "number";
    if (present.every(value => /^(true|false|t|f|yes|no)$/i.test(value))) return "logical";
    if (autoDates && present.every(value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)))) return "date";
    const isoDateTime = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/;
    if (autoDates && present.every(value => isoDateTime.test(value) && !Number.isNaN(Date.parse(value.replace(" ", "T"))))) return "datetime";
    return "text";
  }

  function convertValue(value, kind, decimalMark) {
    const text = String(value).trim();
    if (text === "" || /^NA$/i.test(text)) return null;
    if (kind === "number") return parseNumericText(text, decimalMark);
    if (kind === "logical") return /^(true|t|yes)$/i.test(text);
    return text;
  }

  function parseNumericText(value, decimalMark) {
    const text = String(value).trim();
    if (!text) return null;
    const normalized = decimalMark === "," ? text.replace(/\./g, "").replace(",", ".") : text.replace(/,(?=\d{3}(?:\D|$))/g, "");
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(normalized)) return null;
    const number = Number(normalized);
    return Number.isFinite(number) ? number : null;
  }

  function uniqueHeaders(headers) {
    const counts = new Map();
    return headers.map(header => {
      const count = (counts.get(header) || 0) + 1;
      counts.set(header, count);
      return count === 1 ? header : `${header}_${count}`;
    });
  }

  function assignDefaultMappings() {
    const names = columns.map(column => column.name);
    const measures = columns.filter(column => column.numeric && !column.categorical).map(column => column.name);
    const numeric = columns.filter(column => column.numeric).map(column => column.name);
    const categories = columns.filter(column => column.categorical).map(column => column.name);
    const pick = (preferred, fallback, pool = names) => pool.includes(preferred) ? preferred : fallback;
    state.mappings.x = pick("wt", measures[0] || numeric[0] || names[0] || "", measures.length ? measures : numeric.length ? numeric : names);
    state.mappings.y = pick("mpg", measures.find(name => name !== state.mappings.x) || numeric.find(name => name !== state.mappings.x) || "", measures.length ? measures : numeric);
    state.mappings.group = pick("cyl", categories.find(name => name !== state.mappings.x && name !== state.mappings.y) || "", categories);
    state.mappings.labels = names.includes("model") ? ["model"] : [];
    state.mappings.sortBy = "";
    state.mappings.sortDesc = false;
    applyChartTypeMappingDefaults({ force: true, typeChanged: false });
  }

  function applyChartTypeMappingDefaults({ force = false, typeChanged = false } = {}) {
    const type = state.chartType;
    const names = columns.map(column => column.name);
    const measures = columns.filter(column => column.numeric && !column.categorical).map(column => column.name);
    const numeric = columns.filter(column => column.numeric).map(column => column.name);
    const categories = columns.filter(column => column.categorical).map(column => column.name);
    const dates = columns.filter(column => ["date", "datetime"].includes(column.kind)).map(column => column.name);
    const valid = name => names.includes(name);
    const choose = (...values) => values.find(value => value && valid(value)) || "";
    const chooseMeasure = (...values) => values.find(value => value && measures.includes(value)) || measures[0] || numeric[0] || "";
    const chooseCategory = (...values) => values.find(value => value && categories.includes(value)) || categories[0] || "";

    if (["histogram", "density"].includes(type)) {
      state.mappings.x = chooseMeasure(force ? "mpg" : state.mappings.x, "mpg", "wt");
      state.mappings.y = "";
      state.mappings.group = "";
    } else if (["scatter", "bubble"].includes(type)) {
      state.mappings.x = chooseMeasure(force ? "wt" : state.mappings.x, "wt");
      state.mappings.y = chooseMeasure(force ? "mpg" : state.mappings.y, "mpg", measures.find(name => name !== state.mappings.x));
      if (state.mappings.y === state.mappings.x) state.mappings.y = measures.find(name => name !== state.mappings.x) || "";
    } else if (["line", "spline", "step", "area", "stacked_area"].includes(type)) {
      state.mappings.x = choose(force ? dates[0] : state.mappings.x, dates[0], measures[0], numeric[0], names[0]);
      state.mappings.y = chooseMeasure(state.mappings.y, measures.find(name => name !== state.mappings.x));
    } else if (["bar", "stacked_bar", "pie", "donut", "treemap", "lollipop"].includes(type)) {
      state.mappings.x = chooseCategory(state.mappings.x, "model", categories[0]) || choose(state.mappings.x, names[0]);
      state.mappings.y = chooseMeasure(state.mappings.y, "mpg", measures[0]);
    } else if (type === "boxplot") {
      state.mappings.x = chooseCategory(state.mappings.x, state.mappings.group);
      state.mappings.y = chooseMeasure(state.mappings.y, "mpg", measures[0]);
    } else if (type === "heatmap") {
      state.mappings.x = chooseCategory(state.mappings.x, categories[0]) || choose(state.mappings.x, names[0]);
      state.mappings.group = chooseCategory(state.mappings.group, categories.find(name => name !== state.mappings.x));
      state.mappings.y = chooseMeasure(state.mappings.y, measures[0]);
    }

    const autoSortTypes = new Set(["scatter", "line", "spline", "step", "area", "stacked_area", "bubble", "lollipop"]);
    if (typeChanged || force) {
      state.mappings.sortBy = autoSortTypes.has(type) && state.mappings.x ? state.mappings.x : "";
      state.mappings.sortDesc = false;
    }
    cleanLabelMappings();
  }

  function normalizeMappings() {
    const names = columns.map(column => column.name);
    ["x", "y", "group", "sortBy"].forEach(key => { if (!names.includes(state.mappings[key])) state.mappings[key] = ""; });
    state.mappings.labels = (state.mappings.labels || []).filter(name => names.includes(name));
    if (!state.mappings.x || (!["histogram", "density"].includes(state.chartType) && !state.mappings.y)) assignDefaultMappings();
    else applyChartTypeMappingDefaults({ force: false, typeChanged: false });
    cleanLabelMappings();
  }

  function cleanLabelMappings() {
    const mapped = new Set([state.mappings.x, state.mappings.y, state.mappings.group].filter(Boolean));
    state.mappings.labels = unique(state.mappings.labels || []).filter(name => !mapped.has(name) && columns.some(column => column.name === name));
  }

  function refreshDataUi() {
    populateMappings();
    renderColumns();
    renderDataPreview();
    els.rowCount.textContent = `${rows.length.toLocaleString()} ${rows.length === 1 ? "row" : "rows"}`;
    els.columnCount.textContent = `${columns.length} ${columns.length === 1 ? "column" : "columns"}`;
  }

  function populateMappings() {
    const options = columns.map(column => {
      const category = column.categorical ? " · likely categorical" : "";
      return `<option value="${escapeAttr(column.name)}">${escapeHtml(column.name)} · ${escapeHtml(column.kind || column.class || "text")}${escapeHtml(category)}</option>`;
    }).join("");
    const optional = `<option value="">None</option>${options}`;
    els.mapX.innerHTML = optional;
    els.mapY.innerHTML = optional;
    els.mapGroup.innerHTML = optional;
    els.sortBy.innerHTML = optional;
    els.mapX.value = state.mappings.x || "";
    els.mapY.value = state.mappings.y || "";
    els.mapGroup.value = state.mappings.group || "";
    els.sortBy.value = state.mappings.sortBy || "";
    updateSortControlState();
    renderLabelColumnChoices();
  }

  function updateSortControlState() {
    const enabled = Boolean(state.mappings.sortBy);
    els.sortDesc.checked = enabled && Boolean(state.mappings.sortDesc);
    els.sortDesc.disabled = !enabled;
    const row = els.sortDesc.closest(".switch-row");
    if (row) row.classList.toggle("is-disabled", !enabled);
  }

  function renderLabelColumnChoices() {
    if (!columns.length) {
      els.labelColumns.innerHTML = '<div class="empty-state">Import data to choose hover labels.</div>';
      return;
    }
    const mapped = new Set([state.mappings.x, state.mappings.y, state.mappings.group].filter(Boolean));
    els.labelColumns.innerHTML = columns.map(column => {
      const disabled = mapped.has(column.name);
      const checked = !disabled && state.mappings.labels.includes(column.name);
      return `<label class="check-item ${disabled ? "mapped" : ""}">
        <input type="checkbox" value="${escapeAttr(column.name)}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}>
        <span title="${escapeAttr(column.name)}">${escapeHtml(column.name)}</span>
        ${disabled ? "<small>mapped</small>" : ""}
      </label>`;
    }).join("");
  }

  function renderColumns() {
    els.columns.innerHTML = columns.length ? columns.map(column => {
      const flag = column.categorical ? `<b class="category-flag" title="${escapeAttr(column.categoricalReason || "Likely categorical variable")}">categorical</b>` : "";
      return `<span class="column-chip"><strong>${escapeHtml(column.name)}</strong><em>${escapeHtml(column.kind || column.class || "text")}</em>${flag}</span>`;
    }).join("") : '<span class="muted-text">No columns yet.</span>';
  }

  function renderDataPreview() {
    if (!rows.length || !columns.length) {
      els.dataPreview.innerHTML = '<div class="empty-state">No data to preview.</div>';
      return;
    }
    const previewRows = sortedRows().slice(0, 250);
    els.dataPreview.innerHTML = `<table class="data-table"><thead><tr>${columns.map(column => `<th title="${escapeAttr(column.class || column.kind)}">${escapeHtml(column.name)}</th>`).join("")}</tr></thead><tbody>${previewRows.map(row => `<tr>${columns.map(column => `<td title="${escapeAttr(displayValue(row[column.name]))}">${escapeHtml(displayValue(row[column.name]))}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }

  function readLocalBootstrap() {
    const node = document.getElementById("chartforge-local-bootstrap");
    if (!node || !node.textContent.trim()) return null;
    try {
      const payload = JSON.parse(node.textContent);
      return payload && scalarBoolean(payload.ok) && scalarString(payload.app) === "ChartForge" ? payload : null;
    } catch (_) {
      return null;
    }
  }

  function applyLocalSessionPayload(payload) {
    const objects = normalizeObjectList(payload.data_objects ?? payload.objects ?? []);
    localSession = {
      connected: true,
      objects,
      rVersion: scalarString(payload.r_version, localSession.rVersion || ""),
      sessionError: ""
    };
    preferredPreview = preferredPreview === "webr" ? "webr" : "local";
    populateEnvironmentObjects();
    updateEnvironmentStatus();
    setConnection("success", preferredPreview === "webr" ? "WebR active" : "Local R connected");
    return true;
  }

  async function detectLocalSession({ quiet = false, preserveConnection = false, requestPreview = false } = {}) {
    if (sessionRefreshInFlight) {
      const connected = await sessionRefreshInFlight;
      if (connected && requestPreview && preferredPreview !== "webr") scheduleLocalPreview();
      return connected;
    }

    const refresh = async () => {
      if (!localSession.connected) setConnection("neutral", "Checking local R");
      if (els.refreshEnv) {
        els.refreshEnv.disabled = true;
        els.refreshEnv.classList.add("is-loading");
      }
      const previouslyConnected = Boolean(localSession.connected);
      try {
        const candidates = [
          [`${apiUrl("/api/session")}?_=${Date.now()}`, {}],
          [apiUrl("/api/session"), { method: "POST", headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" }, body: "{}" }],
          [`${apiUrl("/api/bootstrap")}?_=${Date.now()}`, {}],
          [apiUrl("/api/bootstrap"), { method: "POST", headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" }, body: "{}" }]
        ];
        let payload = null;
        let lastError = null;
        for (const [url, options] of candidates) {
          try {
            const attempt = await fetchJsonWithTimeout(url, Object.assign({ cache: "no-store", credentials: "same-origin" }, options), 5000);
            if (attempt && scalarBoolean(attempt.ok) && scalarString(attempt.app) === "ChartForge") { payload = attempt; break; }
            lastError = new Error("The local session endpoint returned an unexpected response.");
          } catch (error) { lastError = error; }
        }
        if (!payload) throw lastError || new Error("The local session endpoint did not identify ChartForge.");
        applyLocalSessionPayload(payload);
        if (!quiet) {
          const version = scalarString(payload.r_version);
          toast(`Local R connected${version ? ` · ${version}` : ""}.`);
        }
        return true;
      } catch (primaryError) {
        try {
          const health = await fetchJsonWithTimeout(apiUrl("/health"), {}, 2500);
          if (!health || !scalarBoolean(health.ok) || scalarString(health.app) !== "ChartForge") throw primaryError;
          const list = await fetchJsonWithTimeout(apiUrl("/api/data-objects"), {}, 2500)
            .catch(() => fetchJsonWithTimeout(apiUrl("/api/data-objects"), { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }, 2500))
            .catch(() => fetchJsonWithTimeout(apiUrl("/data-objects"), {}, 2500));
          localSession = { connected: true, objects: normalizeObjectList(list.objects ?? []), rVersion: scalarString(health.r_version), sessionError: "" };
          preferredPreview = preferredPreview === "webr" ? "webr" : "local";
          populateEnvironmentObjects();
          updateEnvironmentStatus();
          setConnection("success", preferredPreview === "webr" ? "WebR active" : "Local R connected");
          if (!quiet) toast("Local R data objects refreshed.");
          return true;
        } catch (error) {
          const keepConnected = previouslyConnected || preserveConnection;
          localSession = {
            connected: keepConnected,
            objects: keepConnected ? localSession.objects : [],
            rVersion: keepConnected ? localSession.rVersion : "",
            sessionError: error.message || String(error)
          };
          if (!localSession.connected && preferredPreview === "local") preferredPreview = "browser";
          populateEnvironmentObjects();
          updateEnvironmentStatus();
          setConnection(localSession.connected ? "warning" : "neutral", localSession.connected ? "Local R preview available" : "Browser preview");
          if (!quiet) toast(localSession.connected ? "Local R preview works, but its data-object list could not be refreshed." : "No local R data endpoint was detected on this page.", "error");
          return false;
        }
      } finally {
        if (els.refreshEnv) {
          els.refreshEnv.disabled = false;
          els.refreshEnv.classList.remove("is-loading");
        }
      }
    };

    sessionRefreshInFlight = refresh();
    try {
      const connected = await sessionRefreshInFlight;
      if (connected && requestPreview && preferredPreview !== "webr") scheduleLocalPreview();
      return connected;
    } finally {
      sessionRefreshInFlight = null;
    }
  }

  function normalizeObjectList(value) {
    return recordArray(value).map(object => ({
      ...object,
      name: scalarString(object.name),
      type: scalarString(object.type),
      rows: scalarNumber(object.rows),
      columns: scalarNumber(object.columns),
      class: scalarString(object.class)
    })).filter(object => object.name);
  }

  function normalizeColumns(value) {
    return recordArray(value).map(column => {
      const name = scalarString(column.name);
      const kind = scalarString(column.kind, scalarString(column.class, "text")).toLowerCase();
      const className = scalarString(column.class, kind || "text");
      const inferredNumeric = kind === "number" || /(^|\/)numeric($|\/)|(^|\/)integer($|\/)|(^|\/)double($|\/)/i.test(className);
      const inferredCategorical = ["category", "text", "logical"].includes(kind) || /(^|\/)(factor|ordered|character|logical)($|\/)/i.test(className);
      return {
        ...column,
        name,
        kind: kind || "text",
        class: className,
        numeric: scalarBoolean(column.numeric, inferredNumeric),
        categorical: scalarBoolean(column.categorical, inferredCategorical),
        categoricalReason: scalarString(column.categoricalReason ?? column.categorical_reason),
        uniqueCount: scalarNumber(column.uniqueCount ?? column.unique_count, 0)
      };
    }).filter(column => column.name);
  }

  function populateEnvironmentObjects() {
    const objects = localSession.objects;
    if (!objects.length) {
      els.envObject.innerHTML = '<option value="">No data frames or matrices found</option>';
      state.envObject = "";
    } else {
      els.envObject.innerHTML = objects.map(object => `<option value="${escapeAttr(object.name)}">${escapeHtml(object.name)} · ${Number(object.rows || 0).toLocaleString()} × ${Number(object.columns || 0).toLocaleString()}</option>`).join("");
      if (!objects.some(object => object.name === state.envObject)) state.envObject = objects[0].name;
      els.envObject.value = state.envObject;
    }
    els.envObject.disabled = !localSession.connected || !objects.length;
    els.loadEnvObject.disabled = !localSession.connected || !objects.length;
  }

  function updateEnvironmentStatus() {
    const card = els.rSessionCard;
    card.classList.remove("neutral", "success", "warning", "error");
    if (localSession.connected) {
      card.classList.add(localSession.sessionError ? "warning" : "success");
      els.rSessionTitle.textContent = localSession.sessionError ? "Local R preview is connected" : "Local R is connected";
      els.envNote.textContent = localSession.objects.length
        ? `${localSession.objects.length} data frame${localSession.objects.length === 1 ? " or matrix is" : "s or matrices are"} available from the launching R environment.`
        : localSession.sessionError
          ? "The preview endpoint works, but the data-object list could not be read. Refresh after checking the local server console."
          : "The R session is available, but it does not currently expose a data frame or matrix.";
    } else {
      card.classList.add("neutral");
      els.rSessionTitle.textContent = "Local R data is unavailable on this page";
      els.envNote.textContent = "The browser preview remains usable. Open this page from chartforge::run_app() to list data frames and matrices from that R session.";
    }
  }

  async function loadEnvironmentObject(name, { quiet = false } = {}) {
    if (!localSession.connected) {
      const connected = await detectLocalSession({ quiet: true });
      if (!connected) {
        showPreviewError("Local R data is unavailable", "The data-object endpoint could not be reached from this page. The browser chart preview can still be used with pasted CSV or TSV data.");
        return;
      }
    }
    if (!name) return;
    try {
      let payload;
      try {
        payload = await fetchJsonWithTimeout(`${apiUrl("/api/data-object")}?name=${encodeURIComponent(name)}&max_rows=5000&_=${Date.now()}`, {}, 8000);
      } catch (getError) {
        payload = await fetchJsonWithTimeout(apiUrl("/api/data-object"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, max_rows: 5000 }) }, 8000);
      }
      if (!scalarBoolean(payload.ok)) throw new Error(scalarString(payload.error, `Could not read R object ${name}.`));
      columns = normalizeColumns(payload.columns ?? []);
      rows = normalizeRows(payload.rows ?? [], columns);
      state.dataSource = "env";
      state.envObject = scalarString(name);
      rawInputText = "";
      assignDefaultMappings();
      setDataSourceUi(); refreshDataUi(); saveState(); renderAll();
      if (!quiet) toast(`${scalarString(name)} loaded from local R${scalarBoolean(payload.truncated) ? " (browser preview truncated to 5,000 rows)" : ""}.`);
    } catch (error) {
      showPreviewError("Could not import the R object", error.message || String(error));
      if (!quiet) toast("The selected R object could not be loaded.", "error");
    }
  }

  function currentRCode({ forceEmbeddedData = false } = {}) {
    const sourceIsEnvironment = state.dataSource === "env" && state.envObject && !forceEmbeddedData;
    const dataCode = sourceIsEnvironment
      ? `df <- cf_get_data(${rString(state.envObject)})`
      : `df <- cf_from_delim(\n  ${rString(rawInputText || rowsToDelimited(rows, columns, parsedDelimiter))},\n  delim = ${rString(parsedDelimiter)},\n  auto_dates = ${rLogical(state.autoDates)},\n  decimal_mark = ${rString(state.inputDecimalMark)}\n)`;

    const style = changedRendererStyle();
    const args = [
      ["data", "df"],
      ["x", rNullableString(state.mappings.x)],
      ["y", rNullableString(state.mappings.y)],
      ["group", rNullableString(state.mappings.group)],
      ["label", rCharacterVector(cleanHoverLabels())],
      ["sort_by", rNullableString(state.mappings.sortBy)],
      ["sort_desc", rLogical(Boolean(state.mappings.sortDesc))],
      ["title", rString(state.title)],
      ["subtitle", rNullableString(state.subtitle)],
      ["caption", rNullableString(state.caption)],
      ["width", String(state.width)],
      ["height", String(state.height)],
      ["theme", rString(state.chartTheme)],
      ["palette", `cf_palette(${rString(state.palette)})`],
      ["marker_size", formatRNumber(state.markerSize)],
      ["bins", String(state.bins)],
      ["aggregate", rString(state.aggregate)],
      ["legend", rString(state.legendEnabled ? "show" : "hide")],
      ["legend_position", rString(state.legendEnabled ? state.legendPosition : "none")],
      ["text_size", formatRNumber(state.textSize)],
      ["title_size", formatRNumber(state.titleSize)],
      ["subtitle_size", formatRNumber(state.subtitleSize)],
      ["axis_text_size", formatRNumber(state.axisTextSize)],
      ["dpi", formatRNumber(state.dpi)],
      ["font_family", rString(state.fontFamily)],
      ["decimal_mark", rString(state.decimalMark)],
      ["grid", rLogical(state.grid)],
      ["tooltip", rLogical(state.tooltip)],
      ["animation", rLogical(state.animation)],
      ["renderer_style", rNamedList(style)],
      ["full_bundle", rLogical(state.fullBundle)],
      ["embed", rLogical(state.embed)],
      ["minified", rLogical(state.minified)]
    ];
    const fn = `cf_${state.library}_${state.chartType}`;
    const body = args.map(([name, value]) => `  ${name} = ${value}`).join(",\n");
    return `library(chartforge)\n\n${dataCode}\n\nchart_html <- ${fn}(\n${body}\n)\n\nchart_html`;
  }

  function specForExport() {
    return {
      library: state.library,
      chartType: state.chartType,
      mappings: {
        x: state.mappings.x || null,
        y: state.mappings.y || null,
        group: state.mappings.group || null,
        label: cleanHoverLabels(),
        sortBy: state.mappings.sortBy ? [state.mappings.sortBy] : null
      },
      sortDesc: [Boolean(state.mappings.sortDesc)],
      title: state.title || "ChartForge chart",
      subtitle: state.subtitle || "",
      width: Number(state.width),
      height: Number(state.height),
      theme: state.chartTheme,
      themeValues: themeValues(state.chartTheme),
      palette: metadata.palettes[state.palette] || metadata.palettes.studio,
      markerSize: Number(state.markerSize),
      bins: Number(state.bins),
      caption: state.caption || "",
      fullBundle: Boolean(state.fullBundle),
      embed: Boolean(state.embed),
      minified: Boolean(state.minified),
      aggregate: state.aggregate,
      legend: state.legendEnabled ? "show" : "hide",
      legendPosition: state.legendEnabled ? state.legendPosition : "none",
      textSize: Number(state.textSize),
      titleSize: Number(state.titleSize),
      subtitleSize: Number(state.subtitleSize),
      axisTextSize: Number(state.axisTextSize),
      dpi: Number(state.dpi),
      fontFamily: state.fontFamily,
      decimalMark: state.decimalMark,
      grid: Boolean(state.grid),
      tooltip: Boolean(state.tooltip),
      animation: Boolean(state.animation),
      rendererStyle: rendererStyleSpec(),
      options: {
        aggregate: state.aggregate,
        renderer_options: {}, highcharts_options: {}, plotly_layout: {}, plotly_config: {},
        vega_config: {}, chartjs_options: {}, echarts_options: {}, apexcharts_options: {},
        google_options: {}, amcharts_options: {}, vchart_options: {}, anychart_options: {}, billboard_options: {}
      }
    };
  }

  function preflightErrors() {
    const errors = [];
    if (!rows.length) errors.push("Import at least one data row.");
    const names = new Set(columns.map(column => column.name));
    const type = state.chartType;
    const x = state.mappings.x;
    const y = state.mappings.y;
    const xColumn = columns.find(column => column.name === x);
    const yColumn = columns.find(column => column.name === y);
    const groupColumn = columns.find(column => column.name === state.mappings.group);
    const requireXY = ["scatter", "line", "spline", "step", "area", "stacked_area", "bubble", "lollipop", "heatmap"].includes(type);
    if (requireXY && (!x || !names.has(x))) errors.push(`${TYPE_LABELS[type] || type} requires an X column.`);
    if (requireXY && (!y || !names.has(y))) errors.push(`${TYPE_LABELS[type] || type} requires a Y column.`);
    if (["bar", "stacked_bar", "pie", "donut", "treemap"].includes(type) && (!x || !names.has(x))) errors.push(`${TYPE_LABELS[type]} requires an X/category column.`);
    if (["histogram", "density"].includes(type)) {
      if (!x || !names.has(x)) errors.push(`${TYPE_LABELS[type]} requires exactly one continuous numeric X variable.`);
      if (y) errors.push(`${TYPE_LABELS[type]} derives its vertical axis from X; clear the Y mapping.`);
      if (state.mappings.group) errors.push(`${TYPE_LABELS[type]} currently uses a single distribution; clear the group mapping.`);
      if (xColumn && (!xColumn.numeric || xColumn.categorical)) errors.push(`X column “${x}” is likely categorical. Choose a continuous numeric variable for ${TYPE_LABELS[type].toLowerCase()}.`);
    }
    if (type === "boxplot" && (!y || !names.has(y))) errors.push("Box plot requires a numeric Y column.");
    if (["scatter", "bubble"].includes(type) && xColumn && (!xColumn.numeric || xColumn.categorical)) errors.push(`X column “${x}” must be a continuous numeric variable for ${TYPE_LABELS[type].toLowerCase()}.`);
    if (y && ["scatter", "line", "spline", "step", "area", "stacked_area", "bubble", "boxplot", "heatmap", "lollipop"].includes(type) && yColumn && !yColumn.numeric) errors.push(`Y column “${y}” is not numeric.`);
    if (type === "heatmap" && !state.mappings.group) errors.push("Heatmap requires a categorical row/group column in addition to X and numeric Y.");
    if (type === "heatmap" && xColumn && !xColumn.categorical) errors.push(`Heatmap X column “${x}” is not flagged as categorical.`);
    if (type === "heatmap" && state.mappings.group && groupColumn && !groupColumn.categorical) errors.push(`Heatmap row column “${state.mappings.group}” is not flagged as categorical.`);
    if (state.dataSource === "env" && !state.envObject) errors.push("Select a data frame or matrix from local R.");
    return unique(errors);
  }

  function renderAll() {
    clearTimeout(renderTimer);
    const token = ++renderToken;
    generatedR = currentRCode();
    setHighlightedCode(els.rCode, generatedR, "r");
    renderDataPreview();
    updatePreviewDimensions();
    const errors = preflightErrors();
    if (errors.length) {
      generatedHtml = "";
      setHighlightedCode(els.htmlCode, "", "html");
      showPreviewError("R code needs attention", errors.join("\n"), "Correct the mappings or data settings shown above, then ChartForge will rerender automatically.");
      return;
    }
    setPreviewStatus("neutral", "Building output");
    renderTimer = setTimeout(async () => {
      try {
        const html = await buildBrowserHtml();
        if (token !== renderToken) return;
        generatedHtml = html;
        setHighlightedCode(els.htmlCode, html, "html");
        if (preferredPreview !== "local" && preferredPreview !== "webr") {
          setPreviewHtml(html, localSession.connected ? "Browser design preview · local R is available" : "Browser design preview", localSession.connected ? "neutral" : "warning");
        }
        if (localSession.connected && preferredPreview === "local") scheduleLocalPreview();
        else if (preferredPreview === "webr" && webRReady) scheduleWebRPreview();
      } catch (error) {
        if (token !== renderToken) return;
        generatedHtml = "";
        setHighlightedCode(els.htmlCode, "", "html");
        showPreviewError("HTML generation error", error.message || String(error), state.fullBundle ? "Turn off vendor inlining to use CDN tags, or run the emitted R code with network access." : "Check the renderer and chart settings.");
      }
    }, 90);
  }

  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderAll, 180);
  }

  function previewRequestKey() {
    return `${renderToken}:${simpleHash(generatedR || "")}`;
  }

  function scheduleLocalPreview({ force = false } = {}) {
    const key = previewRequestKey();
    if (!force && key === lastLocalPreviewKey) return;
    if (localPreviewInFlight) {
      localPreviewQueued = true;
      return;
    }
    clearTimeout(localPreviewTimer);
    localPreviewTimer = setTimeout(() => runLocalPreview({ auto: true, force }), 420);
  }

  function scheduleWebRPreview({ force = false } = {}) {
    const key = previewRequestKey();
    if (!force && key === lastWebRPreviewKey) return;
    if (webRPreviewInFlight) {
      webRPreviewQueued = true;
      return;
    }
    clearTimeout(webRPreviewTimer);
    webRPreviewTimer = setTimeout(() => runWebRPreview({ auto: true, force }), 520);
  }

  async function buildBrowserHtml() {
    const spec = specForExport();
    const outputRows = sortedRows();
    const runtime = await loadSelectedRuntime(state.library, state.chartType, state.minified);
    const assets = assetsFor(state.library, state.chartType, spec.rendererStyle);
    const assetTags = await buildAssetTags(state.library, assets, state.fullBundle, state.minified);
    const fontTags = fontTagsFor(state.fontFamily, state.minified);
    const dataJson = safeScriptJson(JSON.stringify(outputRows));
    const specJson = safeScriptJson(JSON.stringify(spec));
    const hash = simpleHash(JSON.stringify({ spec, n: outputRows.length, first: outputRows[0], last: outputRows[outputRows.length - 1] }));
    const chartId = `cf-chart-${hash}`;
    const dataId = `cf-data-${hash}`;
    const specId = `cf-spec-${hash}`;
    const width = Number(state.width);
    const height = Number(state.height);
    const coreCss = [
      ".cf-chartforge{box-sizing:border-box;display:block;overflow:auto;font-family:var(--cf-font,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif)}",
      ".cf-chart{box-sizing:border-box;display:block;position:relative}",
      ".cf-chart svg,.cf-chart canvas{display:block;max-width:none}",
      ".cf-error{box-sizing:border-box;border:1px solid #fecdd3;background:#fff1f2;color:#9f1239;border-radius:14px;padding:16px;line-height:1.5;font:500 14px/1.5 var(--cf-font,Inter,ui-sans-serif,system-ui,sans-serif);white-space:pre-wrap}"
    ].join(state.minified ? "" : "\n");
    const renderCall = `ChartForgeRender.renderFromScripts("${dataId}","${specId}","${chartId}");`;
    const join = state.minified ? "" : "\n";
    const runtimeTag = `<script>${state.minified ? "" : "\n"}${escapeClosingScript(runtime)}${state.minified ? "" : "\n"}</script>`;

    if (state.embed) {
      return [
        `<style>${state.minified ? "" : "\n"}${coreCss}${state.minified ? "" : "\n"}</style>`,
        fontTags,
        assetTags,
        `<div class="cf-chartforge" style="--cf-font:${escapeAttr(state.fontFamily)};width:${width}px"><div id="${chartId}" class="cf-chart" role="img" aria-label="Generated chart" style="width:${width}px;height:${height}px;min-height:${height}px"></div></div>`,
        `<script type="application/json" id="${dataId}">${dataJson}</script>`,
        `<script type="application/json" id="${specId}">${specJson}</script>`,
        runtimeTag,
        `<script>(function(){${renderCall}})();</script>`
      ].filter(Boolean).join(join);
    }

    const theme = themeValues(state.chartTheme);
    const pageCss = [
      "html,body{margin:0;padding:0;min-height:100%;font-family:var(--cf-font,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif)}",
      ".cf-page{min-height:100vh;box-sizing:border-box;padding:24px;overflow:auto;background:var(--cf-bg);color:var(--cf-text)}",
      ".cf-card{box-sizing:border-box;width:var(--cf-width);margin:0 auto;border:1px solid rgba(125,145,170,.24);border-radius:20px;background:var(--cf-panel);box-shadow:0 18px 55px rgba(15,23,42,.13);padding:16px;overflow:auto}",
      coreCss
    ].join(state.minified ? "" : "\n");
    const rootCss = `:root{--cf-bg:${theme.bg};--cf-panel:${theme.panel};--cf-text:${theme.text};--cf-grid:${theme.grid};--cf-muted:${theme.muted};--cf-width:${width}px;--cf-font:${state.fontFamily}}`;
    return [
      "<!doctype html>", '<html lang="en">', "<head>", '<meta charset="utf-8">', '<meta name="viewport" content="width=device-width,initial-scale=1">',
      `<title>${escapeHtml(state.title || "ChartForge chart")}</title>`, `<style>${rootCss}${state.minified ? "" : "\n"}${pageCss}</style>`, fontTags, assetTags, "</head>", "<body>",
      '<main class="cf-page"><section class="cf-card">', `<div id="${chartId}" class="cf-chart" role="img" aria-label="Generated chart" style="width:${width}px;height:${height}px;min-height:${height}px"></div>`, "</section></main>",
      `<script type="application/json" id="${dataId}">${dataJson}</script>`, `<script type="application/json" id="${specId}">${specJson}</script>`, runtimeTag,
      `<script>(function(){${renderCall}})();</script>`, "</body>", "</html>"
    ].filter(Boolean).join(join);
  }

  async function loadSelectedRuntime(renderer, type, minified) {
    const key = `${renderer}/${type}/${minified ? "min" : "readable"}`;
    if (runtimeCache.has(key)) return runtimeCache.get(key);
    const mode = minified ? "minified" : "readable";
    const packKey = `pack/${mode}`;
    let pack = runtimeCache.get(packKey);
    if (!pack) {
      const response = await fetch(`assets/runtime-${mode}.json.gz?v=0.6.6`, { cache: "force-cache" });
      if (!response.ok) throw new Error(`The ${mode} ChartForge runtime pack could not be loaded (${response.status}).`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      let text;
      if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) {
        if (!("DecompressionStream" in globalThis)) {
          throw new Error("This browser cannot decompress ChartForge's compact runtime pack. Use a current Chrome, Edge, or Firefox release.");
        }
        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
        text = await new Response(stream).text();
      } else {
        // Some hosts transparently decode a .gz response before exposing it to fetch().
        text = new TextDecoder("utf-8").decode(bytes);
      }
      try { pack = JSON.parse(text); }
      catch (error) { throw new Error(`The ${mode} ChartForge runtime pack is invalid: ${error.message || error}`); }
      runtimeCache.set(packKey, pack);
    }
    const source = pack && pack[renderer] && pack[renderer][type];
    if (typeof source !== "string" || !source) throw new Error(`The selected ${renderer} ${type} runtime is missing from the runtime pack.`);
    runtimeCache.set(key, source);
    return source;
  }

  function assetsFor(renderer, type, style) {
    if (renderer === "highcharts") {
      const scripts = ["https://cdn.jsdelivr.net/npm/highcharts@12.6.0/highcharts.js"];
      if (["bubble", "boxplot"].includes(type)) scripts.push("https://cdn.jsdelivr.net/npm/highcharts@12.6.0/highcharts-more.js");
      if (type === "heatmap") scripts.push("https://cdn.jsdelivr.net/npm/highcharts@12.6.0/modules/heatmap.js");
      if (type === "treemap") scripts.push("https://cdn.jsdelivr.net/npm/highcharts@12.6.0/modules/treemap.js");
      if (style.exporting) scripts.push("https://cdn.jsdelivr.net/npm/highcharts@12.6.0/modules/exporting.js");
      if (style.accessibility !== false) scripts.push("https://cdn.jsdelivr.net/npm/highcharts@12.6.0/modules/accessibility.js");
      return { scripts, styles: [] };
    }
    if (renderer === "amcharts") {
      const kind = ["pie", "donut"].includes(type) ? "percent" : "xy";
      return { scripts: ["https://cdn.amcharts.com/lib/version/5.19.1/index.js", `https://cdn.amcharts.com/lib/version/5.19.1/${kind}.js`, "https://cdn.amcharts.com/lib/version/5.19.1/themes/Animated.js"], styles: [] };
    }
    return ASSET_BASE[renderer] || { scripts: [], styles: [] };
  }

  function htmlLegalComment(lines, minified) {
    const clean = lines.map(line => String(line).replaceAll("--", "- -"));
    return minified ? `<!--${clean.join(" | ")}-->` : `<!--\n${clean.join("\n")}\n-->`;
  }

  function legalAnnotation(renderer, fullBundle, vendorInlined, minified) {
    const meta = rendererMeta(renderer);
    const delivery = fullBundle && meta.bundle_policy === "cdn-only"
      ? "full_bundle=TRUE was requested, but ChartForge intentionally kept this vendor library CDN-linked and did not download or inline it."
      : vendorInlined
        ? "The vendor asset is inlined by request. The applicable licence text is included in this HTML output."
        : "The vendor asset is referenced from its CDN and is not redistributed in this HTML output.";
    return htmlLegalComment([
      "ChartForge third-party renderer notice",
      `Renderer: ${meta.label} ${meta.version || ""}`.trim(),
      `Licence or terms: ${meta.license_name || "Third-party terms"} (${meta.license_url || "see THIRD_PARTY_NOTICES.md"})`,
      `Delivery: ${delivery}`,
      `Important: ${meta.usage_notice || "This renderer is governed by its own terms."}`,
      "ChartForge's MIT licence does not grant rights to this renderer."
    ], minified);
  }

  async function fetchLicenseText(filename) {
    const key = `license/${filename}`;
    if (vendorAssetCache.has(key)) return vendorAssetCache.get(key);
    const response = await fetch(`licenses/${encodeURIComponent(filename)}`, { cache: "force-cache" });
    if (!response.ok) throw new Error(`Required third-party licence notice ${filename} could not be loaded (${response.status}). ChartForge will not inline this renderer without its notice.`);
    const text = await response.text();
    vendorAssetCache.set(key, text);
    return text;
  }

  async function vendorLicenseBlock(renderer, minified) {
    const meta = rendererMeta(renderer);
    const files = Array.isArray(meta.license_files) ? meta.license_files : [];
    if (!files.length) return "";
    const texts = await Promise.all(files.map(fetchLicenseText));
    const payload = texts.map((text, index) => `===== ${files[index]} =====\n${text.trimEnd()}`).join("\n\n");
    const join = minified ? "" : "\n";
    return `<script type="text/plain" data-chartforge-third-party-license="${escapeAttr(renderer)}">${join}${escapeClosingScript(payload)}${join}</script>`;
  }

  async function buildAssetTags(renderer, assets, fullBundle, minified) {
    const join = minified ? "" : "\n";
    const meta = rendererMeta(renderer);
    const vendorInlined = Boolean(fullBundle) && meta.bundle_policy !== "cdn-only";
    const annotation = legalAnnotation(renderer, Boolean(fullBundle), vendorInlined, minified);
    if (!vendorInlined) {
      return [
        annotation,
        ...assets.styles.map(url => `<link rel="stylesheet" href="${escapeAttr(url)}">`),
        ...assets.scripts.map(url => `<script src="${escapeAttr(url)}"></script>`)
      ].join(join);
    }
    const licence = await vendorLicenseBlock(renderer, minified);
    const styles = await Promise.all(assets.styles.map(async url => `<style>${minified ? "" : "\n"}${await fetchVendorAsset(url)}${minified ? "" : "\n"}</style>`));
    const scripts = await Promise.all(assets.scripts.map(async url => `<script>${minified ? "" : "\n"}${escapeClosingScript(await fetchVendorAsset(url))}${minified ? "" : "\n"}</script>`));
    return [annotation, licence, ...styles, ...scripts].filter(Boolean).join(join);
  }

  async function fetchVendorAsset(url) {
    if (vendorAssetCache.has(url)) return vendorAssetCache.get(url);
    const response = await fetch(url, { mode: "cors", credentials: "omit", referrerPolicy: "no-referrer" });
    if (!response.ok) throw new Error(`Could not inline ${url} (${response.status} ${response.statusText}).`);
    const source = await response.text();
    vendorAssetCache.set(url, source);
    return source;
  }

  function fontTagsFor(fontFamily, minified) {
    const base = String(fontFamily || "").split(",")[0].trim().replace(/^['"]|['"]$/g, "");
    const font = metadata.fonts.find(item => item.label.toLowerCase() === base.toLowerCase());
    if (!font || !font.google_family) return "";
    const join = minified ? "" : "\n";
    return [
      '<link rel="preconnect" href="https://fonts.googleapis.com">',
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
      `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${escapeAttr(font.google_family)}:wght@400;500;600;700;800&display=swap">`
    ].join(join);
  }

  function setPreviewButtonBusy(button, busy) {
    if (!button) return;
    button.disabled = Boolean(busy);
    button.classList.toggle("is-loading", Boolean(busy));
    button.setAttribute("aria-busy", busy ? "true" : "false");
  }

  async function runLocalPreview({ auto = false, force = false } = {}) {
    if (auto && preferredPreview !== "local") return;
    if (!auto) clearTimeout(webRPreviewTimer);
    const errors = preflightErrors();
    if (errors.length) {
      showPreviewError("R code needs attention", errors.join("\n"));
      return;
    }

    const requestKey = previewRequestKey();
    if (!force && requestKey === lastLocalPreviewKey) return;
    if (localPreviewInFlight) {
      localPreviewQueued = true;
      return;
    }

    clearTimeout(localPreviewTimer);
    localPreviewInFlight = true;
    localPreviewQueued = false;
    lastLocalPreviewKey = requestKey;
    preferredPreview = "local";
    const token = renderToken;
    const code = generatedR;
    setPreviewButtonBusy(els.runLocal, true);
    setPreviewStatus("neutral", auto ? "Running local R" : "Evaluating emitted R locally");

    try {
      const response = await fetch(apiUrl("/api/run"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      let payload;
      try { payload = await response.json(); }
      catch (_) { throw new Error(`Local R returned an unreadable response (${response.status}).`); }
      if (!response.ok || !scalarBoolean(payload.ok)) {
        const logs = Array.isArray(payload.logs) ? payload.logs.map(scalarString).join("\n") : scalarString(payload.logs);
        const detail = [scalarString(payload.error), scalarString(payload.call), logs].filter(Boolean).join("\n\n");
        const localError = new Error(detail || `Local R returned HTTP ${response.status}.`);
        localError.isChartForgeR = true;
        throw localError;
      }
      if (token !== renderToken || requestKey !== previewRequestKey()) {
        localPreviewQueued = true;
        return;
      }
      const html = scalarString(payload.html);
      if (!html.trim() || html.trim() === "undefined") throw new Error("Local R did not return a non-empty character string named chart_html.");
      localSession.connected = true;
      localSession.sessionError = "";
      if (preferredPreview === "local") {
        generatedHtml = html;
        setHighlightedCode(els.htmlCode, html, "html");
        setPreviewHtml(html, "Preview rendered from local R output", "success");
        setConnection("success", "Local R connected");
      }
      updateEnvironmentStatus();
      if (!auto) toast("The emitted R code ran successfully.");
    } catch (error) {
      if (token !== renderToken && auto) return;
      const message = error.message || String(error);
      localSession.sessionError = message;
      if (preferredPreview === "local") {
        setConnection(localSession.connected ? "warning" : "neutral", localSession.connected ? "Local R preview error" : "Browser preview");
        showPreviewError(
          error.isChartForgeR ? "Local R error" : "Local R preview unavailable",
          message,
          error.isChartForgeR
            ? "The emitted code is shown in the R code tab so the failing mapping or argument can be corrected directly."
            : "The browser-generated HTML remains available. Use Refresh in the Local R data panel to recheck the R session."
        );
      }
      if (!auto) toast(`Local R: ${firstLine(message)}`, "error");
    } finally {
      localPreviewInFlight = false;
      setPreviewButtonBusy(els.runLocal, false);
      if (localPreviewQueued && preferredPreview === "local") {
        localPreviewQueued = false;
        scheduleLocalPreview();
      }
    }
  }

  async function runWebRPreview({ auto = false, force = false } = {}) {
    if (auto && preferredPreview !== "webr") return;
    if (!auto) clearTimeout(localPreviewTimer);
    const errors = preflightErrors();
    if (errors.length) {
      showPreviewError("R code needs attention", errors.join("\n"));
      return;
    }

    const requestKey = previewRequestKey();
    if (!force && requestKey === lastWebRPreviewKey) return;
    if (webRPreviewInFlight) {
      webRPreviewQueued = true;
      return;
    }

    clearTimeout(webRPreviewTimer);
    webRPreviewInFlight = true;
    webRPreviewQueued = false;
    lastWebRPreviewKey = requestKey;
    preferredPreview = "webr";
    const token = renderToken;
    setPreviewButtonBusy(els.runWebr, true);
    setPreviewStatus("neutral", webRReady ? "Running WebR" : "Starting WebR");

    try {
      const instance = await getWebR();
      await loadRRuntimeInWebR(instance);
      const runtime = await loadSelectedRuntime(state.library, state.chartType, state.minified);
      const code = stripPackageLines(currentRCode({ forceEmbeddedData: true })).replace(/chartforge::/g, "");
      const resourceOverrides = await buildWebRResourceOverrides();
      const outcome = await instance.evalRString(buildWebREvaluationCode(runtime, code, resourceOverrides));
      if (typeof outcome !== "string") throw new Error("WebR returned an unexpected non-character result.");
      if (outcome.startsWith(WEBR_ERROR_MARKER)) throw new Error(outcome.slice(WEBR_ERROR_MARKER.length).trim());
      const html = outcome.startsWith(WEBR_OK_MARKER) ? outcome.slice(WEBR_OK_MARKER.length) : outcome;
      if (token !== renderToken || requestKey !== previewRequestKey()) {
        webRPreviewQueued = true;
        return;
      }
      if (!html || html === "undefined") throw new Error("WebR did not return a non-empty character string named chart_html.");
      if (preferredPreview === "webr") {
        generatedHtml = html;
        setHighlightedCode(els.htmlCode, html, "html");
        setPreviewHtml(html, "Rendered with WebR.", "success");
        setConnection("success", "WebR active");
      }
      if (!auto) toast("The emitted R code ran in WebR.");
    } catch (error) {
      if (token !== renderToken && auto) return;
      const message = describeWebRError(error);
      if (preferredPreview === "webr") {
        setConnection(localSession.connected ? "warning" : "neutral", localSession.connected ? "Local R available" : "Browser preview");
        showPreviewError("WebR error", message, webRErrorHint(message));
      }
      if (!auto) toast(`WebR: ${firstLine(message)}`, "error");
    } finally {
      webRPreviewInFlight = false;
      setPreviewButtonBusy(els.runWebr, false);
      if (webRPreviewQueued && preferredPreview === "webr") {
        webRPreviewQueued = false;
        scheduleWebRPreview();
      }
    }
  }

  const WEBR_OK_MARKER = "__CHARTFORGE_WEBR_OK__";
  const WEBR_ERROR_MARKER = "__CHARTFORGE_WEBR_ERROR__";

  function buildWebREvaluationCode(runtime, code, resourceOverrides = "") {
    const extraOptions = resourceOverrides ? `,\n    ${resourceOverrides}` : "";
    return `(function() {\n  previous_options <- options(\n    chartforge.runtime_override = ${rString(runtime)}${extraOptions}\n  )\n  on.exit(options(previous_options), add = TRUE)\n  tryCatch({\n${code}\n    if (!exists("chart_html", inherits = FALSE) || !is.character(chart_html) || !length(chart_html) || !nzchar(chart_html[[1L]])) {\n      stop("The code ran, but it did not produce a non-empty character object named 'chart_html'.", call. = FALSE)\n    }\n    paste0("${WEBR_OK_MARKER}", chart_html[[1L]])\n  }, error = function(e) {\n    call_text <- if (is.null(conditionCall(e))) "" else paste0("\\nCall: ", paste(deparse(conditionCall(e)), collapse = " "))\n    paste0("${WEBR_ERROR_MARKER}", conditionMessage(e), call_text)\n  })\n})()`;
  }

  async function buildWebRResourceOverrides() {
    const meta = rendererMeta(state.library);
    if (!state.fullBundle || meta.bundle_policy === "cdn-only") return "";
    setPreviewStatus("neutral", "Preparing WebR vendor bundle");
    const spec = specForExport();
    const assets = assetsFor(state.library, state.chartType, spec.rendererStyle || {});
    const urls = unique([...(assets.styles || []), ...(assets.scripts || [])]);
    const assetEntries = await Promise.all(urls.map(async url => [url, await fetchVendorAsset(url)]));
    const files = Array.isArray(meta.license_files) ? meta.license_files : [];
    const licenseEntries = await Promise.all(files.map(async filename => [filename, await fetchLicenseText(filename)]));
    return [
      `chartforge.asset_text_override = ${rNamedCharacterList(assetEntries)}`,
      `chartforge.license_text_override = ${rNamedCharacterList(licenseEntries)}`
    ].join(",\n    ");
  }

  async function getWebR() {
    if (webR) return webR;
    if (webRInitPromise) return webRInitPromise;

    webRInitPromise = (async () => {
      const failures = [];
      for (const source of WEBR_SOURCES) {
        let module;
        setPreviewStatus("neutral", `Loading WebR from ${source.label}`);
        try {
          module = await promiseWithTimeout(
            importWebRModule(source.moduleUrl),
            30000,
            `Timed out while loading the WebR module from ${source.label}.`
          );
          if (!module || typeof module.WebR !== "function") {
            throw new Error("The downloaded module does not export the WebR class.");
          }
        } catch (error) {
          failures.push(`${source.label} module: ${error.message || error}`);
          continue;
        }

        const options = { baseUrl: source.baseUrl };
        if (module.ChannelType && module.ChannelType.PostMessage !== undefined) {
          options.channelType = module.ChannelType.PostMessage;
        }

        let instance = null;
        setPreviewStatus("neutral", `Starting WebR from ${source.label}`);
        try {
          instance = new module.WebR(options);
          await promiseWithTimeout(
            instance.init(),
            60000,
            `WebR startup through ${source.label} timed out after one minute.`
          );
          webRModule = module;
          webRSource = source;
          webR = instance;
          return instance;
        } catch (error) {
          failures.push(`${source.label} runtime: ${error.message || error}`);
          try { instance?.close(); } catch (_) {}
        }
      }

      throw new Error([
        `ChartForge could not start WebR ${WEBR_VERSION} from any configured source.`,
        ...failures.map((failure, index) => `${index + 1}. ${failure}`)
      ].join("\n"));
    })();

    try {
      return await webRInitPromise;
    } catch (error) {
      webR = null;
      webRModule = null;
      webRSource = null;
      webRReady = false;
      throw error;
    } finally {
      webRInitPromise = null;
    }
  }

  async function loadRRuntimeInWebR(instance) {
    if (webRReady) return;
    if (!rRuntimeSource) throw new Error("The ChartForge R runtime asset was not loaded.");
    const ok = "__CHARTFORGE_RUNTIME_OK__";
    const fail = "__CHARTFORGE_RUNTIME_ERROR__";
    const wrapped = `tryCatch({\n${rRuntimeSource}\n"${ok}"\n}, error = function(e) {\n  call_text <- if (is.null(conditionCall(e))) "" else paste0("\\nCall: ", paste(deparse(conditionCall(e)), collapse = " "))\n  paste0("${fail}", conditionMessage(e), call_text)\n})`;
    const outcome = await instance.evalRString(wrapped);
    if (typeof outcome !== "string" || outcome.startsWith(fail)) {
      throw new Error(typeof outcome === "string" ? outcome.slice(fail.length).trim() : "ChartForge's R runtime could not be loaded in WebR.");
    }
    webRReady = true;
  }

  function describeWebRError(error) {
    const parts = [];
    const seen = new Set();
    const add = value => {
      const text = value === null || value === undefined ? "" : String(value).trim();
      if (text && !seen.has(text)) { seen.add(text); parts.push(text); }
    };
    let current = error;
    for (let depth = 0; current && depth < 4; depth += 1) {
      add(current.message);
      add(current.data && current.data.message);
      add(current.error && current.error.message);
      current = current.cause;
    }
    add(error);
    return parts.join("\n\n") || "WebR returned an unknown error.";
  }

  function webRErrorHint(message) {
    if (/load|fetch|network|module|worker|start|timed out/i.test(message)) {
      const hosts = WEBR_SOURCES.map(source => new URL(source.baseUrl).host).join(", ");
      return `ChartForge tried the official WebR release and two npm CDN mirrors through its PostMessage channel. Check that the browser, firewall, proxy, or content blocker permits Web Workers and HTTPS access to: ${hosts}.`;
    }
    return "Correct the emitted R code shown in the R code tab, or use the local-R/browser preview.";
  }

  function firstLine(value) {
    return String(value || "Unknown error").split(/\r?\n/)[0].slice(0, 180);
  }

  function stripPackageLines(code) {
    return String(code).replace(/^\s*(?:library|require)\(\s*["']?chartforge["']?\s*\)\s*;?\s*$/gm, "");
  }

  function setPreviewHtml(html, message, kind = "success") {
    generatedHtml = html;
    els.preview.srcdoc = html;
    updatePreviewDimensions();
    setPreviewStatus(kind, message);
  }

  function updatePreviewDimensions() {
    const pagePadding = state.embed ? 20 : 84;
    els.preview.style.width = `${Math.max(160, Number(state.width) + pagePadding)}px`;
    els.preview.style.height = `${Math.max(160, Number(state.height) + pagePadding)}px`;
    els.preview.setAttribute("width", String(Math.max(160, Number(state.width) + pagePadding)));
    els.preview.setAttribute("height", String(Math.max(160, Number(state.height) + pagePadding)));
  }

  function fitPreviewFrame() { updatePreviewDimensions(); }

  function inspectPreview() {
    window.setTimeout(() => {
      try {
        const doc = els.preview.contentDocument;
        const error = doc && doc.querySelector(".cf-error");
        if (error && error.textContent.trim()) setPreviewStatus("error", "Renderer error · see chart area");
      } catch (_) {}
    }, 700);
  }

  function showPreviewError(title, message, hint = "") {
    const body = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
      html,body{margin:0;min-height:100%;font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:#fff7f7;color:#450a0a}.error-page{box-sizing:border-box;min-height:100vh;display:grid;place-items:center;padding:28px}.error-card{max-width:720px;width:100%;box-sizing:border-box;border:1px solid #fecaca;border-radius:16px;padding:18px;background:#fff;box-shadow:0 16px 45px rgba(127,29,29,.12)}h1{margin:0 0 8px;font-size:18px;color:#b91c1c}p{margin:0 0 10px;line-height:1.55}.hint{color:#7f1d1d;font-size:13px}pre{max-height:300px;overflow:auto;white-space:pre-wrap;margin:10px 0 0;padding:11px;border-radius:9px;background:#fff1f2;color:#881337;font:11px/1.5 Consolas,monospace}
      @media(prefers-color-scheme:dark){html,body{background:#190909;color:#fee2e2}.error-card{background:#2b0c0c;border-color:#7f1d1d}.hint{color:#fecaca}pre{background:#3f0d12;color:#fecdd3}}
    </style></head><body><main class="error-page"><section class="error-card"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(hint || "ChartForge could not render this chart.")}</p><pre>${escapeHtml(message || "Unknown error")}</pre></section></main></body></html>`;
    els.preview.srcdoc = body;
    updatePreviewDimensions();
    setPreviewStatus("error", title);
  }

  function setPreviewStatus(kind, message) {
    els.status.className = `preview-status ${kind || "neutral"}`;
    els.status.innerHTML = `<span class="status-dot"></span><span>${escapeHtml(message)}</span>`;
  }

  function setConnection(kind, message) {
    els.connectionBadge.className = `status-badge ${kind || "neutral"}`;
    els.connectionLabel.textContent = message;
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state && state.appTheme === "dark" ? "dark" : "light";
    if (els.themeToggle) els.themeToggle.setAttribute("aria-pressed", String(state && state.appTheme === "dark"));
  }

  function updatePalettePreview() {
    const palette = metadata.palettes[state.palette] || metadata.palettes.studio;
    els.palettePreview.innerHTML = palette.map(colour => `<span style="background:${escapeAttr(colour)}"></span>`).join("");
  }

  function resetAll() {
    const localTheme = state.appTheme;
    state = defaultState();
    state.appTheme = localTheme;
    rawInputText = SAMPLE_TEXT;
    parsedDelimiter = ",";
    els.dataInput.value = SAMPLE_TEXT;
    useDelimitedText(SAMPLE_TEXT, { quiet: true, preserveMappings: true });
    hydrateControls();
    saveState();
    switchModule("data");
    switchOutput("r-code");
    renderAll();
    toast("All chart settings were reset.");
  }

  function loadDemo() {
    state.dataSource = "text";
    state.delimiter = "auto";
    state.inputDecimalMark = ".";
    state.autoDates = true;
    rawInputText = SAMPLE_TEXT;
    els.dataInput.value = SAMPLE_TEXT;
    els.delimiter.value = "auto";
    els.inputDecimalMark.value = ".";
    els.autoDates.checked = true;
    useDelimitedText(SAMPLE_TEXT, { quiet: true });
    hydrateControls();
    toast("Demo data loaded.");
  }

  function sortedRows() {
    const copy = rows.slice();
    const key = state.mappings.sortBy;
    if (!key) return copy;
    const desc = Boolean(state.mappings.sortDesc);
    return copy.map((row, index) => ({ row, index })).sort((a, b) => {
      const av = a.row[key], bv = b.row[key];
      const aMissing = av === null || av === undefined || av === "";
      const bMissing = bv === null || bv === undefined || bv === "";
      if (aMissing && bMissing) return a.index - b.index;
      if (aMissing) return 1;
      if (bMissing) return -1;
      let order;
      if (typeof av === "number" && typeof bv === "number") order = av - bv;
      else {
        const ad = Date.parse(av), bd = Date.parse(bv);
        if (!Number.isNaN(ad) && !Number.isNaN(bd) && /\d{4}-\d{2}-\d{2}/.test(String(av)) && /\d{4}-\d{2}-\d{2}/.test(String(bv))) order = ad - bd;
        else order = String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
      }
      return (desc ? -order : order) || a.index - b.index;
    }).map(item => item.row);
  }

  function cleanHoverLabels() {
    const mapped = new Set([state.mappings.x, state.mappings.y, state.mappings.group].filter(Boolean));
    return unique(state.mappings.labels || []).filter(name => !mapped.has(name) && columns.some(column => column.name === name));
  }

  function themeValues(name) {
    const index = metadata.theme_names.indexOf(name);
    return metadata.themes[index >= 0 ? index : 0] || metadata.themes[0];
  }

  function rendererMeta(id) { return metadata.renderers.find(item => item.id === id) || metadata.renderers[0]; }

  function rString(value) {
    return `"${String(value ?? "")
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\r/g, "\\r")
      .replace(/\n/g, "\\n")
      .replace(/\t/g, "\\t")}"`;
  }

  function rNullableString(value) { return value === null || value === undefined || String(value) === "" ? "NULL" : rString(value); }
  function rLogical(value) { return value ? "TRUE" : "FALSE"; }
  function rCharacterVector(values) {
    const clean = unique((values || []).filter(value => value !== null && value !== undefined && String(value) !== ""));
    if (!clean.length) return "NULL";
    if (clean.length === 1) return rString(clean[0]);
    return `c(${clean.map(rString).join(", ")})`;
  }
  function rNamedList(object) {
    const entries = Object.entries(object || {});
    if (!entries.length) return "list()";
    return `list(${entries.map(([key, value]) => `${key} = ${rValue(value)}`).join(", ")})`;
  }
  function rNamedCharacterList(entries) {
    if (!entries || !entries.length) return "list()";
    const values = entries.map(([, value]) => rString(value)).join(", ");
    const names = entries.map(([name]) => rString(name)).join(", ");
    return `setNames(list(${values}), c(${names}))`;
  }
  function rValue(value) {
    if (value === null || value === undefined) return "NULL";
    if (typeof value === "boolean") return rLogical(value);
    if (typeof value === "number") return formatRNumber(value);
    if (Array.isArray(value)) return `c(${value.map(rValue).join(", ")})`;
    if (typeof value === "object") return rNamedList(value);
    return rString(value);
  }
  function formatRNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "NA_real_";
    return Number.isInteger(number) ? String(number) : String(number);
  }

  function rowsToDelimited(data, cols, delimiter) {
    const names = cols.map(column => column.name);
    const quote = value => {
      const text = value === null || value === undefined ? "" : String(value);
      return /["\r\n,;\t]/.test(text) || text.includes(delimiter) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    return [names.map(quote).join(delimiter), ...data.map(row => names.map(name => quote(row[name])).join(delimiter))].join("\n");
  }

  function dataAsTsv() { return rowsToDelimited(sortedRows(), columns, "\t"); }

  async function copyCurrentOutput() {
    if (activeOutput === "html-code") await copyText(generatedHtml, "HTML copied.");
    else if (activeOutput === "data-preview") await copyText(dataAsTsv(), "Data copied as TSV.");
    else await copyText(generatedR, "R code copied.");
  }

  async function copyText(text, message) {
    if (!text) { toast("There is nothing to copy.", "error"); return; }
    try {
      await navigator.clipboard.writeText(text);
      toast(message);
    } catch (_) {
      const area = document.createElement("textarea");
      area.value = text; area.style.position = "fixed"; area.style.opacity = "0";
      document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove();
      toast(message);
    }
  }

  function downloadText(filename, text, type) {
    if (!text) { toast("There is nothing to save.", "error"); return; }
    const blob = new Blob([text], { type: type || "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob); link.download = filename;
    document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function setHighlightedCode(element, code, language) {
    element.dataset.raw = code;
    element.innerHTML = language === "html" ? highlightHtml(code) : highlightR(code);
  }

  function highlightR(code) {
    const keywords = new Set(["TRUE", "FALSE", "NULL", "NA", "NA_real_", "NA_character_", "function", "if", "else", "for", "while", "repeat", "next", "break", "in", "library"]);
    let out = "";
    for (let i = 0; i < code.length;) {
      const char = code[i];
      if (char === "#") {
        let j = code.indexOf("\n", i); if (j < 0) j = code.length;
        out += `<span class="tok-comment">${escapeHtml(code.slice(i, j))}</span>`; i = j; continue;
      }
      if (char === '"' || char === "'") {
        const quote = char; let j = i + 1;
        while (j < code.length) { if (code[j] === "\\") j += 2; else if (code[j] === quote) { j += 1; break; } else j += 1; }
        out += `<span class="tok-string">${escapeHtml(code.slice(i, j))}</span>`; i = j; continue;
      }
      const number = code.slice(i).match(/^-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
      if (number) { out += `<span class="tok-number">${escapeHtml(number[0])}</span>`; i += number[0].length; continue; }
      const identifier = code.slice(i).match(/^[A-Za-z.][A-Za-z0-9._]*/);
      if (identifier) {
        const token = identifier[0];
        const tail = code.slice(i + token.length);
        const cls = keywords.has(token) ? "tok-keyword" : (/^cf_|^chart_html$/.test(token) || /^\s*\(/.test(tail) ? "tok-function" : "");
        out += cls ? `<span class="${cls}">${escapeHtml(token)}</span>` : escapeHtml(token);
        i += token.length; continue;
      }
      out += escapeHtml(char); i += 1;
    }
    return out;
  }

  function highlightHtml(code) {
    const pattern = /<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>/g;
    let out = ""; let last = 0; let match;
    while ((match = pattern.exec(code))) {
      out += escapeHtml(code.slice(last, match.index));
      const raw = match[0];
      if (raw.startsWith("<!--")) out += `<span class="tok-comment">${escapeHtml(raw)}</span>`;
      else out += highlightHtmlTag(raw);
      last = match.index + raw.length;
    }
    out += escapeHtml(code.slice(last));
    return out;
  }

  function highlightHtmlTag(tag) {
    const match = tag.match(/^(<\/?)([A-Za-z0-9:-]+)([\s\S]*?)(\/?>)$/);
    if (!match) return escapeHtml(tag);
    const attrs = escapeHtml(match[3])
      .replace(/([A-Za-z_:][-A-Za-z0-9_:.]*)(=)/g, '<span class="tok-attr">$1</span>$2')
      .replace(/(&quot;[\s\S]*?&quot;|&#39;[\s\S]*?&#39;)/g, '<span class="tok-string">$1</span>');
    return `${escapeHtml(match[1])}<span class="tok-tag">${escapeHtml(match[2])}</span>${attrs}${escapeHtml(match[4])}`;
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }
  function readState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (_) { return {}; }
  }

  function apiUrl(path) { return new URL(String(path).replace(/^\/+/, ""), `${location.origin}/`).toString(); }

  function promiseWithTimeout(promise, timeout, message) {
    let timer = null;
    return Promise.race([
      promise,
      new Promise((_, reject) => { timer = window.setTimeout(() => reject(new Error(message)), timeout); })
    ]).finally(() => { if (timer !== null) window.clearTimeout(timer); });
  }

  async function importWebRModule(url) {
    return import(url);
  }

  async function fetchJsonWithTimeout(url, options = {}, timeout = 3000) {
    const controller = new AbortController();
    const id = window.setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, Object.assign({ cache: "no-store" }, options, { signal: controller.signal }));
      if (!response.ok) throw new Error(`HTTP ${response.status} from ${new URL(url).pathname}`);
      const type = response.headers.get("content-type") || "";
      if (!type.includes("json")) throw new Error(`Expected JSON from ${new URL(url).pathname}.`);
      return await response.json();
    } finally { window.clearTimeout(id); }
  }

  function toast(message, kind = "") {
    const node = document.createElement("div");
    node.className = `toast ${kind}`;
    node.textContent = message;
    els.toastRegion.appendChild(node);
    window.setTimeout(() => node.remove(), 2800);
  }

  function showFatal(error) {
    document.body.innerHTML = `<main class="error-page"><section class="error-card"><h1>ChartForge could not start</h1><p>The app metadata or runtime could not be loaded.</p><pre>${escapeHtml(error.message || String(error))}</pre></section></main>`;
  }

  function delimiterName(delimiter) { return delimiter === "\t" ? "TSV" : delimiter === ";" ? "semicolon-delimited" : "CSV"; }
  function positiveNumber(value, fallback) { const number = Number(value); return Number.isFinite(number) && number > 0 ? number : fallback; }
  function sameValue(a, b) { return typeof a === "number" && typeof b === "number" ? Math.abs(a - b) < 1e-12 : String(a) === String(b); }
  function unique(values) { return Array.from(new Set(values)); }
  function groupBy(values, fn) { return values.reduce((out, value) => { const key = fn(value); (out[key] ||= []).push(value); return out; }, {}); }
  function titleCase(value) { return String(value).replace(/[_-]+/g, " ").replace(/\b\w/g, char => char.toUpperCase()); }
  function humanChoice(value) {
    const text = String(value);
    if (text === "false") return "Disabled";
    if (text === "none") return "None";
    return titleCase(text);
  }
  function formatCompact(value) { return typeof value === "number" ? Number(value.toFixed(4)).toString() : String(value); }
  function displayValue(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "number") return new Intl.NumberFormat(state.decimalMark === "," ? "de-DE" : "en-US", { maximumFractionDigits: 8, useGrouping: false }).format(value);
    return String(value);
  }
  function safeScriptJson(value) { return String(value).replace(/<\//g, "<\\/").replace(/<!--/g, "<\\!--"); }
  function escapeClosingScript(value) { return String(value).replace(/<\/script/gi, "<\\/script"); }
  function simpleHash(value) { let hash = 2166136261; for (let i = 0; i < value.length; i += 1) { hash ^= value.charCodeAt(i); hash = Math.imul(hash, 16777619); } return (hash >>> 0).toString(36); }
  function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]); }
  function escapeAttr(value) { return escapeHtml(value).replace(/`/g, "&#96;"); }
  function cssEscape(value) { return window.CSS && CSS.escape ? CSS.escape(value) : String(value).replace(/[^A-Za-z0-9_-]/g, "\\$&"); }

})();
