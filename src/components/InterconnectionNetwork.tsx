/**
 * Connectivity map of the OpenFork extension network.
 *
 * Solid paths: operations entered through the OXP connector.
 * Dashed paths: independent native Session / worker execution.
 * Separate portrait and landscape route geometries preserve legibility
 * without shrinking a desktop graph to phone dimensions.
 */
const networkNodes = [
  { id:'chatgpt', eyebrow:'EXTERNAL AGENT', title:'ChatGPT', detail:'Connector caller' },
  { id:'session', eyebrow:'OPENCODE FOUNDATION', title:'Native Session', detail:'Agent runtime' },
  { id:'oxp', eyebrow:'EXTERNAL GATEWAY', title:'OXP', detail:'Authorized MCP ingress' },
  { id:'worker', eyebrow:'DELEGATION', title:'Worker Sessions', detail:'Durable native agents' },
  { id:'tools', eyebrow:'NATIVE CAPABILITIES', title:'Tools', detail:'Project · edit · test' },
  { id:'mcp', eyebrow:'INTEGRATIONS', title:'MCP servers', detail:'Configured tool providers' },
  { id:'ofxp', eyebrow:'PEER NETWORK', title:'OFXP', detail:'Authorized remote access' },
  { id:'peer', eyebrow:'SECOND INSTALLATION', title:'OpenFork B', detail:'Own tools + Sessions' },
] as const

function Edges({ landscape }: { landscape:boolean }) {
  // Each named path is a caller->capability edge, not a generic directional funnel.
  const mobile = [
    ['external','M94 89 C105 113 160 115 172 141'],
    ['control','M211 143 C223 113 249 103 265 89'],
    ['delegation','M151 210 C106 229 86 243 86 275'],
    ['tools','M210 210 C253 231 274 248 274 275'],
    ['mcp','M145 209 C12 225 -8 349 86 403'],
    ['ofxp','M215 205 C366 260 365 365 275 403'],
    ['native-tools','M284 89 C350 155 346 234 282 275'],
    ['native-mcp','M261 89 C169 157 167 321 88 403'],
    ['native-ofxp','M318 89 C337 195 348 336 286 403'],
    ['worker-tools','M158 306 L194 306'],
    ['peer','M275 468 L275 513'],
  ] as const
  const desktop = [
    ['external','M159 106 C180 105 185 99 211 99'],
    ['control','M232 119 C186 166 188 238 159 257'],
    ['delegation','M300 134 L300 173'],
    ['tools','M368 133 C424 165 423 258 371 276'],
    ['mcp','M390 96 C417 93 439 76 474 76'],
    ['ofxp','M390 112 C451 123 443 189 474 189'],
    ['native-tools','M159 257 C187 273 197 301 211 304'],
    ['native-mcp','M159 243 C188 16 431 30 474 76'],
    ['native-ofxp','M159 271 C274 360 433 314 474 189'],
    ['worker-tools','M300 235 L300 273'],
    ['peer','M545 223 L545 270'],
  ] as const
  const routes = landscape?desktop:mobile
  const orientation=landscape?'landscape':'portrait'
  return <svg className={'ofarch-network-wires ofarch-network-wires--'+orientation}
    viewBox={landscape?'0 0 640 360':'0 0 360 640'}
    preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <defs>
      <marker id={'ofarch-solid-arrow-'+orientation} viewBox="0 0 8 8" markerWidth="5" markerHeight="5" refX="7" refY="4" orient="auto">
        <path d="M1 1 L7 4 L1 7" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      </marker>
      <marker id={'ofarch-native-arrow-'+orientation} viewBox="0 0 8 8" markerWidth="5" markerHeight="5" refX="7" refY="4" orient="auto">
        <path d="M1 1 L7 4 L1 7" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      </marker>
    </defs>
    {routes.map(([name,d]) => {
      const native = name.startsWith('native-')||name==='worker-tools'
      return <path key={name} className={'ofarch-network-edge'+(native?' ofarch-network-edge--native':'')}
        d={d} markerEnd={'url(#ofarch-'+(native?'native':'solid')+'-arrow-'+orientation+')'}/>
    })}
  </svg>
}
export function InterconnectionNetwork() {
  return <div className="ofarch-network">
    <Edges landscape={false}/>
    <Edges landscape/>
    {networkNodes.map(node=><div className={'ofarch-network-node ofarch-network-node--'+node.id} key={node.id}>
      <span className="ofarch-network-eyebrow">{node.eyebrow}</span>
      <strong>{node.title}</strong>
      <span className="ofarch-network-detail">{node.detail}</span>
    </div>)}
    <div className="ofarch-network-legend" aria-label="Solid routes are OXP-mediated calls. Dashed routes are native agent or worker calls. Each route requires its own permissions.">
      <span><i className="ofarch-key-solid"/>OXP connections</span>
      <span><i className="ofarch-key-native"/>Native agent routes</span>
    </div>
  </div>
}
