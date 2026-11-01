import type { ReactNode } from 'react'
import { InterconnectionNetwork } from './InterconnectionNetwork'
import './oxp-architecture-figures.css'

/**
 * Editorial diagrams, not interface mockups: each figure represents a specific
 * relationship with its own grammar. All text remains selectable and accessible.
 */
function Figure({ number, title, caption, label, children }: {
  number: number
  title: string
  caption: string
  label: string
  children: ReactNode
}) {
  const id = 'ofarch-figure-' + number
  return <figure className="of-figure" aria-labelledby={id}>
    <div className="of-figure-heading">
      <span className="of-figure-num" aria-hidden="true">{String(number).padStart(2, '0')}</span>
      <h3 id={id}>{title}</h3>
    </div>
    <div className="of-plate" role="group" aria-label={label}>{children}</div>
    <figcaption className="of-figure-caption">{caption}</figcaption>
  </figure>
}

function Overview() {
  return <Figure number={1}
    title="One harness, independently authorized routes"
    label="Five shared OpenFork capabilities each reachable by two distinct callers, ChatGPT through OXP and a native OpenFork session."
    caption="The two principals can reach overlapping capabilities, but their grants are not interchangeable. Worker delegation produces a native session; OFXP reaches an independently authorized installation.">
    <InterconnectionNetwork/>
  </Figure>
}

function SharedImplementation() {
  return <Figure number={2}
    title="Different callers, one implementation"
    label="Two independently permission-checked callers converge on the same project-inspection service, which returns repository structure, script discovery, and toolchain probes."
    caption="OXP's connector grants and native Session permissions are checked separately before both routes reach the same underlying Project inspection implementation.">
    <div className="of-converge">
      <div className="of-converge-callers">
        <div><strong>ChatGPT / OXP</strong><span>External request</span></div>
        <div><strong>OpenFork Session</strong><span>Native request</span></div>
      </div>
      <div className="of-converge-checks">
        <span>Connector grant + approved root</span>
        <span>Session + workspace permission</span>
      </div>
      <div className="of-converge-lines" aria-hidden="true"><i/><i/></div>
      <div className="of-converge-service">
        <strong>Project inspection</strong>
        <span>One authoritative domain implementation</span>
      </div>
      <div className="of-converge-output">Repository structure <span>·</span> Package scripts <span>·</span> Toolchain probes</div>
    </div>
  </Figure>
}

const lifecycle = [
  { id: '01', name: 'Configured', description: 'Available in OpenFork settings' },
  { id: '02', name: 'Activated', description: 'Open an authorized connection' },
  { id: '03', name: 'Invoked', description: 'Load and call the selected tool' },
  { id: '04', name: 'Released', description: 'Reclaim an idle connection' },
] as const

function MCPConnections() {
  return <Figure number={3}
    title="MCP connections have an owner and a lifetime"
    label="On-demand MCP lifecycle from configuration through activation and invocation to release, distinguishing externally owned from native session connections."
    caption="Configuration is persistent; a connection need not be. OXP-managed transient clients and native Session clients remain separately owned. The source-audited behavior requires an updated deployed OpenFork host to be available at runtime.">
    <div className="of-timeline">
      <ol className="of-timeline-stages">
        {lifecycle.map(stage => <li key={stage.id}>
          <span className="of-timeline-dot" aria-hidden="true"/>
          <div><strong>{stage.name}</strong><span>{stage.description}</span></div>
        </li>)}
      </ol>
      <div className="of-timeline-ownership">
        <div><strong>OXP-owned client</strong><span>Transient / connector authority</span></div>
        <div><strong>Session-owned client</strong><span>Native / Session authority</span></div>
      </div>
    </div>
  </Figure>
}

function OFXPPeer() {
  return <Figure number={4}
    title="OFXP connects independent OpenFork runtimes"
    label="Two distinct OpenFork machines joined by an authenticated OFXP connection; the target checks peer grants before executing supported remote operations."
    caption="Pairing authenticates the peer; it does not grant blanket access. Machine B independently enforces its approved roots and capabilities. Remote worker creation and peer messaging are not executable paths in the cited implementation.">
    <div className="of-federation">
      <div className="of-federation-host">
        <div className="of-federation-title"><span>A</span><strong>Local OpenFork</strong></div>
        <ul><li>ChatGPT through OXP</li><li>Native Sessions</li></ul>
        <p>Origin of request</p>
      </div>
      <div className="of-federation-link">
        <span className="of-federation-rail" aria-hidden="true"/>
        <strong>OFXP</strong>
        <span>Authenticated peer</span>
        <span>Remote grants</span>
        <span>Approved roots</span>
        <span className="of-federation-rail" aria-hidden="true"/>
      </div>
      <div className="of-federation-host">
        <div className="of-federation-title"><span>B</span><strong>Remote OpenFork</strong></div>
        <ul><li>Own roots and Sessions</li><li>Permission-checked dispatch</li></ul>
        <p>Independent execution authority</p>
      </div>
    </div>
    <div className="of-federation-status">
      <div><span className="of-status-dot" aria-hidden="true"/><strong>Available under grants</strong><span>Tools / Session supervision</span></div>
      <div><span className="of-status-dot of-status-dot--empty" aria-hidden="true"/><strong>Not dispatched</strong><span>Remote workers / peer messaging</span></div>
    </div>
  </Figure>
}

const principals = [
  { caller:'Native Session', identity:'Session ID', scope:'Workspace + tool policy', enforcement:'Native runtime' },
  { caller:'ChatGPT / OXP', identity:'Connector principal', scope:'Approved roots + grants', enforcement:'OXP adapter' },
  { caller:'OFXP peer', identity:'Paired host', scope:'Remote grants + target scope', enforcement:'Remote dispatcher' },
] as const

function Authority() {
  return <Figure number={5}
    title="Identity and authorization are separate"
    label="Authorization matrix showing three different principals, their identity, their permitted scope, and the enforcement point."
    caption="Discovery is not permission. Each operation is checked at every boundary it crosses before reaching a shared service. A local OXP grant cannot confer additional authority on a remote OFXP host.">
    <div className="of-auth">
      <div className="of-auth-table" role="table" aria-label="OpenFork execution authority">
        <div className="of-auth-header" role="row">
          <span role="columnheader">Caller</span><span role="columnheader">Identity</span><span role="columnheader">Scope</span><span role="columnheader">Enforced by</span>
        </div>
        {principals.map(p => <div key={p.caller} className="of-auth-row" role="row">
          <strong role="cell">{p.caller}</strong><span role="cell">{p.identity}</span>
          <span role="cell">{p.scope}</span><span role="cell">{p.enforcement}</span>
        </div>)}
      </div>
      <div className="of-auth-result">
        <span aria-hidden="true">∩</span><div><strong>Effective permission</strong><small>Intersection of the boundaries crossed</small></div>
      </div>
    </div>
  </Figure>
}

export function OXPArchitectureFigures({ sectionIndex }: { sectionIndex: number }) {
  switch (sectionIndex) {
    case 0: return <Overview/>
    case 3: return <SharedImplementation/>
    case 5: return <MCPConnections/>
    case 6: return <OFXPPeer/>
    case 9: return <Authority/>
    default: return null
  }
}
