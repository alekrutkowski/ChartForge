`%||%` <- function(x, y) {
  if (is.null(x) || length(x) == 0L || (length(x) == 1L && is.na(x))) y else x
}

.cf_renderer_ids <- c(
  "highcharts", "plotly", "d3", "vega", "observable", "chartjs",
  "echarts", "apexcharts", "googlecharts", "amcharts", "vchart",
  "anychart", "billboard"
)


.cf_vendor_registry <- list(
  highcharts = list(
    label = "Highcharts", version = "12.6.0",
    license_name = "Highsoft licence terms", bundle_policy = "cdn-only",
    license_url = "https://www.highcharts.com/license",
    usage_notice = "Use may require a Highsoft commercial, SaaS, or OEM licence. ChartForge does not grant or verify Highcharts usage rights and leaves the default Highcharts credits enabled.",
    license_files = "highcharts-12.6.0-LICENSE.txt"
  ),
  plotly = list(
    label = "Plotly.js", version = "3.7.0", license_name = "MIT",
    bundle_policy = "permissive",
    license_url = "https://github.com/plotly/plotly.js/blob/v3.7.0/LICENSE",
    usage_notice = "Redistribution is permitted when the copyright and MIT licence notice are retained.",
    license_files = "plotly.js-3.7.0-LICENSE.txt"
  ),
  d3 = list(
    label = "D3.js", version = "7.9.0", license_name = "ISC",
    bundle_policy = "permissive",
    license_url = "https://github.com/d3/d3/blob/v7.9.0/LICENSE",
    usage_notice = "Redistribution is permitted when the copyright and ISC permission notice are retained.",
    license_files = "d3-7.9.0-LICENSE.txt"
  ),
  vega = list(
    label = "Vega-Lite/Vega", version = "Vega 6.2.0; Vega-Lite 6.4.3; Vega-Embed 7.1.0",
    license_name = "BSD-3-Clause", bundle_policy = "permissive",
    license_url = "https://github.com/vega/vega/blob/v6.2.0/LICENSE",
    usage_notice = "Redistribution is permitted subject to the BSD three-clause conditions and notices for each component.",
    license_files = c("vega-6.2.0-LICENSE.txt", "vega-lite-6.4.3-LICENSE.txt", "vega-embed-7.1.0-LICENSE.txt")
  ),
  observable = list(
    label = "Observable Plot", version = "0.6.17; D3 7.9.0", license_name = "ISC",
    bundle_policy = "permissive",
    license_url = "https://github.com/observablehq/plot/blob/v0.6.17/LICENSE",
    usage_notice = "Observable Plot and its separately loaded D3 dependency may be redistributed with their ISC notices retained.",
    license_files = c("observable-plot-0.6.17-LICENSE.txt", "d3-7.9.0-LICENSE.txt")
  ),
  chartjs = list(
    label = "Chart.js", version = "4.5.1", license_name = "MIT",
    bundle_policy = "permissive",
    license_url = "https://github.com/chartjs/Chart.js/blob/v4.5.1/LICENSE.md",
    usage_notice = "Redistribution is permitted when the copyright and MIT licence notice are retained.",
    license_files = "chart.js-4.5.1-LICENSE.txt"
  ),
  echarts = list(
    label = "Apache ECharts", version = "6.1.0", license_name = "Apache-2.0",
    bundle_policy = "permissive",
    license_url = "https://github.com/apache/echarts/blob/6.1.0/LICENSE",
    usage_notice = "Redistribution is permitted subject to Apache License 2.0, including preservation of the licence and NOTICE material.",
    license_files = c("echarts-6.1.0-LICENSE.txt", "echarts-6.1.0-NOTICE.txt")
  ),
  apexcharts = list(
    label = "ApexCharts", version = "5.16.0",
    license_name = "ApexCharts Community or commercial licence", bundle_policy = "cdn-only",
    license_url = "https://apexcharts.com/license/community/",
    usage_notice = "The Community License covers qualifying personal, non-profit, educational, and small-organization use, subject to its revenue, attribution, non-compete, and sharing conditions. Other use may require a commercial or OEM licence.",
    license_files = "apexcharts-5.16.0-LICENSE.md"
  ),
  googlecharts = list(
    label = "Google Charts", version = "current rolling service",
    license_name = "Google Charts terms of service", bundle_policy = "cdn-only",
    license_url = "https://developers.google.com/chart/interactive/faq",
    usage_notice = "Google requires the loader and visualization code to be loaded from Google and does not permit downloading or self-hosting it.",
    license_files = character()
  ),
  amcharts = list(
    label = "amCharts 5", version = "5.19.1",
    license_name = "Free amCharts linkware licence or commercial licence", bundle_policy = "conditional",
    license_url = "https://github.com/amcharts/amcharts5/blob/5.19.1/LICENSE",
    usage_notice = "The free licence permits bundling only while the built-in branding remains visible and the original licence and copyright notices accompany the files.",
    license_files = c("amcharts5-5.19.1-LICENSE.md", "amcharts5-5.19.1-THIRD-PARTY.md")
  ),
  vchart = list(
    label = "VisActor VChart", version = "2.1.3", license_name = "MIT",
    bundle_policy = "permissive",
    license_url = "https://github.com/VisActor/VChart/blob/v2.1.3/LICENSE",
    usage_notice = "Redistribution is permitted when the copyright and MIT licence notice are retained.",
    license_files = "vchart-2.1.3-LICENSE.txt"
  ),
  anychart = list(
    label = "AnyChart", version = "8.14.1",
    license_name = "AnyChart proprietary/free-use terms", bundle_policy = "cdn-only",
    license_url = "https://www.anychart.com/buy/",
    usage_notice = "Free use is limited to qualifying non-commercial, educational, or non-profit scenarios. Commercial, SaaS, and redistributable uses may require an AnyChart licence.",
    license_files = character()
  ),
  billboard = list(
    label = "Billboard.js", version = "3.17.2",
    license_name = "MIT; bundled D3 components use ISC-compatible notices", bundle_policy = "permissive",
    license_url = "https://github.com/naver/billboard.js/blob/3.17.2/LICENSE",
    usage_notice = "Redistribution is permitted when the Billboard.js MIT notice and applicable bundled dependency notices are retained.",
    license_files = c("billboard.js-3.17.2-LICENSE.txt", "d3-7.9.0-LICENSE.txt")
  )
)

.cf_vendor_meta <- function(renderer) {
  renderer <- match.arg(renderer, .cf_renderer_ids)
  .cf_vendor_registry[[renderer]]
}

.cf_chart_type_ids <- c(
  "scatter", "line", "spline", "step", "bar", "stacked_bar",
  "area", "stacked_area", "histogram", "density", "pie", "donut",
  "bubble", "boxplot", "heatmap", "treemap", "lollipop"
)

.cf_palette_registry <- list(
  studio = c("#5B8DEF", "#14B8A6", "#F97316", "#A855F7", "#EF4444", "#84CC16", "#06B6D4", "#F59E0B"),
  okabe = c("#0072B2", "#E69F00", "#009E73", "#D55E00", "#CC79A7", "#56B4E9", "#F0E442", "#000000"),
  tableau = c("#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F", "#EDC948", "#B07AA1", "#FF9DA7"),
  warm = c("#B45309", "#EA580C", "#F97316", "#FB7185", "#E11D48", "#BE123C", "#9F1239"),
  mono = c("#0F172A", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"),
  viridis = c("#440154", "#46327E", "#365C8D", "#277F8E", "#1FA187", "#4AC16D", "#A0DA39", "#FDE725"),
  plasma = c("#0D0887", "#5B02A3", "#9A179B", "#CB4679", "#ED7953", "#FB9F3A", "#F0F921"),
  set2 = c("#66C2A5", "#FC8D62", "#8DA0CB", "#E78AC3", "#A6D854", "#FFD92F", "#E5C494", "#B3B3B3"),
  nord = c("#5E81AC", "#88C0D0", "#8FBCBB", "#A3BE8C", "#EBCB8B", "#D08770", "#BF616A", "#B48EAD"),
  jewel = c("#2563EB", "#7C3AED", "#DB2777", "#059669", "#D97706", "#0891B2", "#DC2626", "#65A30D"),
  fire = c("#7F1D1D", "#B91C1C", "#EA580C", "#F59E0B", "#FACC15", "#FEF08A"),
  ocean = c("#082F49", "#075985", "#0284C7", "#06B6D4", "#2DD4BF", "#A7F3D0"),
  forest = c("#14532D", "#166534", "#15803D", "#65A30D", "#84CC16", "#BEF264"),
  sunset = c("#27187E", "#758BFD", "#F1F2F6", "#FF8600", "#F2542D"),
  pastel = c("#A7C7E7", "#C1E1C1", "#F8C8DC", "#FDFD96", "#C3B1E1", "#FFDAC1"),
  bold = c("#E11D48", "#2563EB", "#16A34A", "#CA8A04", "#9333EA", "#0891B2"),
  grayscale = c("#111827", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#F3F4F6")
)

#' Supported JavaScript charting libraries
#'
#' @return A data frame with renderer identifiers, display names, modes,
#'   versions, licence information, delivery policy, and R package hints.
#' @export
chart_libraries <- function() {
  meta <- .cf_vendor_registry[.cf_renderer_ids]
  data.frame(
    id = .cf_renderer_ids,
    label = vapply(meta, `[[`, character(1), "label"),
    mode = rep("direct-js", length(.cf_renderer_ids)),
    version = vapply(meta, `[[`, character(1), "version"),
    license = vapply(meta, `[[`, character(1), "license_name"),
    bundle_policy = vapply(meta, `[[`, character(1), "bundle_policy"),
    license_url = vapply(meta, `[[`, character(1), "license_url"),
    usage_notice = vapply(meta, `[[`, character(1), "usage_notice"),
    r_package_hint = c(
      "highcharter", "plotly", "r2d3", "vegawidget", NA_character_, NA_character_,
      "echarts4r/echarty", "apexcharter", NA_character_, "rAmCharts", "vchartr",
      NA_character_, "billboarder"
    ),
    doc_url = c(
      "https://api.highcharts.com/", "https://plotly.com/javascript/", "https://d3js.org/",
      "https://vega.github.io/vega-lite/docs/", "https://observablehq.com/plot/",
      "https://www.chartjs.org/docs/latest/", "https://echarts.apache.org/handbook/en/get-started/",
      "https://apexcharts.com/docs/options/chart/", "https://developers.google.com/chart/interactive/docs",
      "https://www.amcharts.com/docs/v5/", "https://visactor.io/vchart/guide/tutorial_docs/VChart_Website_Guide",
      "https://docs.anychart.com/", "https://naver.github.io/billboard.js/"
    ),
    stringsAsFactors = FALSE
  )
}

#' Supported chart types
#'
#' @return Character vector of chart type identifiers.
#' @export
chart_types <- function() .cf_chart_type_ids

#' Supported renderer by chart-type combinations
#'
#' @return A data frame with the full app-supported library-by-type grid.
#' @export
cf_supported <- function() {
  expand.grid(library = .cf_renderer_ids, type = .cf_chart_type_ids, stringsAsFactors = FALSE)
}

#' Bundled demo data
#'
#' @return A data frame based on the classic `mtcars` data set.
#' @export
demo_data <- function() {
  path <- system.file("examples", "mtcars-demo.csv", package = "chartforge", mustWork = TRUE)
  utils::read.csv(path, stringsAsFactors = FALSE, check.names = FALSE)
}

#' ChartForge palettes
#'
#' @param name Palette name.
#' @return A character vector of CSS colour values.
#' @export
cf_palette <- function(name = names(.cf_palette_registry)) {
  name <- match.arg(name, names(.cf_palette_registry))
  unname(.cf_palette_registry[[name]])
}


#' Available ChartForge palette names
#'
#' @return Character vector of palette names.
#' @export
cf_palettes <- function() names(.cf_palette_registry)

#' Available ChartForge theme names
#'
#' @return Character vector of theme names.
#' @export
cf_themes <- function() .cf_theme_names

#' Retrieve a data object for reusable emitted code
#'
#' Looks first in the caller environment, then in the environment registered by
#' [run_app()], then in the global environment. This helps emitted code reuse a
#' data frame or matrix selected from the R session that launched the app.
#'
#' @param name Object name.
#' @param env Caller environment to search first.
#' @return A data frame or matrix.
#' @export
cf_get_data <- function(name, env = parent.frame()) {
  if (!is.character(name) || length(name) != 1L || !nzchar(name)) {
    stop("'name' must be a non-empty object-name string.", call. = FALSE)
  }

  candidates <- list()
  add_chain <- function(start) {
    current <- start
    while (is.environment(current) && !identical(current, emptyenv()) && !identical(current, baseenv())) {
      if (!any(vapply(candidates, identical, logical(1), y = current))) candidates[[length(candidates) + 1L]] <<- current
      if (identical(current, .GlobalEnv)) break
      current <- tryCatch(parent.env(current), error = function(e) emptyenv())
    }
  }
  add_chain(env)
  add_chain(getOption("chartforge.data_env", NULL))
  add_chain(.GlobalEnv)

  wrong_type <- FALSE
  for (e in candidates) {
    if (!exists(name, envir = e, inherits = FALSE)) next
    if (tryCatch(bindingIsActive(name, e), error = function(e) FALSE)) next
    obj <- tryCatch(get(name, envir = e, inherits = FALSE), error = function(e) NULL)
    if (is.data.frame(obj) || is.matrix(obj)) return(obj)
    if (!is.null(obj)) wrong_type <- TRUE
  }
  if (wrong_type) stop("Object '", name, "' exists but is not a data frame or matrix.", call. = FALSE)
  stop("Could not find data frame or matrix '", name, "'.", call. = FALSE)
}

#' Read delimited text into a data frame
#'
#' Reads CSV, TSV, or semicolon-delimited text. When `delim = NULL`, the
#' delimiter is inferred from the first non-empty line.
#'
#' @param text Delimited text.
#' @param delim Delimiter: `NULL`, `","`, `"\\t"`, or `";"`.
#' @param auto_dates Convert unambiguous ISO date and date-time columns.
#' @param decimal_mark Decimal mark used while parsing numbers.
#' @param ... Passed to [utils::read.table()].
#' @return A data frame.
#' @export
cf_from_delim <- function(text, delim = NULL, auto_dates = TRUE,
                          decimal_mark = c(".", ","), ...) {
  if (!is.character(text) || length(text) != 1L || !nzchar(text)) {
    stop("'text' must be a non-empty character scalar.", call. = FALSE)
  }
  decimal_mark <- match.arg(as.character(decimal_mark)[1L], c(".", ","))
  if (is.null(delim) || !nzchar(delim)) {
    lines <- strsplit(text, "\\r?\\n", perl = TRUE)[[1L]]
    line <- lines[nzchar(trimws(lines))][1L] %||% ""
    counts <- c(
      tab = lengths(regmatches(line, gregexpr("\t", line, fixed = TRUE))),
      comma = lengths(regmatches(line, gregexpr(",", line, fixed = TRUE))),
      semicolon = lengths(regmatches(line, gregexpr(";", line, fixed = TRUE)))
    )
    delim <- c("\t", ",", ";")[[which.max(counts)]]
  }
  if (identical(delim, "\\t")) delim <- "\t"
  if (!delim %in% c(",", "\t", ";")) {
    stop("'delim' must be NULL, ',', '\\t', or ';'.", call. = FALSE)
  }
  df <- utils::read.table(
    text = text, header = TRUE, sep = delim, dec = decimal_mark,
    quote = "\"", comment.char = "", fill = TRUE,
    stringsAsFactors = FALSE, check.names = FALSE, ...
  )
  if (!isTRUE(auto_dates) || !ncol(df)) return(df)
  for (nm in names(df)) {
    z <- df[[nm]]
    if (!is.character(z)) next
    keep <- !is.na(z) & nzchar(trimws(z))
    if (!any(keep)) next
    vals <- trimws(z[keep])
    if (all(grepl("^\\d{4}-\\d{2}-\\d{2}$", vals))) {
      parsed <- as.Date(vals, format = "%Y-%m-%d")
      if (all(!is.na(parsed))) {
        out <- as.Date(rep(NA_character_, length(z)))
        out[keep] <- parsed
        df[[nm]] <- out
        next
      }
    }
    iso_dt <- "^\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}(:\\d{2}(\\.\\d+)?)?(Z|[+-]\\d{2}:?\\d{2})?$"
    if (all(grepl(iso_dt, vals, perl = TRUE))) {
      cleaned <- sub("Z$", "+0000", vals)
      cleaned <- sub("([+-]\\d{2}):(\\d{2})$", "\\1\\2", cleaned)
      parsed <- as.POSIXct(
        cleaned, tz = "UTC",
        tryFormats = c("%Y-%m-%dT%H:%M:%OS%z", "%Y-%m-%d %H:%M:%OS%z",
                       "%Y-%m-%dT%H:%M:%OS", "%Y-%m-%d %H:%M:%OS")
      )
      if (all(!is.na(parsed))) {
        out <- as.POSIXct(rep(NA_real_, length(z)), origin = "1970-01-01", tz = "UTC")
        out[keep] <- parsed
        df[[nm]] <- out
      }
    }
  }
  df
}

#' Read CSV text into a data frame
#'
#' @param text CSV text.
#' @param ... Passed to [cf_from_delim()].
#' @return A data frame.
#' @export
cf_from_csv <- function(text, ...) cf_from_delim(text, delim = ",", ...)

.cf_font_registry <- data.frame(
  label = c("Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Source Sans 3", "Noto Sans", "Merriweather", "Playfair Display", "IBM Plex Sans", "Fira Sans", "Poppins", "Nunito", "Work Sans", "Libre Franklin", "System UI"),
  family = c("Inter, sans-serif", "Roboto, sans-serif", "Open Sans, sans-serif", "Lato, sans-serif", "Montserrat, sans-serif", "Source Sans 3, sans-serif", "Noto Sans, sans-serif", "Merriweather, serif", "Playfair Display, serif", "IBM Plex Sans, sans-serif", "Fira Sans, sans-serif", "Poppins, sans-serif", "Nunito, sans-serif", "Work Sans, sans-serif", "Libre Franklin, sans-serif", "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"),
  google_family = c("Inter", "Roboto", "Open+Sans", "Lato", "Montserrat", "Source+Sans+3", "Noto+Sans", "Merriweather", "Playfair+Display", "IBM+Plex+Sans", "Fira+Sans", "Poppins", "Nunito", "Work+Sans", "Libre+Franklin", NA_character_),
  stringsAsFactors = FALSE
)

#' Available ChartForge font choices
#'
#' @return A data frame with user-facing labels and CSS font-family strings.
#' @export
cf_fonts <- function() .cf_font_registry

.cf_font_tags <- function(font_family) {
  ff <- as.character(font_family %||% "")
  base <- gsub("^[\'\"]|[\'\"]$", "", trimws(strsplit(ff, ",", fixed = TRUE)[[1L]][1L]))
  hit <- which(tolower(.cf_font_registry$label) == tolower(base))
  if (!length(hit) || is.na(.cf_font_registry$google_family[hit[1L]])) return("")
  fam <- .cf_font_registry$google_family[hit[1L]]
  paste0(
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=', fam, ':wght@400;500;600;700;800&display=swap">'
  )
}

.cf_theme_names <- c("aurora", "paper", "midnight", "minimal", "slate", "graphite", "cream", "solarized", "candy", "contrast", "quartz", "charcoal", "mint", "rose")

.cf_theme <- function(theme = .cf_theme_names) {
  theme <- match.arg(theme, .cf_theme_names)
  switch(
    theme,
    aurora = list(bg = "#F8FBFF", panel = "rgba(255,255,255,.94)", text = "#172033", grid = "rgba(30,41,59,.14)", muted = "#64748B"),
    paper = list(bg = "#FFFDF7", panel = "#FFFFFF", text = "#1F2937", grid = "rgba(120,113,108,.22)", muted = "#7C6F60"),
    midnight = list(bg = "#0B1020", panel = "#111827", text = "#F8FAFC", grid = "rgba(226,232,240,.16)", muted = "#94A3B8"),
    minimal = list(bg = "#FFFFFF", panel = "#FFFFFF", text = "#111827", grid = "rgba(17,24,39,.10)", muted = "#6B7280"),
    slate = list(bg = "#F1F5F9", panel = "#FFFFFF", text = "#0F172A", grid = "rgba(51,65,85,.16)", muted = "#64748B"),
    graphite = list(bg = "#18181B", panel = "#27272A", text = "#FAFAFA", grid = "rgba(212,212,216,.18)", muted = "#A1A1AA"),
    cream = list(bg = "#FFFBEB", panel = "#FFF7ED", text = "#422006", grid = "rgba(146,64,14,.18)", muted = "#92400E"),
    solarized = list(bg = "#FDF6E3", panel = "#EEE8D5", text = "#073642", grid = "rgba(88,110,117,.20)", muted = "#586E75"),
    candy = list(bg = "#FFF1F2", panel = "#FFFFFF", text = "#4A044E", grid = "rgba(190,24,93,.14)", muted = "#86198F"),
    contrast = list(bg = "#FFFFFF", panel = "#FFFFFF", text = "#000000", grid = "rgba(0,0,0,.25)", muted = "#333333"),
    quartz = list(bg = "#F7F7FB", panel = "#FFFFFF", text = "#27272A", grid = "rgba(113,113,122,.18)", muted = "#71717A"),
    charcoal = list(bg = "#111111", panel = "#1C1C1C", text = "#F5F5F5", grid = "rgba(245,245,245,.16)", muted = "#A3A3A3"),
    mint = list(bg = "#ECFDF5", panel = "#FFFFFF", text = "#064E3B", grid = "rgba(5,150,105,.18)", muted = "#047857"),
    rose = list(bg = "#FFF1F2", panel = "#FFFFFF", text = "#4C0519", grid = "rgba(225,29,72,.16)", muted = "#BE123C")
  )
}

.cf_check_data <- function(data) {
  if (is.matrix(data)) data <- as.data.frame(data, stringsAsFactors = FALSE, check.names = FALSE)
  if (!is.data.frame(data)) stop("'data' must be a data frame or matrix.", call. = FALSE)
  as.data.frame(data, stringsAsFactors = FALSE, check.names = FALSE)
}

.cf_unique_non_missing <- function(x) unique(x[!is.na(x)])

.cf_is_integer_like <- function(x) {
  if (!is.numeric(x) || is.factor(x)) return(FALSE)
  z <- x[!is.na(x)]
  length(z) > 0L && all(is.finite(z)) && all(abs(z - round(z)) < sqrt(.Machine$double.eps))
}

.cf_is_likely_categorical <- function(x) {
  if (is.factor(x) || is.ordered(x) || is.character(x) || is.logical(x)) return(TRUE)
  .cf_is_integer_like(x) && length(.cf_unique_non_missing(x)) <= 5L
}

.cf_is_continuous_numeric <- function(x) {
  is.numeric(x) && !is.factor(x) && !.cf_is_likely_categorical(x)
}

.cf_require_numeric <- function(data, col, arg, continuous = FALSE) {
  if (is.null(col)) return(invisible(NULL))
  value <- data[[col]]
  if (!is.numeric(value) || is.factor(value)) {
    stop("Column '", col, "' mapped to '", arg, "' must be numeric.", call. = FALSE)
  }
  if (isTRUE(continuous) && .cf_is_likely_categorical(value)) {
    stop("Column '", col, "' mapped to '", arg,
         "' looks categorical (five or fewer integer levels). Choose a continuous numeric column.",
         call. = FALSE)
  }
  invisible(NULL)
}

.cf_as_list <- function(x, arg = "renderer_options") {
  if (is.null(x)) return(list())
  if (!is.list(x)) stop("'", arg, "' must be a list.", call. = FALSE)
  x
}

.cf_legend_value <- function(legend) {
  if (is.logical(legend)) return(if (isTRUE(legend)) "show" else "hide")
  legend <- as.character(legend %||% "auto")
  match.arg(legend, c("auto", "show", "hide"))
}

.cf_legend_position <- function(x) {
  x <- as.character(x %||% "bottom")
  match.arg(x, c("bottom", "right", "top", "left", "none"))
}

.cf_check_col <- function(data, col, arg = "column", allow_null = TRUE) {
  if (is.null(col) || identical(col, "")) {
    if (allow_null) return(NULL)
    stop("'", arg, "' is required.", call. = FALSE)
  }
  if (!is.character(col) || length(col) != 1L) {
    stop("'", arg, "' must be a single column-name string.", call. = FALSE)
  }
  if (!col %in% names(data)) stop("Column not found for '", arg, "': ", col, call. = FALSE)
  col
}

.cf_check_cols <- function(data, cols, arg = "columns", allow_null = TRUE) {
  if (is.null(cols) || !length(cols) || all(!nzchar(as.character(cols)))) {
    if (allow_null) return(NULL)
    stop("'", arg, "' is required.", call. = FALSE)
  }
  if (!is.character(cols)) stop("'", arg, "' must contain column-name strings.", call. = FALSE)
  cols <- unique(cols[nzchar(cols)])
  missing <- setdiff(cols, names(data))
  if (length(missing)) stop("Column(s) not found for '", arg, "': ", paste(missing, collapse = ", "), call. = FALSE)
  unname(cols)
}

.cf_validate_mapping <- function(data, type, x, y, group, label, sort_by = NULL) {
  x <- .cf_check_col(data, x, "x", allow_null = TRUE)
  y <- .cf_check_col(data, y, "y", allow_null = TRUE)
  group <- .cf_check_col(data, group, "group", allow_null = TRUE)
  label <- .cf_check_cols(data, label, "label", allow_null = TRUE)
  sort_by <- .cf_check_cols(data, sort_by, "sort_by", allow_null = TRUE)

  xy_required <- c("scatter", "line", "spline", "step", "area", "stacked_area", "bubble", "lollipop")
  if (type %in% xy_required && (is.null(x) || is.null(y))) {
    stop("Chart type '", type, "' requires both 'x' and 'y'.", call. = FALSE)
  }
  if (type %in% c("bar", "stacked_bar", "pie", "donut", "treemap") && is.null(x)) {
    stop("Chart type '", type, "' requires 'x'.", call. = FALSE)
  }
  if (type %in% c("histogram", "density")) {
    if (is.null(x)) stop("Chart type '", type, "' requires exactly one continuous numeric 'x' column.", call. = FALSE)
    if (!is.null(y)) stop("Chart type '", type, "' derives its vertical axis from 'x'; leave 'y' unset.", call. = FALSE)
    if (!is.null(group)) stop("Chart type '", type, "' currently renders one distribution; leave 'group' unset.", call. = FALSE)
    .cf_require_numeric(data, x, "x", continuous = TRUE)
  }
  if (type %in% c("scatter", "bubble")) {
    .cf_require_numeric(data, x, "x", continuous = TRUE)
    .cf_require_numeric(data, y, "y", continuous = TRUE)
  }
  if (type %in% c("line", "spline", "step", "area", "stacked_area", "lollipop", "bar", "stacked_bar", "pie", "donut", "treemap") && !is.null(y)) {
    .cf_require_numeric(data, y, "y")
  }
  if (type == "boxplot") {
    if (is.null(y)) stop("Chart type 'boxplot' requires a numeric 'y' column.", call. = FALSE)
    .cf_require_numeric(data, y, "y")
  }
  if (type == "heatmap") {
    if (is.null(x) || is.null(y) || is.null(group)) {
      stop("Chart type 'heatmap' requires categorical 'x' cells, a categorical 'group' row, and a numeric 'y' value.", call. = FALSE)
    }
    if (!.cf_is_likely_categorical(data[[x]])) {
      stop("Column '", x, "' mapped to heatmap 'x' should be categorical.", call. = FALSE)
    }
    if (!.cf_is_likely_categorical(data[[group]])) {
      stop("Column '", group, "' mapped to heatmap 'group' should be categorical.", call. = FALSE)
    }
    .cf_require_numeric(data, y, "y")
  }
  list(x = x, y = y, group = group, label = label, sort_by = sort_by)
}

.cf_sort_data <- function(data, sort_by = NULL, sort_desc = FALSE) {
  if (is.null(sort_by) || !length(sort_by) || nrow(data) < 2L) return(data)
  sort_desc <- rep_len(as.logical(sort_desc), length(sort_by))
  keys <- lapply(seq_along(sort_by), function(i) {
    z <- data[[sort_by[[i]]]]
    if (is.factor(z)) z <- as.character(z)
    key <- xtfrm(z)
    if (isTRUE(sort_desc[[i]])) -key else key
  })
  keys[[length(keys) + 1L]] <- seq_len(nrow(data))
  ord <- do.call(order, c(keys, list(na.last = TRUE, method = "radix")))
  data[ord, , drop = FALSE]
}

.cf_json_quote <- function(x) {
  x <- enc2utf8(as.character(x))
  x <- gsub("\\", "\\\\", x, fixed = TRUE)
  x <- gsub('"', '\\"', x, fixed = TRUE)
  x <- gsub("\r", "\\r", x, fixed = TRUE)
  x <- gsub("\n", "\\n", x, fixed = TRUE)
  x <- gsub("\t", "\\t", x, fixed = TRUE)
  paste0('"', x, '"')
}

.cf_number_json <- function(x) {
  bad <- is.na(x) | !is.finite(x)
  out <- format(x, scientific = FALSE, digits = 15, trim = TRUE)
  out[bad] <- "null"
  out
}

.cf_json <- function(x, auto_unbox = TRUE) {
  if (is.null(x)) return("null")
  if (inherits(x, "POSIXt")) x <- format(x, "%Y-%m-%dT%H:%M:%OS%z", tz = "UTC")
  if (inherits(x, "Date")) x <- as.character(x)
  if (is.factor(x)) x <- as.character(x)
  if (is.data.frame(x)) return(.cf_dataframe_json(x))
  if (is.list(x)) return(.cf_list_json(x, auto_unbox = auto_unbox))
  if (is.character(x)) {
    vals <- ifelse(is.na(x), "null", vapply(x, .cf_json_quote, character(1)))
    if (auto_unbox && length(vals) == 1L) return(vals[[1]])
    return(paste0("[", paste(vals, collapse = ","), "]"))
  }
  if (is.numeric(x) || is.integer(x)) {
    vals <- .cf_number_json(as.numeric(x))
    if (auto_unbox && length(vals) == 1L) return(vals[[1]])
    return(paste0("[", paste(vals, collapse = ","), "]"))
  }
  if (is.logical(x)) {
    vals <- ifelse(is.na(x), "null", ifelse(x, "true", "false"))
    if (auto_unbox && length(vals) == 1L) return(vals[[1]])
    return(paste0("[", paste(vals, collapse = ","), "]"))
  }
  .cf_json(as.character(x), auto_unbox = auto_unbox)
}

.cf_dataframe_json <- function(x) {
  n <- nrow(x)
  cols <- names(x)
  if (!n) return("[]")
  rows <- vapply(seq_len(n), function(i) {
    row <- lapply(cols, function(nm) x[[nm]][i])
    names(row) <- cols
    .cf_list_json(row, auto_unbox = TRUE)
  }, character(1))
  paste0("[", paste(rows, collapse = ","), "]")
}

.cf_list_json <- function(x, auto_unbox = TRUE) {
  if (!length(x)) return("{}")
  nms <- names(x)
  is_object <- !is.null(nms) && length(nms) == length(x) && all(nzchar(nms))
  vals <- vapply(x, .cf_json, character(1), auto_unbox = auto_unbox)
  if (is_object) {
    pairs <- paste0(vapply(nms, .cf_json_quote, character(1)), ":", vals)
    paste0("{", paste(pairs, collapse = ","), "}")
  } else {
    paste0("[", paste(vals, collapse = ","), "]")
  }
}

.cf_html_escape <- function(x) {
  x <- as.character(x %||% "")
  x <- gsub("&", "&amp;", x, fixed = TRUE)
  x <- gsub("<", "&lt;", x, fixed = TRUE)
  x <- gsub(">", "&gt;", x, fixed = TRUE)
  x <- gsub('"', "&quot;", x, fixed = TRUE)
  x
}

.cf_json_script <- function(x) gsub("</", "<\\/", as.character(x), fixed = TRUE)

.cf_style_control <- function(key, label, type = "switch", default = NULL,
                              choices = NULL, min = NULL, max = NULL, step = NULL,
                              group = "Appearance", help = "", chart_types = NULL) {
  list(key = key, label = label, type = type, default = default, choices = choices,
       min = min, max = max, step = step, group = group, help = help,
       chart_types = chart_types)
}

.cf_renderer_style_registry <- list(
  highcharts = list(
    title = "Highcharts style and interaction",
    doc_url = "https://api.highcharts.com/highcharts/",
    description = "Zooming, panning, exporting, native data labels, and polished interactive tooltips.",
    controls = list(
      .cf_style_control("zoom_type", "Zoom direction", "select", "none", c("none", "x", "y", "xy"), group = "Navigation"),
      .cf_style_control("mouse_wheel_zoom", "Mouse-wheel zoom", "switch", FALSE, group = "Navigation"),
      .cf_style_control("panning", "Panning", "switch", FALSE, group = "Navigation"),
      .cf_style_control("pan_key", "Pan modifier key", "select", "shift", c("shift", "ctrl", "alt", "meta"), group = "Navigation"),
      .cf_style_control("shared_tooltip", "Shared tooltip", "switch", FALSE, group = "Tooltip"),
      .cf_style_control("crosshair", "Crosshair", "switch", FALSE, group = "Tooltip"),
      .cf_style_control("data_labels", "Data labels", "switch", FALSE, group = "Marks"),
      .cf_style_control("line_width", "Line width", "range", 3, min = 1, max = 10, step = 1, group = "Marks", chart_types = c("line", "spline", "step", "area", "stacked_area")),
      .cf_style_control("line_dash", "Line pattern", "select", "solid", c("solid", "dashed", "dotted"), group = "Marks"),
      .cf_style_control("column_radius", "Column corner radius", "range", 4, min = 0, max = 18, step = 1, group = "Marks", chart_types = c("bar", "stacked_bar", "histogram")),
      .cf_style_control("shadow", "Mark shadow", "switch", FALSE, group = "Effects"),
      .cf_style_control("exporting", "Export menu", "switch", FALSE, group = "Utilities"),
      .cf_style_control("accessibility", "Accessibility module", "switch", TRUE, group = "Utilities")
    )
  ),
  plotly = list(
    title = "Plotly.js style and interaction", doc_url = "https://plotly.com/javascript/configuration-options/",
    description = "Modebar tools, rich hover modes, selectable drag interactions, and WebGL-friendly point styling.",
    controls = list(
      .cf_style_control("modebar", "Show modebar", "switch", TRUE, group = "Navigation"),
      .cf_style_control("scroll_zoom", "Scroll-wheel zoom", "switch", FALSE, group = "Navigation"),
      .cf_style_control("dragmode", "Default drag tool", "select", "zoom", c("zoom", "pan", "select", "lasso", "orbit", "turntable"), group = "Navigation"),
      .cf_style_control("hovermode", "Hover mode", "select", "closest", c("closest", "x", "x unified", "y", "y unified", "false"), group = "Tooltip"),
      .cf_style_control("marker_symbol", "Marker symbol", "select", "circle", c("circle", "square", "diamond", "cross", "x", "triangle-up", "star"), group = "Marks"),
      .cf_style_control("marker_opacity", "Marker opacity", "range", 0.86, min = 0.1, max = 1, step = 0.05, group = "Marks"),
      .cf_style_control("line_width", "Line width", "range", 3, min = 1, max = 10, step = 1, group = "Marks"),
      .cf_style_control("line_dash", "Line pattern", "select", "solid", c("solid", "dash", "dot", "dashdot"), group = "Marks"),
      .cf_style_control("responsive", "Responsive resize", "switch", FALSE, group = "Display"),
      .cf_style_control("static_plot", "Disable interactions", "switch", FALSE, group = "Display")
    )
  ),
  d3 = list(
    title = "D3.js style and interaction", doc_url = "https://d3js.org/getting-started",
    description = "Fine-grained scales, curve interpolation, axes, zooming, brushing, and custom SVG marks.",
    controls = list(
      .cf_style_control("x_scale", "X scale", "select", "auto", c("auto", "linear", "log", "sqrt", "time", "band"), group = "Scales"),
      .cf_style_control("y_scale", "Y scale", "select", "linear", c("linear", "log", "sqrt"), group = "Scales"),
      .cf_style_control("curve", "Curve interpolation", "select", "linear", c("linear", "basis", "cardinal", "catmull-rom", "monotone-x", "step"), group = "Marks"),
      .cf_style_control("zoom", "Pan and zoom", "switch", FALSE, group = "Interaction"),
      .cf_style_control("brush", "Selection brush", "switch", FALSE, group = "Interaction"),
      .cf_style_control("point_symbol", "Point symbol", "select", "circle", c("circle", "square", "diamond", "triangle", "star", "cross"), group = "Marks"),
      .cf_style_control("point_size", "Point size", "range", 7, min = 2, max = 24, step = 1, group = "Marks"),
      .cf_style_control("line_width", "Line width", "range", 3, min = 1, max = 10, step = 1, group = "Marks"),
      .cf_style_control("opacity", "Mark opacity", "range", 0.88, min = 0.1, max = 1, step = 0.05, group = "Marks"),
      .cf_style_control("x_ticks", "X tick count", "range", 6, min = 2, max = 16, step = 1, group = "Axes"),
      .cf_style_control("y_ticks", "Y tick count", "range", 6, min = 2, max = 16, step = 1, group = "Axes")
    )
  ),
  vega = list(
    title = "Vega-Lite / Vega style and interaction", doc_url = "https://vega.github.io/vega-lite/docs/",
    description = "Declarative scales, selections, axis configuration, mark properties, and SVG or Canvas rendering.",
    controls = list(
      .cf_style_control("renderer", "Renderer", "select", "svg", c("svg", "canvas"), group = "Display"),
      .cf_style_control("autosize", "Autosize mode", "select", "fit", c("fit", "fit-x", "fit-y", "pad", "none"), group = "Display"),
      .cf_style_control("selection", "Interactive selection", "select", "none", c("none", "nearest", "interval"), group = "Interaction"),
      .cf_style_control("actions", "Vega action menu", "switch", FALSE, group = "Utilities"),
      .cf_style_control("x_scale", "X scale", "select", "auto", c("auto", "linear", "log", "sqrt", "time", "utc"), group = "Scales"),
      .cf_style_control("y_scale", "Y scale", "select", "linear", c("linear", "log", "sqrt"), group = "Scales"),
      .cf_style_control("scale_zero", "Include zero", "switch", FALSE, group = "Scales"),
      .cf_style_control("scale_nice", "Nice axis bounds", "switch", TRUE, group = "Scales"),
      .cf_style_control("axis_label_angle", "X label angle", "range", 0, min = -90, max = 90, step = 5, group = "Axes"),
      .cf_style_control("x_ticks", "X tick count", "range", 7, min = 2, max = 16, step = 1, group = "Axes", help = "Desired number of ticks on quantitative and temporal X axes."),
      .cf_style_control("y_ticks", "Y tick count", "range", 6, min = 2, max = 16, step = 1, group = "Axes", help = "Desired number of ticks on quantitative Y axes."),
      .cf_style_control("filled", "Filled marks", "switch", TRUE, group = "Marks"),
      .cf_style_control("opacity", "Mark opacity", "range", 0.88, min = 0.1, max = 1, step = 0.05, group = "Marks"),
      .cf_style_control("stroke_width", "Stroke width", "range", 3, min = 1, max = 10, step = 1, group = "Marks")
    )
  ),
  observable = list(
    title = "Observable Plot style and interaction", doc_url = "https://observablehq.com/plot/",
    description = "Concise statistical marks, built-in tips and crosshairs, scale transforms, and accessible SVG output.",
    controls = list(
      .cf_style_control("curve", "Curve interpolation", "select", "linear", c("linear", "basis", "cardinal", "catmull-rom", "monotone-x", "step"), group = "Marks"),
      .cf_style_control("tip", "Observable tip", "switch", TRUE, group = "Interaction"),
      .cf_style_control("crosshair", "Crosshair", "switch", FALSE, group = "Interaction"),
      .cf_style_control("frame", "Plot frame", "switch", FALSE, group = "Display"),
      .cf_style_control("x_scale", "X scale", "select", "auto", c("auto", "linear", "log", "sqrt", "time", "utc", "point", "band"), group = "Scales"),
      .cf_style_control("y_scale", "Y scale", "select", "linear", c("linear", "log", "sqrt"), group = "Scales"),
      .cf_style_control("scale_zero", "Include zero", "switch", FALSE, group = "Scales"),
      .cf_style_control("scale_nice", "Nice axis bounds", "switch", TRUE, group = "Scales"),
      .cf_style_control("line_width", "Line width", "range", 3, min = 1, max = 10, step = 1, group = "Marks"),
      .cf_style_control("opacity", "Mark opacity", "range", 0.88, min = 0.1, max = 1, step = 0.05, group = "Marks")
    )
  ),
  chartjs = list(
    title = "Chart.js style and interaction", doc_url = "https://www.chartjs.org/docs/latest/configuration/",
    description = "Canvas-first charts with flexible interaction modes, point elements, animations, and large-data decimation.",
    controls = list(
      .cf_style_control("point_style", "Point style", "select", "circle", c("circle", "cross", "crossRot", "dash", "line", "rect", "rectRounded", "rectRot", "star", "triangle"), group = "Marks"),
      .cf_style_control("point_radius", "Point radius", "range", 5, min = 0, max = 20, step = 1, group = "Marks"),
      .cf_style_control("border_width", "Line/border width", "range", 3, min = 1, max = 10, step = 1, group = "Marks"),
      .cf_style_control("tension", "Line tension", "range", 0, min = 0, max = 0.5, step = 0.05, group = "Marks"),
      .cf_style_control("interaction_mode", "Interaction mode", "select", "nearest", c("nearest", "index", "dataset", "point", "x", "y"), group = "Interaction"),
      .cf_style_control("intersect", "Require pointer intersection", "switch", FALSE, group = "Interaction"),
      .cf_style_control("easing", "Animation easing", "select", "easeOutQuart", c("linear", "easeOutQuart", "easeInOutCubic", "easeOutBounce"), group = "Animation"),
      .cf_style_control("animation_duration", "Animation duration", "range", 700, min = 0, max = 2500, step = 50, group = "Animation"),
      .cf_style_control("decimation", "Large-data decimation", "select", "none", c("none", "lttb", "min-max"), group = "Performance")
    )
  ),
  echarts = list(
    title = "Apache ECharts style and interaction", doc_url = "https://echarts.apache.org/handbook/en/concepts/style/",
    description = "Toolbox actions, data zoom, axis pointers, smooth lines, rich labels, and flexible symbol styling.",
    controls = list(
      .cf_style_control("data_zoom", "Data zoom slider", "switch", FALSE, group = "Navigation"),
      .cf_style_control("inside_zoom", "Inside wheel/pinch zoom", "switch", FALSE, group = "Navigation"),
      .cf_style_control("toolbox", "Toolbox", "switch", FALSE, group = "Utilities"),
      .cf_style_control("axis_pointer", "Axis pointer", "select", "line", c("none", "line", "shadow", "cross"), group = "Tooltip"),
      .cf_style_control("smooth", "Smooth lines", "switch", FALSE, group = "Marks"),
      .cf_style_control("symbol", "Point symbol", "select", "circle", c("circle", "rect", "roundRect", "triangle", "diamond", "pin", "arrow", "none"), group = "Marks"),
      .cf_style_control("symbol_size", "Symbol size", "range", 8, min = 2, max = 28, step = 1, group = "Marks"),
      .cf_style_control("line_width", "Line width", "range", 3, min = 1, max = 10, step = 1, group = "Marks"),
      .cf_style_control("line_dash", "Line pattern", "select", "solid", c("solid", "dashed", "dotted"), group = "Marks"),
      .cf_style_control("labels", "Data labels", "switch", FALSE, group = "Labels"),
      .cf_style_control("area_opacity", "Area opacity", "range", 0.28, min = 0, max = 1, step = 0.05, group = "Marks")
    )
  ),
  apexcharts = list(
    title = "ApexCharts style and interaction", doc_url = "https://apexcharts.com/docs/options/chart/",
    description = "Built-in toolbar and zooming, sparkline mode, stroke curves, markers, fills, shadows, and data labels.",
    controls = list(
      .cf_style_control("toolbar", "Toolbar", "switch", TRUE, group = "Navigation"),
      .cf_style_control("zoom", "Zoom", "switch", FALSE, group = "Navigation"),
      .cf_style_control("zoom_type", "Zoom direction", "select", "x", c("x", "y", "xy"), group = "Navigation"),
      .cf_style_control("sparkline", "Sparkline mode", "switch", FALSE, group = "Display"),
      .cf_style_control("curve", "Stroke curve", "select", "straight", c("straight", "smooth", "stepline", "monotoneCubic"), group = "Marks"),
      .cf_style_control("stroke_width", "Stroke width", "range", 3, min = 1, max = 10, step = 1, group = "Marks"),
      .cf_style_control("dash_array", "Dash length", "range", 0, min = 0, max = 12, step = 1, group = "Marks"),
      .cf_style_control("marker_shape", "Marker shape", "select", "circle", c("circle", "square"), group = "Marks"),
      .cf_style_control("marker_size", "Marker size", "range", 6, min = 0, max = 20, step = 1, group = "Marks"),
      .cf_style_control("data_labels", "Data labels", "switch", FALSE, group = "Labels"),
      .cf_style_control("fill_opacity", "Fill opacity", "range", 0.35, min = 0, max = 1, step = 0.05, group = "Marks"),
      .cf_style_control("drop_shadow", "Drop shadow", "switch", FALSE, group = "Effects")
    )
  ),
  googlecharts = list(
    title = "Google Charts style and interaction", doc_url = "https://developers.google.com/chart/interactive/docs/gallery",
    description = "Explorer navigation, crosshairs, annotations, trendlines, and familiar Google chart presentation.",
    controls = list(
      .cf_style_control("curve_type", "Curve style", "select", "none", c("none", "function"), group = "Marks"),
      .cf_style_control("explorer", "Explorer pan and zoom", "switch", FALSE, group = "Navigation"),
      .cf_style_control("crosshair", "Crosshair", "switch", FALSE, group = "Interaction"),
      .cf_style_control("point_size", "Point size", "range", 7, min = 0, max = 20, step = 1, group = "Marks"),
      .cf_style_control("line_width", "Line width", "range", 3, min = 1, max = 10, step = 1, group = "Marks"),
      .cf_style_control("opacity", "Mark opacity", "range", 0.86, min = 0.1, max = 1, step = 0.05, group = "Marks"),
      .cf_style_control("annotations", "Point annotations", "switch", FALSE, group = "Labels"),
      .cf_style_control("trendline", "Linear trendline", "switch", FALSE, group = "Analysis", chart_types = c("scatter")),
      .cf_style_control("trendline_r2", "Show trendline R²", "switch", FALSE, group = "Analysis", chart_types = c("scatter"))
    )
  ),
  amcharts = list(
    title = "amCharts 5 style and interaction", doc_url = "https://www.amcharts.com/docs/v5/charts/xy-chart/",
    description = "XY cursors, pan and wheel behaviours, native scrollbars, animated themes, and detailed series styling.",
    controls = list(
      .cf_style_control("animated_theme", "Animated theme", "switch", TRUE, group = "Animation"),
      .cf_style_control("cursor", "XY cursor", "switch", TRUE, group = "Interaction"),
      .cf_style_control("cursor_behavior", "Cursor behaviour", "select", "zoomX", c("none", "zoomX", "zoomY", "zoomXY", "selectX", "selectY", "selectXY"), group = "Interaction"),
      .cf_style_control("pan_x", "Horizontal panning", "switch", FALSE, group = "Navigation"),
      .cf_style_control("pan_y", "Vertical panning", "switch", FALSE, group = "Navigation"),
      .cf_style_control("wheel_x", "Mouse-wheel X action", "select", "panX", c("none", "zoomX", "zoomY", "panX", "panY"), group = "Navigation"),
      .cf_style_control("wheel_y", "Mouse-wheel Y action", "select", "zoomX", c("none", "zoomX", "zoomY", "panX", "panY"), group = "Navigation"),
      .cf_style_control("scrollbar_x", "Horizontal scrollbar", "switch", FALSE, group = "Navigation"),
      .cf_style_control("scrollbar_y", "Vertical scrollbar", "switch", FALSE, group = "Navigation"),
      .cf_style_control("stroke_width", "Stroke width", "range", 3, min = 1, max = 10, step = 1, group = "Marks"),
      .cf_style_control("fill_opacity", "Fill opacity", "range", 0.28, min = 0, max = 1, step = 0.05, group = "Marks"),
      .cf_style_control("column_radius", "Column corner radius", "range", 4, min = 0, max = 20, step = 1, group = "Marks")
    )
  ),
  vchart = list(
    title = "VisActor VChart style and interaction", doc_url = "https://visactor.io/vchart/guide/tutorial_docs/VChart_Website_Guide",
    description = "Declarative chart specs with data zoom, crosshairs, axis range controls, rich labels, and animated marks.",
    controls = list(
      .cf_style_control("data_zoom", "Data zoom", "switch", FALSE, group = "Navigation"),
      .cf_style_control("crosshair", "Crosshair", "switch", FALSE, group = "Interaction"),
      .cf_style_control("points", "Show points", "switch", TRUE, group = "Marks"),
      .cf_style_control("smooth", "Smooth lines", "switch", FALSE, group = "Marks"),
      .cf_style_control("point_size", "Point size", "range", 8, min = 2, max = 24, step = 1, group = "Marks"),
      .cf_style_control("line_width", "Line width", "range", 3, min = 1, max = 10, step = 1, group = "Marks"),
      .cf_style_control("line_dash", "Line pattern", "select", "solid", c("solid", "dashed"), group = "Marks"),
      .cf_style_control("area_opacity", "Area opacity", "range", 0.3, min = 0, max = 1, step = 0.05, group = "Marks"),
      .cf_style_control("labels", "Data labels", "switch", FALSE, group = "Labels"),
      .cf_style_control("bar_radius", "Bar corner radius", "range", 4, min = 0, max = 20, step = 1, group = "Marks"),
      .cf_style_control("x_tick_count", "X tick count", "range", 6, min = 2, max = 16, step = 1, group = "Axes"),
      .cf_style_control("y_tick_count", "Y tick count", "range", 6, min = 2, max = 16, step = 1, group = "Axes"),
      .cf_style_control("exact_domain", "Match numeric data domain", "switch", TRUE, group = "Axes")
    )
  ),
  anychart = list(
    title = "AnyChart style and interaction", doc_url = "https://docs.anychart.com/Common_Settings/Interactivity",
    description = "Crosshairs, chart scrollers, marker controls, tooltip display modes, labels, and animated transitions.",
    controls = list(
      .cf_style_control("crosshair", "Crosshair", "switch", FALSE, group = "Interaction"),
      .cf_style_control("scroller", "Chart scroller", "switch", FALSE, group = "Navigation"),
      .cf_style_control("marker_type", "Marker type", "select", "circle", c("circle", "square", "diamond", "triangle-up", "triangle-down", "cross", "star5"), group = "Marks"),
      .cf_style_control("marker_size", "Marker size", "range", 6, min = 2, max = 22, step = 1, group = "Marks"),
      .cf_style_control("line_width", "Line width", "range", 3, min = 1, max = 10, step = 1, group = "Marks"),
      .cf_style_control("labels", "Data labels", "switch", FALSE, group = "Labels"),
      .cf_style_control("tooltip_mode", "Tooltip mode", "select", "single", c("single", "union", "separated"), group = "Tooltip"),
      .cf_style_control("animation_duration", "Animation duration", "range", 600, min = 0, max = 2500, step = 50, group = "Animation")
    )
  ),
  billboard = list(
    title = "Billboard.js style and interaction", doc_url = "https://naver.github.io/billboard.js/release/latest/doc/Options.html",
    description = "Zooming, subcharts, grouped tooltips, rotated axes, point focus, and SVG or Canvas rendering.",
    controls = list(
      .cf_style_control("renderer", "Renderer", "select", "svg", c("svg", "canvas"), group = "Display"),
      .cf_style_control("zoom", "Zoom", "switch", FALSE, group = "Navigation"),
      .cf_style_control("zoom_type", "Zoom input", "select", "wheel", c("wheel", "drag"), group = "Navigation"),
      .cf_style_control("zoom_rescale", "Rescale Y while zooming", "switch", FALSE, group = "Navigation"),
      .cf_style_control("subchart", "Navigator subchart", "switch", FALSE, group = "Navigation"),
      .cf_style_control("points", "Show points", "switch", TRUE, group = "Marks"),
      .cf_style_control("point_radius", "Point radius", "range", 5, min = 1, max = 18, step = 1, group = "Marks"),
      .cf_style_control("point_focus", "Expand focused point", "switch", TRUE, group = "Interaction"),
      .cf_style_control("tooltip_grouped", "Grouped tooltip", "switch", TRUE, group = "Tooltip"),
      .cf_style_control("axis_rotated", "Rotate chart axes", "switch", FALSE, group = "Axes"),
      .cf_style_control("tick_rotation", "X label rotation", "range", 0, min = -90, max = 90, step = 5, group = "Axes"),
      .cf_style_control("tick_culling", "Cull crowded labels", "switch", TRUE, group = "Axes")
    )
  )
)

#' Renderer-specific style controls
#'
#' @param renderer Optional renderer id. When omitted, returns all schemas.
#' @return A renderer style schema or the full named schema registry.
#' @export
cf_renderer_styles <- function(renderer = NULL) {
  if (is.null(renderer)) return(.cf_renderer_style_registry)
  renderer <- match.arg(renderer, .cf_renderer_ids)
  .cf_renderer_style_registry[[renderer]]
}

.cf_style_defaults <- function(renderer) {
  controls <- .cf_renderer_style_registry[[renderer]]$controls %||% list()
  out <- lapply(controls, function(x) x$default)
  names(out) <- vapply(controls, function(x) x$key, character(1))
  out
}

.cf_merge_flat <- function(defaults, supplied) {
  supplied <- .cf_as_list(supplied, "renderer_style")
  if (!length(supplied)) return(defaults)
  defaults[names(supplied)] <- supplied
  defaults
}

.cf_asset_registry <- function(renderer, type = "scatter", renderer_style = list()) {
  renderer <- match.arg(renderer, .cf_renderer_ids)
  type <- match.arg(type, .cf_chart_type_ids)
  st <- .cf_merge_flat(.cf_style_defaults(renderer), renderer_style)
  assets <- switch(
    renderer,
    highcharts = {
      scripts <- "https://cdn.jsdelivr.net/npm/highcharts@12.6.0/highcharts.js"
      if (type %in% c("bubble", "boxplot")) scripts <- c(scripts, "https://cdn.jsdelivr.net/npm/highcharts@12.6.0/highcharts-more.js")
      if (type == "heatmap") scripts <- c(scripts, "https://cdn.jsdelivr.net/npm/highcharts@12.6.0/modules/heatmap.js")
      if (type == "treemap") scripts <- c(scripts, "https://cdn.jsdelivr.net/npm/highcharts@12.6.0/modules/treemap.js")
      if (isTRUE(st$exporting)) scripts <- c(scripts, "https://cdn.jsdelivr.net/npm/highcharts@12.6.0/modules/exporting.js")
      if (!identical(st$accessibility, FALSE)) scripts <- c(scripts, "https://cdn.jsdelivr.net/npm/highcharts@12.6.0/modules/accessibility.js")
      list(scripts = scripts, styles = character())
    },
    plotly = list(scripts = "https://cdn.jsdelivr.net/npm/plotly.js-dist-min@3.7.0/plotly.min.js", styles = character()),
    d3 = list(scripts = "https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js", styles = character()),
    vega = list(scripts = c("https://cdn.jsdelivr.net/npm/vega@6.2.0/build/vega.min.js", "https://cdn.jsdelivr.net/npm/vega-lite@6.4.3/build/vega-lite.min.js", "https://cdn.jsdelivr.net/npm/vega-embed@7.1.0/build/vega-embed.min.js"), styles = character()),
    observable = list(scripts = c("https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js", "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6.17/dist/plot.umd.min.js"), styles = character()),
    chartjs = list(scripts = "https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js", styles = character()),
    echarts = list(scripts = "https://cdn.jsdelivr.net/npm/echarts@6.1.0/dist/echarts.min.js", styles = character()),
    apexcharts = list(scripts = "https://cdn.jsdelivr.net/npm/apexcharts@5.16.0/dist/apexcharts.min.js", styles = character()),
    googlecharts = list(scripts = "https://www.gstatic.com/charts/loader.js", styles = character()),
    amcharts = {
      kind <- if (type %in% c("pie", "donut")) "percent" else "xy"
      list(scripts = c("https://cdn.amcharts.com/lib/version/5.19.1/index.js", paste0("https://cdn.amcharts.com/lib/version/5.19.1/", kind, ".js"), "https://cdn.amcharts.com/lib/version/5.19.1/themes/Animated.js"), styles = character())
    },
    vchart = list(scripts = "https://cdn.jsdelivr.net/npm/@visactor/vchart@2.1.3/build/index.min.js", styles = character()),
    anychart = list(scripts = "https://cdn.anychart.com/releases/8.14.1/js/anychart-base.min.js", styles = character()),
    billboard = list(scripts = "https://cdn.jsdelivr.net/npm/billboard.js@3.17.2/dist/billboard.pkgd.min.js", styles = "https://cdn.jsdelivr.net/npm/billboard.js@3.17.2/dist/billboard.min.css")
  )
  assets
}

#' JavaScript and CSS assets for a ChartForge renderer
#'
#' @param renderer Renderer id from [chart_libraries()].
#' @param type Chart type from [chart_types()]. Highcharts and amCharts use it
#'   to include only required modules.
#' @param renderer_style Renderer-specific style list. It can activate optional
#'   modules such as Highcharts exporting.
#' @return A list with `scripts` and `styles` character vectors.
#' @export
cf_assets <- function(renderer = .cf_renderer_ids, type = "scatter", renderer_style = list()) {
  renderer <- match.arg(renderer, .cf_renderer_ids)
  type <- match.arg(type, .cf_chart_type_ids)
  .cf_asset_registry(renderer, type, renderer_style)
}

.cf_override_text <- function(name, object_name, option_name = NULL) {
  values <- get0(object_name, inherits = TRUE, ifnotfound = NULL)
  if (is.null(values) && !is.null(option_name)) values <- getOption(option_name, NULL)
  value <- NULL
  if (is.environment(values)) {
    value <- get0(name, envir = values, inherits = FALSE, ifnotfound = NULL)
  } else if ((is.list(values) || is.atomic(values)) && !is.null(names(values)) && name %in% names(values)) {
    value <- values[[name]]
  }
  if (is.character(value) && length(value) == 1L && !is.na(value)) value else NULL
}

.cf_fetch_text <- function(url) {
  override <- .cf_override_text(url, ".chartforge_asset_text_override", "chartforge.asset_text_override")
  if (!is.null(override)) return(override)
  tmp <- tempfile(fileext = if (grepl("\\.css($|[?])", url)) ".css" else ".js")
  on.exit(unlink(tmp), add = TRUE)
  args <- list(url = url, destfile = tmp, quiet = TRUE, mode = "wb")
  if ("headers" %in% names(formals(utils::download.file))) {
    args$headers <- c("User-Agent" = "Mozilla/5.0 ChartForge/0.6.6", "Referer" = "https://github.com/alekrutkowski/chartforge")
  }
  ok <- tryCatch({ do.call(utils::download.file, args); TRUE }, error = function(e) e)
  if (inherits(ok, "error") || !file.exists(tmp) || !file.info(tmp)$size) {
    stop("Could not download bundled asset from ", url, ". Use full_bundle = FALSE for CDN tags, or pass a local file via asset_paths.", call. = FALSE)
  }
  paste(readLines(tmp, warn = FALSE, encoding = "UTF-8"), collapse = "\n")
}

.cf_html_comment <- function(lines, minified = FALSE) {
  lines <- gsub("--", "- -", as.character(lines), fixed = TRUE)
  if (isTRUE(minified)) return(paste0("<!--", paste(lines, collapse = " | "), "-->"))
  paste0("<!--\n", paste(lines, collapse = "\n"), "\n-->")
}

.cf_license_root_candidates <- function() {
  roots <- c(
    get0(".chartforge_license_root", inherits = TRUE, ifnotfound = ""),
    getOption("chartforge.license_root", ""),
    file.path(getwd(), "inst", "app", "licenses")
  )
  installed <- system.file("app", "licenses", package = "chartforge", mustWork = FALSE)
  if (nzchar(installed)) roots <- c(roots, installed)
  unique(roots[nzchar(roots)])
}

.cf_vendor_license_block <- function(renderer, minified = FALSE) {
  meta <- .cf_vendor_meta(renderer)
  files <- meta$license_files %||% character()
  if (!length(files)) return("")
  roots <- .cf_license_root_candidates()
  texts <- vapply(files, function(filename) {
    override <- .cf_override_text(filename, ".chartforge_license_text_override", "chartforge.license_text_override")
    if (!is.null(override)) return(override)
    candidates <- file.path(roots, filename)
    path <- candidates[file.exists(candidates)][1L]
    if (!length(path) || is.na(path)) {
      stop("Required third-party licence notice was not found: ", filename,
           ". ChartForge will not inline this vendor asset without its notice.", call. = FALSE)
    }
    paste(readLines(path, warn = FALSE, encoding = "UTF-8"), collapse = "\n")
  }, character(1))
  names(texts) <- files
  payload <- paste(vapply(seq_along(texts), function(i) {
    paste0("===== ", names(texts)[[i]], " =====\n", texts[[i]])
  }, character(1)), collapse = "\n\n")
  payload <- gsub("</script", "<\\/script", payload, fixed = TRUE)
  nl <- if (isTRUE(minified)) "" else "\n"
  paste0('<script type="text/plain" data-chartforge-third-party-license="',
         .cf_html_escape(renderer), '">', nl, payload, nl, '</script>')
}

.cf_legal_annotation <- function(renderer, full_bundle = FALSE, vendor_inlined = FALSE,
                                 minified = FALSE) {
  meta <- .cf_vendor_meta(renderer)
  delivery <- if (isTRUE(full_bundle) && identical(meta$bundle_policy, "cdn-only")) {
    "full_bundle=TRUE was requested, but ChartForge intentionally kept this vendor library CDN-linked and did not download or inline it."
  } else if (isTRUE(vendor_inlined)) {
    "The vendor asset is inlined by request. The applicable licence text is included in this HTML output."
  } else {
    "The vendor asset is referenced from its CDN and is not redistributed in this HTML output."
  }
  .cf_html_comment(c(
    "ChartForge third-party renderer notice",
    paste0("Renderer: ", meta$label, " ", meta$version),
    paste0("Licence or terms: ", meta$license_name, " (", meta$license_url, ")"),
    paste0("Delivery: ", delivery),
    paste0("Important: ", meta$usage_notice),
    "ChartForge's MIT licence does not grant rights to this renderer."
  ), minified = minified)
}

.cf_asset_tags <- function(renderer, type, renderer_style = list(), full_bundle = FALSE,
                           asset_paths = NULL, include_assets = TRUE, asset_mode = NULL,
                           minified = FALSE) {
  if (!include_assets) return("")
  if (!is.null(asset_mode)) {
    asset_mode <- match.arg(asset_mode, c("inline", "cdn", "none"))
    if (asset_mode == "none") return("")
    full_bundle <- identical(asset_mode, "inline")
  }
  assets <- cf_assets(renderer, type, renderer_style)
  meta <- .cf_vendor_meta(renderer)
  vendor_inlined <- isTRUE(full_bundle) && !identical(meta$bundle_policy, "cdn-only")
  annotation <- .cf_legal_annotation(renderer, full_bundle, vendor_inlined, minified)
  license_block <- if (vendor_inlined) .cf_vendor_license_block(renderer, minified) else ""
  style_tags <- character()
  script_tags <- character()
  if (!vendor_inlined) {
    style_tags <- sprintf('<link rel="stylesheet" href="%s">', vapply(assets$styles, .cf_html_escape, character(1)))
    script_tags <- sprintf('<script src="%s"></script>', vapply(assets$scripts, .cf_html_escape, character(1)))
  } else {
    get_asset <- function(url, kind) {
      path <- NULL
      if (!is.null(asset_paths) && length(asset_paths)) {
        if (!is.null(names(asset_paths)) && url %in% names(asset_paths)) path <- asset_paths[[url]]
        if (is.null(path)) {
          hit <- match(url, asset_paths)
          if (!is.na(hit)) path <- asset_paths[[hit]]
        }
      }
      code <- if (!is.null(path) && file.exists(path)) paste(readLines(path, warn = FALSE, encoding = "UTF-8"), collapse = "\n") else .cf_fetch_text(url)
      if (identical(kind, "script")) code <- gsub("</script", "<\\/script", code, fixed = TRUE)
      code
    }
    style_tags <- vapply(assets$styles, function(url) sprintf(if (minified) "<style>%s</style>" else "<style>\n%s\n</style>", get_asset(url, "style")), character(1))
    script_tags <- vapply(assets$scripts, function(url) sprintf(if (minified) "<script>%s</script>" else "<script>\n%s\n</script>", get_asset(url, "script")), character(1))
  }
  paste(c(annotation, license_block, style_tags, script_tags), collapse = if (minified) "" else "\n")
}

.cf_runtime_pack_cache <- new.env(parent = emptyenv())

.cf_read_runtime_pack <- function(path) {
  key <- normalizePath(path, winslash = "/", mustWork = TRUE)
  if (exists(key, envir = .cf_runtime_pack_cache, inherits = FALSE)) {
    return(get(key, envir = .cf_runtime_pack_cache, inherits = FALSE))
  }
  con <- gzfile(path, open = "rt", encoding = "UTF-8")
  on.exit(close(con), add = TRUE)
  json <- paste(readLines(con, warn = FALSE, encoding = "UTF-8"), collapse = "\n")
  pack <- jsonlite::fromJSON(json, simplifyVector = FALSE)
  assign(key, pack, envir = .cf_runtime_pack_cache)
  pack
}

.cf_export_runtime_js <- function(renderer, type, minified = FALSE) {
  override <- getOption("chartforge.runtime_override", NULL)
  if (is.null(override)) override <- get0(".chartforge_runtime_override", inherits = TRUE, ifnotfound = NULL)
  if (is.list(override)) {
    key <- paste(renderer, type, if (minified) "min" else "readable", sep = "/")
    override <- override[[key]] %||% override[[paste(renderer, type, sep = "/")]]
  }
  if (is.character(override) && length(override) == 1L && nzchar(override)) return(override)

  mode <- if (isTRUE(minified)) "minified" else "readable"
  pack_filename <- paste0("runtime-", mode, ".json.gz")
  roots <- c(
    get0(".chartforge_runtime_root", inherits = TRUE, ifnotfound = ""),
    getOption("chartforge.runtime_root", ""),
    file.path(getwd(), "inst", "app", "assets")
  )
  roots <- unique(roots[nzchar(roots)])
  pack_paths <- unique(c(
    file.path(roots, pack_filename),
    file.path(dirname(roots), pack_filename)
  ))
  installed <- system.file("app", "assets", pack_filename, package = "chartforge", mustWork = FALSE)
  if (nzchar(installed)) pack_paths <- c(pack_paths, installed)
  pack_path <- pack_paths[file.exists(pack_paths)][1L]
  if (length(pack_path) && !is.na(pack_path)) {
    pack <- .cf_read_runtime_pack(pack_path)
    source <- pack[[renderer]][[type]] %||% NULL
    if (is.character(source) && length(source) == 1L && nzchar(source)) return(source)
  }

  # Compatibility fallback for development trees made by ChartForge <= 0.6.2.
  filename <- paste0(type, if (isTRUE(minified)) ".min.js" else ".js")
  legacy_paths <- file.path(roots, renderer, filename)
  legacy_installed <- system.file("app", "assets", "runtime", renderer, filename, package = "chartforge", mustWork = FALSE)
  if (nzchar(legacy_installed)) legacy_paths <- c(legacy_paths, legacy_installed)
  legacy <- legacy_paths[file.exists(legacy_paths)][1L]
  if (length(legacy) && !is.na(legacy)) {
    return(paste(readLines(legacy, warn = FALSE, encoding = "UTF-8"), collapse = if (minified) "" else "\n"))
  }

  fallback_paths <- c(
    getOption("chartforge.runtime_source", ""),
    file.path(getwd(), "scripts", "export-runtime.js")
  )
  fallback <- fallback_paths[nzchar(fallback_paths) & file.exists(fallback_paths)][1L]
  if (!length(fallback) || is.na(fallback)) {
    stop("ChartForge rendering runtime pack was not found. Reinstall ChartForge or rebuild the runtime packs.", call. = FALSE)
  }
  warning("A selected ChartForge runtime bundle was not found; using the build-tree development runtime.", call. = FALSE)
  paste(readLines(fallback, warn = FALSE, encoding = "UTF-8"), collapse = if (minified) "" else "\n")
}

.cf_core_css <- function(minified = FALSE) {
  x <- c(
    ".cf-chartforge{box-sizing:border-box;display:block;overflow:auto;font-family:var(--cf-font,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif)}",
    ".cf-chart{box-sizing:border-box;display:block;position:relative}",
    ".cf-chart svg,.cf-chart canvas{display:block;max-width:none}",
    ".cf-error{box-sizing:border-box;border:1px solid #fecdd3;background:#fff1f2;color:#9f1239;border-radius:14px;padding:16px;line-height:1.5;font:500 14px/1.5 var(--cf-font,Inter,ui-sans-serif,system-ui,sans-serif);white-space:pre-wrap}"
  )
  paste(x, collapse = if (isTRUE(minified)) "" else "\n")
}

.cf_page_css <- function(minified = FALSE) {
  x <- c(
    "html,body{margin:0;padding:0;min-height:100%;font-family:var(--cf-font,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif)}",
    ".cf-page{min-height:100vh;box-sizing:border-box;padding:24px;overflow:auto;background:var(--cf-bg);color:var(--cf-text)}",
    ".cf-card{box-sizing:border-box;width:var(--cf-width);margin:0 auto;border:1px solid rgba(125,145,170,.24);border-radius:20px;background:var(--cf-panel);box-shadow:0 18px 55px rgba(15,23,42,.13);padding:16px;overflow:auto}",
    .cf_core_css(minified)
  )
  paste(x, collapse = if (isTRUE(minified)) "" else "\n")
}

.cf_spec <- function(renderer, type, x, y, group, label, sort_by, sort_desc,
                     title, subtitle, width, height, theme, palette,
                     marker_size, bins, caption, full_bundle, embed, minified, aggregate,
                     legend, legend_position, text_size, title_size, subtitle_size,
                     axis_text_size, dpi, font_family, decimal_mark, grid, tooltip,
                     animation, renderer_style, renderer_options, highcharts_options,
                     plotly_layout, plotly_config, vega_config, chartjs_options,
                     echarts_options, apexcharts_options, google_options,
                     amcharts_options, vchart_options, anychart_options,
                     billboard_options, ...) {
  th <- .cf_theme(theme)
  opts <- list(...)
  opts$aggregate <- aggregate
  opts$renderer_options <- .cf_as_list(renderer_options, "renderer_options")
  opts$highcharts_options <- .cf_as_list(highcharts_options, "highcharts_options")
  opts$plotly_layout <- .cf_as_list(plotly_layout, "plotly_layout")
  opts$plotly_config <- .cf_as_list(plotly_config, "plotly_config")
  opts$vega_config <- .cf_as_list(vega_config, "vega_config")
  opts$chartjs_options <- .cf_as_list(chartjs_options, "chartjs_options")
  opts$echarts_options <- .cf_as_list(echarts_options, "echarts_options")
  opts$apexcharts_options <- .cf_as_list(apexcharts_options, "apexcharts_options")
  opts$google_options <- .cf_as_list(google_options, "google_options")
  opts$amcharts_options <- .cf_as_list(amcharts_options, "amcharts_options")
  opts$vchart_options <- .cf_as_list(vchart_options, "vchart_options")
  opts$anychart_options <- .cf_as_list(anychart_options, "anychart_options")
  opts$billboard_options <- .cf_as_list(billboard_options, "billboard_options")
  list(
    library = renderer,
    chartType = type,
    mappings = list(x = x, y = y, group = group, label = unname(label), sortBy = unname(sort_by)),
    sortDesc = rep_len(as.logical(sort_desc), max(1L, length(sort_by))),
    title = title %||% "ChartForge chart",
    subtitle = subtitle %||% "",
    width = as.integer(width %||% 840L),
    height = as.integer(height %||% 480L),
    theme = theme,
    themeValues = th,
    palette = unname(palette),
    markerSize = as.numeric(marker_size %||% 8),
    bins = as.integer(bins %||% 12L),
    caption = caption %||% "",
    fullBundle = isTRUE(full_bundle),
    vendorBundlePolicy = .cf_vendor_meta(renderer)$bundle_policy,
    vendorAssetsInlined = isTRUE(full_bundle) && !identical(.cf_vendor_meta(renderer)$bundle_policy, "cdn-only"),
    embed = isTRUE(embed),
    minified = isTRUE(minified),
    aggregate = aggregate,
    legend = .cf_legend_value(legend),
    legendPosition = .cf_legend_position(legend_position),
    textSize = as.numeric(text_size %||% 13),
    titleSize = as.numeric(title_size %||% 22),
    subtitleSize = as.numeric(subtitle_size %||% 13),
    axisTextSize = as.numeric(axis_text_size %||% 11),
    dpi = as.numeric(dpi %||% 1),
    fontFamily = font_family %||% "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    decimalMark = decimal_mark,
    grid = isTRUE(grid),
    tooltip = isTRUE(tooltip),
    animation = isTRUE(animation),
    rendererStyle = .cf_merge_flat(.cf_style_defaults(renderer), renderer_style),
    options = opts
  )
}

.cf_id <- function(prefix = "cf") {
  paste0(prefix, "-", paste(sample(c(letters, 0:9), 12, replace = TRUE), collapse = ""))
}

.cf_html_output <- function(data, spec, renderer, type, title = NULL, height = 480,
                            theme = "aurora", full_bundle = FALSE, embed = TRUE,
                            minified = FALSE, asset_paths = NULL, include_assets = TRUE,
                            asset_mode = NULL) {
  th <- .cf_theme(theme)
  assets <- .cf_asset_tags(
    renderer, type, renderer_style = spec$rendererStyle,
    full_bundle = full_bundle, asset_paths = asset_paths,
    include_assets = include_assets, asset_mode = asset_mode,
    minified = minified
  )
  data_json <- .cf_json_script(.cf_json(data))
  spec_json <- .cf_json_script(.cf_json(spec))
  runtime <- gsub("</script", "<\\/script", .cf_export_runtime_js(renderer, type, minified), fixed = TRUE)
  font_tags <- .cf_font_tags(spec$fontFamily)
  title <- title %||% spec$title %||% "ChartForge chart"
  width_px <- as.integer(spec$width %||% 840L)
  height_px <- as.integer(spec$height %||% height %||% 480L)
  chart_id <- .cf_id("cf-chart")
  data_id <- .cf_id("cf-data")
  spec_id <- .cf_id("cf-spec")
  css <- if (isTRUE(embed)) .cf_core_css(minified) else .cf_page_css(minified)
  render_call <- sprintf('ChartForgeRender.renderFromScripts("%s","%s","%s");', data_id, spec_id, chart_id)
  join <- if (isTRUE(minified)) "" else "\n"

  if (isTRUE(embed)) {
    pieces <- c(
      paste0("<style>", if (minified) "" else "\n", css, if (minified) "" else "\n", "</style>"),
      font_tags,
      assets,
      sprintf('<div class="cf-chartforge" style="--cf-font:%s;width:%dpx"><div id="%s" class="cf-chart" role="img" aria-label="Generated chart" style="width:%dpx;height:%dpx;min-height:%dpx"></div></div>',
              .cf_html_escape(spec$fontFamily), width_px, chart_id, width_px, height_px, height_px),
      sprintf('<script type="application/json" id="%s">%s</script>', data_id, data_json),
      sprintf('<script type="application/json" id="%s">%s</script>', spec_id, spec_json),
      paste0("<script>", if (minified) "" else "\n", runtime, if (minified) "" else "\n", "</script>"),
      paste0("<script>(function(){", render_call, "})();</script>")
    )
    return(paste(pieces[nzchar(pieces)], collapse = join))
  }

  root_css <- sprintf(":root{--cf-bg:%s;--cf-panel:%s;--cf-text:%s;--cf-grid:%s;--cf-muted:%s;--cf-width:%dpx;--cf-font:%s}",
                      th$bg, th$panel, th$text, th$grid, th$muted, width_px, spec$fontFamily)
  pieces <- c(
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    paste0("<title>", .cf_html_escape(title), "</title>"),
    paste0("<style>", root_css, if (minified) "" else "\n", css, "</style>"),
    font_tags,
    assets,
    "</head>",
    "<body>",
    '<main class="cf-page"><section class="cf-card">',
    sprintf('<div id="%s" class="cf-chart" role="img" aria-label="Generated chart" style="width:%dpx;height:%dpx;min-height:%dpx"></div>', chart_id, width_px, height_px, height_px),
    "</section></main>",
    sprintf('<script type="application/json" id="%s">%s</script>', data_id, data_json),
    sprintf('<script type="application/json" id="%s">%s</script>', spec_id, spec_json),
    paste0("<script>", if (minified) "" else "\n", runtime, if (minified) "" else "\n", "</script>"),
    paste0("<script>(function(){", render_call, "})();</script>"),
    "</body>",
    "</html>"
  )
  paste(pieces[nzchar(pieces)], collapse = join)
}

#' Build a chart HTML string
#'
#' Programmatic renderer used by all `cf_<renderer>_<type>()` wrappers.
#'
#' @param data A data frame or matrix.
#' @param renderer Renderer id from [chart_libraries()].
#' @param type Chart type from [chart_types()].
#' @param x,y,group Column names used for x, y, and optional grouping.
#' @param label Zero, one, or several column names combined into clean hover labels.
#'   Columns already mapped to x, y, or group are omitted from the label to avoid duplication.
#' @param sort_by Optional column name or names used to sort rows before rendering.
#' @param sort_desc Logical value or vector controlling descending sort order.
#' @param title,subtitle Text displayed above or inside the chart.
#' @param width,height Exact chart dimensions in CSS pixels.
#' @param theme Theme id from [cf_themes()].
#' @param palette Character vector of CSS colour values.
#' @param marker_size Marker radius for point charts.
#' @param bins Target number of touching bins for histograms; for density plots it controls the evaluation-grid resolution.
#' @param aggregate Aggregation used by summary chart types when `y` is supplied.
#' @param caption Optional caption saved into the generated specification.
#' @param full_bundle If `TRUE`, ChartForge inlines vendor JavaScript/CSS only
#'   for renderers whose terms permit redistribution, and includes the relevant
#'   licence text. Highcharts, ApexCharts, Google Charts, and AnyChart remain
#'   CDN-linked even when this is `TRUE`; the HTML records that legal safeguard.
#'   If `FALSE`, compact CDN tags are emitted for every renderer.
#' @param embed If `TRUE`, return a minimal embeddable fragment. If `FALSE`, return
#'   a complete HTML document.
#' @param minified If `TRUE`, use a minified chart runtime and compact HTML/CSS/JS.
#'   The default `FALSE` keeps the selected runtime human-readable.
#' @param legend Legend mode: `"auto"`, `"show"`, or `"hide"`; logical values are accepted.
#' @param legend_position Legend location.
#' @param text_size,title_size,subtitle_size,axis_text_size Typography sizes in pixels.
#' @param dpi Chart.js rendering scale (device-pixel ratio), from 1 to 3. Other renderers ignore this value.
#' @param font_family CSS font-family string.
#' @param decimal_mark Decimal dot or comma for rendered numeric labels.
#' @param grid,tooltip,animation Global feature toggles.
#' @param renderer_style Named list of renderer-specific, user-friendly style values.
#'   See [cf_renderer_styles()].
#' @param renderer_options,highcharts_options,plotly_layout,plotly_config,vega_config,chartjs_options,echarts_options,apexcharts_options,google_options,amcharts_options,vchart_options,anychart_options,billboard_options Advanced option lists.
#' @param asset_paths Optional named character vector of local asset files used when `full_bundle = TRUE` and the selected renderer permits inlining.
#' @param asset_mode Deprecated compatibility option: `"inline"`, `"cdn"`, or `"none"`.
#' @param ... Additional values saved into the generated specification.
#' @return A single HTML/CSS/JavaScript character string.
#' @export
cf_chart_html <- function(data,
                          renderer = "highcharts",
                          type = "scatter",
                          x = NULL,
                          y = NULL,
                          group = NULL,
                          label = NULL,
                          sort_by = NULL,
                          sort_desc = FALSE,
                          title = "ChartForge chart",
                          subtitle = NULL,
                          width = 840,
                          height = 480,
                          theme = .cf_theme_names,
                          palette = cf_palette("studio"),
                          marker_size = 8,
                          bins = 12,
                          aggregate = c("sum", "mean", "count"),
                          caption = NULL,
                          full_bundle = FALSE,
                          embed = TRUE,
                          minified = FALSE,
                          legend = c("auto", "show", "hide"),
                          legend_position = c("bottom", "right", "top", "left", "none"),
                          text_size = 13,
                          title_size = 22,
                          subtitle_size = 13,
                          axis_text_size = 11,
                          dpi = 1,
                          font_family = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                          decimal_mark = c(".", ","),
                          grid = TRUE,
                          tooltip = TRUE,
                          animation = TRUE,
                          renderer_style = list(),
                          renderer_options = list(),
                          highcharts_options = list(),
                          plotly_layout = list(),
                          plotly_config = list(),
                          vega_config = list(),
                          chartjs_options = list(),
                          echarts_options = list(),
                          apexcharts_options = list(),
                          google_options = list(),
                          amcharts_options = list(),
                          vchart_options = list(),
                          anychart_options = list(),
                          billboard_options = list(),
                          asset_paths = NULL,
                          asset_mode = NULL,
                          ...) {
  data <- .cf_check_data(data)
  renderer <- match.arg(renderer, .cf_renderer_ids)
  type <- match.arg(type, .cf_chart_type_ids)
  theme <- match.arg(as.character(theme)[1L], .cf_theme_names)
  aggregate <- match.arg(as.character(aggregate)[1L], c("sum", "mean", "count"))
  legend <- if (is.logical(legend)) .cf_legend_value(legend) else match.arg(as.character(legend)[1L], c("auto", "show", "hide"))
  legend_position <- match.arg(as.character(legend_position)[1L], c("bottom", "right", "top", "left", "none"))
  decimal_mark <- match.arg(as.character(decimal_mark)[1L], c(".", ","))
  width <- as.integer(width)
  height <- as.integer(height)
  if (length(width) != 1L || is.na(width) || width < 120L) stop("'width' must be at least 120 pixels.", call. = FALSE)
  if (length(height) != 1L || is.na(height) || height < 120L) stop("'height' must be at least 120 pixels.", call. = FALSE)
  for (arg in c("text_size", "title_size", "subtitle_size", "axis_text_size")) {
    value <- get(arg, inherits = FALSE)
    if (!is.numeric(value) || length(value) != 1L || !is.finite(value) || value <= 0) stop("'", arg, "' must be a positive number.", call. = FALSE)
  }
  dpi <- as.numeric(dpi)
  if (length(dpi) != 1L || !is.finite(dpi) || dpi < 1 || dpi > 3) stop("'dpi' must be a Chart.js rendering scale from 1 to 3.", call. = FALSE)
  if (!is.character(palette) || !length(palette) || any(!nzchar(palette))) stop("'palette' must contain CSS colour strings.", call. = FALSE)
  marker_size <- as.numeric(marker_size)
  if (length(marker_size) != 1L || !is.finite(marker_size) || marker_size <= 0) stop("'marker_size' must be a positive number.", call. = FALSE)
  bins <- as.integer(bins)
  if (length(bins) != 1L || is.na(bins) || bins < 2L || bins > 100L) stop("'bins' must be an integer from 2 to 100.", call. = FALSE)
  renderer_style <- .cf_as_list(renderer_style, "renderer_style")
  if (!is.null(asset_mode)) {
    asset_mode <- match.arg(asset_mode, c("inline", "cdn", "none"))
    if (identical(asset_mode, "inline")) full_bundle <- TRUE
    if (identical(asset_mode, "cdn")) full_bundle <- FALSE
  }
  mapping <- .cf_validate_mapping(data, type, x, y, group, label, sort_by)
  data <- .cf_sort_data(data, mapping$sort_by, sort_desc)
  spec <- .cf_spec(
    renderer, type, mapping$x, mapping$y, mapping$group, mapping$label,
    mapping$sort_by, sort_desc, title, subtitle, width, height, theme,
    palette, marker_size, bins, caption, full_bundle, embed, minified, aggregate,
    legend, legend_position, text_size, title_size, subtitle_size, axis_text_size,
    dpi, font_family, decimal_mark, grid, tooltip, animation, renderer_style,
    renderer_options, highcharts_options, plotly_layout, plotly_config,
    vega_config, chartjs_options, echarts_options, apexcharts_options,
    google_options, amcharts_options, vchart_options, anychart_options,
    billboard_options, ...
  )
  .cf_html_output(
    data, spec, renderer, type, title = title, height = height, theme = theme,
    full_bundle = full_bundle, embed = embed, minified = minified,
    asset_paths = asset_paths, include_assets = !identical(asset_mode, "none"),
    asset_mode = asset_mode
  )
}

#' Backwards-compatible alias for cf_chart_html()
#'
#' @inheritParams cf_chart_html
#' @param library Alias for `renderer`.
#' @return A single HTML/CSS/JavaScript character string.
#' @export
chart_html <- function(data, x = NULL, y = NULL, group = NULL, label = NULL,
                       sort_by = NULL, sort_desc = FALSE, type = "scatter",
                       library = "highcharts", renderer = library, ...) {
  cf_chart_html(data = data, renderer = renderer, type = type, x = x, y = y,
                group = group, label = label, sort_by = sort_by,
                sort_desc = sort_desc, ...)
}

#' Save a ChartForge HTML string
#'
#' @param html A character scalar returned by a ChartForge renderer.
#' @param file Output HTML file path.
#' @return The normalized output file path, invisibly.
#' @export
cf_save_html <- function(html, file = "chartforge-chart.html") {
  if (!is.character(html) || length(html) != 1L || !nzchar(html)) stop("'html' must be a non-empty character scalar.", call. = FALSE)
  dir <- dirname(file)
  if (nzchar(dir) && !dir.exists(dir)) dir.create(dir, recursive = TRUE, showWarnings = FALSE)
  writeLines(html, con = file, useBytes = TRUE)
  invisible(normalizePath(file, winslash = "/", mustWork = FALSE))
}

.cf_make_wrapper <- function(renderer, type) {
  force(renderer)
  force(type)
  function(data,
           x = NULL,
           y = NULL,
           group = NULL,
           label = NULL,
           sort_by = NULL,
           sort_desc = FALSE,
           title = "ChartForge chart",
           subtitle = NULL,
           width = 840,
           height = 480,
           theme = .cf_theme_names,
           palette = cf_palette("studio"),
           marker_size = 8,
           bins = 12,
           aggregate = c("sum", "mean", "count"),
           caption = NULL,
           full_bundle = FALSE,
           embed = TRUE,
           minified = FALSE,
           legend = c("auto", "show", "hide"),
           legend_position = c("bottom", "right", "top", "left", "none"),
           text_size = 13,
           title_size = 22,
           subtitle_size = 13,
           axis_text_size = 11,
           dpi = 1,
           font_family = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
           decimal_mark = c(".", ","),
           grid = TRUE,
           tooltip = TRUE,
           animation = TRUE,
           renderer_style = list(),
           renderer_options = list(),
           highcharts_options = list(),
           plotly_layout = list(),
           plotly_config = list(),
           vega_config = list(),
           chartjs_options = list(),
           echarts_options = list(),
           apexcharts_options = list(),
           google_options = list(),
           amcharts_options = list(),
           vchart_options = list(),
           anychart_options = list(),
           billboard_options = list(),
           asset_paths = NULL,
           asset_mode = NULL,
           ...) {
    cf_chart_html(
      data = data, renderer = renderer, type = type, x = x, y = y,
      group = group, label = label, sort_by = sort_by, sort_desc = sort_desc,
      title = title, subtitle = subtitle, width = width, height = height,
      theme = theme, palette = palette, marker_size = marker_size, bins = bins,
      aggregate = aggregate, caption = caption, full_bundle = full_bundle,
      embed = embed, minified = minified, legend = legend,
      legend_position = legend_position, text_size = text_size,
      title_size = title_size, subtitle_size = subtitle_size,
      axis_text_size = axis_text_size, dpi = dpi, font_family = font_family,
      decimal_mark = decimal_mark, grid = grid, tooltip = tooltip,
      animation = animation, renderer_style = renderer_style,
      renderer_options = renderer_options, highcharts_options = highcharts_options,
      plotly_layout = plotly_layout, plotly_config = plotly_config,
      vega_config = vega_config, chartjs_options = chartjs_options,
      echarts_options = echarts_options, apexcharts_options = apexcharts_options,
      google_options = google_options, amcharts_options = amcharts_options,
      vchart_options = vchart_options, anychart_options = anychart_options,
      billboard_options = billboard_options, asset_paths = asset_paths,
      asset_mode = asset_mode, ...
    )
  }
}

for (.cf_renderer in .cf_renderer_ids) {
  for (.cf_type in .cf_chart_type_ids) {
    assign(paste0("cf_", .cf_renderer, "_", .cf_type),
           .cf_make_wrapper(.cf_renderer, .cf_type), envir = environment())
  }
}
rm(.cf_renderer, .cf_type)

for (.cf_type in .cf_chart_type_ids) {
  assign(paste0("cf_google_", .cf_type),
         get(paste0("cf_googlecharts_", .cf_type), envir = environment()),
         envir = environment())
}
rm(.cf_type)
