import { ChapterLabel } from '../../../../components/sections/ChapterLabel';
import { InlineCite } from '../../../../components/prose/InlineCite';

const prose = 'text-sm leading-relaxed text-[var(--text)]';

export function ConclusionSection() {
  return (
    <section id="conclusion" aria-labelledby="conclusion-heading" className="prose-heading mb-10">
      <ChapterLabel number="6" id="conclusion-heading" title="Conclusions" />
      <div className="space-y-4">
        <p className={prose}>
          The operating assumptions examined here fail when pressure, vapor
          transfer, and heat delivery are treated as independent measurements
          of drying. Maximum pump-down is not a universal objective for
          primary drying. A vapor-pressure difference is a potential for
          sublimation, not a mechanical force or a measure of water loss.
          Total pressure and water-vapor partial pressure play different
          roles; a thermal-conductivity gauge measures neither composition
          nor residual product ice directly.
        </p>
        <p className={prose}>
          These distinctions are consequential in integrated cold-wall
          chambers. Sublimed water can accumulate on the refrigerated wall
          without leaving the apparatus, while the pump removes gas from
          the same volume. Late in primary drying, falling vapor generation
          can permit continued pump-down. If the resulting pressure decline
          reduces heat delivery to surviving ice, sublimation can weaken
          further. Dried-layer resistance, sublimative cooling, heater
          regulation, and heterogeneous tray contact modify this recursive
          response. A low-pressure trace may therefore represent either
          a completed batch or a heat-limited wet region.
        </p>
        <p className={prose}>
          Harvest Right, Stay Fresh, and Blue Alpine document comparable
          chamber principles, not identical controller performance. The
          proposed failure and any benefit from metered gas admission
          remain to be quantified. Discriminating tests require independent
          absolute-pressure and composition-sensitive measurements,
          heater power, product temperatures, gas and water throughput,
          and evidence of residual ice at the slowest drying location.
          Only a demonstrated increase in water-removal rate under matched
          product constraints establishes an efficiency improvement
          <InlineCite refs={['pikal1985', 'tchessalov2023']} />.
        </p>
      </div>
    </section>
  );
}
