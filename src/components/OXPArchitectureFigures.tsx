import type { ReactNode } from 'react'
import './oxp-architecture-figures.css'

/**
 * Source-grounded conceptual diagrams for the October 2026 OpenFork network essay.
 * They describe execution/authority paths, not latency or throughput measurements.
 */
function Figure({ number, title, caption, children }: {
  number: number
  title: string
  caption: string
  children: ReactNode
}) {
  return <figure className="ofarch-figure" aria-label={title}>
    <div className="ofarch-figure-top"><span>Fig. {String(number).padStart(2, '0')} / Architecture</span><span>OPENFORK · OXP · OFXP</span></div>
    <div className="ofarch-figure-inner">
      <h3 className="ofarch-figure-title">{title}</h3>
      {children}
    </div>
    <figcaption className="ofarch-caption">{caption}</figcaption>
  </figure>
}

function Block({ eyebrow, title, detail, tone, className = '' }: {
  eyebrow: string
  title: string
  detail: string
  tone?: 'core' | 'external' | 'peer'
  className?: string
}) {
  return <div className={['ofarch-block', tone ? 'ofarch-block--' + tone : '', className].filter(Boolean).join(' ')}>
    <span className="ofarch-block-eyebrow">{eyebrow}</span>
    <strong>{title}</strong>
    <span className="ofarch-block-detail">{detail}</span>
  </div>
}

function EntryPoints() {
  return <Figure number={1} title="Several ways in; one OpenFork-owned runtime"
    caption="Each ingress supplies a different principal and tool context. Arrows indicate authorized execution paths into a shared runtime, not shared credentials.">
    <div className="ofarch-entry-label">INDEPENDENT ENTRY POINTS</div>
    <div className="ofarch-entry-grid">
      <Block eyebrow="EXTERNAL AGENT" title="ChatGPT" detail="OXP / MCP ingress" tone="external"/>
      <Block eyebrow="NATIVE AGENT" title="OpenFork Session" detail="Desktop, browser or worker" tone="core"/>
      <Block eyebrow="EDITOR CLIENT" title="ACP" detail="OpenFork-backed Session" />
      <Block eyebrow="PEER AGENT" title="Remote OpenFork" detail="OFXP authenticated peer" tone="peer"/>
    </div>
    <div className="ofarch-merge" aria-hidden="true"><span>↓</span><span>AUTHORITY-AWARE ADAPTERS</span><span>↓</span></div>
    <div className="ofarch-owner">
      <span className="ofarch-owner-label">OPENFORK / LOCAL SIDECAR</span>
      <strong>Native execution and shared domain owners</strong>
      <span>Production V1 Session / tool runtime · shared Core state and services</span>
      <div className="ofarch-owner-grid">
        <div><strong>Custom tools</strong><span>Project · Symbols · Read · Edit · Test</span></div>
        <div><strong>Agent lifecycles</strong><span>Sessions · Workers · Swarms</span></div>
        <div><strong>Integrations</strong><span>Configured MCP servers · Code Mode</span></div>
        <div><strong>Peer exchange</strong><span>OFXP transport and remote dispatch</span></div>
      </div>
    </div>
  </Figure>
}

const oxpBranches = [
  ['01', 'Native tools', 'Project, symbols, read/edit, Git, tests and specialized actions', 'Approved root and per-action permission'],
  ['02', 'Worker delegation', 'Start and supervise real, durable OpenFork worker Sessions', 'Delegation grant and native lifecycle'],
  ['03', 'OpenFork MCPs', 'Discover, describe and call configured external MCP tools', 'Explicit workspace/integrations authority'],
  ['04', 'OFXP peers', 'Call capabilities and supervise authorized Sessions on paired hosts', 'Remote peer grants checked independently'],
  ['05', 'Session control', 'Inspect existing native Sessions; send or stop when authorized', 'Independent supervision/control authority']
] as const

function OXPBranches() {
  return <Figure number={2} title="What one OXP entry point can reach"
    caption="OXP is an MCP-facing adapter onto OpenFork capabilities. Each branch is an independent execution and permission path, not a second implementation of the corresponding native feature.">
    <div className="ofarch-hub">
      <span className="ofarch-hub-in"><span>ChatGPT / external agent</span><b>↓</b></span>
      <div className="ofarch-hub-core"><span>SECURE MCP INGRESS</span><strong>OXP</strong><small>Direct actions + lazy capability broker</small></div>
      <span className="ofarch-hub-down" aria-hidden="true">↓</span>
    </div>
    <div className="ofarch-branch-list">
      {oxpBranches.map(([index, title, detail, grant]) => <div className="ofarch-branch" key={index}>
        <span className="ofarch-branch-index">{index}</span>
        <div><strong>{title}</strong><span>{detail}</span></div>
        <small>{grant}</small>
      </div>)}
    </div>
  </Figure>
}

const mcpSteps = [
  ['1', 'Configured', 'OpenFork knows about the server; disabled state may be preserved'],
  ['2', 'Activated', 'A requested server gets an OXP-owned transient connection'],
  ['3', 'Described and called', 'Only selected MCP tool schemas are loaded and invoked'],
  ['4', 'Released or idle', 'The transient connection closes without rewriting user config']
] as const

function MCPActivation() {
  return <Figure number={3} title="An MCP server does not have to live in the permanent tool prefix"
    caption="The on-demand OXP connection pool is implemented in recent OpenFork source and requires deployment of that build. Native Code-mode MCP activation has its own Session-owned connection semantics.">
    <div className="ofarch-sequence">
      {mcpSteps.map(([number, title, detail], i) => <div key={number} className="ofarch-sequence-step">
        <span className="ofarch-sequence-index">{number}</span>
        <strong>{title}</strong>
        <p>{detail}</p>
        {i < mcpSteps.length - 1 && <span className="ofarch-sequence-arrow" aria-hidden="true">→</span>}
      </div>)}
    </div>
    <p className="ofarch-inline-note">Native Session tools and transient OXP MCP tools have separate ownership. Activating one is not permission to silently publish its credentials or tools to the other.</p>
  </Figure>
}

function PeerExchange() {
  return <Figure number={4} title="One local OXP connection; a second independent OpenFork host"
    caption="OXP enters Machine A. Its OFXP adapter uses Machine A's paired-peer runtime to invoke granted capabilities on Machine B. The peer retains its own workspace and Session authority. Remote worker creation and peer messaging are not currently dispatched.">
    <div className="ofarch-peer-topline">
      <span>CHATGPT</span><span aria-hidden="true">→</span><span>OXP / MACHINE A</span>
    </div>
    <div className="ofarch-peer-grid">
      <div className="ofarch-machine">
        <span className="ofarch-machine-kicker">HOST A · LOCAL OWNER</span>
        <strong>OpenFork A</strong>
        <div className="ofarch-machine-data">OXP ingress / native Session</div>
        <div className="ofarch-machine-data">Local tools, Sessions and MCPs</div>
        <div className="ofarch-machine-endpoint">OFXP client</div>
      </div>
      <div className="ofarch-wire">
        <span>Authenticated peer route</span>
        <div aria-hidden="true" className="ofarch-wire-line"><span>←</span><i/><span>→</span></div>
        <small>Peer identity · TLS · receipt / grant checks</small>
      </div>
      <div className="ofarch-machine ofarch-machine--remote">
        <span className="ofarch-machine-kicker">HOST B · INDEPENDENT OWNER</span>
        <strong>OpenFork B</strong>
        <div className="ofarch-machine-data">Own Sessions, tools and state</div>
        <div className="ofarch-machine-data">Approved roots / explicit grants</div>
        <div className="ofarch-machine-endpoint">OFXP server dispatcher</div>
      </div>
    </div>
    <div className="ofarch-status-legend">
      <span><b className="ofarch-status-dot"/>Executable: capability calls and approved Session supervision/control</span>
      <span><b className="ofarch-status-dot ofarch-status-dot--hollow"/>Planned: remote worker delegation and peer messaging</span>
    </div>
  </Figure>
}

function Authority() {
  const rows = [
    ['Native Session', 'Real Session / tool context', 'Native workspace, tool and Session permissions'],
    ['ChatGPT → OXP', 'External connector principal', 'OXP grants, approved roots, authorized Session scopes'],
    ['OpenFork A → OFXP B', 'Authenticated peer + original actor', 'Target peer grants, verified roots and action-specific control']
  ] as const
  return <Figure number={5} title="Different principals; the same domain implementations"
    caption="Permissions narrow across each boundary. A catalog entry, a discovered peer or a successful identity pairing does not itself authorize execution.">
    <div className="ofarch-authority-table" role="table" aria-label="OpenFork execution principals and permission boundaries">
      <div className="ofarch-authority-row ofarch-authority-heading" role="row"><span role="columnheader">Entry route</span><span role="columnheader">Execution identity</span><span role="columnheader">Authorization boundary</span></div>
      {rows.map(([name,principal,grant])=><div className="ofarch-authority-row" role="row" key={name}><strong role="cell">{name}</strong><span role="cell">{principal}</span><span role="cell">{grant}</span></div>)}
    </div>
    <div className="ofarch-law"><span>ARCHITECTURAL RULE</span><strong>One semantic owner; separately authorized execution routes.</strong></div>
  </Figure>
}

export function OXPArchitectureFigures({ sectionIndex }: { sectionIndex: number }) {
  switch (sectionIndex) {
    case 0: return <EntryPoints/>
    case 3: return <OXPBranches/>
    case 5: return <MCPActivation/>
    case 6: return <PeerExchange/>
    case 9: return <Authority/>
    default: return null
  }
}
