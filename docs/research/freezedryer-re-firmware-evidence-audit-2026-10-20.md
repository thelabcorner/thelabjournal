# Freeze-Dryer Firmware Research: Cross-Vendor Evidence Audit

**Research note, October 20, 2026.** Source corpus: `W:\Dev\freezedryer-firmwares\analysis\`, inspected read-only using OpenFork OXP. Intended use: improve the misconception-led single-chamber lyophilization manuscript without importing unverified controller interpretation.

## Session and swarm visibility

The user identified Session `ses_ea48f5469ffeIsALV669AIYaza` and the active `freezedryer-re` Swarm. The specified Session returned `OXP_NOT_FOUND: Session is not available to OXP supervision` both with and without the approved workspace root. The Swarm capability returned no accessible swarms under the six advertised approved roots. This means **the live Session conversation, Swarm roster, tasks, blackboard, and messages were not reviewed**. It does not mean they do not exist. Files in the named analysis directory were independently accessible, and several reports had been updated within minutes of inspection. File modification alone does not establish member liveness, task settlement or current decisions. No swarm instructions were sent and no active analysis files were modified.

## Verified report inventory

The source workspace contains a substantial read-only collection of Harvest Right, Blue Alpine, and cross-vendor reports. Primary references include:

- `analysis/reports/harvestright/03-cross-vendor-heater-gate.md` lines 32–52, 144–256, 257–350, 371–395.
- `analysis/reports/harvestright/03-harvestright-process-operations.md` lines 372–422 and 705–748.
- `analysis/reports/bluealpine/01-bluealpine-process-operations.md` lines 579–675 and 711–730.
- `analysis/reports/bluealpine/02-bluealpine-state-machine.md` lines 616–661, 683–710.
- `analysis/reports/cross/01-cross-reference-table.md` lines 985–1028.
- `analysis/reports/cross/00-research-concept-index.md` lines 93–131 and 1289–1384.
- `analysis/reports/cross/04-method-and-evidence.md` lines 9–53 and 724–762.
- Direct decompilation: `analysis/ghidra/ba3_out/opitems/drain/ba_fn_dump.txt` lines 400–473, with instructions at lines 365–394.

The reports distinguish observed binary evidence from interpretation, and have repeatedly corrected fabricated Ghidra *function boundaries* introduced by a function-at-every-branch-target sweep. For example, `BLOCK_0002F422` and drying-end code block `0x2FC18` are real code regions but not verified function entries. Refer to addresses as **blocks**, not named functions.

## Findings ready to use, with scope

| Subject | Supported conclusion | Source / scope |
| --- | --- | --- |
| Harvest Right heater command | Boreas v5.5.25 contains a pressure-dependent 25/50/75% commanded duty selection in `BLOCK_0002F422`; mode and state conditions constrain the path. No proportional / integral / derivative temperature-error term was found in this heater-command path. | HR heater-gate report 144–179; firmware-build-specific. Do not infer that every Harvest Right unit lacks a PID elsewhere. |
| Blue Alpine temperature regulation | v3.3.4 contains a PID-based temperature-command path and a separate two-threshold generic actuator gate; the PID output is reported as **temperature**, not a 0–100% heater duty. | BA operations report 579–675; PID-to-specific-channel mapping partly inferred. |
| Distinct phase vocabulary | BA v3.3.4 labels phases Primary, Secondary, Final, Cooldown and binds them to recipe groups `primary_dry_*`, `secondary_dry_*`, `tertiary_dry_*`, `quaternary_dry_*`. The same build uses different naming schemes in UI and logs. | BA state-machine 616–639; source addresses and field slots given. |
| Timer-dependent BA progression | `FUN_420517fc` uses recipe-specific 64-bit time fields to advance drying sub-phases. End-of-cycle pressure criteria are separately present; a pressure-derivative **telemetry field alone does not prove the derivative is used by the endpoint state transition**. | BA state-machine 640–661; BA operations 711–730. |
| Harvest Right transition predicate | Code at `0x2FC18–0x2FC39` tests a sensing predicate, elapsed difference `>0x2A30` (10800, time unit not established), and signed counter `>8`, then branches to state 6 through the success continuation. | HR operations 372–422; does not identify the sensing predicate's input or prove ice absence. |
| Product state visibility | Neither recovered control architecture explicitly measures residual product ice mass or water-removal flux. Absence of named product-probe channels in the surveyed images is supporting negative evidence, not a proof of all physical hardware channels on all models. | Cross process report 115–133; vendor source inventory. |
| Drain-port gas admission | Neither inspected process controller provides an identified metered gas-admission control routine. HR has an explicit drain/vent path, a Drain state, a drain percentage timer and `Open Drain Valve to Vent`; BA uses door/drain closed interlocks and appears to require manual drain operation. A restricted external drain-port inlet remains an *unimplemented engineering experiment*, not a firmware feature. | HR heater-gate 371–395; cross process 502–525. |
| Gauge technology | HR firmware itself does **not** identify a Pirani, thermocouple, capacitance gauge or Agilent model. The manuscript's identification of an Agilent Type 531 thermocouple gauge is based on separate physical/vendor references and should remain a separately sourced hardware fact. | Cross process 462–471; manuscript literature 259–279. |

## Priority correction: Blue Alpine actuator comparator polarity

The cross-vendor report (`harvestright/03-cross-vendor-heater-gate.md` lines 59–68) describes:

- `measured < upper -> ON`
- `measured > lower -> OFF`
- `between thresholds -> HOLD`

For `lower < upper`, these conditions **overlap** inside the interval. They cannot both describe a conventional deadband with deterministic ON/OFF tests and a HOLD region.

Direct Ghidra decompilation of `FUN_42049304` instead shows:

1. `fVar6 = convert(param_1 + 0x1f)`; if `fVar6 < fVar2` then `goto LAB_42049422`, whose `uVar5=1` path enables the actuator (decomp lines 453–454, 423–426; instruction `olt.s` and branch at `0x4204941C`).
2. A second threshold is constructed from `param_1[0x1f] - param_1[0x20]` and converted (lines 455–457); if `fVar6 <= fVar2` the function exits without a new command; otherwise it reaches the `uVar5=0` path (lines 458–464; second comparison at `0x4204945C`).

If `fVar2` is the converted observation and the second threshold lies below the first, the code implements **ON above the first, OFF below the second, HOLD between**, opposite to the report's first two inequalities. That would also undermine the report's claim of *opposite pressure-control polarity across vendors*.

**Evidence boundary:** The generic routine is not, by itself, proof that the compared input is chamber pressure. The report grades the binding to the recipe's `*_upper_pressure` and `*_lower_pressure` fields as inferred (BA operations 654–659). Before publication, confirm the parameter object, unit conversion, threshold signs and call-site binding end-to-end. The direct branch direction and the prose discrepancy are sufficiently clear to block reuse of the existing verbal polarity claim.

## Other report claims that require narrower wording

1. **"Neither controller uses a fixed-time drying-completion rule"** is broader than the disassembly evidence. HR's reported successful transition includes a minimum elapsed requirement, and BA's sub-phases advance using recipe durations. More precise: *the examined controllers implement stage- and sensor-dependent completion logic; neither is established to infer spatial residual ice directly*.
2. **"Both vendors watch the derivative to determine completion"** is not established from the evidence quoted for Blue Alpine. Its filtered/differentiated pressure sensor and derivative telemetry exist, but a *dataflow from the derivative to the completion branch* has not yet been shown. Keep pressure derivative as an available observable, not a proven universal endpoint predicate.
3. **"Blue Alpine Kp=1.2, Kd=0.5, Ki=0"** is not fully grounded merely by the found floats. The BA operations report explicitly grades gain-role assignment as not definitive; the exact constructor argument order and units must be traced.
4. **"No PID in Harvest Right"** is too broad as a negative inference from literal strings alone. The defensible statement is *no temperature-PID error term was identified in the inspected v5.5.25 heater-duty path*.

## Current manuscript integration targets

- `sections/ResultsSection.tsx` lines 33–97: section 4.1 still titles the mechanism "Pressure-gated temperature control" and labels Eq. (4.1) **"PID duty cycle output (clamped 0–100%)"**. For the recovered Blue Alpine implementation this caption is incorrect: the PID's output is a temperature command, not a directly measured duty cycle. Change the caption and explicitly separate controller output, pressure-band enable state and downstream heater actuation.
- `sections/LiteratureReviewSection.tsx` lines 229–245: retain the distinction between patent disclosure, static firmware evidence and historic batch observations; do not give the unverified Blue Alpine polarity as settled.
- `figures/PressureTemperatureControlFigure.tsx` lines 4–12: preserve two build-specific lanes, include hysteresis only at the level actually confirmed by control-flow inspection, and distinguish sensor-setpoint regulation from the product's actual heat demand.
- `sections/DiscussionSection.tsx` lines 79–100: connect stage boundaries and pressure-derived endpoint criteria to **spatially unobserved residual ice**. The controller's switch to a named Secondary or Final stage is not itself a physical measurement proving primary sublimation completed.
- `sections/DiscussionSection.tsx` lines 133–163: the proposed restricted inlet is on the **bottom drain connection**, while the pump remains on its **separate unrestricted vacuum connection**. The firmware's drain/vent handling and any interlock consequences should be described as design constraints, not as validation of the intervention.
- `sections/LiteratureReviewSection.tsx` lines 259–279: treat the native gauge type as external instrument identification; reverse engineering alone establishes only a generic vacuum sensor channel.

The full thermodynamic claim remains the manuscript's own hypothesis: vapor generation may decline below the sum of cold-wall deposition and pump removal, allowing pressure to fall while ice remains; pressure-dependent gas conduction can then further reduce latent heating. None of the two binary images experimentally establishes how often this occurs, what its dynamic gain is, or whether a candidate controlled bleed improves sublimation.

## Provenance and collaboration

The cross-vendor project's concept index warns that the journal manuscript **changed mid-analysis while preserving file modification timestamps**. It was not necessarily a malicious replacement: concurrent editing and patching can have the same effect. Prefer content-based citations and exact code snippets over report lines alone. Cite the *current* manuscript state rather than the outdated concept-index line positions. Avoid modifying or interrupting the external research workspace while its writers remain active.

No repository files were committed or pushed as part of this note.
