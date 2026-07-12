#' Directory containing the ChartForge browser application
#'
#' @return A character scalar path.
#' @export
chartforge_app_dir <- function() {
  system.file("app", package = "chartforge", mustWork = TRUE)
}

#' Plumber file for ChartForge
#'
#' @return A character scalar path.
#' @export
chartforge_plumber_file <- function() {
  system.file("plumber", "plumber.R", package = "chartforge", mustWork = TRUE)
}

#' Start ChartForge
#'
#' Starts a local Plumber server that serves the browser app and provides a
#' trusted local R evaluation endpoint for previewing the emitted code.
#'
#' @param host Host interface. Defaults to `127.0.0.1`.
#' @param port Port number. Defaults to `8788`.
#' @param browse Open the app in the default browser.
#' @param app_dir Static app directory. Advanced users can point this at a
#'   modified copy of the app.
#' @param data_env Environment searched by the app for data frames and matrices.
#'   Defaults to the environment from which `run_app()` is called.
#' @return The running Plumber server, invisibly.
#' @export
run_app <- function(host = "127.0.0.1", port = 8788, browse = interactive(), app_dir = chartforge_app_dir(), data_env = parent.frame()) {
  if (!requireNamespace("plumber", quietly = TRUE)) {
    stop("Package 'plumber' is required. Install it with install.packages('plumber').", call. = FALSE)
  }
  if (!requireNamespace("jsonlite", quietly = TRUE)) {
    stop("Package 'jsonlite' is required. Install it with install.packages('jsonlite').", call. = FALSE)
  }

  app_dir <- normalizePath(app_dir, winslash = "/", mustWork = TRUE)
  Sys.setenv(CHARTFORGE_APP_DIR = app_dir)
  if (!is.environment(data_env)) stop("'data_env' must be an environment.", call. = FALSE)
  options(chartforge.data_env = data_env)

  pr <- plumber::plumb(chartforge_plumber_file())
  # ChartForge is an application, not an API-documentation session.  Disable
  # Plumber's documentation UI and its IDE/browser callback explicitly so only
  # the ChartForge root page can be opened.
  if (is.function(pr$setDocs)) pr$setDocs(FALSE)
  if (is.function(pr$setDocsCallback)) pr$setDocsCallback(NULL)
  url <- sprintf("http://%s:%s", host, as.integer(port))
  message("ChartForge listening at ", url)
  if (isTRUE(browse)) utils::browseURL(url)
  pr$run(host = host, port = as.integer(port), docs = FALSE, swaggerCallback = function(url) invisible(NULL))
}

#' Alias for run_app()
#'
#' @inheritParams run_app
#' @export
serve_app <- function(host = "127.0.0.1", port = 8788, browse = interactive(), app_dir = chartforge_app_dir(), data_env = parent.frame()) {
  run_app(host = host, port = port, browse = browse, app_dir = app_dir, data_env = data_env)
}
