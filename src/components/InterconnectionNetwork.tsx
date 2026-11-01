/**
 * Editorial connectivity matrix: two explicit principals, five capability
 * families and ten independent routes. The line is the relationship; the
 * words are not enclosed in redundant UI cards.
 */
const rows = [
  { number:'01', name:'Native tools', note:'Project · Symbols · Edit · Test' },
  { number:'02', name:'Existing Sessions', note:'Inspect · Prompt · Supervise' },
  { number:'03', name:'Worker delegation', note:'Durable native Sessions' },
  { number:'04', name:'MCP integrations', note:'Configured server access' },
  { number:'05', name:'OFXP peers', note:'Approved remote machines' },
] as const

export function InterconnectionNetwork() {
  return <div className="of-net" role="group"
    aria-label="ChatGPT via OXP and native OpenFork Sessions have distinct authorized routes to five capability families">
    <div className="of-net-head">
      <strong>ChatGPT <span>via OXP</span></strong>
      <span>Shared capability</span>
      <strong>Native Session</strong>
    </div>
    <div className="of-net-rows">
      {rows.map(row => <div className="of-net-row" key={row.number}>
        <div className="of-net-route of-net-route--external"><i aria-hidden="true"/></div>
        <div className="of-net-capability">
          <span>{row.number}</span>
          <div><strong>{row.name}</strong><small>{row.note}</small></div>
        </div>
        <div className="of-net-route of-net-route--native"><i aria-hidden="true"/></div>
      </div>)}
    </div>
    <p className="of-net-note">Both routes execute under their own authority, not under shared credentials.</p>
  </div>
}
