const prose = 'text-sm leading-relaxed text-[var(--text)]';

export function ConclusionSection() {
  return (
    <section id="conclusion" aria-labelledby="conclusion-heading" className="prose-heading mb-10">
      <div className="research-chapter-label mb-4">
        <span className="research-heading-number">6</span>
        <h2 id="conclusion-heading" className="text-base font-semibold text-[var(--text)] tracking-tight">Conclusion</h2>
      </div>
      <div className="space-y-4">
        <p className={prose}>
          The principal misconception in low-temperature freeze drying is that chamber pressure
          independently describes sublimation performance. A low indicated pressure does not
          establish how much water is leaving the product. The pressure difference conventionally
          termed a sublimation driving force represents potential for vapor transport rather than
          work already performed. Heat must still reach the ice, vapor must escape the product,
          and the refrigerated wall must capture it.
        </p>
        <p className={prose}>
          This is why maximum vacuum is not a universal objective, why a cold shelf setting can
          coexist with inadequate heat delivery, and why a gas-dependent thermocouple gauge
          cannot be treated as an absolute-pressure reference. In the examined single-chamber
          machine, product water can accumulate as ice inside the chamber while gas-phase
          water pressure falls. Tray contact, heater control and differences between shelf
          positions affect when the final wet region completes primary drying.
        </p>
        <p className={prose}>
          The purpose of the calculations is to clarify these physical relationships for
          practical interpretation. They do not demonstrate a faster cycle or a preferred
          operating pressure. Those conclusions require measured heat delivery, product
          temperature, water loss, wall deposition and shelf-specific responses under
          controlled operating conditions.
        </p>
      </div>
    </section>
  );
}
