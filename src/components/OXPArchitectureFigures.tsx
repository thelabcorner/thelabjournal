import type { ReactNode } from 'react'
import { InterconnectionNetwork } from './InterconnectionNetwork'
import './oxp-architecture-figures.css'

/**
 * Five native, selectable, responsive editorial figures.
 * Each answers one architectural question; none is a scaled screenshot or an iframe.
 */
function Figure({ number, title, caption, label, children }: {
  number: number
  title: string
  caption: string
  label: string
  children: ReactNode
}) {
  const id = 'ofarch-figure-' + number
  return <figure className="research-figure of-figure" aria-labelledby={id}>
    <div className="of-figure-heading">
      <span className="of-figure-num">{String(number).padStart(2, '0')}</span>
      <h3 id={id}>{title}</h3>
    </div>
    <div className="of-plate" role="group" aria-label={label}>{children}</div>
    <figcaption className="of-figure-caption">{caption}</figcaption>
  </figure>
}

function Overview() {
  return <Figure number={1}
    title="One harness, independently authorized routes"
    label="Five-row OpenFork capability matrix. ChatGPT through OXP and a local native Session each have an independent route to tools, existing Sessions, worker delegation, MCP integrations, and OFXP peers."
    caption="Two entry principals reach overlapping OpenFork capabilities. Connections in the same row share a capability family, not a permission grant. A delegated worker becomes a native Session; an OFXP peer remains another OpenFork installation.">
    <InterconnectionNetwork/>
  </Figure>
}

function SharedImplementation() {
  return <Figure number={2}
    title="Different callers, one implementation"
    label="An external OXP request and a native Session request cross different permission boundaries, then call the same OpenFork domain implementation."
    caption="The OXP adapter checks its external caller's grants; a native Session uses its Session and workspace permissions. The Project inspection domain service is shared, so repository logic need not be implemented twice.">
    <div className="of-parity">
      <div className="of-parity-sources">
        <div className="of-source of-source--external">
          <strong>ChatGPT / OXP</strong>
          <p>External request</p>
        </div>
        <div className="of-source">
          <strong>OpenFork Session</strong>
          <p>Native request</p>
        </div>
      </div>
      <div className="of-parity-gates">
        <div className="of-gate"><span>01</span><strong>Approved root + connector grant</strong></div>
        <div className="of-gate"><span>02</span><strong>Session + workspace permission</strong></div>
      </div>
      <div className="of-join" aria-hidden="true"><span/><span/></div>
      <div className="of-service">
        <div className="of-service-symbol" aria-hidden="true">[ ]</div>
        <div>
          <strong>Project inspection</strong>
          <p>One domain service / shared repository semantics</p>
        </div>
      </div>
      <div className="of-parity-examples" aria-label="Example outputs">
        <span>Repository structure</span><span>Package scripts</span><span>Toolchain probes</span>
      </div>
    </div>
  </Figure>
}

const lifecycle = [
  { number: '01', title: 'Configured', detail: 'A server exists in OpenFork settings.' },
  { number: '02', title: 'Activated', detail: 'An authorized caller opens a connection.' },
  { number: '03', title: 'Invoked', detail: 'Only the selected tool contract is loaded.' },
  { number: '04', title: 'Released', detail: 'OXP-owned idle connections can close.' },
] as const

function MCPConnections() {
  return <Figure number={3}
    title="MCP connections have an owner and a lifetime"
    label="Four stages of on-demand MCP access: configured, activated, invoked and released. A separate boundary distinguishes OXP-managed transient connections from native Session connections."
    caption="On-demand connection management avoids treating every configured MCP server as permanently connected. OXP-owned transient activation and native Session activation are separate lifecycles; neither implicitly changes the other's active tools.">
    <div className="of-mcp">
      <ol className="of-mcp-stages">
        {lifecycle.map(stage => <li key={stage.number}>
          <span className="of-mcp-number">{stage.number}</span>
          <strong>{stage.title}</strong>
          <p>{stage.detail}</p>
        </li>)}
      </ol>
      <div className="of-mcp-owners">
        <div className="of-owner-rule"><strong>OXP-owned</strong><span>Transient client / external grant</span></div>
        <div className="of-owner-rule"><strong>Session-owned</strong><span>Native client / Session permission</span></div>
      </div>
      <p className="of-mcp-note">Configuration is persistent. A connection is not.</p>
    </div>
  </Figure>
}

function OFXPPeer() {
  return <Figure number={4}
    title="OFXP connects two independent runtimes"
    label="Machine A contains local native Sessions and an OXP ingress. The OFXP connection crosses an authenticated peer boundary into Machine B, which maintains its own roots, Sessions and grants. Remote operations are permission checked."
    caption="OXP can reach a paired OFXP machine through the local OpenFork host. Pairing establishes identity; remote root and action grants are separate. Remote Session control exists under explicit grants, while remote-worker delegation and peer messaging are not executable routes in this audited implementation.">
    <div className="of-peer">
      <div className="of-machine">
        <div className="of-machine-title"><span className="of-machine-id">A</span><strong>Local OpenFork</strong></div>
        <div className="of-machine-contents">
          <div><strong>OXP ingress</strong><span>ChatGPT as external principal</span></div>
          <div><strong>Native Sessions</strong><span>Local agents and workers</span></div>
        </div>
        <p>Initiates an OFXP request</p>
      </div>
      <div className="of-peer-link">
        <span className="of-peer-line" aria-hidden="true"/>
        <strong>Authenticated OFXP</strong>
        <span>Peer identity</span>
        <span>Target grants</span>
        <span>Approved roots</span>
        <span className="of-peer-line" aria-hidden="true"/>
      </div>
      <div className="of-machine">
        <div className="of-machine-title"><span className="of-machine-id">B</span><strong>Remote OpenFork</strong></div>
        <div className="of-machine-contents">
          <div><strong>Local authority</strong><span>Own workspaces and Sessions</span></div>
          <div><strong>Remote dispatch</strong><span>Granted tools and Session control</span></div>
        </div>
        <p>Decides what the caller may access</p>
      </div>
      <div className="of-peer-limits">
        <div><i aria-hidden="true"/> <strong>Executable</strong><span>Approved operations / Session supervision</span></div>
        <div><i className="of-limit-open" aria-hidden="true"/> <strong>Not dispatched</strong><span>Remote workers / peer messages</span></div>
      </div>
    </div>
  </Figure>
}

const permissions = [
  { principal: 'Native Session', identity: 'Session ID', scope: 'Workspace + tool policy', authority: 'Native runtime' },
  { principal: 'ChatGPT / OXP', identity: 'Connector principal', scope: 'Approved roots + grants', authority: 'OXP adapter' },
  { principal: 'OFXP peer', identity: 'Paired host identity', scope: 'Remote grants + target scope', authority: 'Remote dispatcher' },
] as const

function Authority() {
  return <Figure number={5}
    title="Capability access is checked at the boundary"
    label="An access-control matrix compares three principals: native Session, ChatGPT through OXP, and an OFXP peer. Each has its own identity, scope, and enforcement point before shared OpenFork services run."
    caption="Discovery identifies an available operation; execution still depends on the caller's actual authority. A local grant cannot expand an OFXP peer's rights on the target machine.">
    <div className="of-auth">
      <div className="of-auth-table" role="table" aria-label="Principal authorization matrix">
        <div className="of-auth-header" role="row">
          <span role="columnheader">Caller</span><span role="columnheader">Identity</span><span role="columnheader">Authorized scope</span><span role="columnheader">Enforced by</span>
        </div>
        {permissions.map((p,index) => <div className="of-auth-row" role="row" key={p.principal}>
          <strong role="cell"><span className="of-auth-num">0{index+1}</span>{p.principal}</strong>
          <span role="cell">{p.identity}</span>
          <span role="cell">{p.scope}</span>
          <span role="cell">{p.authority}</span>
        </div>)}
      </div>
      <div className="of-auth-result">
        <span className="of-auth-result-mark" aria-hidden="true">∩</span>
        <div>
          <strong>Effective permission</strong>
          <p>The intersection of every boundary the operation crosses.</p>
        </div>
      </div>
      <div className="of-auth-outcome">
        <strong>Shared OpenFork service</strong>
        <span>Invoked only after authorization</span>
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
