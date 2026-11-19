# Gravimetric decarboxylation manuscript — mass-led structure and scientific reader

**Date:** 2026-10-18
**Project:** `lab-journal-prototype`
**Scope:** `gravimetric-decarboxylation-co2-progress` only. This is a working-source overhaul; no publication, scientific validation, or deployment is implied.

## Editorial contract (No AI Slop / ACS-inspired)

- Write as an independent applied process engineer, not as a student, institutional lab, or credentialed academic body.
- Technical but approachable: present a physical concept, then the equation, then how to interpret it.
- Maintain objective scientific third-person prose. Journal essays may use first person; this research manuscript does not.
- Avoid inflated claims, generic introductions, manufactured conclusions, false dichotomies, repetitive safety disclaimers, and excessive lists of remote edge cases.
- Preserve concrete examples and distinguish **established mathematics**, **manual Decarboxulator V3/V4 implementation**, **informal experience**, **proposed instrumentation**, and **unperformed validation**.
- Treat gravimetric decarboxylation progress as a practical process-engineering *estimate*, not a chemical assay. Different initial feeds may undergo CO₂-evolving reactions; do not imply THCa is the only possible reactant.
- Do not invent degrees, affiliations, institutions, experiments, statistics, or precision.
- The paper is not responsible for solving every chemical, physical, instrumentation, or safety problem. Mention meaningful operating boundaries where they affect the method, without letting qualifications consume the explanation.
- Existing scientific paragraphs and derivations are preserved during the UI overhaul except for specifically requested short vacuum-attribution notes and chapter/figure/reference numbering.

## Reading order

1. Introduction
2. Manual gravimetric method and mass measurement pathway
3. Stoichiometric mass balance, measured progress, mixtures, aliquot calibration
4. Heater arrangements, independent versus integrated weighing load path, balance readability
5. Continuous acquisition, lot calibration, mass-derived target, process control
6. Complementary **pressure** methods: sealed accumulation first; isolated/measured vent accounting second; vacuum/initial gas, competing gases, optional Henry-law dissolution, gauge readability
7. Proposed experimental methods
8. Discussion
9. Conclusions

Stable section IDs and deep links remain unchanged. TOC, chapter numbers, subsection labels, equation numbers, inline cross-references, and figure captions must agree in displayed reading order.

### Vacuum interpretation

Lower initial absolute air pressure reduces residual air and the air/CO₂ composition correction. In a sealed, temperature-corrected initial-to-final inventory, starting air is already subtracted: vacuum chiefly improves gas attribution, **not intrinsic sensor accuracy**. In measured-vent calculations, less initial air makes discharged gas more CO₂-rich and reduces the importance of the composition correction. These are explanatory advantages, not experimentally established universal accuracy multipliers.

## Design contract

- WebSeal / shadcn-zinc / New York compact density.
- Manuscript with premium scientific white-paper character, not a consumer dashboard or generic blog template.
- Preserve the journal's centered shell and navigation, academic structure, references, provenance, mathematical typography, and printability.
- Small pastel accents only: blue for gas/CO₂, sage for gravimetric measurement and material, amber for thermal hardware; zinc for layout surfaces.
- Semantic inline variables use real subscript and superscript, not underscores; chemical formulas format numerals correctly; existing KaTeX math remains mathematically authoritative.
- Scientific inline styling must be scoped to the gravimetric manuscript and never silently alter journal entries or the lyophilization manuscript.
- The mass pathway figure is selectable React/HTML/KaTeX rather than an inaccessible screenshot. All displays must work at 320px and in both themes.

## Implementation inventory

- `src/manuscript-runtime/components/prose/ScientificInline.tsx`: finite reviewed variable vocabulary and inline chemical/unit rendering; never interpret arbitrary identifiers.
- `src/manuscript-runtime/data/papers/gravimetric-decarboxylation/MassPipelineFigure.tsx`: compact five-stage gravimetric method.
- `src/manuscript-runtime/data/papers/gravimetric-decarboxylation/index.tsx`: physical chapter reordering, chapter/section/equation references, variable-enriched paragraphs/tables, minimal vacuum clarification, figure integration.
- `src/manuscript-runtime/data/papers/gravimetric-decarboxylation/nav.ts`: matching chapter/subsection navigation.
- `src/manuscript-runtime/data/papers/gravimetric-decarboxylation/{ReactorFigure,VacuumCompositionFigure}.tsx`: figure numbering in new reading order.
- `src/gravimetric-manuscript-presentation.css`: scientific badges and compact responsive pipeline styling.
- `src/App.tsx`: explicit `research-body--gravimetric` class for style isolation.
- `scripts/manuscript-mass-flow-audit.mjs`: source-integrity and real Chromium verification.

## Checks

Run `bun run typecheck`, `bun scripts/manuscript-mass-flow-audit.mjs`, `bun scripts/manuscript-visual-audit.mjs`, and `bun scripts/manuscript-reader-ux-audit.mjs` against the local Vite server. The first three passed during this pass, including eight light/dark viewport pairs and sequential figure/citation checks. The full reader regression passed **18/18** scenarios across both manuscripts after explicitly scoping gravimetric-only inline mathematics styling. An earlier 320px overflow in the separate lyophilization manuscript was resolved without editing its scientific content.

No claim of direct experimental verification, full screen-reader parity, printed PDF parity, or deployed production behavior is made here.


## October 24, 2026 discussion: scope-preserving editorial instruction

The manuscript remains a **practical methods paper**: one of the “papers I wish I had” when learning and doing this work. Its contribution is the accessible organization of existing chemistry, mathematical methods, measurement sequences, and implementable engineering ideas that developed alongside Decarboxulator. Its value is practical reproducibility and explanation, not a new reaction-mechanism discovery, doctoral thesis, or experimentally validated chemical assay.

The complete supplied October 24 Zoom transcript has now been reviewed for manuscript-relevant remarks. Dr. Drew expressed enthusiasm for the practical project, noted the manuscript's length and its personal-project character, and was invited by the author to read it critically for errors. At approximately 4:35:49–4:36:43, when the author explicitly asked whether a detailed molecular reaction mechanism belonged in the paper, Drew distinguished chemistry and engineering lenses and answered, in general, **no**. At approximately 4:36:46, he reinforced that the author was not writing a PhD on THC. His comments do not constitute formal peer review or chemical-method validation.

Editorial priorities informed by the discussion:
- Explain the principal cannabinoid reaction, the meaning of gross-mass loss, its measurement boundary, the reference denominator, and what an estimated percentage represents before requiring the reader to work through formal derivations.
- Keep a concrete manual workflow and worked numeric example central. Aliquot calibration and optional pressure-inventory methods are extensions, not prerequisites for basic tracking.
- Distinguish established stoichiometry, historical/manual software capabilities, conceptual apparatus design, and proposed tests without demanding new experimentation for publication as a methods paper.
- Preserve equations, calculation results, chapter IDs, figures, provenance and reference traces. Correct factual or mathematical errors when verified; do not extend into a comprehensive kinetics or analytical chemistry thesis to anticipate every possible expert question.
- Maintain the actual author's scope and claim direction. No generic defensive additions, invented counterclaims, mass-spectrometric validation claims, or retroactive descriptions of experiments not performed.

Transcript-specific scientific guardrails:
- The roughly 4:13–4:49 exploration of THCA reaction mechanisms was exploratory and unresolved. Do not convert the improvised mechanism into an established figure or assert that heat alone reveals the microscopic pathway.
- The conversation's 50% progress illustration is a useful reason to show a **mass-loss stopping threshold**, not grounds to equate progress with assayed THC concentration or to assume linear time remaining.
- The CO2 released by decarboxylation is not itself the visible white smoke/aerosol, and claims about antioxidant benefit, dosing, or the comparative health of inhalation methods are not needed to explain this measurement.
- The salicylic-acid case is a **conditional stoichiometric example**, not a demonstrated direct thermal reactor process. Cite chemistry that actually concerns the free acid, without importing its reaction mechanism into this practical paper.
- The manuscript should answer how to take measurements, apply an explicit denominator, interpret the result, and reproduce the worked example. Optional future analytical verification can be described accurately without turning a practical methods manuscript into a chemical-kinetics dissertation.

The October 24 follow-up adds a short reader pathway, repeatable-weighing details, a reverse target-mass example, careful time-to-target language, and more directly applicable support for the salicylic-acid illustration. The work remains a draft: no new experiments, deployment, or external peer-review outcome is implied.
