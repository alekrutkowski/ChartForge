test_that("renderer and chart-type grids are complete", {
  libs <- chart_libraries()
  expected_libs <- c(
    "highcharts", "plotly", "d3", "vega", "observable", "chartjs", "echarts",
    "apexcharts", "googlecharts", "amcharts", "vchart", "anychart", "billboard"
  )
  expected_types <- c(
    "scatter", "line", "spline", "step", "bar", "stacked_bar", "area",
    "stacked_area", "histogram", "density", "pie", "donut", "bubble",
    "boxplot", "heatmap", "treemap", "lollipop"
  )
  expect_equal(libs$id, expected_libs)
  expect_equal(chart_types(), expected_types)
  expect_equal(nrow(cf_supported()), nrow(libs) * length(expected_types))
  expect_true(all(c("version", "license", "bundle_policy", "license_url", "usage_notice", "doc_url") %in% names(libs)))
  expect_true(all(grepl("^https://", libs$doc_url)))
  expect_true(all(grepl("^https://", libs$license_url)))
  expect_setequal(libs$bundle_policy, c("cdn-only", "permissive", "conditional"))
  expect_setequal(libs$id[libs$bundle_policy == "cdn-only"], c("highcharts", "apexcharts", "googlecharts", "anychart"))
  expect_identical(libs$bundle_policy[libs$id == "amcharts"], "conditional")
})

test_that("every renderer by chart-type wrapper is exported", {
  supported <- cf_supported()
  functions <- paste0("cf_", supported$library, "_", supported$type)
  expect_true(all(vapply(functions, function(name) {
    is.function(getExportedValue("chartforge", name))
  }, logical(1))))
  expect_true(is.function(cf_google_scatter))
  expect_false(exists("cf_rawgraphs_pie", inherits = TRUE))
})

test_that("renderer-specific style schemas are complete and friendly", {
  schemas <- cf_renderer_styles()
  expect_setequal(names(schemas), chart_libraries()$id)
  for (renderer in names(schemas)) {
    schema <- schemas[[renderer]]
    expect_true(nzchar(schema$title))
    expect_true(grepl("^https://", schema$doc_url))
    expect_true(nzchar(schema$description))
    expect_gte(length(schema$controls), 8L)
    keys <- vapply(schema$controls, `[[`, character(1), "key")
    types <- vapply(schema$controls, `[[`, character(1), "type")
    expect_false(anyDuplicated(keys))
    expect_true(all(types %in% c("switch", "range", "select")))
  }
})

test_that("CSV, TSV, decimal comma, and ISO dates are parsed", {
  csv <- cf_from_delim("id,value,date\na,1.5,2026-01-01\nb,2.5,2026-01-02")
  expect_equal(csv$value, c(1.5, 2.5))
  expect_s3_class(csv$date, "Date")

  tsv <- cf_from_delim("id\tvalue\twhen\na\t1.5\t2026-01-01 10:30:00\nb\t2.5\t2026-01-02 11:45:00")
  expect_equal(names(tsv), c("id", "value", "when"))
  expect_s3_class(tsv$when, "POSIXct")

  semicolon <- cf_from_delim("id;value\na;1,5\nb;2,5", decimal_mark = ",")
  expect_equal(semicolon$value, c(1.5, 2.5))

  plain <- cf_from_delim("date\tvalue\n2026-01-01\t1", auto_dates = FALSE)
  expect_type(plain$date, "character")
})

test_that("sorting and multiple label mappings are embedded in the specification", {
  df <- data.frame(
    model = c("third", "first", "second"),
    note = c("C", "A", "B"),
    x = c(3.1, 1.1, 2.1),
    y = c(30.5, 10.5, 20.5),
    group = c("g1", "g2", "g1"),
    check.names = FALSE
  )
  html <- cf_plotly_scatter(
    df, x = "x", y = "y", group = "group",
    label = c("model", "note", "x"), sort_by = "x",
    full_bundle = FALSE, embed = TRUE
  )
  expect_match(html, '"label":["model","note","x"]', fixed = TRUE)
  expect_match(html, '"sortBy":"x"')
  first <- regexpr('"model":"first"', html, fixed = TRUE)[1]
  second <- regexpr('"model":"second"', html, fixed = TRUE)[1]
  third <- regexpr('"model":"third"', html, fixed = TRUE)[1]
  expect_true(first < second && second < third)
})

test_that("CDN output is renderer and chart-type specialized", {
  df <- data.frame(x = c(1.1, 2.2, 3.3), y = c(3.2, 1.4, 2.6))
  readable <- cf_plotly_scatter(
    df, x = "x", y = "y", width = 777, height = 444,
    full_bundle = FALSE, embed = TRUE, minified = FALSE
  )
  compact <- cf_plotly_scatter(
    df, x = "x", y = "y", width = 777, height = 444,
    full_bundle = FALSE, embed = TRUE, minified = TRUE
  )

  expect_match(readable, "plotly.js-dist-min", fixed = TRUE)
  expect_match(readable, "width:777px", fixed = TRUE)
  expect_match(readable, "height:444px", fixed = TRUE)
  expect_match(readable, "renderPlotly", fixed = TRUE)
  expect_false(grepl("renderHighcharts", readable, fixed = TRUE))
  expect_false(grepl("renderVChart", readable, fixed = TRUE))
  expect_false(grepl("ChartForge tree-shaken", readable, fixed = TRUE))
  expect_true(grepl("<script src=", readable, fixed = TRUE))
  expect_lt(nchar(compact), nchar(readable))
})

test_that("fragment and full-page output are distinct", {
  df <- data.frame(x = c(1.1, 2.2), y = c(2.3, 1.4))
  fragment <- cf_d3_scatter(df, x = "x", y = "y", embed = TRUE)
  page <- cf_d3_scatter(df, x = "x", y = "y", embed = FALSE)
  expect_false(grepl("<!doctype html>", fragment, fixed = TRUE))
  expect_true(grepl("<!doctype html>", page, fixed = TRUE))
})

test_that("amCharts and AnyChart use browser-loadable pinned CDN tags", {
  df <- data.frame(x = c(1.1, 2.2), y = c(2.3, 1.4))
  am <- cf_amcharts_scatter(df, x = "x", y = "y")
  any <- cf_anychart_scatter(df, x = "x", y = "y")
  expect_match(am, "https://cdn.amcharts.com/lib/version/5.19.1/index.js", fixed = TRUE)
  expect_match(am, "https://cdn.amcharts.com/lib/version/5.19.1/xy.js", fixed = TRUE)
  expect_match(any, "https://cdn.anychart.com/releases/8.14.1/js/anychart-base.min.js", fixed = TRUE)
  expect_false(grepl('crossorigin="anonymous"', am, fixed = TRUE))
  expect_false(grepl('crossorigin="anonymous"', any, fixed = TRUE))
})

test_that("helper registries and save function are available", {
  expect_true(length(cf_palettes()) >= 12L)
  expect_true(length(cf_themes()) >= 10L)
  expect_true(nrow(cf_fonts()) >= 12L)
  expect_true(is.function(cf_save_html))
})


test_that("Highcharts is the default renderer", {
  df <- data.frame(x = c(1.2, 2.5, 3.8), y = c(4.1, 2.2, 7.3))
  html <- cf_chart_html(df, x = "x", y = "y")
  expect_match(html, "highcharts@", fixed = TRUE)
  expect_match(html, "renderHighcharts", fixed = TRUE)
  expect_false(grepl("renderPlotly", html, fixed = TRUE))
})

test_that("distribution charts enforce one continuous x variable", {
  df <- data.frame(category_code = rep(1:4, each = 4), value = seq(0.25, 4, length.out = 16), other = 1:16)
  expect_error(cf_highcharts_histogram(df, x = "category_code"), "looks categorical")
  expect_error(cf_highcharts_histogram(df, x = "value", y = "other"), "leave 'y' unset", fixed = TRUE)
  expect_error(cf_highcharts_density(df, x = "value", group = "category_code"), "leave 'group' unset", fixed = TRUE)
  histogram_html <- cf_highcharts_histogram(df, x = "value")
  density_html <- cf_highcharts_density(df, x = "value")
  expect_match(histogram_html, "pointPadding: 0", fixed = TRUE)
  expect_match(histogram_html, "groupPadding: 0", fixed = TRUE)
  expect_match(density_html, 'type: "areaspline"', fixed = TRUE)
  expect_false(grepl("function histogram", density_html, fixed = TRUE))
})

test_that("corrected Highcharts chart types have explicit semantics", {
  df <- data.frame(category = rep(c("A", "B"), each = 4), row = rep(c("r1", "r2"), 4), x = 1:8, y = c(2, 4, 3, 5, 7, 6, 8, 9))
  scatter <- cf_highcharts_scatter(df, x = "x", y = "y")
  heatmap <- cf_highcharts_heatmap(df, x = "category", y = "y", group = "row")
  treemap <- cf_highcharts_treemap(df, x = "category", y = "y")
  lollipop <- cf_highcharts_lollipop(df, x = "category", y = "y")
  pie <- cf_highcharts_pie(df, x = "category", y = "y", legend = "show")
  expect_match(scatter, "lineWidth: 0", fixed = TRUE)
  expect_match(heatmap, 'type: "heatmap"', fixed = TRUE)
  expect_match(heatmap, "lineWidth: 0", fixed = TRUE)
  expect_match(treemap, 'type: "treemap"', fixed = TRUE)
  expect_match(treemap, "lineWidth: 0", fixed = TRUE)
  expect_match(lollipop, 'type: "column"', fixed = TRUE)
  expect_match(lollipop, 'type: "scatter"', fixed = TRUE)
  expect_match(pie, "showInLegend: true", fixed = TRUE)
})

test_that("local server shell advertises the launching R environment without a catch-all route", {
  plumber_file <- chartforge_plumber_file()
  source_text <- paste(readLines(plumber_file, warn = FALSE), collapse = "\n")
  expect_false(grepl('pr_static(pr, "/"', source_text, fixed = TRUE))
  expect_match(source_text, "chartforge-local-bootstrap", fixed = TRUE)
  expect_match(source_text, "@post /api/session", fixed = TRUE)
  expect_match(source_text, "pr$setDocs(FALSE)", fixed = TRUE)
})

test_that("compressed runtime packs remain specialized by renderer and chart type", {
  root <- system.file("app", "assets", package = "chartforge", mustWork = TRUE)
  read_pack <- function(mode) {
    path <- file.path(root, paste0("runtime-", mode, ".json.gz"))
    expect_true(file.exists(path))
    expect_lt(file.info(path)$size, 500000)
    con <- gzfile(path, open = "rt", encoding = "UTF-8")
    on.exit(close(con), add = TRUE)
    jsonlite::fromJSON(paste(readLines(con, warn = FALSE), collapse = "\n"), simplifyVector = FALSE)
  }
  readable <- read_pack("readable")
  compact <- read_pack("minified")
  expect_setequal(names(readable), chart_libraries()$id)
  expect_setequal(names(readable$highcharts), chart_types())
  expect_setequal(names(compact$highcharts), chart_types())

  high_scatter <- readable$highcharts$scatter
  vchart_scatter <- readable$vchart$scatter
  expect_match(high_scatter, "renderHighcharts", fixed = TRUE)
  expect_false(grepl("renderGoogleCharts", high_scatter, fixed = TRUE))
  expect_false(grepl("function histogram", high_scatter, fixed = TRUE))
  expect_match(high_scatter, "credits:\\s*\\{\\s*enabled:\\s*true")
  expect_false(grepl("credits: {\n        enabled: false", high_scatter, fixed = TRUE))
  expect_match(vchart_scatter, 'xField: "x"', fixed = TRUE)
  expect_match(vchart_scatter, 'yField: "y"', fixed = TRUE)
  expect_false(grepl('type: "pie"', vchart_scatter, fixed = TRUE))
  expect_lt(nchar(compact$plotly$scatter), nchar(readable$plotly$scatter))
  expect_false(dir.exists(file.path(root, "runtime")))
})

test_that("local-R JSON responses preserve scalar column metadata", {
  plumber_file <- chartforge_plumber_file()
  source_text <- paste(readLines(plumber_file, warn = FALSE), collapse = "\n")
  app_text <- paste(readLines(system.file("app", "assets", "app.js", package = "chartforge", mustWork = TRUE), warn = FALSE), collapse = "\n")

  expect_gte(length(gregexpr("@serializer unboxedJSON", source_text, fixed = TRUE)[[1L]]), 10L)
  expect_match(source_text, "#* @serializer unboxedJSON\n#* @get /api/data-object\n", fixed = TRUE)
  expect_match(source_text, "#* @serializer unboxedJSON\n#* @get /api/session\n", fixed = TRUE)
  expect_match(app_text, "function unboxScalar", fixed = TRUE)
  expect_match(app_text, "scalarBoolean(column.categorical", fixed = TRUE)
  expect_false(grepl("Boolean(column.categorical)", app_text, fixed = TRUE))
})

test_that("penguins-like continuous measurements are not categorical", {
  env <- new.env(parent = globalenv())
  sys.source(chartforge_plumber_file(), envir = env)
  penguins_like <- data.frame(
    species = factor(c("Adelie", "Gentoo", "Chinstrap", "Adelie", "Gentoo", "Chinstrap")),
    island = factor(c("Torgersen", "Biscoe", "Dream", "Dream", "Biscoe", "Dream")),
    bill_length_mm = c(39.1, 46.1, 50.0, 37.8, 47.3, 51.3),
    bill_depth_mm = c(18.7, 13.2, 19.5, 18.3, 15.3, 19.2),
    body_mass_g = c(3750, 4500, 3900, 3550, 5000, 3950),
    year = c(2007L, 2008L, 2009L, 2007L, 2008L, 2009L)
  )
  profiles <- lapply(penguins_like, env$column_profile)

  expect_true(profiles$species$categorical)
  expect_true(profiles$island$categorical)
  expect_false(profiles$bill_length_mm$categorical)
  expect_true(profiles$bill_length_mm$numeric)
  expect_false(profiles$bill_depth_mm$categorical)
  expect_true(profiles$body_mass_g$numeric)
  expect_true(profiles$year$categorical)
})


test_that("CDN-only renderers are never downloaded in full-bundle mode", {
  df <- data.frame(x = c(1.2, 2.4, 3.6), y = c(3.1, 1.7, 4.2))
  cases <- list(
    highcharts = list(fun = cf_highcharts_scatter, asset = "highcharts@12.6.0/highcharts.js"),
    apexcharts = list(fun = cf_apexcharts_scatter, asset = "apexcharts@5.16.0/dist/apexcharts.min.js"),
    googlecharts = list(fun = cf_googlecharts_scatter, asset = "www.gstatic.com/charts/loader.js"),
    anychart = list(fun = cf_anychart_scatter, asset = "cdn.anychart.com/releases/8.14.1/js/anychart-base.min.js")
  )
  for (renderer in names(cases)) {
    html <- cases[[renderer]]$fun(df, x = "x", y = "y", full_bundle = TRUE, embed = TRUE)
    expect_match(html, cases[[renderer]]$asset, fixed = TRUE, info = renderer)
    expect_match(html, "intentionally kept this vendor library CDN-linked", fixed = TRUE, info = renderer)
    expect_match(html, '"fullBundle":true', fixed = TRUE, info = renderer)
    expect_match(html, '"vendorAssetsInlined":false', fixed = TRUE, info = renderer)
    expect_false(grepl(paste0('data-chartforge-third-party-license="', renderer, '"'), html, fixed = TRUE), info = renderer)
  }
})

test_that("permissive full bundles carry exact licence text", {
  df <- data.frame(x = c(1.2, 2.4, 3.6), y = c(3.1, 1.7, 4.2))
  asset <- cf_assets("plotly", "scatter")$scripts
  mock <- tempfile(fileext = ".js")
  writeLines("window.Plotly={newPlot:function(){return null;}};", mock)
  html <- cf_plotly_scatter(
    df, x = "x", y = "y", full_bundle = TRUE, embed = TRUE,
    asset_paths = setNames(mock, asset)
  )
  expect_match(html, "window.Plotly={newPlot", fixed = TRUE)
  expect_false(grepl(paste0('<script src="', asset), html, fixed = TRUE))
  expect_match(html, 'data-chartforge-third-party-license="plotly"', fixed = TRUE)
  expect_match(html, "MIT License", fixed = TRUE)
  expect_match(html, '"vendorAssetsInlined":true', fixed = TRUE)
})

test_that("conditional amCharts bundles retain branding licence notices", {
  df <- data.frame(x = c(1.2, 2.4, 3.6), y = c(3.1, 1.7, 4.2))
  assets <- cf_assets("amcharts", "scatter")$scripts
  mocks <- vapply(seq_along(assets), function(i) {
    path <- tempfile(fileext = ".js")
    writeLines(sprintf("window.__chartforge_amcharts_asset_%d=true;", i), path)
    path
  }, character(1))
  html <- cf_amcharts_scatter(
    df, x = "x", y = "y", full_bundle = TRUE, embed = TRUE,
    asset_paths = setNames(mocks, assets)
  )
  expect_false(any(vapply(assets, function(asset) grepl(paste0('<script src="', asset), html, fixed = TRUE), logical(1))))
  expect_match(html, 'data-chartforge-third-party-license="amcharts"', fixed = TRUE)
  expect_match(html, "Free amCharts license", fixed = TRUE)
  expect_match(html, "branding link", fixed = TRUE)
  expect_match(html, '"vendorAssetsInlined":true', fixed = TRUE)
})

test_that("third-party notices and machine-readable policy ship with the package", {
  notices <- system.file("app", "THIRD_PARTY_NOTICES.md", package = "chartforge", mustWork = TRUE)
  registry <- system.file("app", "assets", "metadata.json", package = "chartforge", mustWork = TRUE)
  expect_gt(file.info(notices)$size, 10000)
  text <- paste(readLines(notices, warn = FALSE), collapse = "\n")
  expect_match(text, "ApexCharts Community License", fixed = TRUE)
  expect_match(text, "Google Charts", fixed = TRUE)
  expect_match(text, "Highcharts", fixed = TRUE)
  expect_match(text, "amCharts 5", fixed = TRUE)
  policy <- jsonlite::fromJSON(registry, simplifyVector = FALSE)
  expect_identical(policy$chartforge_version, "0.6.6")
  ids <- vapply(policy$renderers, `[[`, character(1), "id")
  expect_setequal(ids, chart_libraries()$id)
  expect_length(policy$notice_artifacts, 15L)
})

test_that("the WebR rendering API is generated from the package R API", {
  package_source <- file.path(test_path("..", ".."), "R", "rendering.R")
  browser_source <- file.path(test_path("..", ".."), "inst", "app", "assets", "chartforge-r-runtime.R")
  expect_identical(readLines(package_source, warn = FALSE), readLines(browser_source, warn = FALSE))
})

test_that("browser UI exposes renderer-specific licence safeguards", {
  app_text <- paste(readLines(system.file("app", "assets", "app.js", package = "chartforge", mustWork = TRUE), warn = FALSE), collapse = "\n")
  html_text <- paste(readLines(system.file("app", "index.html", package = "chartforge", mustWork = TRUE), warn = FALSE), collapse = "\n")
  expect_match(app_text, 'meta.bundle_policy !== "cdn-only"', fixed = TRUE)
  expect_match(app_text, "intentionally kept this vendor library CDN-linked", fixed = TRUE)
  expect_match(app_text, "Complete third-party notices", fixed = TRUE)
  expect_match(html_text, 'id="renderer-license-note"', fixed = TRUE)
  expect_match(html_text, 'id="full-bundle-help"', fixed = TRUE)
})
