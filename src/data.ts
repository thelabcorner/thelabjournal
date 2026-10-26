import { firstPost } from './first-post'
import { agentToolsPost } from './agent-tools-post'
import { problemScopePost } from './problem-scope-post'
import { silicaDoorsPost } from './silica-doors-post'
import { acyclicityPost } from './acyclicity-post'
import { oxpArchitecturePost } from './oxp-architecture-post'
import { processWorkPost } from './process-work-post'
import { modelSwitchPromptPost } from './model-switch-prompt-post'
import { whatBecomesOrdinaryPost } from './what-becomes-ordinary-post'
import { beignetEinkPost } from './beignet-eink-post'

export type Topic = 'Essays' | 'Research' | 'Engineering' | 'Experiments' | 'Process'
export type Stage = 'Editorial draft' | 'Under review' | 'Working notes' | 'Concept'
export type FigureType = 'learning' | 'pressure' | 'contours' | 'geometry' | 'tokens' | 'pdf' | 'storage' | 'system' | 'signals' | 'agent' | 'frontier'

export interface Section {
  heading: string
  paragraphs: string[]
  takeaway?: string
}
export interface Entry {
  intro?: string[]
  slug: string
  title: string
  shortTitle: string
  contextLabel: string
  topic: Topic
  stage: Stage
  type: string
  date: string
  minutes: number
  summary: string
  issue: string
  figure: FigureType
  keywords: string[]
  sections: Section[]
}
export const entries: Entry[] = [
  firstPost,
  agentToolsPost,
  problemScopePost,
  silicaDoorsPost,
  acyclicityPost,
  oxpArchitecturePost,
  processWorkPost,
  modelSwitchPromptPost,
  whatBecomesOrdinaryPost,
  beignetEinkPost,
  {
    slug: 'four-axis-lyophilization',
    title: 'Low-temperature lyophilization: three theses in a four-axis optimization framework',
    shortTitle: 'A different way to think about freeze drying',
    contextLabel: 'Featured research / 001',
    topic: 'Research', stage: 'Under review', type: 'Research manuscript', date: '2026-09-13', minutes: 85, issue: 'R–001', figure: 'pressure',
    summary: 'Control architecture, gas-phase transport, vapor composition, and tray-contact engineering are coupled variables—not independent settings on a machine.',
    keywords: ['Thermodynamics', 'Sublimation', 'Transport', 'Control systems'],
    sections: [
      {
        heading: 'The problem with optimizing one variable at a time',
        paragraphs: [
          'Low-temperature drying is governed by several mechanisms operating at once. Optimizing vacuum pressure without examining heat delivery can shift the bottleneck rather than remove it.',
          'The manuscript organizes three formal theses inside a four-axis engineering framework: control architecture, pressure-dependent transport, vapor composition, and tray/contact thermal engineering. The fourth is a cross-cutting hardware boundary condition, not a fourth molecular thesis.'
        ],
        takeaway: 'A drying-process improvement is a coupled heat-and-mass-transfer claim. It cannot be established from pressure or temperature alone.'
      },
      {
        heading: 'Three theses, different strengths of evidence',
        paragraphs: [
          'The pressure-dependent gas conduction argument has experimental precedent and a tractable algebraic foundation. The control-engineering argument is derived within a simplified closed-loop model and must not be treated as a universal impossibility result for PID.',
          'The vapor-composition thesis remains a model-derived hypothesis. A possible gain in heat transfer competes with reduced sublimation driving force, and the net improvement has not been experimentally established on the target system.'
        ]
      },
      {
        heading: 'What the model must preserve',
        paragraphs: [
          'Chamber total pressure and water-vapor partial pressure are different physical quantities. The sublimation driving force depends on the latter. Conflating the two leads to incorrect interpretations of the operating window.',
          'The current engineering model resolves contact conduction, radiative exchange, molecular gas conduction, and flow-associated heat transfer while accounting for mass-transfer resistance. Its computational consistency is not the same thing as experimental validation.'
        ],
        takeaway: 'Evidence labels are first-class: experimental, derived, hypothesis, and unmeasured machine-specific behavior.'
      },
    ]
  },
  {
    slug: 'nacre-vectorization',
    title: 'Recovering geometric intent from raster pixels',
    shortTitle: 'Recovering geometry from pixels',
    contextLabel: 'Engineering note / 002',
    topic: 'Engineering', stage: 'Working notes', type: 'Algorithm design', date: '2026-10-09', minutes: 9, issue: 'E–002', figure: 'contours',
    summary: 'Nacre explores the jump from pixel coverage to clean native vector geometry: contours, primitives, intersections, and topology that survive editing.',
    keywords: ['Nacre', 'Vectorization', 'Computer vision'],
    sections: [
      { heading: 'The problem is not tracing', paragraphs: ['A raster contains sampled coverage, not paths. A naïve trace inherits antialiasing, compression, and pixel-grid artifacts into a vector document.', 'A practical vectorizer must infer meaningful primitives and enforce relationships among adjacent boundaries rather than optimize each edge in isolation.'] },
      { heading: 'Geometry before decoration', paragraphs: ['Nacre investigates subpixel boundary recovery, contour topology, primitive classification, and constrained fitting. Reconstructing circles and rounded corners is particularly useful because these structures occur frequently in designed artwork.', 'The engineering objective is editable native geometry. Pixel-perfect resemblance alone does not establish that the generated document is structurally good.'], takeaway: 'Render fidelity and geometric editability must be measured independently.' }
    ]
  },
  {
    slug: 'silica-pdf-engine',
    title: 'From browser layout to native PDF without losing the document',
    shortTitle: 'Browser fidelity, native output',
    contextLabel: 'Engineering note / 003',
    topic: 'Engineering', stage: 'Working notes', type: 'Rendering systems', date: '2026-10-09', minutes: 7, issue: 'E–003', figure: 'pdf',
    summary: 'Silica investigates multiple paths to native PDF: the current browser DOM, full Chromium, headless shell, and a separate rendering backend.',
    keywords: ['Silica', 'PDF', 'Browser rendering'],
    sections: [
      { heading: 'A PDF can look right and still be wrong', paragraphs: ['A screenshot embedded into a PDF preserves appearance but discards searchable text, editable vector paths, semantic structure, and compact resource reuse. The target is native output with high visual fidelity.', 'Rendering is not a single-path decision. An existing browser can offer runtime context; full Chromium and headless shell favor compatibility; a specialized backend can prioritize throughput under a narrower feature contract.'] },
      { heading: 'Measure startup separately from conversion', paragraphs: ['One-shot rendering, long-lived worker pools, and service mode have different cost structures. Comparing them without isolating browser startup obscures the actual conversion engine.', 'A credible fidelity claim requires broad fixture coverage, not an isolated green sample.'], takeaway: 'Separate cold-start latency, steady-state latency, throughput, native-object retention, and visual error.' }
    ]
  },
  {
    slug: 'arcfit-artwork',
    title: 'Deterministic artwork placement on curved packaging',
    shortTitle: 'The geometry of curved labels',
    contextLabel: 'Field note / 004',
    topic: 'Process', stage: 'Working notes', type: 'Applied geometry', date: '2026-10-09', minutes: 6, issue: 'P–004', figure: 'geometry',
    summary: 'ArcFit tackles the mismatch between Illustrator warp bounds, clipping masks, and the physical surface artwork is actually being applied to.',
    keywords: ['ArcFit', 'Illustrator', 'Packaging'],
    sections: [
      { heading: 'Artwork bounds are not dieline bounds', paragraphs: ['Hidden clipping-mask paths, nested masks, and artwork outside the visible region can distort a transformation that relies on ordinary object bounds.', 'The physical dieline is the stable reference. ArcFit examines warp mapping and preservation constraints relative to that geometry, rather than accepting incidental off-canvas paths as truth.'] },
      { heading: 'Reproducibility beats visual guesswork', paragraphs: ['For production labeling, the same input and dieline should produce the same placement. Deterministic geometry matters more than a tool that appears correct on one piece of artwork.', 'Nested masks and different layering arrangements remain important adversarial cases to validate.'], takeaway: 'The transform contract must specify exactly which geometry is authoritative.' }
    ]
  },
  {
    slug: 'webseal-client-integrity',
    title: 'The work behind a resilient browser boundary',
    shortTitle: 'Engineering a resilient client boundary',
    contextLabel: 'Systems note / 005',
    topic: 'Engineering', stage: 'Working notes', type: 'Application integrity', date: '2026-10-09', minutes: 8, issue: 'E–005', figure: 'system',
    summary: 'The practical case for reusable release identity, runtime integrity signals, and server-side capabilities instead of another bespoke client security system.',
    keywords: ['WebSeal', 'Integrity', 'Security'],
    sections: [
      { heading: 'A client can be observed and modified', paragraphs: ['Browsers cannot be treated as trusted execution environments. The goal is to make tampering harder to sustain and sensitive operations dependent on independently checked server decisions.', 'Release verification, freshness, evidence collection, and recovery have different guarantees. Collapsing them into a single “protected” badge hides meaningful distinctions.'] },
      { heading: 'The hard part is integration and upkeep', paragraphs: ['Teams can implement these ideas individually, but the cost of coordinating them grows: versioning, key management, replay controls, mutation semantics, and incident handling.', 'WebSeal explores standardizing the surrounding engineering burden without claiming to replace authentication, authorization, or server-side business rules.'], takeaway: 'Nothing is unhackable. Build resilient anyway.' }
    ]
  },
  {
    slug: 'chunkdb-compression',
    title: 'Compression as a storage primitive, not an export option',
    shortTitle: 'Compression beneath the data model',
    contextLabel: 'Experiment / 006',
    topic: 'Experiments', stage: 'Concept', type: 'Storage research', date: '2026-10-09', minutes: 6, issue: 'X–006', figure: 'storage',
    summary: 'ChunkDB asks whether compressed, independently addressable chunks can become a practical storage layer for structured application data.',
    keywords: ['ChunkDB', 'Compression', 'Storage'],
    sections: [
      { heading: 'Random access changes the compression problem', paragraphs: ['A maximal compression ratio is less interesting if reading one record requires decompressing an entire database. Chunk boundaries and indexing impose a different optimization objective.', 'The system explores codec choice, chunk sizing, and update locality across browser and desktop environments.'] },
      { heading: 'The question to measure', paragraphs: ['A useful comparison must combine encoded size, random-read latency, write amplification, update cost, and CPU overhead. A win on only one axis does not demonstrate a better storage system.'], takeaway: 'The benchmark should reward the workload, not a codec leaderboard.' }
    ]
  },
  {
    slug: 'anvil-lossless-codec',
    title: 'Investigating arithmetic reuse in lossless compression',
    shortTitle: 'A different primitive for repetition',
    contextLabel: 'Experiment / 007',
    topic: 'Experiments', stage: 'Working notes', type: 'Compression research', date: '2026-10-09', minutes: 7, issue: 'X–007', figure: 'signals',
    summary: 'Project Anvil tests copy commands with small arithmetic transformations and sparse corrections, then subjects the idea to measured-cost benchmarks.',
    keywords: ['Anvil', 'Lossless compression', 'Algorithms'],
    sections: [
      { heading: 'Repeated data is not always identical data', paragraphs: ['Many structured streams contain phrases that repeat with changed offsets or field values. Ordinary LZ copy handles exact bytes; an arithmetic-copy primitive can represent related phrases with sparse corrections.', 'This mechanism is a research candidate, not an established improvement. Measured tests so far have not produced a Pareto win over the chosen baselines.'] },
      { heading: 'A negative benchmark is a result', paragraphs: ['Encoding cost, decode dispatch, and model complexity matter alongside ratio. Report every dominating baseline, not just the most promising example.', 'The research priority is to find a real performance mechanism or reject the approach rather than frame novelty alone as success.'], takeaway: 'Zero measured Pareto wins is a useful constraint, not a marketing problem.' }
    ]
  },
  {
    slug: 'essemble-extendscript',
    title: 'Giving legacy scripting a modern development surface',
    shortTitle: 'Developer tooling for an older runtime',
    contextLabel: 'Engineering note / 008',
    topic: 'Engineering', stage: 'Concept', type: 'Tooling architecture', date: '2026-10-09', minutes: 5, issue: 'E–008', figure: 'tokens',
    summary: 'ESSEMBLE is a composable toolchain concept for Adobe ExtendScript: load arbitrary modules, work with modern workflows, and retain runtime compatibility.',
    keywords: ['ESSEMBLE', 'ExtendScript', 'Developer tools'],
    sections: [
      { heading: 'A workflow problem, not a library catalog', paragraphs: ['Legacy scripting ecosystems become difficult to maintain when module loading, bundling, type checking, and testing depend on isolated ad-hoc scripts.', 'ESSEMBLE is intended to orchestrate dedicated tools and work with arbitrary third-party libraries and local code, rather than replacing each existing subsystem.'] },
      { heading: 'The compatibility constraint', paragraphs: ['ExtendScript’s older JavaScript semantics make build output a first-class concern. Modern authoring convenience is only useful when the emitted program respects the target host.', 'A good toolchain should make the correct path the easy path while keeping the generated artifacts understandable.'] }
    ]
  }
]
export const topics: Array<Topic | 'All'> = ['All','Essays','Research','Engineering','Experiments','Process']
export const topicCount = (topic: Topic | 'All') => topic === 'All' ? entries.length : entries.filter((entry) => entry.topic === topic).length
