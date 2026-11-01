import type { ReactNode } from 'react'
import { DitherScene } from './DitherScene'
import './oxp-architecture-figures.css'

/**
 * Five editorial illustrations that share the journal's existing figure shell.
 * The SVG art is source-owned and intentionally conceptual, not a product UI.
 * Captions disclose the architectural constraints each illustration simplifies.
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

const capabilityNames = ['Tools', 'Sessions', 'Workers', 'MCP', 'OFXP'] as const
const capabilityCoordinates = [[80,154],[120,154],[160,154],[200,154],[240,154]] as const

function NetworkIllustration() {
  return <svg viewBox="0 0 320 188" role="img" aria-labelledby="of-net-title of-net-desc">
    <title id="of-net-title">Two independent routes into five OpenFork capabilities</title>
    <desc id="of-net-desc">One entry represents ChatGPT through OXP and another represents a native OpenFork Session. Each connects to the five capability families, with separate authority.</desc>
    <g fill="none" stroke="currentColor" strokeLinecap="round">
      <path d="M76 31 C61 68 80 90 117 112" strokeOpacity=".47" strokeWidth="2.2"/>
      <path d="M244 31 C259 68 240 90 203 112" strokeOpacity=".47" strokeWidth="2.2"/>
      <path d="M117 112Q160 90 203 112" strokeOpacity=".19" strokeWidth="12"/>
      <path d="M117 112Q160 90 203 112" strokeOpacity=".85" strokeWidth="2.6"/>
      {capabilityCoordinates.map(([x,y],i)=><path key={'left'+i} d={`M117 112 Q${x+15} 124 ${x} ${y-8}`} strokeOpacity=".25" strokeWidth="1.3"/>)}
      {capabilityCoordinates.map(([x,y],i)=><path key={'right'+i} d={`M203 112 Q${x-15} 124 ${x} ${y-8}`} strokeOpacity=".25" strokeWidth="1.3" strokeDasharray="3 4"/>)}
    </g>
    <circle cx="76" cy="27" r="20" fill="var(--card)" stroke="currentColor" strokeOpacity=".6" strokeWidth="1.2"/>
    <circle cx="244" cy="27" r="20" fill="var(--card)" stroke="currentColor" strokeOpacity=".6" strokeWidth="1.2"/>
    <g stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round">
      <path d="M65 22h22v12H65zm4-4h14m-11 10h8" opacity=".8"/>
      <path d="M234 21h20v14h-20zm-4 19h28m-14-5v5" opacity=".8"/>
    </g>
    <circle cx="117" cy="112" r="4.1" fill="currentColor"/>
    <circle cx="203" cy="112" r="4.1" fill="var(--card)" stroke="currentColor" strokeWidth="1.4"/>
    {capabilityCoordinates.map(([x,y],i)=><g key={i}>
      <circle cx={x} cy={y} r="9" fill="var(--card)" stroke="currentColor" strokeOpacity=".64" strokeWidth="1.2"/>
      <circle cx={x} cy={y} r={i===2?3.2:2.3} fill="currentColor" opacity={i===2?.9:.65}/>
    </g>)}
    <path d="M72 172H248" stroke="currentColor" strokeOpacity=".19" strokeWidth=".8"/>
  </svg>
}
function Network() {
  return <Figure number={1} title="Two callers, one connected system"
    label="One direct external OXP caller and one native OpenFork Session, each connected through separately authorized paths to the same five capability families."
    caption="OXP and native Sessions reach overlapping OpenFork capability families. The illustration shows connectivity, not shared credentials: each route remains independently permission-scoped.">
    <div className="ofarch-art">
      <NetworkIllustration/>
      <div className="ofarch-two-labels">
        <div><strong>ChatGPT through OXP</strong><span>External connector</span></div>
        <div><strong>Native OpenFork Session</strong><span>First-party runtime</span></div>
      </div>
      <div className="ofarch-capabilities" aria-label="Five capability families">
        {capabilityNames.map((name,i)=><div key={name}><i aria-hidden="true"/><span>{name}</span><small>{String(i+1).padStart(2,'0')}</small></div>)}
      </div>
    </div>
  </Figure>
}

function ConvergenceIllustration() {
  return <svg viewBox="0 0 320 158" role="img" aria-labelledby="of-converge-title of-converge-desc">
    <title id="of-converge-title">Independent callers meet at the shared service</title>
    <desc id="of-converge-desc">Each caller passes through its own permission boundary. Both are routed to the same project inspection implementation.</desc>
    <g fill="none" stroke="currentColor" strokeLinecap="round">
      <path d="M77 31C77 65 92 79 132 96C151 104 160 119 160 134" strokeOpacity=".28" strokeWidth="11"/>
      <path d="M243 31C243 65 228 79 188 96C169 104 160 119 160 134" strokeOpacity=".28" strokeWidth="11"/>
      <path d="M77 31C77 65 92 79 132 96C151 104 160 119 160 134" strokeWidth="2"/>
      <path d="M243 31C243 65 228 79 188 96C169 104 160 119 160 134" strokeWidth="2" strokeDasharray="4 5"/>
      <circle cx="77" cy="31" r="20" strokeOpacity=".65" strokeWidth="1.4"/>
      <circle cx="243" cy="31" r="20" strokeOpacity=".65" strokeWidth="1.4"/>
    </g>
    <g stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round">
      <path d="M68 27h18v10H68zm4-4h10"/>
      <path d="M234 26h18v12h-18zm4 16h10"/>
    </g>
    <circle cx="106" cy="78" r="6" fill="var(--card)" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="214" cy="78" r="6" fill="var(--card)" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="160" cy="134" r="16" fill="var(--card)" stroke="currentColor" strokeWidth="2"/>
    <path d="M153 134h14m-7-7v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
}
function Convergence() {
  return <Figure number={2} title="Different callers, one implementation"
    label="Two curved routes from separate caller identities converge on one project inspection service after their independent permission checks."
    caption="The OXP adapter checks connector grants and approved roots; native Sessions use their own workspace permissions. Once authorized, both call the same project-inspection implementation.">
    <div className="ofarch-art">
      <ConvergenceIllustration/>
      <div className="ofarch-side-by-side">
        <div><strong>Connector grant</strong><span>ChatGPT / OXP</span></div>
        <div><strong>Session permission</strong><span>Native OpenFork</span></div>
      </div>
      <div className="ofarch-result"><strong>Project inspection</strong><span>Repository structure · scripts · toolchain</span></div>
    </div>
  </Figure>
}

const stages = [
  ['Configured','Server declared'],
  ['Activated','Client connected'],
  ['Invoked','Selected tool called'],
  ['Released','Idle client closed'],
] as const
function LifecycleIllustration() {
  return <svg viewBox="0 0 320 116" role="img" aria-labelledby="of-mcp-title of-mcp-desc">
    <title id="of-mcp-title">On-demand MCP connection lifecycle</title>
    <desc id="of-mcp-desc">Four state markers progress along a gently curving continuous route. A transient client can close without removing its configuration.</desc>
    <path d="M28 61C63 61 66 27 107 32S165 84 204 65S259 37 292 37" fill="none" stroke="currentColor" strokeOpacity=".23" strokeWidth="14" strokeLinecap="round"/>
    <path d="M28 61C63 61 66 27 107 32S165 84 204 65S259 37 292 37" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
    {[[28,61],[107,32],[204,65],[292,37]].map(([x,y],i)=><g key={i}>
      <circle cx={x} cy={y} r="12" fill="var(--card)" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx={x} cy={y} r={i===2?5:3.2} fill="currentColor" opacity={i===2?1:.55}/>
    </g>)}
    <path d="M32 93H290" stroke="currentColor" strokeOpacity=".15" strokeWidth="1" strokeDasharray="3 5"/>
    <path d="M284 90l6 3-6 3" fill="none" stroke="currentColor" strokeOpacity=".5" strokeWidth="1.3"/>
  </svg>
}
function MCP() {
  return <Figure number={3} title="MCP connections are temporary; configuration isn't"
    label="A four-state on-demand MCP connection path: configured, activated, invoked, released. OXP and native Sessions own their connections separately."
    caption="OXP's transient MCP pool and native Session activation have separate owners. On-demand activation was source-audited; whether it is present in a live host depends on that host's deployed build.">
    <div className="ofarch-art">
      <LifecycleIllustration/>
      <div className="ofarch-stage-grid">
        {stages.map(([name,detail],i)=><div key={name}><span>{String(i+1).padStart(2,'0')}</span><strong>{name}</strong><small>{detail}</small></div>)}
      </div>
      <div className="ofarch-ownership"><span>OXP-owned client</span><i/><span>Native Session client</span></div>
    </div>
  </Figure>
}

function PeerIllustration() {
  return <svg viewBox="0 0 320 160" role="img" aria-labelledby="of-peer-title of-peer-desc">
    <title id="of-peer-title">A peer exchange between two independent OpenFork machines</title>
    <desc id="of-peer-desc">Two bounded OpenFork instances exchange an authorized request over an OFXP connection. Each retains its own workspaces and sessions.</desc>
    <g stroke="currentColor" fill="none">
      <rect x="16" y="26" width="108" height="93" rx="26" strokeOpacity=".48" strokeWidth="1.5"/>
      <rect x="196" y="26" width="108" height="93" rx="26" strokeOpacity=".48" strokeWidth="1.5"/>
      <rect x="32" y="42" width="76" height="44" rx="9" strokeOpacity=".72"/>
      <rect x="212" y="42" width="76" height="44" rx="9" strokeOpacity=".72"/>
      <path d="M70 86v12m-18 0h36M250 86v12m-18 0h36" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M124 73C144 60 145 86 160 73S181 60 196 73" strokeOpacity=".22" strokeWidth="10" strokeLinecap="round"/>
      <path d="M124 73C144 60 145 86 160 73S181 60 196 73" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M158 63l7 9-7 9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    {[51,70,89,231,250,269].map((x,i)=><circle key={i} cx={x} cy="64" r="4.5" stroke="currentColor" strokeOpacity=".6" fill={i===1||i===4?'currentColor':'var(--card)'}/>)}
    <path d="M43 134H97M223 134h54" stroke="currentColor" strokeOpacity=".2"/>
  </svg>
}
function Peer() {
  return <Figure number={4} title="A peer is another OpenFork, not an extension of your session"
    label="Two rounded standalone machine environments exchange an OFXP request, but keep distinct grants and native session state."
    caption="Pairing authenticates the other OpenFork machine, while approved roots and remote action grants still restrict execution. Remote Session supervision is supported under grants; remote worker creation and peer messaging are not currently dispatched.">
    <div className="ofarch-art">
      <PeerIllustration/>
      <div className="ofarch-side-by-side">
        <div><strong>Local OpenFork</strong><span>OXP ingress + native Sessions</span></div>
        <div><strong>Remote OpenFork</strong><span>Independent roots + grants</span></div>
      </div>
      <div className="ofarch-route-note"><strong>OFXP</strong><span>Paired identity · authorized action · target scope</span></div>
    </div>
  </Figure>
}

function AuthorityIllustration() {
  return <svg viewBox="0 0 320 170" role="img" aria-labelledby="of-auth-title of-auth-desc">
    <title id="of-auth-title">Effective authority is the intersection of three checks</title>
    <desc id="of-auth-desc">Three overlapping permission scopes represent identity, route authorization, and action scope. A request only executes in the common permitted intersection.</desc>
    <g fill="none" stroke="currentColor">
      <circle cx="127" cy="68" r="48" strokeOpacity=".42" strokeWidth="1.6"/>
      <circle cx="193" cy="68" r="48" strokeOpacity=".42" strokeWidth="1.6"/>
      <circle cx="160" cy="111" r="48" strokeOpacity=".42" strokeWidth="1.6"/>
      <path d="M127 68C142 85 178 85 193 68" strokeWidth="2" strokeLinecap="round"/>
    </g>
    <circle cx="160" cy="81" r="10" fill="currentColor" opacity=".09"/>
    <circle cx="160" cy="81" r="4" fill="currentColor"/>
    <g fill="currentColor" opacity=".53">
      <circle cx="127" cy="47" r="3"/><circle cx="193" cy="47" r="3"/><circle cx="160" cy="130" r="3"/>
    </g>
    <path d="M160 91v24" stroke="currentColor" strokeOpacity=".18" strokeDasharray="2 4"/>
  </svg>
}
function Authority() {
  return <Figure number={5} title="Authorization is the intersection, not the sum"
    label="Three overlapping circles represent caller identity, permitted route and allowed action scope. The center marks an operation authorized by all three boundaries."
    caption="Tool discovery does not confer permission. Native Sessions, external OXP callers, and OFXP peers must each satisfy their own boundary checks; a local grant cannot expand remote authority.">
    <div className="ofarch-art">
      <AuthorityIllustration/>
      <div className="ofarch-checks">
        <div><strong>Identity</strong><span>Who is calling?</span></div>
        <div><strong>Route grant</strong><span>May they use this route?</span></div>
        <div><strong>Action scope</strong><span>What may execute?</span></div>
      </div>
      <p className="ofarch-centerline">Only the permitted overlap reaches a shared implementation.</p>
    </div>
  </Figure>
}

export function OXPArchitectureFigures({ sectionIndex }: { sectionIndex: number }) {
  switch(sectionIndex){
    case 0: return <Network/>
    case 3: return <Convergence/>
    case 5: return <MCP/>
    case 6: return <Peer/>
    case 9: return <Authority/>
    default: return null
  }
}
