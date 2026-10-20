from pathlib import Path
p=Path("src/manuscript-runtime/data/papers/sublimation/sections/ResultsSection.tsx")
s=p.read_text(encoding="utf-8")
def cut_between(a,b,new):
 global s
 assert s.count(a)==1, ("start",s.count(a))
 x=s.index(a); y=s.index(b,x)
 s=s[:x]+new+s[y:]
cut_between('          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">\n            The Smoluchowski model gives an increasing fraction',
 '          <FluxContributorsChart isDark={isDark} />',
 '''          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            In the illustrative saturating model, the assigned half-saturation pressure is 162 mTorr.
            Its gas-conduction term reaches approximately 24% of the assumed plateau at 50 mTorr,
            76% at 500 mTorr, and 90% at 1500 mTorr. These are evaluations of a fixed
            coefficient, not independently established transition pressures for the actual
            water-vapor and nitrogen mixture. Higher gas conduction need not increase sublimation
            when vapor backpressure, product resistance and condenser removal change simultaneously
            <InlineCite refs={['pikal1984', 'ganguly2013']} />.
          </p>
''')
cut_between('            Water vapor has <InlineMath math="\\gamma = 1.33" />',
 '          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">\n            <strong>The 500 mTorr heuristic',
 '''            At equal temperature and equal effective accommodation, kinetic-theory coefficients
            relative to water vapor are approximately 0.718 for CO2, 0.681 for nitrogen, and 0.380
            for argon, using representative heat-capacity ratios. These are conditional species
            comparisons, not observed tray conductances. In a free-molecular mixture, each gas
            contributes according to its partial pressure. Continuum conductivity and the
            transition pressure additionally depend on mixture transport properties, accommodation
            and geometry. The previously quoted 90, 162, 408 and 1005 mTorr mixture coefficients
            cannot be inferred from species molar masses alone. Water vapor can enhance heat
            transfer yet reduce the driving force for net ice sublimation.
          </p>

''')
s=s.replace('>500 mTorr total safe?</th>', '>Positive modeled driving force at 500 mTorr?</th>')
s=s.replace('No (far exceeds ceiling)', 'No at the assumed 50% water-vapor fraction')
s=s.replace('Borderline (barely safe)', 'Yes, with small modeled margin')
s=s.replace('Yes comfortably', 'Yes at the assumed composition')
s=s.replace('Yes (very conservative)', 'Yes at the assumed composition')
s=s.replace('Yes (far below ceiling)', 'Yes at the assumed composition')
s=s.replace('K_{eff}(T_s-T_i)=\\Delta H_{sub}j,\\qquad j=', 'K_{eff}(T_s-T_i)=\\Delta H_{sub}\\Gamma j,\\qquad j=')
s=s.replace('100k-sample model family', 'Exploratory 100k-draw model family')
s=s.replace('The machine hardware is now constrained independently:', 'The assumed heater configuration is:')
assert '−3/2' not in s and 'M^{-3/2}' not in s
assert '\u2014' not in s
p.write_text(s,encoding="utf-8")
print("Results gas-transfer correction applied")
