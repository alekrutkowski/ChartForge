\name{run_app}
\alias{run_app}
\alias{serve_app}
\title{Start ChartForge}
\usage{run_app(host = "127.0.0.1", port = 8788, browse = interactive(), app_dir = chartforge_app_dir(), data_env = parent.frame())
serve_app(host = "127.0.0.1", port = 8788, browse = interactive(), app_dir = chartforge_app_dir(), data_env = parent.frame())}
\arguments{\item{host}{Host interface.}\item{port}{Port number.}\item{browse}{Open the app in the default browser.}\item{app_dir}{Static app directory.}\item{data_env}{Environment searched by the app for data frames and matrices.}}
\value{The running Plumber server, invisibly.}
\description{Starts a local Plumber server that serves the browser app and provides a trusted local R preview endpoint and local R data-object browser.}
