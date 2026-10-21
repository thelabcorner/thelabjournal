/**
 * Journal-only explanatory figures. Each visual is an interpretive schematic,
 * not a measurement or simulated output. Keep labels faithful to article prose.
 */
export type FigureNode = readonly [label: string, explanation: string]
export type FigureKind = 'flow' | 'compare' | 'matrix' | 'layers' | 'cycle' | 'pixel' | 'arc' | 'bytes' | 'pdf' | 'dependency'
export interface JournalFigureSpec {
  title: string
  caption: string
  kind: FigureKind
  nodes?: readonly FigureNode[]
  left?: readonly FigureNode[]
  right?: readonly FigureNode[]
  note?: string
}
interface FigurePair { overview: JournalFigureSpec; detail?: JournalFigureSpec }
export const journalFigureSpecs: Record<string, FigurePair> = {
  'learning-in-reverse': {
    overview: {
      title: 'Where learning begins',
      caption: 'Two working sequences from the essay. Both still require understanding and verification.',
      kind: 'compare',
      left: [['Before AI', 'Read and reason first'], ['Next', 'Build the initial version'], ['Then', 'Test what I understood']],
      right: [['With AI', 'Start with a rough artifact'], ['Next', 'Inspect what it gets wrong'], ['Then', 'Understand, refine and verify']],
    },
    detail: {
      title: 'An imperfect artifact becomes a test',
      caption: 'The feedback cycle described in the essay; arrows express iteration, not measured duration.',
      kind: 'cycle',
      nodes: [['Make a candidate', 'Something concrete to run'], ['Find a discrepancy', 'Inspect assumptions and failure cases'], ['Change the model', 'Revise the implementation and test again']],
    },
  },
  'agents-shouldnt-have-to-guess-twice': {
    overview: {
      title: 'Give the agent attributable evidence',
      caption: 'A bounded tool surface shortens the distance between a question and verifiable codebase evidence.',
      kind: 'flow',
      nodes: [['Objective', 'The user defines constraints'], ['Inspect', 'Project structure and symbols'], ['Modify', 'Grounded edits and checked patches'], ['Verify', 'Focused tests and recoverable errors']],
    },
    detail: {
      title: 'The recovery contract',
      caption: 'When an edit fails, preserve uncertainty and return enough evidence for a precise retry.',
      kind: 'compare',
      left: [['Ambiguous failure', '“Edit failed”'], ['Agent response', 'Guess at the file state'], ['Consequence', 'More speculative work']],
      right: [['Grounded failure', 'Changed or ambiguous target'], ['Agent response', 'Refresh exact evidence'], ['Consequence', 'Retry against the observed state']],
    },
  },
  'the-problems-i-can-solve-now': {
    overview: {
      title: 'The cost moves from setup to judgment',
      caption: 'Conceptual shift in the limiting work; box widths do not encode time, effort, or model capability.',
      kind: 'compare',
      left: [['Earlier barrier', 'Manual setup and tooling'], ['Available capacity', 'Fewer ideas reach a meaningful test']],
      right: [['Reduced barrier', 'Agent-assisted first implementations'], ['Current bottleneck', 'Reasoning quality, tests and evidence']],
    },
    detail: {
      title: 'One idea crosses several disciplines',
      caption: 'The essay describes problems that combine these competencies rather than a single coding trick.',
      kind: 'matrix',
      nodes: [['Raster to vectors', 'Sampling and topology'], ['HTML to native PDF', 'Layout and font shaping'], ['Compression research', 'Parsers and measurement'], ['Agent systems', 'Contracts and verification']],
    },
  },
  'i-started-with-html-to-pdf': {
    overview: {
      title: 'The rendering pipeline I kept expanding',
      caption: 'A conceptual document pathway; export targets are research directions, not all verified implementations.',
      kind: 'flow',
      nodes: [['HTML + CSS', 'Layout and document semantics'], ['Intermediate representation', 'Geometry, text and drawing commands'], ['Native output', 'PDF, with other targets explored']],
    },
    detail: {
      title: 'Same appearance, different document',
      caption: 'Appearance alone cannot tell whether text and vector geometry survive PDF conversion.',
      kind: 'pdf',
      left: [['Flat image PDF', 'The page is a single raster surface'], ['Selection', 'Text is no longer native text']],
      right: [['Native-object PDF', 'Text and paths remain separate objects'], ['Selection', 'Search and geometry can survive']],
    },
  },
  'on-acyclicity-in-agentic-engineering': {
    overview: {
      title: 'A strict prerequisite cycle cannot start',
      caption: 'A waits for B, B waits for C, and C waits for A. No task has an executable starting order.',
      kind: 'dependency',
      nodes: [['A', 'Needs B completed'], ['B', 'Needs C completed'], ['C', 'Needs A completed']],
    },
    detail: {
      title: 'Separate work permission from release evidence',
      caption: 'Illustrative repaired sequence: allow bounded development without bypassing final qualification.',
      kind: 'flow',
      nodes: [['Prototype', 'Disabled by default, fail-closed'], ['Integrate', 'Test narrowly scoped behavior'], ['Qualify', 'Independent acceptance and release evidence']],
    },
  },
  'when-the-process-becomes-the-work': {
    overview: {
      title: 'When the workflow consumes the experiment',
      caption: 'The same precautions become obstacles when each step depends on work the process forbids.',
      kind: 'compare',
      left: [['Process serving work', 'Build a testable candidate'], ['Then', 'Use evidence to add safeguards']],
      right: [['Process replacing work', 'Require a completed plan and review'], ['Then', 'Block the prototype needed to review']],
    },
    detail: {
      title: 'Add controls in response to actual failures',
      caption: 'A feedback rule for proportionate engineering safeguards.',
      kind: 'cycle',
      nodes: [['Make the change', 'Keep the scope bounded'], ['Observe a failure', 'Collect reproducible evidence'], ['Add the cheapest guard', 'Test whether it prevents recurrence']],
    },
  },
  'the-difference-one-word-makes': {
    overview: {
      title: 'A different grammatical role changes the plan',
      caption: 'In an agent harness, the model interpreting the instruction may act on either reading.',
      kind: 'compare',
      left: [['“Continue with the new model”', 'The model may be read as a tool'], ['Possible action', 'Delegate work to another model']],
      right: [['“Continue as the new model”', 'The model is the acting identity'], ['Possible action', 'Resume the task directly']],
    },
    detail: {
      title: 'A continuation prompt can avoid the ambiguity',
      caption: 'Tell the active agent what state and obligations to preserve, not which model to invoke.',
      kind: 'flow',
      nodes: [['Resume', 'Use existing session and state'], ['Preserve', 'Goal, constraints and completed work'], ['Validate', 'Recheck only stale or missing results']],
    },
  },
  'what-becomes-ordinary': {
    overview: {
      title: 'The moving boundary of ordinary knowledge',
      caption: 'A qualitative timeline: accumulated methods change which problems are approachable.',
      kind: 'layers',
      nodes: [['Earlier generations', 'Discover and formalize foundational mathematics'], ['Later generations', 'Learn those results as established tools'], ['Current work', 'Use accumulated knowledge to approach new problems']],
      note: 'Difficulty depends partly on the knowledge already available to build upon.',
    },
  },
  'neural-fields-and-e-ink': {
    overview: {
      title: 'Two different systems, one visual resemblance',
      caption: 'Left: numerical image fitting. Right: electrophoretic pigment response. Both panels are conceptual.',
      kind: 'pixel',
      left: [['Neural image fit', 'The representation is optimized against image error']],
      right: [['E Ink update', 'Voltage pulses move pigment toward an optical state']],
    },
    detail: {
      title: 'A possible physics-aware refresh optimizer',
      caption: 'Proposed research architecture; the model has not been built or validated on an E Ink panel.',
      kind: 'flow',
      nodes: [['Target + prior state', 'Image and panel transition history'], ['Response model', 'Predict pigment and optical changes'], ['Waveform selection', 'Balance error, ghosting, time and energy'], ['Panel measurement', 'Compare prediction with observed response']],
    },
  },
  'four-axis-lyophilization': {
    overview: {
      title: 'Four coupled engineering variables',
      caption: 'A conceptual operating framework; no quadrants represent independently measured effect sizes.',
      kind: 'matrix',
      nodes: [['Control architecture', 'How the chamber operating state is managed'], ['Gas-phase transport', 'Pressure-dependent conduction and mass transfer'], ['Vapor composition', 'Species partial pressures and driving forces'], ['Tray contact', 'Thermal path into the material']],
    },
    detail: {
      title: 'Two pressures with different physical jobs',
      caption: 'Total pressure affects the gas environment; water-vapor partial pressure enters the sublimation driving force.',
      kind: 'compare',
      left: [['Total chamber pressure', 'Sum of gaseous species partial pressures'], ['Relevant role', 'Gas density, collisions and transport regime']],
      right: [['Water-vapor partial pressure', 'Water species contribution to the gas pressure'], ['Relevant role', 'Vapor driving-force difference at the ice surface']],
    },
  },
  'nacre-vectorization': {
    overview: {
      title: 'Recover structure beyond sampled pixels',
      caption: 'Illustrative pixel coverage and fitted geometry; not an actual Nacre output or benchmark fixture.',
      kind: 'pixel',
      left: [['Raster evidence', 'Antialiased coverage on a sampling grid']],
      right: [['Editable geometry', 'A continuous fitted contour with stable topology']],
    },
    detail: {
      title: 'The reconstruction pipeline',
      caption: 'Geometry inference needs multiple checks before the result can be treated as editable artwork.',
      kind: 'flow',
      nodes: [['Coverage', 'Estimate subpixel boundaries'], ['Topology', 'Resolve connectivity and intersections'], ['Primitive fitting', 'Infer lines, arcs and curves'], ['Editable document', 'Preserve structural relationships']],
    },
  },
  'silica-pdf-engine': {
    overview: {
      title: 'Fidelity has two separate outputs',
      caption: 'A visual match is only one axis of a structurally faithful PDF conversion.',
      kind: 'pdf',
      left: [['Screenshot output', 'Visual appearance on one surface'], ['Missing structure', 'Text and geometry flattened']],
      right: [['Native document', 'Text objects, paths and fonts'], ['Required fidelity', 'Appearance plus document semantics']],
    },
    detail: {
      title: 'Performance depends on execution mode',
      caption: 'Metrics to report separately; no benchmark magnitudes are implied.',
      kind: 'matrix',
      nodes: [['Cold start', 'Browser or renderer initialization'], ['Warm conversion', 'Latency with reused workers'], ['Throughput', 'Documents per unit time'], ['Fidelity', 'Rendering and native-object preservation']],
    },
  },
  'arcfit-artwork': {
    overview: {
      title: 'The dieline is the authoritative geometry',
      caption: 'Curved-label projection schematic. The dashed rectangle represents incidental artwork bounds.',
      kind: 'arc',
      left: [['Unreliable reference', 'Hidden clip content changes selection bounds']],
      right: [['Stable reference', 'The physical dieline anchors the mapping']],
    },
    detail: {
      title: 'Deterministic placement needs stable inputs',
      caption: 'The warp contract fixes both its reference geometry and preservation constraint.',
      kind: 'flow',
      nodes: [['Physical dieline', 'Authoritative target boundary'], ['Visible artwork', 'Exclude incidental hidden clipping geometry'], ['Preserve width', 'Apply the specified warp constraint'], ['Repeat', 'Same input, same placement']],
    },
  },
  'webseal-client-integrity': {
    overview: {
      title: 'Trust must be enforced on the server',
      caption: 'The browser can supply integrity signals, while authorization remains a server decision.',
      kind: 'layers',
      nodes: [['Browser / untrusted', 'Observable and modifiable client code'], ['Verification signals', 'Release identity, freshness and integrity evidence'], ['Server / authority', 'Independent validation and permission decisions']],
    },
    detail: {
      title: 'Separate four guarantees',
      caption: 'Related safeguards should retain distinct purposes and failure behavior.',
      kind: 'matrix',
      nodes: [['Release identity', 'Which code version is claimed'], ['Freshness', 'When evidence was produced'], ['Replay controls', 'Whether evidence can be reused'], ['Recovery', 'What happens after a failed check']],
    },
  },
  'chunkdb-compression': {
    overview: {
      title: 'Find the chunk before decoding it',
      caption: 'Conceptual indexed random access, with independently addressable compressed chunks.',
      kind: 'flow',
      nodes: [['Request record', 'Lookup logical identifier'], ['Chunk index', 'Locate compressed span'], ['Decode target', 'Only the needed chunk'], ['Return row', 'Avoid a full-file decode']],
    },
    detail: {
      title: 'Compression ratio is only one dimension',
      caption: 'A candidate needs to fit its access pattern rather than maximize compression in isolation.',
      kind: 'matrix',
      nodes: [['Encoded bytes', 'Storage footprint'], ['Random read', 'Time to locate and decode'], ['Update locality', 'Write amplification'], ['CPU overhead', 'Compression and decompression cost']],
    },
  },
  'anvil-lossless-codec': {
    overview: {
      title: 'Reuse a phrase with structured corrections',
      caption: 'Symbolic byte slots illustrate the TCOPY hypothesis, not an encoded stream or measured sample.',
      kind: 'bytes',
      left: [['Reference phrase', 'Copy from a previous occurrence']],
      right: [['Adjusted phrase', 'Shared arithmetic delta plus sparse residual edits']],
    },
    detail: {
      title: 'Novelty and measured advantage are separate tests',
      caption: 'The recorded study found zero Pareto wins against its chosen baselines.',
      kind: 'compare',
      left: [['Mechanism', 'Arithmetic copy and sparse corrections'], ['What passed', 'Round-trip and fuzz checks']],
      right: [['Performance test', 'Compression ratio and throughput'], ['Observed so far', 'No Pareto win on both axes']],
    },
  },
  'essemble-extendscript': {
    overview: {
      title: 'Modern authoring, ES3-compatible output',
      caption: 'A possible ESSEMBLE build pathway; feature coverage is subject to runtime testing.',
      kind: 'flow',
      nodes: [['Modern source', 'Authoring and imported modules'], ['Build graph', 'Resolve dependencies and transform'], ['ES3-compatible bundle', 'Match old JavaScript semantics'], ['Adobe host', 'Execute and validate ExtendScript']],
    },
    detail: {
      title: 'Compatibility is an output property',
      caption: 'Source convenience is useful only if the emitted artifacts work in the target host.',
      kind: 'matrix',
      nodes: [['Module resolution', 'Correct dependency ordering'], ['Syntax lowering', 'No unsupported syntax'], ['Runtime behavior', 'Needed polyfills and host APIs'], ['Inspection', 'Understandable generated artifacts']],
    },
  },
}
