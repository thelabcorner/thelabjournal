import type { ReactNode } from 'react'
import { DitherScene } from './DitherScene'
import './oxp-architecture-figures.css'

/**
 * One architecture, five lenses. The visual invariant is that OXP, native
 * Sessions and authorized peers REUSE domain implementations rather than
 * creating a parallel tool stack or a fictional backing Session.
 */
function Figure({ number, title, caption, label, children }: {
  number: number
  title: string
  caption: string
  label: string
  children: ReactNode
}) {
  const id = 'ofarch-figure-' + number
  return <figure className="research-figure jf-figure ofarch-figure" aria-labelledby={id}>
    <div className="figure-top jf-top">
      <span>Fig. {String(number).padStart(2, '0')} / {number === 1 ? 'Overview' : 'Mechanism'}</span>
      {number === 1 && <span className="figure-motion" aria-hidden="true">
        <DitherScene variant="ledger" className="figure-dither" fps={14} speed={.68} intensity={.85}/>
      </span>}
    </div>
    <div className="jf-body ofarch-body">
      <h3 className="jf-title" id={id}>{title}</h3>
      <div className="ofarch-graphic" role="group" aria-label={label}>{children}</div>
    </div>
    <figcaption className="jf-caption">{caption}</figcaption>
  </figure>
}

function Caller({ name, detail }: { name: string; detail: string }) {
  return <div className="ofx-caller">
    <strong>{name}</strong><span>{detail}</span>
  </div>
}

function Merge() {
  return <div className="ofx-merge" aria-hidden="true"><i/><i/></div>
}

const capabilities = [
  { name: 'Native tools', detail: 'Project · Symbols · Git · Test' },
  { name: 'Existing Sessions', detail: 'Inspect · Send · Supervise' },
  { name: 'Delegated workers', detail: 'Real native Sessions' },
  { name: 'MCP integrations', detail: 'Configured servers' },
  { name: 'OFXP peers', detail: 'Authorized remote OpenFork' },
] as const

function Network() {
  return <Figure number={1}
    title="Two entry points. The same OpenFork underneath."
    label="ChatGPT through OXP and a native OpenFork Session converge on one shared OpenFork implementation with five capability families; delegated workers also become native Sessions that reuse that same implementation."
    caption="OpenFork reuses OpenCode’s agent harness and extends its capabilities. OXP does not create a second implementation: ChatGPT and native Sessions reach the same services under different grants. Delegated workers become native Sessions; OFXP reaches another separately authorized OpenFork host.">
    <div className="ofx-diagram ofx-network">
      <div className="ofx-pair ofx-caller-pair">
        <Caller name="ChatGPT" detail="via OXP connector"/>
        <Caller name="OpenFork Session" detail="native agent"/>
      </div>
      <Merge/>
      <div className="ofx-runtime">
        <div className="ofx-runtime-head">
          <span className="ofx-runtime-glyph" aria-hidden="true"><i/><i/><i/></span>
          <div><strong>OpenFork</strong><span>One shared implementation</span></div>
          <span className="ofx-one" aria-label="One implementation">1×</span>
        </div>
        <div className="ofx-capabilities">
          {capabilities.map((cap,i)=><div className="ofx-capability" key={cap.name}>
            <span className="ofx-index">{String(i+1).padStart(2,'0')}</span>
            <div><strong>{cap.name}</strong><span>{cap.detail}</span></div>
          </div>)}
        </div>
      </div>
      <div className="ofx-native-loop">
        <span className="ofx-loop-icon" aria-hidden="true">↳</span>
        <span><strong>Delegate → native worker</strong><small>Another Session; same underlying services</small></span>
      </div>
    </div>
  </Figure>
}

function Project() {
  return <Figure number={2}
    title="Project inspection is implemented once"
    label="OXP's project capability and native OpenFork Project tool pass through their own authorization gates but invoke one ProjectInspection producer."
    caption="Both entry points invoke the same ProjectInspection producer. OXP adds connector-root authorization and host-path redaction; native Sessions use their own workspace permissions. The repository logic is not reimplemented for ChatGPT.">
    <div className="ofx-diagram ofx-project">
      <div className="ofx-pair ofx-caller-pair">
        <Caller name="OXP · project" detail="external caller"/>
        <Caller name="Native · Project" detail="Session caller"/>
      </div>
      <div className="ofx-gates ofx-pair">
        <div>Connector grants</div><div>Session permissions</div>
      </div>
      <Merge/>
      <div className="ofx-producer">
        <span className="ofx-producer-symbol" aria-hidden="true"><i/><i/><i/></span>
        <div><strong>ProjectInspection</strong><span>One authoritative producer</span></div>
      </div>
      <div className="ofx-product">Repository structure <span>·</span> Toolchains <span>·</span> Entry points</div>
    </div>
  </Figure>
}

function MCP() {
  return <Figure number={3}
    title="One MCP catalog, separately owned connections"
    label="Both OXP and native Sessions reuse the configured MCP server catalog, but activate independent clients against the same external server."
    caption="The configured MCP server catalog belongs to OpenFork. OXP and native Sessions can discover the same integrations without copying their configuration, but their active connections and permissions remain separately owned. Lazy activation must not silently enable tools in the other caller.">
    <div className="ofx-diagram ofx-mcp">
      <div className="ofx-catalog"><strong>OpenFork MCP service</strong><span>One configured server catalog</span></div>
      <div className="ofx-split" aria-hidden="true"><i/><i/></div>
      <div className="ofx-pair ofx-clients">
        <Caller name="OXP client" detail="transient, connector-owned"/>
        <Caller name="Native client" detail="Session-owned"/>
      </div>
      <Merge/>
      <div className="ofx-endpoint"><strong>Configured MCP server</strong><span>Same tools; independent client lifecycles</span></div>
    </div>
  </Figure>
}

function Peer() {
  return <Figure number={4}
    title="OFXP reuses OpenFork on both machines"
    label="Machine A has an OpenFork runtime accessed by OXP and native Sessions; OFXP reaches a second independently authorized OpenFork runtime on Machine B, whose native tool and Session implementations are reused rather than recreated as remote-only APIs."
    caption="ChatGPT can enter Machine A through OXP, or a native Session can initiate the same OFXP route. Machine B then executes approved operations through its own OpenFork implementations. Each machine retains its identity, roots, Sessions and grants; remote worker creation and peer messaging are not depicted as executable routes.">
    <div className="ofx-diagram ofx-peer">
      <div className="ofx-pair ofx-hosts">
        <div className="ofx-host">
          <strong>Machine A</strong>
          <span>ChatGPT / OXP + native Sessions</span>
          <div className="ofx-host-core"><strong>OpenFork</strong><small>Native capability services</small></div>
        </div>
        <div className="ofx-host">
          <strong>Machine B</strong>
          <span>Independent roots + Sessions</span>
          <div className="ofx-host-core"><strong>OpenFork</strong><small>Native capability services</small></div>
        </div>
      </div>
      <div className="ofx-peer-bridge"><i aria-hidden="true"/><span>OFXP · authenticated peer grants</span><i aria-hidden="true"/></div>
      <div className="ofx-peer-footer"><span>Native tools</span><span>Session supervision</span><span>Remote operations</span></div>
    </div>
  </Figure>
}

const routes = [
  { caller:'Native Session', scope:'Session + workspace policy' },
  { caller:'ChatGPT / OXP', scope:'Approved roots + connector grants' },
  { caller:'OFXP peer', scope:'Remote host + target grants' },
] as const

function Authority() {
  return <Figure number={5}
    title="Separate grants. Shared executors."
    label="Three distinct callers each have their own authorization route, and all permitted operations resolve to shared native capability implementations. Permissions do not transfer between callers."
    caption="A discovered capability is not a granted operation. The executor is shared, but each caller must satisfy the permission boundaries its own request crosses. An OXP grant cannot give an OFXP peer more authority on its target machine.">
    <div className="ofx-diagram ofx-authority">
      <div className="ofx-authority-rows">
        {routes.map((route,i)=><div className="ofx-authority-row" key={route.caller}>
          <span className="ofx-index">{String(i+1).padStart(2,'0')}</span>
          <div><strong>{route.caller}</strong><span>{route.scope}</span></div>
          <span className="ofx-check" aria-hidden="true">✓</span>
        </div>)}
      </div>
      <div className="ofx-authority-join" aria-hidden="true"/>
      <div className="ofx-producer">
        <span className="ofx-producer-symbol" aria-hidden="true"><i/><i/><i/></span>
        <div><strong>Shared OpenFork executor</strong><span>Only after the applicable grants are checked</span></div>
      </div>
    </div>
  </Figure>
}

export function OXPArchitectureFigures({ sectionIndex }: { sectionIndex: number }) {
  switch(sectionIndex){
    case 0: return <Network/>
    case 3: return <Project/>
    case 5: return <MCP/>
    case 6: return <Peer/>
    case 9: return <Authority/>
    default: return null
  }
}
