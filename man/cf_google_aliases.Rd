\name{cf_google_aliases}
\alias{cf_google_scatter}
\alias{cf_google_line}
\alias{cf_google_spline}
\alias{cf_google_step}
\alias{cf_google_bar}
\alias{cf_google_stacked_bar}
\alias{cf_google_area}
\alias{cf_google_stacked_area}
\alias{cf_google_histogram}
\alias{cf_google_density}
\alias{cf_google_pie}
\alias{cf_google_donut}
\alias{cf_google_bubble}
\alias{cf_google_boxplot}
\alias{cf_google_heatmap}
\alias{cf_google_treemap}
\alias{cf_google_lollipop}
\title{Google Charts aliases}
\usage{cf_google_scatter(data, x = NULL, y = NULL, group = NULL, ...)}
\arguments{\item{data}{A data frame.}\item{x, y, group}{Column-name strings.}\item{...}{Passed to the matching \code{cf_googlecharts_*()} function, such as \code{cf_googlecharts_scatter()}.}}
\value{A character scalar containing an HTML fragment or document.}
\description{Convenience aliases for the \code{cf_googlecharts_*()} functions, such as \code{cf_googlecharts_scatter()}.}
