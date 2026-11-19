# THCA-A in limonene: temperature-dependent solubility and MSZW status

## Diagram and interpretation

`thca_temperature_solubility.svg` plots conditional crystal-to-solution equilibrium estimates from -17.78 to 176.70 °C (0.0 to 350.1 °F). The full axis reaches the nominal limonene normal boiling endpoint 176.7 °C at 1 atm. Curves are split into 20 and 100 cm⁻¹ Einstein external-mode scenarios; the shaded band is the additional ±0.45 kcal/mol openCOSMO-RS 24a benchmark-AAD sensitivity. It is not a confidence interval.

Only the segment at or below the reported THCA-A crystalline melting point (~70 °C) is shown as the crystal-equilibrium model branch. The dashed continuation above that temperature is a formal extrapolation of a crystalline standard state, not a physical equilibrium solubility curve. Wang et al. measured first-order THCA-A conversion at 80, 95 and 110 °C, with reported rate constants 1.8×10⁻⁴, 6.6×10⁻⁴ and 1.83×10⁻³ s⁻¹ (half-lives about 64, 17.5 and 6.3 minutes). These measurements were made in cannabis extracts/vacuum-oven conditions, not limonene; they are a stability warning, not a solvent-specific kinetic prediction. The diagram marks 80 °C as the first measured kinetic condition, not as an onset threshold.

## MSZW

No quantitative metastable-zone-width boundary is drawn. MSZW is protocol-dependent (cooling rate, induction/detection time, volume, seed state, mixing, vessel surface and nucleation kinetics); no THCA-A/limonene MSZW or induction-time dataset was located. The equilibrium line only marks saturation (S=1). For a specified composition, supersaturation can be computed as S=x/x_eq, but a nucleation boundary cannot be inferred without kinetic/interfacial information.

## Model

At each temperature the free-energy cycle is `ΔG(crystal→solution,1M) = ΔG(crystal→gas,1 atm) + RT ln(p(1M)/1 atm) + ΔG(gas 1M→solution 1M)`. The CP2K electronic energy difference is anchored to the validated fixed-cell, heavy-atom-fixed/H-relaxed CIF calculation. NIST's 293-conformer RRHO ensemble is recomputed at each T; the conformer-1 internal vibrational free energy is subtracted as an assumed crystal/gas cancellation. Six uncalculated crystal external modes are represented by 20/100 cm⁻¹ harmonic Einstein scenarios. openCOSMO-RS 24a type-4 dGsolv values are recomputed with the mode-0 compatibility input at each grid T.

## Activity coefficient and concentration conversion

The type-4 `dGsolv` is the gas-1-M to liquid-1-M transfer at infinite dilution and already contains COSMO-RS's liquid infinite-dilution activity contribution (the model expression includes an `RT ln γ∞` term). It is applied once; a separate `ln γ∞` is not added. The concentration conversion `c/c° = exp(−ΔG/RT)` assumes the finite-concentration ratio `γ(c)/γ∞ ≈ 1`. No finite-composition `ln γ(c)` correction is calculated, and uncertainty from that nonideality is not included in the plotted sensitivity band. The resulting mass/mole-fraction curves are most defensible in the dilute branch; the warm-end mathematical extrapolation, where x reaches about 0.0056 in the stiff scenario, is more sensitive to this assumption. Converting c to x also uses additive volumes and the fitted limonene density.

Limonene density is linearly fitted to the 9 NIST ThermoML density measurements from 283.15–353.15 K (1 atm; vibrating-tube data; reported expanded uncertainty ~1 kg m⁻³). Density is extrapolated outside that measured range for mass-unit conversion. No density extrapolation uncertainty is included in the solubility envelope.

## Assumptions and limitations

- The 298.15 K anchor is the verified prior calculation (PBE-D3(BJ)/SZV CP2K crystal/gas leg plus openCOSMO-RS 24a mode-0 dGsolv). The NIST conformer script reproduces 2.211 kJ/mol conformational enthalpy vs the paper's 2.2.
- The original high-basis DZVP periodic check did not complete; the low SZV basis has no BSSE correction or converged-basis uncertainty. Crystal phonons are uncalculated, and cell/heavy-atom relaxation and temperature-dependent lattice expansion are absent.
- openCOSMO-RS 24a was principally parameterized against 25 °C data. Its T-dependent formula is evaluated through the full chart, but predictions far from 298 K—especially above 393 K—are extrapolations. The supplied ORCA_COSMO_TZVPD descriptors lack atomic polarizability sections; mode 7 closes the request, so explicit mode 0 is used. The 0.45 kcal/mol AAD is a benchmark sensitivity, not a temperature-specific confidence bound.
- The type-4 transfer term includes the infinite-dilution activity contribution, but finite-composition activity corrections (`γ(c)/γ∞`) are set to unity. Nonideality uncertainty is not propagated; extrapolated high-temperature concentrations are less reliable if x is no longer very small.
- Reported THCA-A melt point (~70 °C) is from a secondary literature discussion citing a patent and is not a rigorously established phase transition in the supplied crystallographic source. Above it, solid-state solubility is not supported without fusion thermodynamics/polymorph data. Literature conversion rates measured at 80–110 °C are from extract conditions and cannot be assumed to equal rates in limonene.
- No direct equilibrium THCA-A/limonene solubility data or solvent-specific nucleation data were found. No wet-lab evidence is implied.

## Data/source files

- Input temperature grid: `thca_temperature_grid.csv`; type-4 COSMO input/output: `thca_24a_temperature_input.json`, `thca_24a_temperature_output.json`.
- Curve data: `thca_temperature_solubility.csv` and `.json`; diagram: `thca_temperature_solubility.svg`.
- Limonene density/vapor-pressure data extracted from ThermoML: `limonene_density_data.csv`, `limonene_vapor_pressure_data.csv`.
- NIST source: `https://webbook.nist.gov/cgi/cbook.cgi?ID=C138863&Type=TBOIL` and ThermoML dataset `https://doi.org/10.1021/je8007414`.
- openCOSMO-RS 24a: Müller et al., *Fluid Phase Equilibria* 589 (2025), 114250, `https://doi.org/10.1016/j.fluid.2024.114250`; the study's solvation data are mainly at 25 °C.
- THCA-A decarboxylation kinetics: Wang et al., *Cannabis and Cannabinoid Research* 1 (2016), 262–271, `https://doi.org/10.1089/can.2016.0020`.
- THCA-A reported melt and THCA-B comparison: Filer, *Cannabis and Cannabinoid Research* 6 (2021), 446–448, `https://doi.org/10.1089/can.2021.0003` (cites WO2004/026857 A2 for the ~70 °C melt claim).
- MSZW definition/protocol dependence: Kadam et al., *Chemical Engineering Science* 72 (2012), 10–19, `https://doi.org/10.1016/j.ces.2012.01.002`.
