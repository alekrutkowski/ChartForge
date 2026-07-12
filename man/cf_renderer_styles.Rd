\name{cf_renderer_styles}
\alias{cf_renderer_styles}
\title{Renderer-specific Style-tab schemas}
\usage{
cf_renderer_styles(renderer = NULL)
}
\arguments{
\item{renderer}{An optional renderer identifier from \code{chart_libraries()}. When omitted, all schemas are returned.}
}
\value{A renderer schema or a named list of all schemas. Each schema contains a title, official documentation URL, description, and friendly control definitions with defaults, choices, groups, and optional chart-type applicability.}
\description{Returns the schema used to generate section 4, Style, in the ChartForge app. Values selected through these controls are passed to \code{renderer_style} in the emitted R code.}
\examples{
cf_renderer_styles("plotly")
cf_renderer_styles("vchart")$doc_url
}
