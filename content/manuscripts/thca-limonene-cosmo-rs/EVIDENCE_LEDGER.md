# THCA-A / limonene manuscript: evidence and acceptance ledger
**Editorial record, not publication text.** Updated 21 October 2026.
**Genre:** manuscript-new, computational-methods and theoretical sensitivity study. **Release:** unpublished working draft.

## Protected scientific thesis
The author's research exposes a discrepancy between a constrained-crystal/gas-transfer calculation and a composition-dependent openCOSMO-RS solid–liquid equilibrium (SLE) formulation for THCA-A in limonene. The work provides a reproducible calculation of finite-composition liquid activity, shows the leverage of the solid-state free-energy reference over the inferred saturation point, and identifies the physical and analytical measurements needed to establish a sample-specific equilibrium curve. The author's longer-lived liquid observations motivate a careful separation of saturation from crystallization kinetics.

**Nonclaims not to manufacture or rebut:** universal THCA melting point, chemically pure saturated solution measured in laboratory, guaranteed 275 mg/mL final-solution solubility, official peer-reviewed article, proof of THCA self-dimerization in limonene, evidence that either solid polymorph identity is settled, or a quantitative metastable-zone-width result.

## Provenance, exact numeric statements
| Claim in draft | Evidence class | Provenance | Required wording |
| --- | --- | --- | --- |
| 462 activities, 7 temperatures, 66 compositions | Executed simulation | `data/gamma_grid.csv`, `data/sle_rebuild_results.json` | Actual COSMO-RS runs, type-0 pure liquid activity |
| 41 numerical roots, 36 live bisections per root | Executed numerical computation | `data/sle_rebuild_results.json` | 41/42 scenarios valid below assumed melting, one excluded |
| Max absolute ln-activity closure 7.182935e-7 | Executed independent verification | `data/sle_rebuild_verification.json` | A root residual, not numerical confidence interval or experimental accuracy |
| 25°C conditional x=0.1106947966 | Model computation | `data/sle_rebuild_results.json` | Conditional for patent Tm/Hfus, ΔCp=0, 24a mode-0 descriptors |
| 25°C loading 275.423923 mg per mL of **starting limonene** | Derived from x and neat-limonene density | Same + `prepare-data.py` mass equation | Do not rename final-solution mg/mL |
| 25°C final mixture mass fraction 24.6723 wt% | Derived model | Same JSON | Assumes hypothetical single liquid phase |
| Old x≈1.71e-15 and 2.83e-11 | Archived simulation | `data/solubility_cycle_aligned_rerun.json` | Historical conditional crystal-to-gas outputs |
| Original crystal static ΔE=212.3064 kJ/mol | Archived electronic calculation | Same, original CP2K files on homelab | Constrained 120 K H-relaxed fixed heavy atom cell, low SZV basis, unbounded systematic error |
| 146°C and 16.3 kJ/mol | **Patent DSC report** | US20260008762A1, paragraphs and Fig. 10 | A specified crystalline preparation; measured DSC 20°C/min |
| ~125°C thermal-degradation onset | **Patent TGA report** | US20260008762A1, Fig. 9, 1°C/min | Precedes DSC endotherm; not necessarily same chemical transformation or rate |
| 70°C THCA-A melt claim | Secondary citation | Filer, 2021 citing older patent | Not a measured thermal property in Filer's study |
| 100°C user's melting recollection | Personal recollection, unassayed | User's October 21 account | Do not treat as DSC evidence |
| Persistent clarity, slow crystal formation | Personal observations | User's October 21 account | No numerical supersaturation, no measured equilibrium concentration |
| 2021 CIF a=11.4069 Å, b=17.9819 Å, c=19.1565 Å, V=3929.3 Å³ at 120 K | Primary crystallographic supplementary data | Skell et al. `cu3167sup1.cif` | Source is archived with computational source, read by script |
| Patent cell a=11.4635 Å, b=18.0506 Å, c=19.2347 Å, V=3980.1 Å³ at 100 K | Patent XRD report | US20260008762A1 Table 1 | Similar P2₁2₁2₁/Z=8 lattice, not definitive identity |
| Cell percentage differences a +0.496, b +0.382, c +0.408, volume +1.293 | Original arithmetic | `data/lattice_crosswalk.json` | Relative to 2021 CIF, not uncertainty estimate |
| THCA-A carboxylic acid R²₂(8) hydrogen-bonding | Primary solid-state evidence | Skell et al. Acta Cryst C 77 84–89 | Applies to solid-state crystal, not inferred solution dimer fraction |

## Verified bibliography
1. Skell JM, Kahn M, Foxman BM (2021). *Acta Crystallographica C* **77**, 84–89. DOI: [10.1107/S2053229621000280](https://doi.org/10.1107/S2053229621000280).
2. Yarger JL, Davidowski S, Seth M, inventors (2026 publication). *Cannabinoid acids crystalline forms, methods of producing, and uses thereof*. US20260008762A1. [Primary patent record](https://patents.google.com/patent/US20260008762A1/en).
3. Müller S, Nevolianis T, Garcia-Ratés M, Riplinger C, Leonhard K, Smirnova I (2025). *Fluid Phase Equilibria* **589**, 114250. DOI: [10.1016/j.fluid.2024.114250](https://doi.org/10.1016/j.fluid.2024.114250).
4. Filer CN (2021). *Cannabis and Cannabinoid Research* **6**, 446–448. DOI: [10.1089/can.2021.0003](https://doi.org/10.1089/can.2021.0003).
5. Wang M, Wang YH, Avula B, et al. (2016). *Cannabis and Cannabinoid Research* **1**, 262–271. DOI: [10.1089/can.2016.0020](https://doi.org/10.1089/can.2016.0020).

## Scientific/editorial review
The 2026 patent may describe the same or a closely related crystallographic phase as the Skell 2021 sample: both report P2₁2₁2₁ and Z=8 with similar cell metrics. This finding reduces the justification for casually calling them **different** solid forms, but does not identify which specimen yielded the DSC signal. The manuscript source was corrected to document the comparison and preserve the unresolved phase-specific thermal reference.

The dominant quantitative uncertainty is *not* the 7.18e-7 numerical root closure but the physical input Tm, ΔHfus and ΔCp, then descriptor compatibility, single-solute/solvent conformer treatment, interactions such as acid self-association, and stability of chemically intact THCA. The baseline has zero fitted experimental saturation points.

The computational CSV/JSON reproductions and corresponding vectors are accepted as numerical artifacts. The 70°C input is not a primary melting point; no wet-lab data from the user's process were inserted as measured values. The social/scientific manuscript is not to be registered on the public site until the author approves publication.

## Print / UX acceptance
- Distinct manuscript from journal; scholarly A4 two-column layout, searchable text, functional PDF links/anchors, proper numbering, fullwidth title/abstract then coherent two-column body.
- Font: sans Inter if available, Arial fallback; only zinc neutral colors; no glassmorphism or gradients.
- Dither: authentic thelabjournal Bayer field reused from the existing project's dither renderer; restrained header strip.
- Figure 1: temperature SLE, with initial-solvent loading units, sourced from archived root data.
- Figure 2: actual COSMO activity vs mole fraction (not inferred solubility), sourced from archived 462-point grid.
- Table 1: independent 2021 CIF vs 2026 patent structural crosswalk.
- Numeric/data/references cross-check `prepare-data.py` and research `verify_thca_sle_activity_rebuild.py`.
- Inspect rendered pages for overlapping floats, truncated captions, math glyph issues and orphaned references. Use XeLaTeX twice for resolved references.
