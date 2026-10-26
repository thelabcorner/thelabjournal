import type { ReactNode } from 'react'
import { DitherScene } from './DitherScene'
import { InterconnectionNetwork } from './InterconnectionNetwork'
import './oxp-architecture-figures.css'

/**
 * Responsive editorial diagrams for the OpenFork/OXP article.
 * Mobile artboards use 9:16 portrait compositions; desktop uses 16:9 landscape.
 * The lead diagram is a directed interconnection graph with distinct callers.
 */
function Figure({ number, title, caption, diagramLabel, children }: {
  number: number
  title: string
  caption: string
  diagramLabel: string
  children: ReactNode
}) {
  const identifier = 'ofarch-figure-' + number
  return <figure className="research-figure jf-figure ofarch-figure" aria-labelledby={identifier}>
    <div className="figure-top jf-top">
      <span>Fig. {String(number).padStart(2, '0')} / System architecture</span>
      <span className="figure-motion" aria-hidden="true">
        <DitherScene variant="ledger" className="figure-dither" fps={14} speed={0.68} intensity={0.85}/>
      </span>
    </div>
    <div className="ofarch-figure-inner">
      <h3 className="jf-title ofarch-title" id={identifier}>{title}</h3>
      <div className="ofarch-plate" role="group" aria-label={diagramLabel}>
        {children}
      </div>
    </div>
    <figcaption className="jf-caption ofarch-caption">{caption}</figcaption>
  </figure>
}

function PlateHeading({ section, index }: { section: string; index: string }) {
  return <div className="ofarch-plate-heading">
    <span>{section}</span><span className="ofarch-plate-serial">OF / {index}</span>
  </div>
}
function Flow({ label }: { label?: string }) {
  return <div className="ofarch-flow" aria-hidden="true">
    <span className="ofarch-flow-stem"/>
    {label && <span className="ofarch-flow-label">{label}</span>}
    <span className="ofarch-flow-arrow"/>
  </div>
}
function Panel({ kicker, title, description, emphasis = false, children }: {
  kicker: string
  title: string
  description?: string
  emphasis?: boolean
  children?: ReactNode
}) {
  return <div className={'ofarch-panel' + (emphasis ? ' ofarch-panel--emphasis' : '')}>
    <span className="ofarch-kicker">{kicker}</span>
    <strong>{title}</strong>
    {description && <span className="ofarch-description">{description}</span>}
    {children}
  </div>
}
function PlateFooter({ children }: { children: ReactNode }) {
  return <div className="ofarch-plate-footer"><span className="ofarch-plate-footer-rule"/><span>{children}</span></div>
}

function EntryPoints() {
  return <Figure number={1} title="The OpenFork network: every connection matters"
    diagramLabel="Connected network with eleven directed paths. ChatGPT reaches OXP; OXP reaches native Sessions, workers, tools, MCP servers and OFXP. Native Sessions also reach tools, MCP and OFXP; workers use native tools; OFXP reaches an independent OpenFork peer."
    caption="OpenCode supplied the agent harness foundation. OpenFork extends it by interconnecting external agents, native Sessions, delegated workers, customized tools, MCP integrations, and authenticated OFXP peers. Solid lines trace OXP-mediated operations; dashed lines show independent native agent routes. Each route still requires its own authorization.">
    <PlateHeading section="01 / CONNECTED SYSTEMS" index="NETWORK"/>
    <div className="ofarch-plate-content ofarch-overview-network">
      <span className="ofarch-section-label">OpenCode foundation / OpenFork extensions</span>
      <InterconnectionNetwork/>
    </div>
    <PlateFooter>Shared capabilities. Multiple routes. Independent principals.</PlateFooter>
  </Figure>
}

const branches = [
  ['01', 'Native tools', 'Project · symbols · edit · test', 'Approved roots + action permission'],
  ['02', 'Delegated workers', 'Create and supervise worker Sessions', 'Delegation and supervision grants'],
  ['03', 'Configured MCPs', 'Discover · activate · invoke', 'Integration-specific authority'],
  ['04', 'OFXP peers', 'Remote capability + Session control', 'Paired peer + remote grants'],
  ['05', 'Session control', 'Inspect · prompt · stop · select', 'Authorized Session scopes'],
] as const
function OXPBranches() {
  return <Figure number={2} title="Five independently callable connections from OXP"
    diagramLabel="Portrait fanout: ChatGPT enters OXP at the top. A vertical numbered capability bus lists native tools, delegated workers, configured MCPs, OFXP peers and Session control, with a permission label for each."
    caption="These are five separate OXP routes, all visible in the interconnected system map above. A native OpenFork Session has its own independent connections to tools, configured MCP integrations and OFXP. Worker delegation creates a native Session instead of a simulated remote shell.">
    <PlateHeading section="02 / CAPABILITY BUS" index="OXP"/>
    <div className="ofarch-plate-content ofarch-bus-content">
      <div className="ofarch-source-pill">CHATGPT <span>External agent</span></div>
      <Flow/>
      <Panel kicker="MCP-FACING CONNECTOR" title="OXP" description="Direct tools + on-demand capability dispatch" emphasis/>
      <div className="ofarch-bus-rail" role="list" aria-label="Available capability families">
        {branches.map(([index, name, action, scope]) => <div className="ofarch-bus-item" role="listitem" key={index}>
          <div className="ofarch-bus-marker"><span>{index}</span></div>
          <div className="ofarch-bus-copy">
            <strong>{name}</strong>
            <span>{action}</span>
            <small>{scope}</small>
          </div>
        </div>)}
      </div>
    </div>
    <PlateFooter>One connection · five separately guarded paths</PlateFooter>
  </Figure>
}

const activation = [
  ['01', 'Configured', 'A server exists in OpenFork configuration.'],
  ['02', 'Activated on request', 'OXP opens a transient, owned connection.'],
  ['03', 'Tool call dispatched', 'Selected schemas and actions are used.'],
  ['04', 'Released or idle', 'Connection closes; config is unchanged.'],
] as const
function MCPActivation() {
  return <Figure number={3} title="MCP access without permanently loading every server"
    diagramLabel="Portrait state machine: configured, activated on request, dispatched call, and released or idle, with four downward arrows. A separate ownership boundary follows."
    caption="The transient OXP MCP activation pool exists in recent OpenFork source and must run in a deployed host build. Native Session Code-mode activation has separately owned connections.">
    <PlateHeading section="03 / CONNECTION LIFECYCLE" index="MCP"/>
    <div className="ofarch-plate-content ofarch-activation-content">
      <div className="ofarch-lifecycle-lead"><strong>On-demand MCP</strong><span>Transient connection / OXP-owned</span></div>
      <div className="ofarch-lifecycle" role="list">
        {activation.map(([number, title, detail], i) => <div key={number} className="ofarch-lifecycle-group" role="listitem">
          <div className="ofarch-lifecycle-card">
            <span className="ofarch-index ofarch-index--solid">{number}</span>
            <div><strong>{title}</strong><span>{detail}</span></div>
          </div>
          {i < activation.length - 1 && <Flow/>}
        </div>)}
      </div>
      <div className="ofarch-boundary">
        <span>SEPARATE CONNECTION OWNERS</span>
        <strong>OXP transient</strong><span className="ofarch-boundary-divider">≠</span><strong>Native Session</strong>
      </div>
    </div>
    <PlateFooter>Activation does not rewrite server settings</PlateFooter>
  </Figure>
}

function PeerExchange() {
  return <Figure number={4} title="One OXP entry can reach another OpenFork machine"
    diagramLabel="Portrait route: ChatGPT enters OXP on Machine A, crosses an authenticated and permission-checked OFXP link, then reaches a separately owned OpenFork runtime on Machine B."
    caption="Machine A's OXP entry calls its OFXP adapter. Machine B keeps independent Sessions, workspace roots and grants. Remote capability calls and authorized Session supervision work; remote worker creation and peer messaging are not currently dispatched.">
    <PlateHeading section="04 / MACHINE-TO-MACHINE" index="OFXP"/>
    <div className="ofarch-plate-content ofarch-peer-content">
      <div className="ofarch-source-pill">CHATGPT <span>OXP connector</span></div>
      <Flow/>
      <Panel kicker="MACHINE A · LOCAL HOST" title="OpenFork A" description="OXP ingress · tools · Sessions">
        <div className="ofarch-panel-tag">OFXP client / caller</div>
      </Panel>
      <Flow label="Authenticated route"/>
      <div className="ofarch-exchange-gate">
        <span>OFXP / PEER BOUNDARY</span>
        <strong>Identity → grants → dispatch</strong>
        <small>Peer pairing ≠ blanket authority</small>
      </div>
      <Flow/>
      <Panel kicker="MACHINE B · REMOTE HOST" title="OpenFork B" description="Independent roots · Sessions · state">
        <div className="ofarch-panel-tag">OFXP server / dispatcher</div>
      </Panel>
      <div className="ofarch-peer-status">
        <div><span className="ofarch-status-indicator ofarch-status-indicator--solid"/><strong>Executable</strong><span>Tools + granted Session control</span></div>
        <div><span className="ofarch-status-indicator ofarch-status-indicator--outline"/><strong>Not dispatched</strong><span>Remote workers + peer messages</span></div>
      </div>
    </div>
    <PlateFooter>Paired hosts retain independent authority</PlateFooter>
  </Figure>
}

const principals = [
  { index: '01', name: 'Native Session', detail: 'Own Session + workspace permissions', kicker: 'LOCAL AGENT' },
  { index: '02', name: 'ChatGPT via OXP', detail: 'Connector grants + approved roots', kicker: 'EXTERNAL AGENT' },
  { index: '03', name: 'OpenFork via OFXP', detail: 'Peer grants + target root / action scope', kicker: 'REMOTE PEER' },
] as const
function Authority() {
  return <Figure number={5} title="Identity is not authorization"
    diagramLabel="Portrait authority model: three independently named principals are checked against route grants and action scope before shared OpenFork code executes."
    caption="A discovered tool or paired machine is not automatic permission. Requests reach the same domain owners only after the authority checks for that entry point and action.">
    <PlateHeading section="05 / TRUST & CONTROL" index="AUTH"/>
    <div className="ofarch-plate-content ofarch-authority-content">
      <span className="ofarch-section-label">The principal matters</span>
      <div className="ofarch-principals" role="list">
        {principals.map(p => <div className="ofarch-principal" role="listitem" key={p.index}>
          <span className="ofarch-index">{p.index}</span>
          <div className="ofarch-principal-content">
            <span className="ofarch-kicker">{p.kicker}</span>
            <strong>{p.name}</strong>
            <span>{p.detail}</span>
          </div>
        </div>)}
      </div>
      <Flow label="Permission boundary"/>
      <div className="ofarch-authorization">
        <span>EXECUTION GATE</span>
        <strong>Identity + route grants + action scope</strong>
        <div className="ofarch-gate-checks"><span>ROOT</span><span>TOOL</span><span>SESSION</span><span>PEER</span></div>
      </div>
      <Flow/>
      <Panel kicker="IF AUTHORIZED" title="Shared OpenFork implementation" description="One semantic owner, multiple controlled routes" emphasis/>
    </div>
    <PlateFooter>Human control · explicit scope · traceable execution</PlateFooter>
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
