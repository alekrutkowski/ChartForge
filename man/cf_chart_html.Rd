\name{cf_chart_html}
\alias{cf_chart_html}
\alias{chart_html}
\alias{cf_palette}
\alias{cf_palettes}
\alias{cf_themes}
\alias{cf_assets}
\alias{cf_get_data}
\title{Build a chart HTML string}
\usage{
cf_chart_html(data, renderer = "highcharts", type = "scatter", x = NULL,
  y = NULL, group = NULL, label = NULL, sort_by = NULL,
  sort_desc = FALSE, title = "ChartForge chart", subtitle = NULL,
  width = 840, height = 480, theme = cf_themes(),
  palette = cf_palette("studio"), marker_size = 8, bins = 12,
  aggregate = c("sum", "mean", "count"), caption = NULL,
  full_bundle = FALSE, embed = TRUE, minified = FALSE,
  legend = c("auto", "show", "hide"),
  legend_position = c("bottom", "right", "top", "left", "none"),
  text_size = 13, title_size = 22, subtitle_size = 13,
  axis_text_size = 11, dpi = 1,
  font_family = "Inter, ui-sans-serif, system-ui",
  decimal_mark = c(".", ","), grid = TRUE, tooltip = TRUE,
  animation = TRUE, renderer_style = list(), renderer_options = list(),
  highcharts_options = list(), plotly_layout = list(),
  plotly_config = list(), vega_config = list(),
  chartjs_options = list(), echarts_options = list(),
  apexcharts_options = list(), google_options = list(),
  amcharts_options = list(), vchart_options = list(),
  anychart_options = list(), billboard_options = list(),
  asset_paths = NULL, asset_mode = NULL, ...)

chart_html(data, x = NULL, y = NULL, group = NULL, label = NULL,
  sort_by = NULL, sort_desc = FALSE, type = "scatter",
  library = "highcharts", renderer = library, ...)

cf_palette(name = cf_palettes())
cf_palettes()
cf_themes()
cf_fonts()
cf_assets(renderer, type = "scatter", renderer_style = list())
cf_get_data(name, env = parent.frame())
}
\arguments{
\item{data}{A data frame or matrix.}
\item{renderer}{Renderer identifier from \code{chart_libraries()}.}
\item{type}{Chart type from \code{chart_types()}.}
\item{x, y, group}{Single column-name strings used for chart mappings.}
\item{label}{A character vector of zero or more columns combined into per-point hover details. Columns already mapped to x, y, or group are omitted from the extra label text.}
\item{sort_by}{A character vector of columns used for stable sorting before rendering.}
\item{sort_desc}{A logical value or vector recycled to the length of \code{sort_by}.}
\item{title, subtitle, caption}{Text metadata.}
\item{width, height}{Exact chart dimensions in CSS pixels.}
\item{theme}{Theme identifier from \code{cf_themes()}.}
\item{palette}{A vector of CSS colour values.}
\item{marker_size}{Marker radius for point charts.}
\item{bins}{Target number of touching histogram bins; for density plots, controls the evaluation-grid resolution.}
\item{aggregate}{Aggregation used by summary chart types.}
\item{full_bundle}{If \code{TRUE}, vendor JavaScript/CSS is inlined only for renderers whose terms permit redistribution, and the applicable licence/notice text is included in the HTML. Highcharts, ApexCharts, Google Charts, and AnyChart remain CDN-linked even when this is \code{TRUE}; a legal annotation records that safeguard. If \code{FALSE}, compact CDN tags are emitted for every renderer.}
\item{embed}{If \code{TRUE}, return an embeddable HTML fragment. If \code{FALSE}, return a complete HTML page.}
\item{minified}{If \code{TRUE}, emit compact HTML/CSS/JavaScript and use the minified renderer-by-chart-type runtime. The default keeps the selected runtime human-readable.}
\item{legend, legend_position}{Legend visibility and placement. Logical values are accepted for \code{legend}.}
\item{text_size, title_size, subtitle_size, axis_text_size}{Typography sizes in CSS pixels.}
\item{dpi}{Chart.js rendering scale (device-pixel ratio), from 1 to 3. Other renderers ignore this value.}
\item{font_family}{A CSS font-family string. Use \code{cf_fonts()} for the app's Google Font choices.}
\item{decimal_mark}{Decimal separator for rendered numeric labels and tooltips: \code{"."} or \code{","}.}
\item{grid, tooltip, animation}{Logical toggles for common chart features.}
\item{renderer_style}{A named list of friendly renderer-specific style values. See \code{cf_renderer_styles()}.}
\item{renderer_options}{A generic advanced option list merged into the selected renderer configuration.}
\item{highcharts_options, plotly_layout, plotly_config, vega_config, chartjs_options, echarts_options, apexcharts_options, google_options, amcharts_options, vchart_options, anychart_options, billboard_options}{Advanced native option lists merged into the selected library configuration where supported.}
\item{asset_paths}{Optional named local asset files used when \code{full_bundle = TRUE} and the selected renderer's bundle policy permits inlining. They are ignored for CDN-only renderers.}
\item{asset_mode}{Deprecated compatibility option.}
\item{library}{Alias for \code{renderer}.}
\item{name}{A palette name or an R data-object name for \code{cf_get_data()}.}
\item{env}{Environment searched first by \code{cf_get_data()}.}
\item{...}{Additional values stored in the generated specification.}
}
\value{A single character string containing an embeddable HTML fragment or complete HTML document, or helper metadata for the utility functions.}
\description{Programmatic renderer used by all ChartForge wrapper functions. The output includes a renderer-specific third-party notice. CDN mode uses a runtime specialized to the selected renderer and chart type; unrelated renderer implementations are not included. Full-bundle mode follows the bundle policy reported by \code{chart_libraries()}. The returned string can be saved with \code{cf_save_html()} or embedded in an existing page.}
