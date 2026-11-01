/**
 * The two entry principals are intentionally separate.
 * Each row shows two independent routes to one capability family.
 * This is a topology matrix, not a sequential execution pipeline.
 */
const capabilities = [
  { number: '01', name: 'Native tools', detail: 'Project / Symbols / Edit / Test', external: 'execute', native: 'execute' },
  { number: '02', name: 'Existing sessions', detail: 'inspect / send / supervise', external: 'supervise', native: 'control' },
  { number: '03', name: 'Worker delegation', detail: 'create a durable native session', external: 'delegate', native: 'spawn' },
  { number: '04', name: 'MCP integrations', detail: 'configured and permitted servers', external: 'invoke', native: 'invoke' },
  { number: '05', name: 'OFXP peers', detail: 'separately authorized machines', external: 'connect', native: 'connect' },
] as const

export function InterconnectionNetwork() {
  return <div className="of-net" role="group" aria-label="Five shared OpenFork capability families, each accessible through independently authorized OXP and native-session routes">
    <div className="of-net-head">
      <div className="of-net-principal">
        <strong>ChatGPT <span>via OXP</span></strong>
        <span>External principal</span>
      </div>
      <div className="of-net-center-head">OpenFork capabilities</div>
      <div className="of-net-principal">
        <strong>Native session</strong>
        <span>Local principal</span>
      </div>
    </div>
    <div className="of-net-rows">
      {capabilities.map(capability => <div className="of-net-row" key={capability.number}>
        <div className="of-net-route of-net-route--external">
          <span>{capability.external}</span><i aria-hidden="true"/>
        </div>
        <div className="of-net-capability">
          <span className="of-net-index">{capability.number}</span>
          <div><strong>{capability.name}</strong><small>{capability.detail}</small></div>
        </div>
        <div className="of-net-route of-net-route--native">
          <i aria-hidden="true"/><span>{capability.native}</span>
        </div>
      </div>)}
    </div>
    <div className="of-net-bottom">
      <div><span className="of-net-point"/>A worker is a native OpenFork session, with its own lifecycle.</div>
      <div><span className="of-net-point of-net-point--outline"/>An OFXP peer retains independent authorization and state.</div>
    </div>
  </div>
}
