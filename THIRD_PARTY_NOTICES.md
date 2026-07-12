# Third-party notices

**ChartForge version:** 0.6.6  
**Licence audit date:** 11 July 2026

ChartForge itself is distributed under the MIT License. That licence applies only to ChartForge code. It does not grant, replace, broaden, or verify any right to use a third-party chart renderer, hosted service, font, or WebAssembly runtime.

This file records the renderer versions and delivery policy used by this release. Licence terms can change. A user publishing or deploying a chart remains responsible for checking the current official terms and obtaining any required commercial, SaaS, OEM, or other licence.

## Delivery safeguards

- **CDN only:** ChartForge never downloads or inlines the vendor library, even when `full_bundle = TRUE`. The generated HTML contains a legal annotation explaining that the vendor remains remotely linked.
- **May be inlined with notices:** ChartForge may inline the vendor library when `full_bundle = TRUE`, and places the applicable licence text in the same HTML output.
- **May be inlined conditionally:** ChartForge may inline only while the stated conditions are preserved. For amCharts 5, that includes retaining the built-in branding and accompanying licence notices.

## Renderer summary

| Renderer | Version used by ChartForge | Licence or terms | Delivery policy | Important limitation |
|---|---|---|---|---|
| Highcharts | 12.6.0 | [Highsoft licence terms](https://www.highcharts.com/license) | CDN only | Use may require a Highsoft commercial, SaaS, or OEM licence. ChartForge does not grant or verify Highcharts usage rights and leaves the default Highcharts credits enabled. |
| Plotly.js | 3.7.0 | [MIT](https://github.com/plotly/plotly.js/blob/v3.7.0/LICENSE) | May be inlined with notices | Redistribution is permitted when the copyright and MIT licence notice are retained. |
| D3.js | 7.9.0 | [ISC](https://github.com/d3/d3/blob/v7.9.0/LICENSE) | May be inlined with notices | Redistribution is permitted when the copyright and ISC permission notice are retained. |
| Vega-Lite / Vega / Vega-Embed | Vega 6.2.0; Vega-Lite 6.4.3; Vega-Embed 7.1.0 | [BSD-3-Clause](https://github.com/vega/vega/blob/v6.2.0/LICENSE) | May be inlined with notices | Redistribution is permitted subject to the BSD three-clause conditions and notices for each component. |
| Observable Plot | 0.6.17; D3 7.9.0 | [ISC](https://github.com/observablehq/plot/blob/v0.6.17/LICENSE) | May be inlined with notices | Observable Plot and its separately loaded D3 dependency may be redistributed with their ISC notices retained. |
| Chart.js | 4.5.1 | [MIT](https://github.com/chartjs/Chart.js/blob/v4.5.1/LICENSE.md) | May be inlined with notices | Redistribution is permitted when the copyright and MIT licence notice are retained. |
| Apache ECharts | 6.1.0 | [Apache-2.0](https://github.com/apache/echarts/blob/6.1.0/LICENSE) | May be inlined with notices | Redistribution is permitted subject to Apache License 2.0, including preservation of the licence and NOTICE material. |
| ApexCharts | 5.16.0 | [ApexCharts Community or commercial licence](https://apexcharts.com/license/community/) | CDN only | The Community License covers qualifying personal, non-profit, educational, and small-organization use, subject to its revenue, attribution, non-compete, and sharing conditions. Other use may require a commercial or OEM licence. |
| Google Charts | current rolling service | [Google Charts terms of service](https://developers.google.com/chart/interactive/faq) | CDN only | Google expressly requires the loader and visualization code to be loaded from Google and does not permit downloading or self-hosting it. |
| amCharts 5 | 5.19.1 | [Free amCharts linkware licence or commercial licence](https://github.com/amcharts/amcharts5/blob/5.19.1/LICENSE) | May be inlined conditionally | The free licence permits bundling only while the built-in branding remains visible and the original licence and copyright notices accompany the files. A commercial licence can provide different rights. |
| VisActor VChart | 2.1.3 | [MIT](https://github.com/VisActor/VChart/blob/v2.1.3/LICENSE) | May be inlined with notices | Redistribution is permitted when the copyright and MIT licence notice are retained. |
| AnyChart | 8.14.1 | [AnyChart proprietary/free-use terms](https://www.anychart.com/buy/) | CDN only | Free use is limited to qualifying non-commercial, educational, or non-profit scenarios. Commercial, SaaS, and redistributable uses may require an AnyChart licence, including OEM rights where applicable. |
| Billboard.js | 3.17.2 | [MIT; bundled D3 components use ISC-compatible notices](https://github.com/naver/billboard.js/blob/3.17.2/LICENSE) | May be inlined with notices | Redistribution is permitted when the Billboard.js MIT notice and applicable bundled dependency notices are retained. |

## Runtime and presentation dependencies

| Component | Version | Delivery | Licence |
|---|---|---|---|
| webR | 0.6.0 | Remote only, with pinned official-host and npm-mirror failover | [GPL-3.0 for distribution binaries; MIT for specified repository application and setup code](https://github.com/r-wasm/webr/blob/v0.6.0/LICENSE.md) |
| Google Fonts | fonts selected at runtime | CDN only | [Font-specific open font licences, commonly SIL Open Font License](https://fonts.google.com/attribution) |

## WebR runtime delivery

ChartForge does not redistribute the webR JavaScript module, Web Worker, R WebAssembly binary, or supporting runtime binaries. The app tries these pinned, equivalent release locations in order:

1. `https://webr.r-wasm.org/v0.6.0/`
2. `https://cdn.jsdelivr.net/npm/webr@0.6.0/dist/`
3. `https://unpkg.com/webr@0.6.0/dist/`

The corresponding module entry point is `webr.mjs` at all three locations. The fallback mirrors distribute the same published `webr` 0.6.0 npm package. The webR distribution binaries are governed by the upstream licensing statement, including GPL-3.0 for the distribution binaries and MIT terms for specified application and setup code. See the official webR licence before redistributing or self-hosting any webR files.

## Renderer details

### Highcharts

- Version: 12.6.0
- Source loaded by ChartForge: `https://cdn.jsdelivr.net/npm/highcharts@12.6.0/highcharts.js`
- Governing licence or terms: https://www.highcharts.com/license
- ChartForge policy: CDN only
- User notice: Use may require a Highsoft commercial, SaaS, or OEM licence. ChartForge does not grant or verify Highcharts usage rights and leaves the default Highcharts credits enabled.
- Highcharts is proprietary and its required licence depends on the use case. ChartForge intentionally avoids redistributing the Highcharts JavaScript files.
- ChartForge leaves the normal Highcharts credits enabled by default. A user who overrides native Highcharts options remains responsible for the resulting configuration and licence compliance.

### Plotly.js

- Version: 3.7.0
- Source loaded by ChartForge: `https://cdn.jsdelivr.net/npm/plotly.js-dist-min@3.7.0/plotly.min.js`
- Governing licence or terms: https://github.com/plotly/plotly.js/blob/v3.7.0/LICENSE
- ChartForge policy: May be inlined with notices
- User notice: Redistribution is permitted when the copyright and MIT licence notice are retained.

### D3.js

- Version: 7.9.0
- Source loaded by ChartForge: `https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js`
- Governing licence or terms: https://github.com/d3/d3/blob/v7.9.0/LICENSE
- ChartForge policy: May be inlined with notices
- User notice: Redistribution is permitted when the copyright and ISC permission notice are retained.

### Vega-Lite / Vega / Vega-Embed

- Version: Vega 6.2.0; Vega-Lite 6.4.3; Vega-Embed 7.1.0
- Source loaded by ChartForge: `https://cdn.jsdelivr.net/npm/vega@6.2.0/build/vega.min.js`
- Governing licence or terms: https://github.com/vega/vega/blob/v6.2.0/LICENSE
- ChartForge policy: May be inlined with notices
- User notice: Redistribution is permitted subject to the BSD three-clause conditions and notices for each component.

### Observable Plot

- Version: 0.6.17; D3 7.9.0
- Source loaded by ChartForge: `https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6.17/dist/plot.umd.min.js`
- Governing licence or terms: https://github.com/observablehq/plot/blob/v0.6.17/LICENSE
- ChartForge policy: May be inlined with notices
- User notice: Observable Plot and its separately loaded D3 dependency may be redistributed with their ISC notices retained.

### Chart.js

- Version: 4.5.1
- Source loaded by ChartForge: `https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js`
- Governing licence or terms: https://github.com/chartjs/Chart.js/blob/v4.5.1/LICENSE.md
- ChartForge policy: May be inlined with notices
- User notice: Redistribution is permitted when the copyright and MIT licence notice are retained.

### Apache ECharts

- Version: 6.1.0
- Source loaded by ChartForge: `https://cdn.jsdelivr.net/npm/echarts@6.1.0/dist/echarts.min.js`
- Governing licence or terms: https://github.com/apache/echarts/blob/6.1.0/LICENSE
- ChartForge policy: May be inlined with notices
- User notice: Redistribution is permitted subject to Apache License 2.0, including preservation of the licence and NOTICE material.

### ApexCharts

- Version: 5.16.0
- Source loaded by ChartForge: `https://cdn.jsdelivr.net/npm/apexcharts@5.16.0/dist/apexcharts.min.js`
- Governing licence or terms: https://apexcharts.com/license/community/
- ChartForge policy: CDN only
- User notice: The Community License covers qualifying personal, non-profit, educational, and small-organization use, subject to its revenue, attribution, non-compete, and sharing conditions. Other use may require a commercial or OEM licence.
- ApexCharts Community License note: the official Community page states that qualifying users include personal, non-profit, educational, and organizations below the stated annual-revenue threshold. It also requires copyright and licence notices to remain intact and this licence, or a link to it, to accompany shared work. The official current terms control.
- ChartForge keeps ApexCharts support but deliberately leaves the library on its CDN in every bundle mode. This does not establish that every downstream use qualifies for the Community License.

### Google Charts

- Version: current rolling service
- Source loaded by ChartForge: `https://www.gstatic.com/charts/loader.js`
- Governing licence or terms: https://developers.google.com/chart/interactive/faq
- ChartForge policy: CDN only
- User notice: Google expressly requires the loader and visualization code to be loaded from Google and does not permit downloading or self-hosting it.
- Google states that `google.charts.load` and `google.visualization` code may not be downloaded, saved, or self-hosted. ChartForge therefore always emits the official Google loader URL.

### amCharts 5

- Version: 5.19.1
- Source loaded by ChartForge: `https://cdn.amcharts.com/lib/version/5.19.1/index.js`
- Governing licence or terms: https://github.com/amcharts/amcharts5/blob/5.19.1/LICENSE
- ChartForge policy: May be inlined conditionally
- User notice: The free licence permits bundling only while the built-in branding remains visible and the original licence and copyright notices accompany the files. A commercial licence can provide different rights.
- The free linkware licence allows bundling only when branding is not hidden or altered, the original licence accompanies the files, copyright notices remain, and amCharts is not distributed on its own. ChartForge preserves the normal branding behavior and includes the licence text when it inlines amCharts.

### VisActor VChart

- Version: 2.1.3
- Source loaded by ChartForge: `https://cdn.jsdelivr.net/npm/@visactor/vchart@2.1.3/build/index.min.js`
- Governing licence or terms: https://github.com/VisActor/VChart/blob/v2.1.3/LICENSE
- ChartForge policy: May be inlined with notices
- User notice: Redistribution is permitted when the copyright and MIT licence notice are retained.

### AnyChart

- Version: 8.14.1
- Source loaded by ChartForge: `https://cdn.anychart.com/releases/8.14.1/js/anychart-base.min.js`
- Governing licence or terms: https://www.anychart.com/buy/
- ChartForge policy: CDN only
- User notice: Free use is limited to qualifying non-commercial, educational, or non-profit scenarios. Commercial, SaaS, and redistributable uses may require an AnyChart licence, including OEM rights where applicable.
- AnyChart identifies OEM licensing for redistributable and on-premises products and separate SaaS/commercial licensing scenarios. ChartForge intentionally avoids redistributing the AnyChart JavaScript files.

### Billboard.js

- Version: 3.17.2
- Source loaded by ChartForge: `https://cdn.jsdelivr.net/npm/billboard.js@3.17.2/dist/billboard.pkgd.min.js`
- Governing licence or terms: https://github.com/naver/billboard.js/blob/3.17.2/LICENSE
- ChartForge policy: May be inlined with notices
- User notice: Redistribution is permitted when the Billboard.js MIT notice and applicable bundled dependency notices are retained.

## Exact licence and notice texts shipped with ChartForge

The files below are copied from the named upstream package release and stored under `inst/app/licenses/` so a generated full bundle can carry the required notice alongside inlined vendor code.

### Notice-file provenance and integrity

The table below identifies the package archive and path from which each shipped notice was copied. SHA-256 values allow release maintainers to detect accidental changes. The upstream package archive and current official terms remain authoritative.

| Shipped file | Path in upstream package | SHA-256 | Upstream package archive |
|---|---|---|---|
| `highcharts-12.6.0-LICENSE.txt` | `package/LICENSE` | `84e53ada29bde02e706fe0bc35b6150cba7bb2497f470dda7fb786ea8af1bd03` | [package archive](https://registry.npmjs.org/highcharts/-/highcharts-12.6.0.tgz) |
| `plotly.js-3.7.0-LICENSE.txt` | `package/LICENSE` | `8c45d9eaf50c2f72dd9c7ab9ef440788ba58a3538484b5c51c1f17d5128752e7` | [package archive](https://registry.npmjs.org/plotly.js-dist-min/-/plotly.js-dist-min-3.7.0.tgz) |
| `d3-7.9.0-LICENSE.txt` | `package/LICENSE` | `3e6849627f74ff73c257a3ae1efb574015d94fc1035c05ec3c15805165efcbc4` | [package archive](https://registry.npmjs.org/d3/-/d3-7.9.0.tgz) |
| `vega-6.2.0-LICENSE.txt` | `package/LICENSE` | `63727832aaf62004a2b249c933e327f3c90caf49e41a72f4bf436edf632cbda8` | [package archive](https://registry.npmjs.org/vega/-/vega-6.2.0.tgz) |
| `vega-lite-6.4.3-LICENSE.txt` | `package/LICENSE` | `f618900fd0d64046963b29f40590cdd1e341a2f41449f99110d82fd81fea808c` | [package archive](https://registry.npmjs.org/vega-lite/-/vega-lite-6.4.3.tgz) |
| `vega-embed-7.1.0-LICENSE.txt` | `package/LICENSE` | `32df67148f0fc3db0eb9e263a7b75d07f1eb14c61955005a4a39c6918d10d137` | [package archive](https://registry.npmjs.org/vega-embed/-/vega-embed-7.1.0.tgz) |
| `observable-plot-0.6.17-LICENSE.txt` | `package/LICENSE` | `4b295e011e0e046170041b5b46f1349393aeceb95797793a55bd21dbb543363a` | [package archive](https://registry.npmjs.org/@observablehq/plot/-/plot-0.6.17.tgz) |
| `chart.js-4.5.1-LICENSE.txt` | `package/LICENSE.md` | `41a84aa2caba645f966a18d9c2056b73e6d3a81d80bc0046bc0011a2634d4cce` | [package archive](https://registry.npmjs.org/chart.js/-/chart.js-4.5.1.tgz) |
| `echarts-6.1.0-LICENSE.txt` | `package/LICENSE` | `634293835b43a6dd2094fa39182a3d9a6b9ca43b7fdb9ac354e8037af2a3093a` | [package archive](https://registry.npmjs.org/echarts/-/echarts-6.1.0.tgz) |
| `echarts-6.1.0-NOTICE.txt` | `package/NOTICE.txt` | `d491d358344f842685c1b1585970999db65fe30ecf7ef3867af8814f4016c016` | [package archive](https://registry.npmjs.org/echarts/-/echarts-6.1.0.tgz) |
| `apexcharts-5.16.0-LICENSE.md` | `package/LICENSE` | `57a78c6256ea5b216045019a264dd50c0b14e282b295f0cfaef82d62d9dbb816` | [package archive](https://registry.npmjs.org/apexcharts/-/apexcharts-5.16.0.tgz) |
| `amcharts5-5.19.1-LICENSE.md` | `package/LICENSE` | `51c7fed11750e6f7261cf5e4b68add57de988ee9e00792043253309a7e0242c4` | [package archive](https://registry.npmjs.org/@amcharts/amcharts5/-/amcharts5-5.19.1.tgz) |
| `amcharts5-5.19.1-THIRD-PARTY.md` | `package/THIRD-PARTY.md` | `a280dcb840ec9b72bd81905c57391dfd1354aac056d09cced113b221e5fce61a` | [package archive](https://registry.npmjs.org/@amcharts/amcharts5/-/amcharts5-5.19.1.tgz) |
| `vchart-2.1.3-LICENSE.txt` | `package/LICENSE` | `c938403ee99774c305d734fe77774527fb20a90a5e896de4a83e2e513555b757` | [package archive](https://registry.npmjs.org/@visactor/vchart/-/vchart-2.1.3.tgz) |
| `billboard.js-3.17.2-LICENSE.txt` | `package/LICENSE` | `de3b9e6bd1834e4102ecb69a437ee8ba942cccfff6c71081f5e4c6cba412fb39` | [package archive](https://registry.npmjs.org/billboard.js/-/billboard.js-3.17.2.tgz) |

### `highcharts-12.6.0-LICENSE.txt`

```text
Use of this software is governed by the Highsoft Standard License Agreement
found at:

https://www.highcharts.com/license

By installing or using this software, you agree to these terms.
```

### `plotly.js-3.7.0-LICENSE.txt`

```text
MIT License

Copyright (c) 2016-2024 Plotly Technologies Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

### `d3-7.9.0-LICENSE.txt`

```text
Copyright 2010-2023 Mike Bostock

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```

### `vega-6.2.0-LICENSE.txt`

```text
Copyright (c) 2015-2023, University of Washington Interactive Data Lab
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors
  may be used to endorse or promote products derived from this software
  without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

### `vega-lite-6.4.3-LICENSE.txt`

```text
Copyright (c) 2015, University of Washington Interactive Data Lab.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors
  may be used to endorse or promote products derived from this software
  without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

### `vega-embed-7.1.0-LICENSE.txt`

```text
Copyright (c) 2015, University of Washington Interactive Data Lab
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors
  may be used to endorse or promote products derived from this software
  without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

### `observable-plot-0.6.17-LICENSE.txt`

```text
Copyright 2020-2025 Observable, Inc.

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```

### `d3-7.9.0-LICENSE.txt`

```text
Copyright 2010-2023 Mike Bostock

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```

### `chart.js-4.5.1-LICENSE.txt`

```text
The MIT License (MIT)

Copyright (c) 2014-2024 Chart.js Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

### `echarts-6.1.0-LICENSE.txt`

```text

                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.





========================================================================
Apache ECharts Subcomponents:

The Apache ECharts project contains subcomponents with separate copyright
notices and license terms. Your use of the source code for these
subcomponents is also subject to the terms and conditions of the following
licenses.

BSD 3-Clause (d3.js):
The following files embed [d3.js](https://github.com/d3/d3) BSD 3-Clause:
    `/src/chart/treemap/treemapLayout.ts`,
    `/src/chart/tree/layoutHelper.ts`,
    `/src/chart/graph/forceHelper.ts`,
    `/src/util/number.ts`
See `/licenses/LICENSE-d3` for details of the license.
```

### `echarts-6.1.0-NOTICE.txt`

```text
Apache ECharts
Copyright 2017-2026 The Apache Software Foundation

This product includes software developed at
The Apache Software Foundation (https://www.apache.org/).
```

### `apexcharts-5.16.0-LICENSE.md`

```text
## 📄 License Options for ApexCharts

ApexCharts is offered under a **dual-license model** to support individuals, startups, and commercial products of all sizes.

---

### 🔓 Community License (Free)

For individuals, non-profits, educators, and small businesses with **less than $2 million USD in annual revenue**.

✅ What’s allowed:

- Personal, educational, or non-profit use
- Commercial use by small orgs (< $2M annual revenue)
- Modifications and redistribution (with attribution)

🚫 Not allowed:

- Use by companies or entities over $2M/year revenue
- Use in competing charting products
- Sublicensing under different terms

➡ By using ApexCharts under this license, you confirm that **you qualify as a Small Organization**.

---

### 💼 Commercial License (Paid)

The Commercial License applies to all paid SKUs (Pro, Premium, and OEM/Embedded).

The **Community License** is available at no cost **only** to organizations with **annual revenue under \$2M USD**.
If your organization earns \$2M USD or more annually, you must purchase one of our paid licenses.

✅ What's included:

- Use in internal tools and commercial applications
- Modifications and app-level distribution
- 12-month subscription with updates & support

🚫 Not allowed:

- Redistribution in toolkits, SDKs, or platforms
- Use by unlicensed developers
- Competing charting products

---

### 🏛 Non-Profit Tiers

Non-Profits are treated like commercial entities:

- Annual operating budget **less than \$2 million USD**
- _Eligible for Community licenses_

or

- Annual operating budget **greater than \$2 million USD**
- _Commerical license with possible discounts for Community, Pro, Premium and OEM products_

---

### 🔄 OEM / Redistribution License (Paid)

Required if you are **embedding ApexCharts into a product or platform used by other people**, such as:

- No-code dashboards
- Developer platforms
- Embedded BI tools
- SDKs

✅ What's included:

- Redistribution rights for 1 application or product
- 12-month subscription with updates & support

✅ OEM **not required** if your app simply renders static charts and users **cannot** configure or interact with them.

---

### ⚠️ License Acceptance

By installing ApexCharts (e.g., via `npm install apexcharts`), you are agreeing to the applicable license based on your usage:

- Community License (if under $2M revenue)
- Commercial License (if over $2M revenue)
- OEM License (if redistributing to third-party users)

---

### 🛠 Need a License or Have Questions?

📧 Contact us at [sales@apexcharts.com](mailto:sales@apexcharts.com)  
📚 Read full license agreements here: [https://apexcharts.com/license](https://apexcharts.com/license)

---

Thank you for supporting ApexCharts! Your licensing helps keep it free and open for individuals and small teams.
```

### `amcharts5-5.19.1-LICENSE.md`

```text
## Free amCharts license

This amCharts software is copyrighted by Antanas Marcelionis.

This amCharts software is provided under linkware license, conditions of which are outlined below.

### You can

* Use amCharts software in any of your projects, including commercial.
* Modify amCharts software to suit your needs (source code is available at [here](https://github.com/amcharts/amcharts5)).
* Bundle amCharts software with your own projects (free, open source, or commercial).

### If the following conditions are met

* You do not disable, hide or alter the branding link which is displayed on all the content generated by amCharts software.
* You include this original LICENSE file together with original (or modified) files from amCharts software.
* Your own personal license does not supersede or in any way negate the effect of this LICENSE, or make the impression of doing so.

### You can't

* Remove or alter this LICENSE file.
* Remove any of the amCharts copyright notices from any of the files of amCharts software.
* Use amCharts software without built-in attribution (logo). Please see note about commercial amCharts licenses below.
* Sell or receive any compensation for amCharts software.
* Distribute amCharts software on its own, not as part of other application.

### The above does not suit you?

amCharts provides commercial licenses for purchase for various usage scenarios that are not covered by the above conditions.

Please refer to [this web page](https://www.amcharts.com/online-store/) or [contact amCharts support](mailto:contact@amcharts.com) for further information.

### In doubt?

[Contact amCharts](mailto:contact@amcharts.com). We'll be happy to sort you out.
```

### `amcharts5-5.19.1-THIRD-PARTY.md`

```text
# 3rd-party libraries used in amCharts 5

## Used in Core package

|Package|Copyright (c)|License|
|-------|-------------|-------|
|d3|Mike Bostock|[License](https://github.com/d3/d3/blob/master/LICENSE)|
|d3-chord|Mike Bostock|[License](https://github.com/d3/d3-fchord/blob/master/LICENSE)|
|d3-geo|Mike Bostock|[License](https://github.com/d3/d3-geo/blob/master/LICENSE)|
|d3-geo-projection|Mike Bostock|[License](https://github.com/d3/d3-geo-projection/blob/master/LICENSE)|
|d3-force|Mike Bostock|[License](https://github.com/d3/d3-force/blob/master/LICENSE)|
|d3-sankey|Mike Bostock|[License](https://github.com/d3/d3-sankey/blob/master/LICENSE)|
|d3-selection|Mike Bostock|[License](https://github.com/d3/d3-selection/blob/main/LICENSE)|
|d3-transition|Mike Bostock|[License](https://github.com/d3/d3-transition/blob/main/LICENSE)|
|d3-voronoi-treemap|LEBEAU Franck|[License](https://github.com/Kcnarf/d3-voronoi-treemap/blob/master/LICENSE)|
|flatpickr|Gregory Petrosyan|[License](https://github.com/flatpickr/flatpickr/blob/master/LICENSE.md)|
|polylabel|Mapbox|[License](https://github.com/mapbox/polylabel/blob/master/LICENSE)|
|seedrandom|David Bau|[License](https://github.com/davidbau/seedrandom?tab=readme-ov-file#license-mit)|
|svg-arc-to-cubic-bezier|Colin Meinke|[License](https://github.com/colinmeinke/svg-arc-to-cubic-bezier/blob/master/LICENSE.md)|
|tslib|Microsoft|[License](https://github.com/microsoft/tslib/blob/master/LICENSE.txt)|


## Used in optional plugins

|Package|Copyright (c)|License|
|-------|-------------|-------|
|pdfmake|bpampuch|[License](https://github.com/bpampuch/pdfmake/blob/master/LICENSE)|
|SheetJS js-xlsx|SheetJS LLC|[License](https://github.com/SheetJS/js-xlsx/blob/master/LICENSE)|
|marker.js 2|Alan Mendelevich|[License](https://github.com/ailon/markerjs2/blob/master/LICENSE)|
```

### `vchart-2.1.3-LICENSE.txt`

```text
MIT License

Copyright (c) 2023 Bytedance, Inc. and its affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### `billboard.js-3.17.2-LICENSE.txt`

```text
The MIT License (MIT)

Copyright (c) 2017 ~ present NAVER Corp.
Copyright (c) 2013 Masayuki Tanaka

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

### `d3-7.9.0-LICENSE.txt`

```text
Copyright 2010-2023 Mike Bostock

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```

## Official policy links for CDN-only services without a redistributable licence file

- Google Charts FAQ and offline-hosting rule: https://developers.google.com/chart/interactive/faq
- AnyChart purchasing and free-use summary: https://www.anychart.com/buy/
- AnyChart licensing FAQ: https://www.anychart.com/support/pages/faq/
- Highcharts licence terms: https://www.highcharts.com/license
- ApexCharts Community License: https://apexcharts.com/license/community/

## No endorsement and no legal advice

The names and marks of third parties belong to their respective owners. Inclusion of an adapter or a link does not imply endorsement. This notice is an engineering compliance aid, not legal advice.
