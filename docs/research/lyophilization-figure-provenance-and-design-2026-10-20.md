# Lyophilization figure provenance and scientific design audit

## Objective

Figures in *Common Misconceptions in Single-Chamber Freeze Drying* distinguish measured, published-derived, and assumed behavior. Each figure advances a specific physical correction. A decreasing **percentage** of total heat transfer does not identify a decrease in **absolute** radiative heat flow. The pressure-driven thermal model, firmware analysis, and Ganguly data belong to different evidence classes and are labeled accordingly.

## Figure inventory

| Figure or exhibit | Content | Evidence type | Presentation decision |
| --- | --- | --- | --- |
| Abstract coupled-process figure | Thermal supply → ice → chamber gas; cold-wall deposition and pump exhaust as separate removal branches, returning pressure/composition feedback | Conceptual conservation sketch | Distinct source/sink paths and explicit recursion; no implied sequential physical removal |
| Gas conduction analogy | Vacuum insulation, heated thermocouple vacuum gauge, heated frozen product | Mechanistic schematic | Same molecular transport mechanism, distinct purpose; radiation and contact remain available |
| Ganguly experimental evidence | 2010 Figure 13 fits and radiative reference; 2014 Figure 2.1 printed fractions | Published regressions and figure-label transcriptions, based on original gravimetric experiments | Native fluid-width absolute-flux SVG and three direct numeric readouts precede the primary two-condition normalized comparison; suspended-vial and complete transcriptions remain in disclosures |
| Firmware control comparison | Harvest Right v5.5.25 pressure-selected heater duty; Blue Alpine v3.3.4 temperature PID and pressure gate | Static disassembly and linked control report | Two distinct control-law lanes; same product-level unmeasured latent demand |
| Reduced transfer model | Kc, Kr and Kg(P) coefficient curves and normalized shares | Explicit parameterized model | Pressure-selectable 44px+ tap targets, logarithmic pressure axis revealing the low-pressure transition, and two directly comparable 100%-normalized compositions. Constant Kr is prominent |
| Pressure-transfer explorer and table | Ksat(P), signed vapor-pressure potential, normalized series score, matched data table | Reduced analytical model and IAPWS equilibrium pressure calculation | Mobile switches among Heat, Vapor and Coupled views, displaying one complete SVG at a time. Desktop reveals all three. Model table is collapsible and becomes labeled card records on mobile |
| Resistance sensitivity | Screening and series model stationary pressure against assumed η | Closed-form model calculation | Resistance slider controls an explicit highlighted coordinate and the large displayed stationary-pressure value; assumptions and bounds remain visible |

## Mobile-first visual contract

The reference viewport is 390px, with 320px as the minimum tested viewport and 430px as the upper phone target. The 740px breakpoint is an **addition** of desktop layout, not a device-width reduction of desktop charts. Dedicated scientific SVG plots have a fixed semantic plotting coordinate system but fluid CSS width; they occupy the available content width without horizontal panning. Numerical y-axis labels and legends remain visible without pointer-hover tooltips.

The active interaction model is progressive disclosure, with accessible native buttons rather than carousel swipes. The pressure model has one selected lens on mobile and all three panels on wider viewports. The firmware comparison likewise switches lanes on phones and displays both at larger widths. Supplemental numerical tables use labeled record cards below 740px and retain dense scientific tables on desktop; large source datasets are not hidden from readers.

The central scientific comparison explicitly distinguishes a **constant absolute radiative baseline** in the published 2010 fixed-boundary pressure sweep from the **decreasing radiative percentage** in normalized heat-flux partitions. Data-model figures also differentiate a constant prescribed *coefficient* from an actual *heat flux*.

## Ganguly figure data

Author-supplied figure-label CSV transcriptions and a modeling-provenance note were inspected. Canonical in-repository arrays are in `src/manuscript-runtime/data/papers/sublimation/figures/gangulyFigureData.ts`.

- 2014 dissertation Figure 2.1: **20** percentage rows across 4 vial/shelf configurations, 10/20/60/100/200 mTorr.
- 2010 conference Figure 14: **16** percentage rows across 4 configurations, 10/40/100/200 mTorr.
- 2010 Figure 13: 4 regressions valid over 10–100 mTorr and a reported ~2,666 W/m² radiative reference.
- Direct-contact fitted total heat flux from the reported 2010 regression is 3,412 W/m² at 10 mTorr and 5,320 W/m² at 100 mTorr. Holding the approximate radiation reference at 2,666 W/m² gives fractions 78.14% and 50.11%, respectively. The **radiative numerator is identical**; only the fitted denominator changes.
- The 2014 direct-contact pie labels independently read 69% radiation / 13% gas-plus-flow at 10 mTorr and 45% radiation / 44% gas-plus-flow at 100 mTorr. These data are not combined with the 2010 fit as one measurement series.
- Original gravimetric data files and the exact computational grids for dissertation Figures 6.7–6.9 are unavailable from these materials. The dissertation's calculated response surfaces are not observational grids.

## What 'constant radiation' means

For fixed radiating boundary temperatures, geometry, surface emissivities and view factors, the radiative term `q_rad` has no direct dependence on gas pressure. Its percentage of the total falls if the other heat pathways gain flux. The figure's constant reference is therefore a valid **fixed-boundary pressure-sweep interpretation**. A physical drying cycle can change surface temperatures or effective radiative geometry, so this constant-reference construction is not a constant radiative flux prediction across an entire drying process.

The reduced-model plot displays constant prescribed coefficients **Kc = 1.2** and **Kr = 2.0 W/(m²·K)**, with the pressure-sensitive `Kg` term. These are coefficient inputs. They are not absolute radiative heat-flux measurements; a temperature difference is required to obtain flux.

## Reproducibility

Run in `lab-journal-prototype`:

```bash
node scripts/lyo-figure-science-audit.mjs
node scripts/lyo-field-interpretation-audit.mjs
node scripts/lyo-editorial-contract-audit.mjs
python scripts/lyo-prose-style-audit-20261019.py
bun run typecheck
bunx vite build
```

For rendered layouts, start Vite on port 4137, then run:

```bash
node scripts/lyo-figure-visual-audit.mjs
```

The browser audit uses Playwright against local Chrome and checks **320, 360, 390, 430, 768 and 1280 px** viewports. It asserts seven figures, fluid-width SVG charts, a total of six science plots, a full 36-row published-label archive, six working physical-model sliders, touch targets at least 44px, mobile-only single-panel selection, desktop full comparisons, actual controller lane switching, accessible pressed states, numerical state recomputation, and the absence of document overflow or console errors. `LYO_BASE_URL` and `CHROME_PATH` can be set for other environments.

Do not stage or commit unrelated dirty working-tree files or overwrite source data with interpolated results. No Git commit or push was performed in this work.

## Abstract coupled-process figure redesign — October 20, mobile-first follow-up

The prior abstract figure presented three oversized equally weighted cards and buried the intended recursive failure mode after the removal notes. It is now a dedicated JSX component and stylesheet: `LyophilizationPathFigure.tsx` plus `LyophilizationPathFigure.css`. This changes the underlying information architecture rather than merely adjusting fonts or spacing.

The figure now opens with the actual thesis (continued pump-down does not prove all ice is removed), then traces heat supply, residual-ice water-vapor production and chamber gas inventory in three physically typed stages. At the chamber stage it explicitly separates internal cold-wall vapor deposition from pump exhaust and prints the water-vapor source-minus-sinks balance. A conditional feedback panel illustrates pressure decline → reduced gas conduction → reduced heat delivery → reduced vapor generation, with a visible return link. A separate note states the condition under which this feedback becomes limiting, rather than implying universal positive feedback or a measured unstable operating point. The interpretation at the bottom corrects the misconception that deeper vacuum necessarily improves drying.

Responsive styling uses a one-column causal chain and return-loop panel at 320–430 CSS pixels and a two-column explanatory / feedback composition on larger widths. For widths under 360px, the two sink cards stack instead of forcing unreadable 100px text columns. Equations have bounded individual overflow without causing page-level horizontal scrolling. The visual audit asserts presence of the three physically meaningful stages, both sinks, four causal feedback steps, explicit return, rendered balance inequality, and breakpoint-specific layout. Existing unrelated manuscripts and research figures were not changed.

## Visual-system correction — October 20

The previous multi-card figure revision was rejected for violating the established WebSeal / TheLabJournal design rules. The replacement was checked against `webseal/STYLE_GUIDE.md` and `docs/unified-research-journal-design-2026-10-18.md`: zinc-only surfaces, dense New York rhythm, sentence-case labels, restrained two-line rows, 1px borders, no accent rails, no all-caps eyebrows or widened tracking, no decorative warnings, no gradient or glass effect, and borderless 18px tinted badges.

The mobile-first component now uses one integrated `Coupled process` panel with three divided rows and two distinct removal cells; its water-vapor conservation equation stays attached to the inventory rather than appearing in a separate feature card. The feedback panel uses four zinc-neutral rows, a mathematical threshold and a compact return line. A plain interpretation line closes the figure. Presentation is driven by the available figure container width, not viewport-only desktop assumptions. The original scientific caveat is retained: the proposed recursive limitation is conditional on thermal sensitivity, not experimentally demonstrated for every unit.

For regression, the Chromium audit checks the absence of eyebrow elements, 18px neutral borderless chips, 1px hairline panel borders and sentence-case labels alongside process and science invariants. Both the journal's actual `data-theme=light` and `data-theme=dark` token mappings remain compatible.
