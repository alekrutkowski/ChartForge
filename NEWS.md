# ChartForge 0.6.6

## Interface polish and Vega axis correction

- Shortens the WebR success status so it remains readable in the preview header.
- Uses smaller 840 by 480 pixel chart defaults.
- Allocates one third of the desktop workbench to controls and two thirds to preview and output.
- Renames DPI to Rendering scale, exposes it as a 1–3 slider in 0.05 increments, and explains that it applies only to Chart.js.
- Adds explicit desired tick counts to Vega-Lite quantitative axes, correcting numeric X axes that could display only one terminal tick.

# ChartForge 0.6.5

## WebR and publication hardening

- Corrects the pinned official webR release path to `v0.6.0`.
- Tries the official webR release host, jsDelivr, and UNPKG in sequence for both the JavaScript module and matching runtime binaries, including fallback after loader, constructor, worker, or runtime-startup failure.
- Preserves complete per-source startup errors so blocked hosts, workers, and WebAssembly downloads are diagnosable.
- Adds a release audit covering JSON validity and duplicate keys, runtime-pack integrity, notice hashes, private build URLs, accidental secrets, absolute build paths, cross-platform file names, oversized files, and GitHub repository hygiene.
- Regenerates npm lockfile URLs for the public npm registry and adds a repository `.npmrc`.
- Retains only `LICENSE.md` in the GitHub repository root and uses the standardized `MIT` DESCRIPTION licence identifier.
- Adds an aggregate `npm test` command, a WebR source-failover regression test, and current Node 24-compatible GitHub Actions workflows.

# ChartForge 0.6.4

## Preview reliability

- Stops successful local-R preview responses from refreshing session metadata and recursively scheduling another render.
- Deduplicates preview requests by emitted-code hash, separates local-R and WebR timers, and allows at most one queued rerender after a genuine state change.
- Uses WebR 0.6.0 through its explicit PostMessage channel, avoiding a cross-origin-isolation service worker and its conflicts with third-party CDN chart assets.
- Evaluates WebR output with `evalRString()` and returns the actual R condition and failing call in the chart-area error card.
- Supplies browser-fetched vendor assets and required licence notices to browser-side R when a legally permitted full bundle is requested.
- Retires service workers registered by earlier ChartForge releases and removes cross-origin isolation response headers.

# ChartForge 0.6.3

## Third-party licensing safeguards

- Retains every supported renderer while enforcing a renderer-specific delivery policy.
- Keeps Highcharts, ApexCharts, Google Charts, and AnyChart CDN-linked even when `full_bundle = TRUE`.
- Adds a renderer-specific legal annotation to generated HTML and makes licence limitations visible in the app.
- Includes precise third-party notices, pinned renderer versions, source archives, checksums, and upstream licence text where redistribution notices are available.
- Preserves amCharts branding and notice requirements when conditional bundling is requested.

## Smaller package

- Replaces 442 loose runtime files with two indexed gzip runtime packs.
- Removes the duplicated GitHub Pages application tree.
- Moves the generic runtime compiler source to the build-only `scripts/` directory.
- Consolidates machine-readable renderer and notice metadata.
