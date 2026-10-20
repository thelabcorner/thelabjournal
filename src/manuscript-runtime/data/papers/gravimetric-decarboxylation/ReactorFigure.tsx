import type { ReactNode } from 'react';

type Configuration = 'external' | 'cup';

function ReactorSection({ configuration }: { configuration: Configuration }) {
  const isCup = configuration === 'cup';
  return (
    <svg
      viewBox="0 0 390 306"
      className="mx-auto block h-auto w-full max-w-[390px]"
      role="img"
      aria-label={isCup
        ? 'Section drawing: vessel seated in a closed-bottom cup mantle, both supported by a thermally isolated weighing platform.'
        : 'Section drawing: vessel independently supported by the scale, inside a fixed, open-bottom heating sleeve that does not touch the vessel.'}
    >
      <g strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* The vessel and contained sample are common to both reactor layouts. */}
        <path d="M157 66V180Q157 194 169 194H221Q233 194 233 180V66" stroke="var(--text)" strokeWidth="2.6" />
        <path d="M160 131H230V180Q230 191 220 191H170Q160 191 160 180Z" fill="var(--research-material)" fillOpacity=".25" stroke="none"/>
        <path d="M166 131H224" stroke="var(--research-material)" strokeWidth="1.2" strokeOpacity=".8" />
        <path d="M185 59V31M185 31l-4 7m4-7 4 7" stroke="var(--text-muted)" strokeWidth="1.5" />
        {/* A lightweight, non-structural probe is represented only as a dotted path. */}
        <path d="M216 55V115" stroke="var(--text-muted)" strokeWidth="1.4" strokeDasharray="3 4" />
        {isCup ? (
          <>
            {/* Cup mantle: entire assembly is on the load cell. */}
            <path d="M122 77V199Q122 214 137 214H253Q268 214 268 199V77"
              stroke="var(--research-thermal)" strokeWidth="13" />
            <path d="M134 87V196Q134 202 142 202H248Q256 202 256 196V87"
              stroke="var(--research-thermal)" strokeWidth="1.5" strokeOpacity=".5" />
            <path d="M142 218H248" stroke="var(--text-secondary)" strokeWidth="5" />
            <rect x="163" y="221" width="64" height="20" rx="3"
              stroke="var(--text-muted)" strokeWidth="1.5" fill="var(--bg-panel)" />
            {/* Strain-relieved and slack power lead, not a second mechanical support. */}
            <path d="M268 155Q307 152 304 182Q299 205 333 194L365 184"
              stroke="var(--text-secondary)" strokeWidth="2" strokeDasharray="4 5" />
          </>
        ) : (
          <>
            {/* Two independently supported heater walls. No heater contact with the vessel. */}
            <path d="M124 83V215M266 83V215" stroke="var(--research-thermal)" strokeWidth="13" />
            <path d="M139 92V203M251 92V203" stroke="var(--research-thermal)" strokeOpacity=".45" strokeWidth="1.4" />
            <path d="M124 217H95V269M266 217H295V269"
              stroke="var(--text-secondary)" strokeWidth="2.2"/>
            <path d="M75 269H114M276 269H315" stroke="var(--text-secondary)" strokeWidth="3"/>
            {/* The vessel alone reaches the weighing platform via an insulated column. */}
            <rect x="164" y="201" width="62" height="12" rx="2"
              stroke="var(--text-muted)" strokeWidth="1.5" fill="var(--bg-panel)"/>
            <path d="M195 215V238" stroke="var(--text-secondary)" strokeWidth="6"/>
          </>
        )}
        {/* Shared load cell, with identical dimensions, so the difference is the load path. */}
        <rect x="126" y="244" width="138" height="11" rx="2"
          stroke="var(--text-secondary)" strokeWidth="1.6" fill="var(--bg-surface)" />
        <rect x="142" y="259" width="106" height="28" rx="5"
          stroke="var(--text-secondary)" strokeWidth="1.8" fill="var(--bg-panel)" />
        <rect x="114" y="291" width="162" height="6" rx="2" fill="var(--text-muted)" fillOpacity=".25"/>
      </g>
      <g fill="var(--text-secondary)" fontSize="12" fontFamily="inherit">
        <text x="191" y="16" textAnchor="middle">CO₂ vent</text>
        <text x="195" y="153" textAnchor="middle" fill="var(--text)">Material</text>
        <text x="195" y="278" textAnchor="middle" fill="var(--text)" fontSize="11">Load cell</text>
        <text x="22" y="97">Heater</text>
        <path d="M70 94L114 94" fill="none" stroke="var(--text-muted)" strokeWidth="1.2"/>
        <text x="282" y="110">Vessel</text>
        <path d="M276 115L234 120" fill="none" stroke="var(--text-muted)" strokeWidth="1.2"/>
        {isCup ? (
          <text x="285" y="231" fontSize="10">Slack lead</text>
        ) : (
          <text x="14" y="254" fontSize="10">Fixed frame</text>
        )}
      </g>
    </svg>
  );
}

function Scheme({ number, title, description, configuration, children }: {
  number: string;
  title: string;
  description: string;
  configuration: Configuration;
  children: ReactNode;
}) {
  return (
    <div className="research-scheme min-w-0 rounded-md border border-[var(--border)] bg-[var(--bg-panel)]">
      <div className="border-b border-[var(--border)] px-3 py-3">
        <div className="flex items-start gap-2">
          <span className="shrink-0 font-mono text-xs text-[var(--text-muted)]">{number}</span>
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">{description}</p>
          </div>
        </div>
      </div>
      <div className="px-2 py-2">
        <ReactorSection configuration={configuration} />
      </div>
      <div className="border-t border-[var(--border)] px-3 py-3 text-xs leading-relaxed text-[var(--text-secondary)]">
        {children}
      </div>
    </div>
  );
}

export function ReactorFigure() {
  return (
    <figure className="research-scientific-figure research-reactor-figure my-5 rounded-lg border border-[var(--border)] bg-[var(--figure-bg)] p-3 sm:p-4">
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-[var(--text)]">Figure 2. One reactor, two heater load paths</span>
        <span className="text-[11px] text-[var(--text-muted)]">Conceptual sections · not to scale</span>
      </figcaption>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Scheme
          number="A"
          title="Independently supported sleeve"
          description="The scale measures the vessel and its contents."
          configuration="external"
        >
          The heater sits on a fixed frame. Clearance prevents its weight or expansion from adding force to the scale.
        </Scheme>
        <Scheme
          number="B"
          title="Closed-bottom cup mantle"
          description="The scale measures the heater, vessel and contents together."
          configuration="cup"
        >
          The mantle remains on the scale during tare and processing. Its weight cancels in the mass difference if the load path remains stable.
        </Scheme>
      </div>
      <div className="mt-3 border-t border-[var(--border)] pt-3">
        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
          <strong className="font-semibold text-[var(--text)]">Shared requirement:</strong> a milligram-scale change in
          sample mass must remain distinguishable from heater drift, airflow, cable forces and measurement noise. Both
          configurations require a suitably vented vessel, calibrated temperature monitoring, thermal protection for
          the scale and independent heater shutdown.
        </p>
      </div>
    </figure>
  );
}
