# ChartForge local R backend and static app server.
# Intended for trusted local use: the preview endpoint evaluates code emitted
# by the ChartForge browser UI in the R process that launched run_app().

`%||%` <- function(x, y) {
  if (is.null(x) || length(x) == 0L || (length(x) == 1L && is.na(x))) y else x
}

app_dir <- function() {
  configured <- Sys.getenv("CHARTFORGE_APP_DIR", unset = "")
  if (nzchar(configured)) return(normalizePath(configured, winslash = "/", mustWork = FALSE))
  system.file("app", package = "chartforge", mustWork = TRUE)
}

read_utf8 <- function(path) paste(readLines(path, warn = FALSE, encoding = "UTF-8"), collapse = "\n")

json_for_script <- function(value) {
  if (!requireNamespace("jsonlite", quietly = TRUE)) return("null")
  text <- jsonlite::toJSON(value, auto_unbox = TRUE, null = "null", na = "null", digits = NA)
  gsub("</script", "<\\/script", text, fixed = TRUE)
}

inject_local_bootstrap <- function(html) {
  payload <- json_for_script(session_payload())
  tag <- paste0(
    '<script id="chartforge-local-bootstrap" type="application/json">',
    payload,
    '</script>'
  )
  if (grepl("</head>", html, fixed = TRUE)) {
    sub("</head>", paste0(tag, "\n</head>"), html, fixed = TRUE)
  } else {
    paste0(tag, "\n", html)
  }
}

serve_app_file <- function(res, filename, content_type) {
  path <- file.path(app_dir(), filename)
  if (!file.exists(path)) {
    res$status <- 404
    return("")
  }
  res$setHeader("Content-Type", content_type)
  read_utf8(path)
}

registered_data_env <- function() {
  env <- getOption("chartforge.data_env", NULL)
  if (is.environment(env)) env else .GlobalEnv
}

environment_chain <- function() {
  # Search the launching evaluation environment and its user-level parents, but
  # stop before package and base environments. Scanning package namespaces can
  # evaluate active bindings, is unnecessarily slow, and cannot expose the
  # caller's working data objects.
  out <- list()
  add <- function(env) {
    if (!is.environment(env) || identical(env, emptyenv()) || identical(env, baseenv())) return()
    if (!any(vapply(out, identical, logical(1), y = env))) out[[length(out) + 1L]] <<- env
  }
  env <- registered_data_env()
  while (is.environment(env) && !identical(env, emptyenv()) && !identical(env, baseenv())) {
    add(env)
    if (identical(env, .GlobalEnv)) break
    parent <- tryCatch(parent.env(env), error = function(e) emptyenv())
    if (identical(parent, baseenv()) || identical(parent, emptyenv())) break
    env <- parent
  }
  add(.GlobalEnv)
  out
}

safe_environment_value <- function(name, env) {
  if (!is.environment(env) || !exists(name, envir = env, inherits = FALSE)) return(NULL)
  if (tryCatch(bindingIsActive(name, env), error = function(e) FALSE)) return(NULL)
  tryCatch(get(name, envir = env, inherits = FALSE), error = function(e) NULL)
}

find_data_object <- function(name) {
  for (env in environment_chain()) {
    value <- safe_environment_value(name, env)
    if (is.data.frame(value) || is.matrix(value)) return(list(value = value, env = env))
  }
  NULL
}

as_chartforge_frame <- function(x) {
  if (is.matrix(x)) x <- as.data.frame(x, stringsAsFactors = FALSE, check.names = FALSE)
  if (!is.data.frame(x)) stop("Selected object is not a data frame or matrix.", call. = FALSE)
  as.data.frame(x, stringsAsFactors = FALSE, check.names = FALSE)
}

scalar_for_json <- function(value) {
  if (inherits(value, "Date")) return(as.character(value))
  if (inherits(value, "POSIXt")) return(format(value, "%Y-%m-%dT%H:%M:%OS%z", tz = "UTC"))
  if (is.factor(value)) return(as.character(value))
  if (is.null(value) || !length(value)) return(NA_character_)
  if (length(value) != 1L) return(paste(as.character(value), collapse = " | "))
  value
}

to_row_records <- function(df) {
  if (!nrow(df)) return(list())
  lapply(seq_len(nrow(df)), function(i) {
    row <- lapply(df, function(column) scalar_for_json(column[[i]]))
    names(row) <- names(df)
    row
  })
}

column_profile <- function(x) {
  non_missing <- x[!is.na(x)]
  unique_count <- length(unique(non_missing))
  factor_like <- is.factor(x) || is.ordered(x)
  numeric_like <- is.numeric(x) || is.integer(x)
  integer_like <- numeric_like && length(non_missing) > 0L && all(is.finite(non_missing)) && all(abs(non_missing - round(non_missing)) < sqrt(.Machine$double.eps))
  low_cardinality_integer <- integer_like && unique_count <= 5L
  categorical <- factor_like || is.logical(x) || is.character(x) || low_cardinality_integer
  reason <- if (factor_like) {
    "R factor"
  } else if (is.logical(x)) {
    "logical variable"
  } else if (is.character(x)) {
    "text variable"
  } else if (low_cardinality_integer) {
    sprintf("integer with %d unique value%s", unique_count, if (unique_count == 1L) "" else "s")
  } else {
    NULL
  }
  kind <- if (inherits(x, "POSIXt")) {
    "datetime"
  } else if (inherits(x, "Date")) {
    "date"
  } else if (factor_like || low_cardinality_integer) {
    "category"
  } else if (numeric_like) {
    "number"
  } else if (is.logical(x)) {
    "logical"
  } else {
    "text"
  }
  list(
    kind = kind,
    numeric = numeric_like && !factor_like,
    categorical = categorical,
    categorical_reason = reason,
    unique_count = unique_count
  )
}

column_kind <- function(x) column_profile(x)$kind

list_data_objects <- function() {
  seen <- character()
  rows <- list()
  for (env in environment_chain()) {
    object_names <- tryCatch(ls(envir = env, all.names = FALSE), error = function(e) character())
    for (name in object_names) {
      if (name %in% seen) next
      seen <- c(seen, name)
      value <- safe_environment_value(name, env)
      if (!is.data.frame(value) && !is.matrix(value)) next
      rows[[length(rows) + 1L]] <- list(
        name = name,
        type = if (is.matrix(value)) "matrix" else "data.frame",
        rows = NROW(value),
        columns = NCOL(value),
        class = paste(class(value), collapse = "/")
      )
    }
  }
  if (!length(rows)) return(list())
  rows[order(tolower(vapply(rows, `[[`, character(1), "name")))]
}

session_payload <- function() {
  list(
    ok = TRUE,
    app = "ChartForge",
    backend = "local R",
    r_version = R.version.string,
    app_dir = app_dir(),
    data_objects = list_data_objects()
  )
}

data_object_payload <- function(res, name = "", max_rows = 5000) {
  found <- if (nzchar(name)) find_data_object(name) else NULL
  if (is.null(found)) {
    res$status <- 404
    return(list(ok = FALSE, error = paste0("Data object not found: ", name)))
  }
  object <- found$value
  df <- as_chartforge_frame(object)
  max_rows <- suppressWarnings(as.integer(max_rows %||% 5000L))
  if (length(max_rows) != 1L || is.na(max_rows) || max_rows <= 0L) max_rows <- 5000L
  shown <- utils::head(df, max_rows)
  columns <- lapply(names(df), function(column) {
    value <- df[[column]]
    profile <- column_profile(value)
    c(list(name = column, class = paste(class(value), collapse = "/")), profile)
  })
  list(
    ok = TRUE,
    name = name,
    rows = to_row_records(shown),
    columns = columns,
    nrows = nrow(df),
    ncols = ncol(df),
    truncated = nrow(df) > max_rows,
    source = if (is.matrix(object)) "matrix" else "data.frame"
  )
}

#* @filter chartforge_headers
function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type")
  # WebR is started explicitly with its PostMessage channel. Cross-origin
  # isolation is therefore unnecessary and would make third-party chart CDN
  # assets more fragile in the preview iframe.
  if (startsWith(req$PATH_INFO %||% "", "/api/")) res$setHeader("Cache-Control", "no-store")
  if (identical(req$REQUEST_METHOD, "OPTIONS")) return(list(ok = TRUE))
  plumber::forward()
}

#* ChartForge browser app
#* @get /
#* @serializer html
function(res) {
  path <- file.path(app_dir(), "index.html")
  if (!file.exists(path)) {
    res$status <- 404
    return("<h1>ChartForge</h1><p>The installed browser app was not found.</p>")
  }
  inject_local_bootstrap(read_utf8(path))
}

#* ChartForge service worker
#* @get /coi-serviceworker.js
#* @serializer contentType list(type="application/javascript; charset=utf-8")
function(res) serve_app_file(res, "coi-serviceworker.js", "application/javascript; charset=utf-8")

#* ChartForge favicon
#* @get /favicon.svg
#* @serializer contentType list(type="image/svg+xml")
function(res) serve_app_file(res, "favicon.svg", "image/svg+xml")

#* One-call local-session handshake, including visible R data objects.
#* @serializer unboxedJSON
#* @get /api/session
function() session_payload()

#* POST fallback for environments where a stale static GET route masks the API.
#* @serializer unboxedJSON
#* @post /api/session
function() session_payload()

#* A second handshake path used by the browser when proxies or stale service
#* workers interfere with a previously cached /api/session response.
#* @serializer unboxedJSON
#* @get /api/bootstrap
function() session_payload()

#* @serializer unboxedJSON
#* @post /api/bootstrap
function() session_payload()

#* Compatibility health endpoint.
#* @serializer unboxedJSON
#* @get /health
function() {
  list(ok = TRUE, app = "ChartForge", backend = "local R", r_version = R.version.string)
}

#* List data frames and matrices visible from the launching R environment.
#* @serializer unboxedJSON
#* @get /api/data-objects
function() list(ok = TRUE, objects = list_data_objects())

#* Return rows and column metadata for a selected data frame or matrix.
#* @serializer unboxedJSON
#* @get /api/data-object
function(res, name = "", max_rows = 5000) data_object_payload(res, name, max_rows)

#* POST fallback for importing an R object.
#* @serializer unboxedJSON
#* @post /api/data-object
function(req, res) {
  payload <- if (requireNamespace("jsonlite", quietly = TRUE)) {
    tryCatch(jsonlite::fromJSON(req$postBody %||% "{}", simplifyVector = TRUE), error = function(e) list())
  } else list()
  data_object_payload(res, as.character(payload$name %||% ""), payload$max_rows %||% 5000)
}

#* POST fallback for listing data frames and matrices.
#* @serializer unboxedJSON
#* @post /api/data-objects
function() list(ok = TRUE, objects = list_data_objects())

strip_chartforge_package_calls <- function(code) {
  code <- gsub("(?m)^\\s*(library|require)\\(\\s*['\"]?chartforge['\"]?\\s*\\)\\s*;?\\s*$", "", code, perl = TRUE)
  gsub("chartforge::", "", code, fixed = TRUE)
}

prepare_eval_environment <- function() {
  env <- new.env(parent = registered_data_env())
  runtime_root <- file.path(app_dir(), "assets")
  license_root <- file.path(app_dir(), "licenses")
  assign(".chartforge_runtime_root", runtime_root, envir = env)
  assign(".chartforge_license_root", license_root, envir = env)
  options(chartforge.runtime_root = runtime_root, chartforge.license_root = license_root)
  runtime <- file.path(app_dir(), "assets", "chartforge-r-runtime.R")
  if (file.exists(runtime)) source(runtime, local = env, encoding = "UTF-8")
  env
}

#* Evaluate emitted ChartForge R code and return chart_html.
#* @serializer unboxedJSON
#* @post /api/run
function(req, res) {
  if (!requireNamespace("jsonlite", quietly = TRUE)) {
    res$status <- 500
    return(list(ok = FALSE, error = "Package 'jsonlite' is needed by the local preview endpoint."))
  }
  payload <- tryCatch(
    jsonlite::fromJSON(req$postBody %||% "{}", simplifyVector = FALSE),
    error = function(e) list()
  )
  code <- payload$code %||% ""
  if (!is.character(code) || length(code) != 1L || !nzchar(code)) {
    res$status <- 400
    return(list(ok = FALSE, error = "No R code was supplied."))
  }

  env <- prepare_eval_environment()
  logs <- character()
  tryCatch({
    eval_code <- strip_chartforge_package_calls(code)
    value <- NULL
    logs <- capture.output(value <- eval(parse(text = eval_code), envir = env))
    if (exists("chart_html", envir = env, inherits = FALSE)) value <- get("chart_html", envir = env, inherits = FALSE)
    if (!is.character(value) || !length(value) || !nzchar(value[[1L]])) {
      stop("The code ran, but it did not produce a non-empty character object named 'chart_html'.", call. = FALSE)
    }
    list(ok = TRUE, html = jsonlite::unbox(value[[1L]]), logs = logs)
  }, error = function(e) {
    res$status <- 400
    list(
      ok = FALSE,
      error = conditionMessage(e),
      error_class = class(e),
      call = if (is.null(conditionCall(e))) NULL else deparse(conditionCall(e)),
      logs = logs
    )
  })
}

#* Compatibility aliases used by older static clients.
#* @serializer unboxedJSON
#* @get /data-objects
function() list(ok = TRUE, objects = list_data_objects())

#* @serializer unboxedJSON
#* @get /data-object
function(res, name = "", max_rows = 5000) {
  found <- if (nzchar(name)) find_data_object(name) else NULL
  if (is.null(found)) {
    res$status <- 404
    return(list(ok = FALSE, error = paste0("Data object not found: ", name)))
  }
  df <- as_chartforge_frame(found$value)
  max_rows <- suppressWarnings(as.integer(max_rows %||% 5000L))
  if (length(max_rows) != 1L || is.na(max_rows) || max_rows <= 0L) max_rows <- 5000L
  list(ok = TRUE, name = name, rows = to_row_records(utils::head(df, max_rows)),
       columns = lapply(names(df), function(column) {
         profile <- column_profile(df[[column]])
         c(list(name = column, class = paste(class(df[[column]]), collapse = "/")), profile)
       }),
       nrows = nrow(df), ncols = ncol(df), truncated = nrow(df) > max_rows,
       source = if (is.matrix(found$value)) "matrix" else "data.frame")
}

#* @serializer unboxedJSON
#* @post /run
function(req, res) {
  if (!requireNamespace("jsonlite", quietly = TRUE)) {
    res$status <- 500
    return(list(ok = FALSE, error = "Package 'jsonlite' is needed by the local preview endpoint."))
  }
  payload <- jsonlite::fromJSON(req$postBody %||% "{}", simplifyVector = FALSE)
  code <- payload$code %||% ""
  env <- prepare_eval_environment()
  logs <- character()
  tryCatch({
    value <- NULL
    logs <- capture.output(value <- eval(parse(text = strip_chartforge_package_calls(code)), envir = env))
    if (exists("chart_html", envir = env, inherits = FALSE)) value <- get("chart_html", envir = env, inherits = FALSE)
    if (!is.character(value) || !length(value) || !nzchar(value[[1L]])) stop("No non-empty 'chart_html' result was produced.", call. = FALSE)
    list(ok = TRUE, html = jsonlite::unbox(value[[1L]]), logs = logs)
  }, error = function(e) {
    res$status <- 400
    list(ok = FALSE, error = conditionMessage(e), logs = logs)
  })
}

#* @plumber
function(pr) {
  # Do not mount a catch-all static router at "/": it can pre-empt GET API
  # endpoints such as /api/session.  Only the asset subtree is static; the
  # application shell and top-level files have explicit routes above.
  plumber::pr_static(pr, "/assets", file.path(app_dir(), "assets"))
  if (is.function(pr$setDocs)) pr$setDocs(FALSE)
  if (is.function(pr$setDocsCallback)) pr$setDocsCallback(NULL)
  pr
}
