/**
 * Diagram Design editorial output, embedded as two separate aspect-specific HTML/SVG
 * source documents. The phone is a 9:16 reading surface; desktop is a 16:9 surface.
 * Each capability has two unambiguous, independent horizontal incoming routes.
 * The assets are self-contained so they can also be reviewed in isolation.
 */
const base = import.meta.env.BASE_URL
export function InterconnectionNetwork() {
  return <div className="ofarch-network" aria-label="OpenFork integration topology: five capabilities accessible through ChatGPT/OXP and native OpenFork Sessions">
    <iframe
      className="ofarch-network-frame ofarch-network-frame--portrait"
      src={base + 'diagrams/openfork-integration-portrait.html'}
      title="Mobile diagram: OXP and native Sessions each reach five shared OpenFork capabilities"
      loading="lazy"
      sandbox=""
    />
    <iframe
      className="ofarch-network-frame ofarch-network-frame--landscape"
      src={base + 'diagrams/openfork-integration-landscape.html'}
      title="Desktop diagram: distinct OXP and native Session routes converge on each OpenFork capability"
      loading="lazy"
      sandbox=""
    />
  </div>
}
