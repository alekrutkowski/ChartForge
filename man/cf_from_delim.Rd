\name{cf_from_delim}
\alias{cf_from_delim}
\alias{cf_from_csv}
\title{Read pasted CSV, TSV, or semicolon-delimited data}
\usage{
cf_from_delim(text, delim = NULL, auto_dates = TRUE,
  decimal_mark = c(".", ","), ...)
cf_from_csv(text, ...)
}
\arguments{
\item{text}{A non-empty character scalar containing delimited text.}
\item{delim}{\code{NULL} for automatic detection, or one of comma, tab, or semicolon. The string \code{"\\t"} is also accepted for tab.}
\item{auto_dates}{If \code{TRUE}, convert unambiguous ISO \code{YYYY-MM-DD} columns to \code{Date} and ISO date-time columns to UTC \code{POSIXct}.}
\item{decimal_mark}{The decimal mark used while parsing numeric fields: \code{"."} or \code{","}.}
\item{...}{Additional arguments passed to \code{utils::read.table()} or, from \code{cf_from_csv()}, to \code{cf_from_delim()}.}
}
\value{A data frame with original column names preserved.}
\description{Imports the same CSV, TSV, and semicolon-delimited text formats accepted by the ChartForge app. Automatic delimiter recognition examines the first non-empty line.}
