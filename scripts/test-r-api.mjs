import fs from "node:fs";
import path from "node:path";
import { WebR, ChannelType } from "webr";

const packageRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const webR = new WebR({ channelType: ChannelType.PostMessage });
await webR.init();

async function mkdir(dir) {
  try { await webR.FS.mkdir(dir); } catch (error) {
    if (!String(error).includes("File exists")) throw error;
  }
}
async function write(local, remote) {
  await webR.FS.writeFile(remote, fs.readFileSync(local));
}

await mkdir("/home/web_user/chartforge");
await mkdir("/home/web_user/chartforge/R");
await mkdir("/home/web_user/chartforge/man");
await mkdir("/home/web_user/chartforge/tests");
await mkdir("/home/web_user/chartforge/tests/testthat");
await mkdir("/home/web_user/chartforge/inst");
await mkdir("/home/web_user/chartforge/inst/plumber");
await mkdir("/home/web_user/chartforge/licenses");

for (const filename of fs.readdirSync(path.join(packageRoot, "R")).filter(x => x.endsWith(".R"))) {
  await write(path.join(packageRoot, "R", filename), `/home/web_user/chartforge/R/${filename}`);
}
for (const filename of fs.readdirSync(path.join(packageRoot, "man")).filter(x => x.endsWith(".Rd"))) {
  await write(path.join(packageRoot, "man", filename), `/home/web_user/chartforge/man/${filename}`);
}
for (const filename of fs.readdirSync(path.join(packageRoot, "tests/testthat")).filter(x => x.endsWith(".R"))) {
  await write(path.join(packageRoot, "tests/testthat", filename), `/home/web_user/chartforge/tests/testthat/${filename}`);
}
await write(path.join(packageRoot, "tests/testthat.R"), "/home/web_user/chartforge/tests/testthat.R");
await write(path.join(packageRoot, "inst/plumber/plumber.R"), "/home/web_user/chartforge/inst/plumber/plumber.R");
await write(path.join(packageRoot, "DESCRIPTION"), "/home/web_user/chartforge/DESCRIPTION");

for (const filename of fs.readdirSync(path.join(packageRoot, "inst/app/licenses"))) {
  await write(path.join(packageRoot, "inst/app/licenses", filename), `/home/web_user/chartforge/licenses/${filename}`);
}
await webR.FS.writeFile("/home/web_user/chartforge/mock-vendor.js", new TextEncoder().encode("window.__chartforgeVendorMock=true;"));

const testR = String.raw`
options(warn = 2)
root <- "/home/web_user/chartforge"

r_files <- c(list.files(file.path(root, "R"), pattern = "\\.R$", full.names = TRUE),
             list.files(file.path(root, "tests", "testthat"), pattern = "\\.R$", full.names = TRUE),
             file.path(root, "tests", "testthat.R"),
             file.path(root, "inst", "plumber", "plumber.R"))
for (file in r_files) parse(file = file)
rd_files <- list.files(file.path(root, "man"), pattern = "\\.Rd$", full.names = TRUE)
for (file in rd_files) tools::parse_Rd(file)
dcf <- read.dcf(file.path(root, "DESCRIPTION"))
stopifnot(identical(unname(dcf[1, "Version"]), "0.6.6"))

source(file.path(root, "R", "rendering.R"), local = .GlobalEnv)
.chartforge_runtime_override <- "(function(global){global.ChartForgeRender={render:function(){},renderFromScripts:function(){}};})(window);"
.chartforge_license_root <- file.path(root, "licenses")

df <- data.frame(x = c(1.2, 2.4, 3.6), y = c(3.1, 1.7, 4.2), group = c("A", "B", "A"), stringsAsFactors = FALSE)
libs <- chart_libraries()
stopifnot(nrow(libs) == 13L)
stopifnot(setequal(libs$id, c("highcharts", "plotly", "d3", "vega", "observable", "chartjs", "echarts", "apexcharts", "googlecharts", "amcharts", "vchart", "anychart", "billboard")))
stopifnot(all(libs$bundle_policy[libs$id %in% c("highcharts", "apexcharts", "googlecharts", "anychart")] == "cdn-only"))
stopifnot(libs$bundle_policy[libs$id == "amcharts"] == "conditional")

for (renderer in c("highcharts", "apexcharts", "googlecharts", "anychart")) {
  fun <- get(paste0("cf_", renderer, "_scatter"), envir = .GlobalEnv)
  html <- fun(df, x = "x", y = "y", group = "group", full_bundle = TRUE, embed = TRUE)
  stopifnot(grepl("intentionally kept this vendor library CDN-linked", html, fixed = TRUE))
  stopifnot(grepl('"vendorAssetsInlined":false', html, fixed = TRUE))
  stopifnot(!grepl(paste0('data-chartforge-third-party-license="', renderer, '"'), html, fixed = TRUE))
  for (url in cf_assets(renderer, "scatter")$scripts) {
    stopifnot(grepl(paste0('<script src="', url, '"></script>'), html, fixed = TRUE))
  }
}

plotly_url <- cf_assets("plotly", "scatter")$scripts
plotly_html <- cf_plotly_scatter(
  df, x = "x", y = "y", group = "group", full_bundle = TRUE, embed = TRUE,
  asset_paths = setNames(file.path(root, "mock-vendor.js"), plotly_url)
)
stopifnot(grepl("window.__chartforgeVendorMock=true", plotly_html, fixed = TRUE))
stopifnot(!grepl(paste0('<script src="', plotly_url), plotly_html, fixed = TRUE))
stopifnot(grepl('data-chartforge-third-party-license="plotly"', plotly_html, fixed = TRUE))
stopifnot(grepl("MIT License", plotly_html, fixed = TRUE))
stopifnot(grepl('"vendorAssetsInlined":true', plotly_html, fixed = TRUE))

am_urls <- cf_assets("amcharts", "scatter")$scripts
am_paths <- file.path(root, paste0("mock-amcharts-", seq_along(am_urls), ".js"))
for (p in am_paths) writeLines("window.__chartforgeAmChartsMock=true;", p)
am_html <- cf_amcharts_scatter(
  df, x = "x", y = "y", group = "group", full_bundle = TRUE, embed = TRUE,
  asset_paths = setNames(am_paths, am_urls)
)
stopifnot(grepl('data-chartforge-third-party-license="amcharts"', am_html, fixed = TRUE))
stopifnot(grepl("Free amCharts license", am_html, fixed = TRUE))
stopifnot(grepl("branding link", am_html, fixed = TRUE))
stopifnot(grepl('"vendorAssetsInlined":true', am_html, fixed = TRUE))

readable <- cf_plotly_scatter(df, x = "x", y = "y", full_bundle = FALSE, embed = TRUE, minified = FALSE)
compact <- cf_plotly_scatter(df, x = "x", y = "y", full_bundle = FALSE, embed = TRUE, minified = TRUE)
page <- cf_plotly_scatter(df, x = "x", y = "y", full_bundle = FALSE, embed = FALSE, minified = FALSE)
stopifnot(nchar(compact) < nchar(readable))
stopifnot(startsWith(page, "<!doctype html>"))
stopifnot(grepl("The vendor asset is referenced from its CDN", readable, fixed = TRUE))
stopifnot(grepl(plotly_url, readable, fixed = TRUE))

cat("R parse, documentation, and HTML policy tests passed.\n")
`;
await webR.FS.writeFile("/home/web_user/chartforge/test-release.R", new TextEncoder().encode(testR));
try {
  const output = await webR.evalRString('paste(capture.output(source("/home/web_user/chartforge/test-release.R", echo = FALSE)), collapse = "\\n")');
  console.log(output || "R release checks passed.");
} finally {
  webR.close();
}
