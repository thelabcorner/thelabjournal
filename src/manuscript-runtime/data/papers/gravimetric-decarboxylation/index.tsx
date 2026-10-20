import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { TitlePage } from '../../../components/sections/TitlePage';
import { SectionLabel, SubsectionLabel } from '../../../components/sections/Abstract';
import { MathBlock as RenderedMathBlock, InlineMath } from '../../../components/prose/MathBlock';
import { gravimetricEquationPython } from './equationPython';
import { ScientificParagraph, ScientificText, renderScientificText } from '../../../components/prose/ScientificInline';
import { InlineCite } from '../../../components/prose/InlineCite';
import { ReferenceProvider } from '../../../components/prose/ReferenceContext';
import { gravimetricDecarboxylationEntry as entry } from './entry';
import { gravimetricDecarboxylationReferences as references } from './references';
import { ReactorFigure } from './ReactorFigure';
import { CalibrationWorkflowFigure } from './CalibrationWorkflowFigure';
import { VacuumCompositionFigure } from './VacuumCompositionFigure';
import { ScaleReadabilityExplorer, GaugeReadabilityExplorer } from './ReadabilityExplorers';
import { MassPipelineFigure } from './MassPipelineFigure';

const prose = 'text-sm leading-relaxed text-[var(--text)]';
/** Each published display equation has a separately reviewed, executable Python view. */
function MathBlock({ math, label, caption }: { math: string; label?: string; caption?: string }) {
  return <RenderedMathBlock math={math} label={label} caption={caption} python={gravimetricEquationPython(label, caption)} />;
}
function Chapter({ id, n, title, children }: { id: string; n: string; title: string; children: ReactNode }) {
  return <section id={id} aria-labelledby={id + '-heading'} className="prose-heading mb-10">
    <div className="mb-4"><SectionLabel number={n} title={title} id={id + '-heading'} /></div>
    <div className="space-y-4">{children}</div>
  </section>;
}
function Sub({ id, n, title }: { id: string; n: string; title: string }) {
  return <div id={id} className="scroll-mt-24"><SubsectionLabel number={n} title={title} /></div>;
}
function Note({ title, children }: { title: string; children: ReactNode }) {
  return <aside className="research-scientific-note rounded-lg border border-[var(--border)] bg-[var(--sidenote-bg)] px-4 py-3">
    <p className="text-xs font-semibold text-[var(--text-secondary)]">{title}</p>
    <div className="mt-2 text-sm leading-relaxed text-[var(--text)]"><ScientificText>{children}</ScientificText></div>
  </aside>;
}
function Table({ headings, rows }: { headings: string[]; rows: string[][] }) {
  return <div className="research-data-table overflow-x-auto rounded-lg border border-[var(--border)]">
    <table className="w-full border-collapse text-xs leading-relaxed">
      <thead><tr className="bg-[var(--figure-bg)]">{headings.map(h => <th scope="col" key={h} className="px-3 py-2 text-left font-semibold text-[var(--text-secondary)]"><ScientificText>{h}</ScientificText></th>)}</tr></thead>
      <tbody>{rows.map((row,i) => <tr key={i} className="border-t border-[var(--border)]">{row.map((v,j) => <td key={j} className="px-3 py-2 align-top text-[var(--text)]">{renderScientificText(v)}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}
function PressureCycleFigure() {
  return <figure className="research-scientific-figure research-pressure-figure my-5 rounded-lg border border-[var(--border)] bg-[var(--figure-bg)] p-3">
    <svg viewBox="0 0 700 284" className="h-auto w-full" role="img" aria-labelledby="pressure-fig-title pressure-fig-desc">
      <title id="pressure-fig-title">Conceptual pressure-cycle trace used to estimate gas released through measured venting events</title>
      <desc id="pressure-fig-desc">Pressure gradually accumulates in a calibrated gas chamber, drops during measured vent events, then increases again. Events are marked at their pressure drops. A second plot shows accumulated released CO2 moles, with residual retained gas accounted for separately.</desc>
      <g stroke="var(--text-muted)" strokeWidth="1.4" fill="none">
        <path d="M54 27V188H656"/>
        <path d="M54 210V262H656"/>
        <path d="M54 60H656" strokeDasharray="5 5" opacity=".55"/>
        <path d="M54 155H656" strokeDasharray="5 5" opacity=".35"/>
        <path d="M54 262H656" strokeDasharray="3 5" opacity=".3"/>
        <path d="M54 154L102 112L151 60L158 152L230 85L258 54L267 150L338 102L381 65L388 146L470 89L507 62L514 146L599 91L656 45"
          stroke="var(--research-gas)" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round"/>
        <path d="M54 257L151 257L158 245L258 245L267 234L381 234L388 221L507 221L514 207L656 207"
          stroke="var(--research-measure)" strokeWidth="2.4" strokeLinejoin="round"/>
        <path d="M151 60V188M258 54V188M381 65V188M507 62V188" stroke="var(--text-muted)" strokeDasharray="3 5" opacity=".45"/>
      </g>
      <g fill="var(--text)" fontSize="12" fontFamily="sans-serif">
        <text x="54" y="15" fontWeight="600">Pressure accumulation and release</text>
        <text x="63" y="52" fill="var(--text-secondary)">Upper event threshold</text>
        <text x="63" y="176" fill="var(--text-secondary)">Lower return pressure</text>
        <text x="300" y="36" fill="var(--text-secondary)">Measured pressure drops</text>
        <text x="54" y="203" fontWeight="600">Cumulative vented gas (schematic)</text>
        <text x="597" y="278" fill="var(--text-secondary)">Time →</text>
      </g>
      <g fill="var(--research-gas)">
        <circle cx="151" cy="60" r="3"/><circle cx="258" cy="54" r="3"/><circle cx="381" cy="65" r="3"/><circle cx="507" cy="62" r="3"/>
      </g>
    </svg>
    <figcaption className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">Figure 4. Conceptual pressure trace and cumulative vent-event accounting. Individual releases are quantified from the measured pressure and temperature states, not assigned a fixed gas amount merely because a valve opened. The retained gas inventory is needed for progress between releases. No operating-pressure or valve-setpoint specification is implied.</figcaption>
  </figure>;
}

export function PaperBody({ isDark: _isDark }: { isDark: boolean }) {
  useEffect(() => {
    if (!window.location.hash) return;
    const target = decodeURIComponent(window.location.hash.slice(1));
    const frame = requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, []);
  return <ReferenceProvider references={references}>
    <TitlePage metadata={entry.metadata} />
    <details className="mb-8 rounded-lg border border-[var(--border)] bg-[var(--sidenote-bg)]">
      <summary className="cursor-pointer px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">Research provenance</summary>
      <p className="border-t border-[var(--border)] px-4 py-3 text-sm leading-relaxed text-[var(--text)]">This manuscript addresses mathematical models, measurement procedures, and instrumentation design. Computational assistance was used in code review, literature organization, equations, and editorial preparation.</p>
    </details>

    <section id="abstract" aria-labelledby="abstract-heading" className="prose-heading mb-10">
      <SectionLabel number="—" title="Abstract" id="abstract-heading" />
      <div className="research-abstract-card mt-4 space-y-3 rounded-lg border border-[var(--border)] bg-[var(--sidenote-bg)] p-4">
        <ScientificParagraph className={prose}>This paper accompanies the formal publication of Decarboxulator, a software and methodological framework developed progressively since 2023. Successive iterations extended its original gravimetric tracking method to broader stoichiometric, pressure-inventory, and instrumentation calculations. The present work derives the governing mass balances, a lot-referenced calibration method, and a continuous-acquisition formulation for a single reactor.</ScientificParagraph>
        <ScientificParagraph className={prose}>An aliquot establishes reference-endpoint loss per unit feed mass for later portions of the same lot. Analytical treatment of two heater–balance load paths is combined with balance and pressure-gauge readability criteria. Pressure-inventory models cover sealed and vented measurements, initial vacuum, inferred gas composition, and optional equilibrium dissolution. The associated test protocols define subsequent experimental work.</ScientificParagraph>
      </div>
    </section>

    <Chapter id="motivation" n="1" title="Introduction">
      <ScientificParagraph className={prose}>Gravimetric estimation normalizes observed mass loss against the calculated CO2 release capacity of the starting material. The normalized signal defines apparent reaction extent.</ScientificParagraph>
      <ScientificParagraph className={prose}>Visible bubbling depends on viscosity, geometry, and agitation and provides no quantitative measure of released gas.</ScientificParagraph>
      <Sub id="motivation-experience" n="1.1" title="Project history and laboratory use" />
      <ScientificParagraph className={prose}>Development of Decarboxulator began in 2023 with gravimetric decarboxylation tracking and continued through successive revisions of the calculations, tracking procedures, and software. Earlier versions were maintained privately and shared with selected laboratory practitioners. The resulting framework now encompasses stoichiometric mass balance, progress tracking, pressure-based gas inventories, measurement resolution, and proposed instrumented process control. Its formal publication is accompanied by this paper, which presents the accumulated methods, mathematical foundations, and engineering concepts.</ScientificParagraph>
      <Note title="Development record">A June 2024 Decarboxulator asset is preserved in the public repository history, documenting one intermediate stage of the ongoing development. Earlier implementations circulated privately. <InlineCite refs={['decarboxulator-2024-portfolio']} /></Note>
      <Note title="Two distinct percentage definitions">Stoichiometric progress uses the theoretical CO2 yield; lot-referenced progress uses the aliquot endpoint loss. The two denominators are not interchangeable.</Note>
    </Chapter>

    <Chapter id="manual" n="2" title="Gravimetric method">
      <MassPipelineFigure />
      <Sub id="manual-setup" n="2.1" title="Initial conditions and tare measurement" />
      <ScientificParagraph className={prose}>The original Decarboxulator method combines initial and subsequent gross-mass readings with stoichiometric CO2 release capacity. Subsequent implementations, including V3 and V4, progressively extended the same framework with session tracking, analytical tools, and additional calculation methods. <InlineCite refs={['decarboxulator-v3', 'decarboxulator-v4']} /></ScientificParagraph>
      <ScientificParagraph className={prose}>Feed mass is the loaded gross mass minus vessel tare. Reactive mass follows from the specified feed composition.</ScientificParagraph>
      <Sub id="manual-readings" n="2.2" title="Measurement sequence" />
      <ScientificParagraph className={prose}>In the documented V3 procedure, each interval reading is the total mass of the vessel and its contents. The balance is zeroed without applying the vessel tare; when a tare mass is supplied, Decarboxulator accounts for it in the calculation. The operator enters the gross reading and adds a new data point to the tracking session. <InlineCite refs={['decarboxulator-v3']} /></ScientificParagraph>
      <ScientificParagraph className={prose}>Successive gross-mass differences estimate cumulative release and interval release rate. V4 records the trajectory and extrapolates a descriptive time to target. <InlineCite refs={['decarboxulator-v4']} /></ScientificParagraph>
      <Sub id="manual-example" n="2.3" title="Example measurements" />
      <ScientificParagraph className={prose}>The following illustrative readings provide the input data for the mass balance derived in Section 3.2.</ScientificParagraph>
      <Table headings={['Measured or specified quantity', 'Value']} rows={[
        ['Vessel tare, T', '25.0000 g'],
        ['Initial vessel and sample mass, m₀', '35.0000 g'],
        ['Initial THCa mass fraction, f_A', '0.800 (80%)'],
        ['Later vessel and sample mass, m(t)', '34.5089 g'],
      ]} />
      <Sub id="manual-limitations" n="2.4" title="Sampling cadence and weighing artifacts" />
      <ScientificParagraph className={prose}>More frequent, regularly spaced mass readings better capture changes in reaction rate and improve the progress estimate between measurements. When a vessel must be removed from heat for weighing, cooling can alter reaction kinetics and introduce measurement artifacts; take readings promptly and consistently without compromising safety. Decarboxulator accepts the empty-vessel mass separately and calculates from gross readings, avoiding reliance on a balance tare that may reset between measurements.</ScientificParagraph>
    </Chapter>

    <Chapter id="model" n="3" title="Stoichiometric mass balance">
      <Sub id="model-stoichiometry" n="3.1" title="Expected CO₂ mass" />
      <ScientificParagraph className={prose}>Here <InlineMath math={"m_{A,0}"} /> is the starting mass of reactive acid A (g); <InlineMath math={"M_A"} /> is its molar mass (g/mol); <InlineMath math={"M_{CO_2}"} /> is the CO2 molar mass (g/mol); and <InlineMath math={"\\nu_{CO_2}"} /> is the number of CO2 molecules released per acid molecule in the specified reaction. The subscript <InlineMath math={"0"} /> denotes the initial state, while <InlineMath math={String.raw`\max`} /> denotes theoretical maximum release capacity:</ScientificParagraph>
      <MathBlock math={"m_{CO_2,\\max}=m_{A,0}\\frac{\\nu_{CO_2}M_{CO_2}}{M_A}"} label="(1)" caption="Stoichiometric CO2 release capacity." />
      <ScientificParagraph className={prose}>The CO2 molar mass used here is 44.01 g/mol; thus <InlineMath math={String.raw`m_{CO_2,\max}`} /> is a theoretical mass in grams, not a measured endpoint. <InlineCite refs={['nist-co2']} /></ScientificParagraph>
      <Sub id="model-measured" n="3.2" title="From balance readings to progress" />
      <ScientificParagraph className={prose}>The balance measures the vessel and its entire contents. Throughout this derivation, <InlineMath math={"m"} /> denotes a measured mass in grams, and <InlineMath math={String.raw`m_{s,0}`} /> denotes initial sample mass (subscript <InlineMath math={"s"} /> for sample). Subtracting the empty-vessel tare <InlineMath math={"T"} /> from the initial gross reading <InlineMath math={"m_0"} /> gives the starting sample mass. For a sample containing an initial mass fraction <InlineMath math={"f_A"} /> of one CO₂-releasing acid, its reactive mass is <InlineMath math={"A"} />. The remainder <InlineMath math={"I"} /> contributes to the measured mass but not to the theoretical CO₂ yield. The release fraction <InlineMath math={"q"} /> follows from Equation (1):</ScientificParagraph>
      <MathBlock math={String.raw`\begin{aligned}m_{s,0}&=m_0-T=A+I,\\ A&=f_A(m_0-T),\qquad q=\frac{\nu_{CO_2}M_{CO_2}}{M_A}\end{aligned}`} label="(2)" caption="Starting sample and reactive acid mass, and stoichiometric release fraction." />
      <ScientificParagraph className={prose}>The theoretical CO₂ mass is the reactive acid mass multiplied by its dimensionless release fraction. Here <InlineMath math={String.raw`\Delta m(t)`} /> is the gross-mass loss accumulated from the initial reading to elapsed time <InlineMath math={String.raw`t`} />. A later gross reading <InlineMath math={"m(t)"} /> gives observed mass loss by subtraction; the fixed vessel tare cancels between readings.</ScientificParagraph>
      <MathBlock math={String.raw`m_{CO_2,\max}=Aq,\qquad \Delta m(t)=m_0-m(t)`} label="(3)" caption="Theoretical CO₂ release and observed gross-mass difference." />
      <ScientificParagraph className={prose}>Dividing the observed loss by the theoretical capacity gives <InlineMath math={String.raw`X_{\mathrm{app}}(t)`} />, the apparent progress in percent (subscript <InlineMath math={String.raw`\mathrm{app}`} /> for apparent):</ScientificParagraph>
      <MathBlock math={String.raw`X_{\mathrm{app}}(t)=100\,\frac{\Delta m(t)}{m_{CO_2,\max}}=100\,\frac{m_0-m(t)}{Aq}`} label="(4)" caption="Observed mass loss as a percentage of theoretical CO₂ release." />
      <ScientificParagraph className={prose}>For the measurements in Section 2.3, the vessel tare is 25.0000 g, the initial gross mass is 35.0000 g, and 80% of the 10.0000 g sample is THCa. The later gross mass is 34.5089 g:</ScientificParagraph>
      <MathBlock math={String.raw`\begin{aligned}A&=0.80(35.0000-25.0000)=8.0000\ \mathrm{g},\\m_{CO_2,\max}&=8.0000\left(\frac{44.01}{358.47}\right)\approx0.9822\ \mathrm{g},\\ \Delta m&=35.0000-34.5089=0.4911\ \mathrm{g},\\ X_{\mathrm{app}}&=100\left(\frac{0.4911}{0.982174\ldots}\right)\approx50.00\%\end{aligned}`} caption="Worked single-acid example, calculated from the two gross-mass readings." />
      <Sub id="model-mixtures" n="3.3" title="Known mixed feeds" />
      <ScientificParagraph className={prose}>For a mixture, index <InlineMath math={"i"} /> identifies each CO2-releasing component. Its initial mass is <InlineMath math={"m_{i,0}"} /> (g); its release fraction is <InlineMath math={"q_i"} /> (g CO2/g acid); its molar mass is <InlineMath math={"M_i"} /> (g/mol); and <InlineMath math={String.raw`\nu_i`} /> is its CO2 stoichiometric coefficient. The denominator is the sum of their theoretical capacities, whereas the balance still provides one total mass-loss signal:</ScientificParagraph>
      <MathBlock math={String.raw`\begin{aligned}q_i&=\frac{\nu_iM_{CO_2}}{M_i},\qquad m_{CO_2,\max}=\sum_i m_{i,0}q_i,\\X_{\mathrm{app}}(t)&=100\,\frac{\Delta m(t)}{\sum_i m_{i,0}q_i}\end{aligned}`} label="(5)" caption="Additive CO₂ capacity and aggregate apparent progress for known reactants." />
      <ScientificParagraph className={prose}>As an example, a 10.0 g sample contains 6.0 g THCa, 2.0 g CBGa, and 2.0 g of material with no assigned CO₂ release contribution. Applying each acid's molar mass gives:</ScientificParagraph>
      <MathBlock math={String.raw`\begin{aligned}m_{CO_2,\max}&=6.0\left(\frac{44.01}{358.47}\right)+2.0\left(\frac{44.01}{360.49}\right)\\&\approx0.9808\ \mathrm{g},\\X_{\mathrm{app}}&=100\left(\frac{0.4904}{0.980798\ldots}\right)\approx50.00\%\end{aligned}`} caption="Illustrative two-acid mixture with 0.4904 g observed mass loss." />
      <ScientificParagraph className={prose}>The resulting 50% represents aggregate CO₂-equivalent release, not 50% conversion of each constituent. Distinguishing their individual extents requires composition measurements. For unknown starting composition, the aliquot-reference approach in Section 3.5 supplies an empirical release denominator.</ScientificParagraph>
      <Sub id="model-examples" n="3.4" title="Reaction-specific CO₂ capacities" />
      <ScientificParagraph className={prose}>For reactions releasing one mole of CO₂ per mole of acid, <InlineMath math={String.raw`q=M_{CO_2}/M_A`} />. The resulting mass fractions differ with the reactant's molar mass:</ScientificParagraph>
      <Table headings={['Assumed reaction', 'Molar mass of acid', 'Theoretical CO₂ capacity']} rows={[
        ['THCa → THC + CO₂', '358.47 g/mol', '0.12277 g/g'],
        ['CBDa → CBD + CO₂', '358.47 g/mol', '0.12277 g/g'],
        ['CBGa → CBG + CO₂', '360.49 g/mol', '0.12208 g/g'],
        ['Salicylic acid → phenol + CO₂', '138.12 g/mol', '0.31864 g/g'],
      ]} />
      <ScientificParagraph className={prose}>THCa and CBDa have identical stoichiometric capacities because they share a molecular formula. CBGa releases a slightly smaller mass fraction; the salicylic-acid example illustrates the same calculation outside cannabinoids. The tabulated values are theoretical CO₂ capacities, rather than measured reaction yields. <InlineCite refs={['salicylate-thermal']} /></ScientificParagraph>
      <Sub id="model-aliquot" n="3.5" title="Aliquot reference calibration" />
      <ScientificParagraph className={prose}>A representative aliquot processed to a specified reference endpoint provides a lot-specific release capacity. Denote this calibration aliquot by subscript <InlineMath math={"c"} />: its initial sample mass <InlineMath math={"m_c"} /> is the initial vessel-plus-aliquot gross reading <InlineMath math={String.raw`m_{\mathrm{gross},c,0}`} /> minus the empty-vessel tare <InlineMath math={String.raw`m_{\mathrm{tare},c}`} />. Its observed mass loss at the reference endpoint is <InlineMath math={String.raw`\Delta m_c`} />. The ratio <InlineMath math={String.raw`q_{\mathrm{cal}}`} /> (g lost/g feed; subscript <InlineMath math={String.raw`\mathrm{cal}`} /> for calibration) transfers the reference to other portions of the same material lot.</ScientificParagraph>
      <MathBlock math={"m_c=m_{\\rm gross,c,0}-m_{\\rm tare,c},\\qquad q_{\\rm cal}=\\frac{\\Delta m_{\\rm c}}{m_c}"} label="(6)" caption="Empirical reference-loss coefficient from an aliquot." />
      <ScientificParagraph className={prose}>The reference endpoint may be defined by a sustained mass-loss-rate threshold at controlled temperature. For a later bulk portion, subscript <InlineMath math={"b"} /> denotes bulk: <InlineMath math={"m_b"} /> is its initial feed mass, <InlineMath math={String.raw`\Delta m_b(t)`} /> its gross-mass loss by time <InlineMath math={"t"} />, and <InlineMath math={String.raw`m_{\mathrm{loss,ref},b}`} /> its scaled reference-endpoint loss. <InlineMath math={String.raw`X_{\mathrm{ref}}(t)`} /> is progress in percent relative to that aliquot-defined endpoint (<InlineMath math={String.raw`\mathrm{ref}`} /> for reference). A plateau is not an independently verified chemical endpoint.</ScientificParagraph>
      <MathBlock math={"m_{\\rm loss,ref,b}=m_b q_{\\rm cal},\\qquad X_{\\rm ref}(t)=100\\frac{\\Delta m_{\\rm b}(t)}{m_b q_{\\rm cal}}"} label="(7)" caption="Transfer of lot reference capacity to a subsequent batch." />
      <ScientificParagraph className={prose}>For a 2.000 g aliquot with 0.200 g reference loss, <InlineMath math={"q_{\\rm cal}=0.100"} /> g/g. A 100.0 g portion then has a scaled reference loss of 10.0 g, with an 8.50 g target at 85%.</ScientificParagraph>
      <MathBlock math={"f_{\\rm acid,eq}=\\frac{q_{\\rm cal}}{\\nu_{CO_2}M_{CO_2}/M_A}"} label="(8)" caption="Acid-equivalent fraction under the assumed CO2 stoichiometry." />
      <ScientificParagraph className={prose}>In Equation (8), <InlineMath math={String.raw`f_{\mathrm{acid,eq}}`} /> is the inferred acid-equivalent mass fraction of the initial feed (where <em>eq</em> denotes equivalent), and <InlineMath math={"M_A"} /> retains the acid molar-mass definition from Section 3.1. This conversion requires independently established CO2 specificity and endpoint conversion. Otherwise, control proceeds directly from <InlineMath math={"q_{\\rm cal}"} />.</ScientificParagraph>
      <Note title="Calibration validity">Reference capacity is specific to the sampled lot, preparation, and thermal program. Replicate aliquots characterize its variability.</Note>
    </Chapter>

    <Chapter id="heat" n="4" title="Heating and load-path isolation">
      <Sub id="heat-sleeve" n="4.1" title="Heater geometry and the weighing load path" />
      <ScientificParagraph className={prose}>Two load paths are considered: a heater supported independently of the weighing vessel and a closed-bottom heater–vessel assembly weighed together. Both use the same mass balance.</ScientificParagraph>
      <ScientificParagraph className={prose}>The independent sleeve needs clearance from the weighed vessel; the integrated mantle adds heater mass to the tare. Leads, probes, and tubing can transmit forces to either arrangement.</ScientificParagraph>
      <ReactorFigure />
      <Sub id="heat-resolution" n="4.2" title="Balance readability" />
      <ScientificParagraph className={prose}>A balance displays mass in fixed increments. A 0.01 g scale reports hundredths of a gram; a 0.001 g scale reports thousandths. The smallest useful aliquot therefore depends on instrument readability, how much reactive acid it contains, and what fraction of the reaction we want to observe.</ScientificParagraph>
      <ScientificParagraph className={prose}>For THCa, define m_s as initial sample mass in grams, f as its initial THCa mass fraction (0 to 1), x as the theoretical CO2 release fraction reached at the observation point (0 to 1), and k as the CO2-to-THCa molar-mass ratio. The expected gross-mass signal at that point is:</ScientificParagraph>
      <MathBlock math={"\\begin{aligned}k&=\\frac{M_{CO_2}}{M_{\\mathrm{THCa}}}\\approx0.12277,\\\\m_{CO_2,\\max}&=m_sfk,\\qquad \\Delta m_{\\mathrm{signal}}=m_sfkx\\end{aligned}"} label="(9)" caption="Theoretical full-release capacity and predicted gross-mass signal at a selected observation point." />
      <ScientificParagraph className={prose}>Let r be the smallest balance display increment in grams. For a practical screening convention we require at least two displayed increments of expected mass loss. Five increments provide a clearer margin. Dividing those target signals by the loss expected per gram of sample gives the minimum aliquot masses:</ScientificParagraph>
      <MathBlock math={"m_{s,2}=\\frac{2r}{fkx},\\qquad m_{s,5}=\\frac{5r}{fkx}"} label="(10)" caption="Minimum starting masses for two-increment screening and five-increment clearer readings." />
      <ScientificParagraph className={prose}>The subscript 2 identifies the screening criterion, while 5 identifies the clearer-reading criterion. These are display-readability benchmarks, not statistically established detection limits. A smaller sample can still produce gas, but its expected signal does not meet the chosen margin.</ScientificParagraph>
      <ScaleReadabilityExplorer />
      <ScientificParagraph className={prose}>A separate consideration is how large a change in apparent conversion one display step represents. Let q_ref denote the selected release capacity in grams per gram of starting sample: f k for a single-acid stoichiometric calculation, or the lot-specific q_cal from Section 3.5. Here delta X_display is percentage points of inferred progress per displayed mass increment, and epsilon is the greatest permitted increment in percentage points:</ScientificParagraph>
      <MathBlock math={"\\delta X_{\\mathrm{display}}=100\\frac{r}{m_sq_{\\mathrm{ref}}},\\qquad r\\leq\\frac{\\epsilon}{100}m_sq_{\\mathrm{ref}}"} label="(11)" caption="Progress percentage points represented by one scale increment." />
      <ScientificParagraph className={prose}>For 10 g with 80% THCa, a 0.001 g step represents approximately 0.102 percentage points of apparent progress. A 2 g calibration aliquot with a separate reference release of 0.100 g/g advances 0.5 percentage points per increment. Actual observability also depends on balance noise, thermal drift, volatile loss, and repeatability under the working load.</ScientificParagraph>
      <Sub id="heat-variants" n="4.3" title="Alternative heater geometries" />
      <Table headings={['Heating arrangement', 'Likely benefit', 'Measurement problem to solve']} rows={[
        ['Open-bottom sleeve on an independent frame', 'Only the vessel and contents load the scale; the heater is supported elsewhere.', 'Clearance, convective forces, thermal drift and unwanted vessel–heater contact.'],
        ['Closed-bottom cup mantle weighed with the vessel', 'Uses familiar compact mantle geometry; the heater is included in the tare.', 'Combined load, heat transfer to the scale, cable forces and stability of the energized assembly.'],
        ['Radiant panels or ceramic infrared elements', 'Heating surfaces can be fixed to a frame separate from the balance.', 'Line-of-sight temperature gradients, drafts, shielding and hot spots.'],
        ['Hot-air or oven environment', 'A readily available controlled enclosure.', 'Convection forces, air-density changes, support conduction and balance heat exposure.'],
        ['Heated block or plate', 'Direct thermal contact and compact mechanical packaging.', 'The heater can unintentionally share the load path and change its force during expansion.'],
        ['Microwave heating', 'Volumetric dielectric coupling in susceptible materials.', 'Field perturbation, shielding, and sensor-feedthrough compatibility require a purpose-designed cavity.'],
      ]} />
      <Sub id="heat-microwave" n="4.4" title="Microwave heating" />
      <ScientificParagraph className={prose}>Microwave heating requires independent development of the electromagnetic cavity, sensor interfaces, and gas ports. Resistance heating is retained for initial load-path tests.</ScientificParagraph>
    </Chapter>

    <Chapter id="automation" n="5" title="Acquisition and process control">
      <Sub id="automation-acquisition" n="5.1" title="Acquisition architecture" />
      <ScientificParagraph className={prose}>A serial laboratory balance or calibrated load cell is the proposed primary sensor. Nominal 0.001 g readability must be evaluated against full supported load, dynamic repeatability, and thermal drift.</ScientificParagraph>
      <ScientificParagraph className={prose}>Each sample contains time, gross mass, temperature, operating state, and flags. Cumulative mass loss and its local rate are computed from the retained gross-mass readings.</ScientificParagraph>
      <ScientificParagraph className={prose}>Pressure acquisition uses absolute pressure, gas temperature, free volume, and measured vent endpoints to reconstruct the evolving gas inventory.</ScientificParagraph>
      <Sub id="automation-software" n="5.2" title="Software integration with Decarboxulator V4" />
      <ScientificParagraph className={prose}>The companion V4 implementation supplies the stoichiometric calculations and manual tracking functions from which instrumented acquisition can be developed. <InlineCite refs={['decarboxulator-v4']} /></ScientificParagraph>
      <ScientificParagraph className={prose}>Manual and instrumented observations can share a versioned record schema. Higher sampling rates require append-oriented storage beyond the present bounded manual logs.</ScientificParagraph>
      <Sub id="automation-ui" n="5.3" title="Operator readouts" />
      <Table headings={['Live quantity', 'Use at the bench']} rows={[
        ['Current and initial gross mass', 'Measurement continuity, vessel disturbance, and abrupt signal deviations.'],
        ['Observed loss / reference loss', 'Normalization of cumulative release against the defined reference capacity.'],
        ['Apparent extent, %', 'Reference-relative process trajectory.'],
        ['Mass-loss rate, mg/min', 'Local slope and approach to an operational plateau.'],
        ['Sample and balance-region temperatures', 'Thermal state and drift-associated covariates.'],
        ['Gross-mass and cumulative-loss traces', 'Preserve the original readings and show the derived progress trajectory.'],
        ['Data-quality flags', 'Thermal disturbance, nonphysical estimates, and missing observations.'],
      ]} />
      <ScientificParagraph className={prose}>Pressure runs record initial and current gas states, inferred retained and discharged inventories, and vent history.</ScientificParagraph>
      <ScientificParagraph className={prose}>Time-to-target estimates are extrapolated from observed release rates. The terminal record includes the actual post-cooling endpoint.</ScientificParagraph>
      <Sub id="automation-workflow" n="5.4" title="Sequential calibration and production" />
      <ScientificParagraph className={prose}>Calibration and bulk processing occur sequentially in the same reactor. The aliquot establishes reference-endpoint loss per unit feed mass for subsequent lots of the same material.</ScientificParagraph>
      <CalibrationWorkflowFigure />
      <Table headings={['Step', 'Operator input', 'Automatic measurement or decision']} rows={[
        ['Calibrate: tare', 'Place the empty vessel in the reactor.', 'Measure stable tare with the heater and leads in their normal load-path configuration.'],
        ['Calibrate: aliquot', 'Load a small representative portion of a new material lot.', 'Measure aliquot mass from loaded gross mass minus tare.'],
        ['Calibrate: reference run', 'Confirm the documented reference thermal procedure.', 'Heat to an operational endpoint, monitor loss through cooling and record the full mass and temperature trace.'],
        ['Calibrate: save', 'Confirm the lot identity and reference endpoint.', 'Calculate observed reference loss per gram and save a versioned calibration record.'],
        ['Produce: select lot', 'Select an existing calibration and place the empty vessel.', 'Verify calibration conditions and take a new tare.'],
        ['Produce: load and target', 'Load another portion and select target apparent progress.', 'Measure sample mass; scale the saved release capacity to this sample and compute a mass-loss target.'],
        ['Produce: heat and report', 'Confirm the run and retain an accessible stop control.', 'Control heating, record progress, stop toward target, monitor the cooling tail and report final observed loss.'],
      ]} />
      <ScientificParagraph className={prose}>Tare encompasses everything carried by the balance under the selected load path; gross-minus-tare gives feed mass.</ScientificParagraph>
      <Sub id="automation-target" n="5.5" title="Bulk-run target calculation" />
      <ScientificParagraph className={prose}>For a production batch (subscript <em>b</em>), <InlineMath math={String.raw`m_b`} /> is loaded sample mass (g), <InlineMath math={String.raw`m_{\mathrm{gross},b,0}`} /> is its initial gross mass, and <InlineMath math={String.raw`m_{\mathrm{tare},b}`} /> is its vessel tare. The aliquot coefficient <InlineMath math={String.raw`q_{\mathrm{cal}}`} /> from Equation (6) yields <InlineMath math={String.raw`m_{\mathrm{loss,ref},b}`} />, the batch's reference-endpoint loss in grams:</ScientificParagraph>
      <MathBlock math={"m_b=m_{\\rm gross,b,0}-m_{\\rm tare,b},\\qquad m_{\\rm loss,ref,b}=m_bq_{\\rm cal}"} label="(12)" caption="Bulk sample mass and scaled reference loss." />
      <MathBlock math={"\\Delta m_{\\rm target}=\\frac{X_{\\rm selected}}{100}\\,m_bq_{\\rm cal},\\qquad m_{\\rm gross,target}=m_{\\rm gross,b,0}-\\Delta m_{\\rm target}"} label="(13)" caption="Target loss and gross-mass stop threshold." />
      <ScientificParagraph className={prose}>Here <InlineMath math={String.raw`X_{\mathrm{selected}}`} /> is the operator's requested reference-relative progress in percent, <InlineMath math={String.raw`\Delta m_{\mathrm{target}}`} /> is its required cumulative loss (g), and <InlineMath math={String.raw`m_{\mathrm{gross,target}}`} /> is the corresponding gross-mass stop reading (g). An 85% target specifies 85% of reference-endpoint loss. The observed endpoint is recorded after the cooling interval.</ScientificParagraph>
      <Table headings={['Hypothetical measurement', 'Value']} rows={[
        ['Representative calibration aliquot', '2.000 g'],
        ['Observed loss at its specified reference endpoint', '0.200 g'],
        ['Saved reference capacity', '0.100 g of mass lost per gram of starting material'],
        ['New bulk portion from the same lot', '100.0 g'],
        ['Scaled reference-endpoint loss', '10.0 g'],
        ['Requested relative progress', '85%'],
        ['Selected mass-loss target', '8.50 g'],
      ]} />
      <ScientificParagraph className={prose}>Aliquot-to-bulk transfer presumes representative composition; kinetics and thermal response may differ with batch size.</ScientificParagraph>
      <Sub id="automation-control" n="5.6" title="Feedback control and scale-up" />
      <ScientificParagraph className={prose}>Temperature follows the prescribed thermal program while mass-loss feedback tracks the selected reference endpoint. Bulk thermal response and release rate determine stopping behavior.</ScientificParagraph>
      <ScientificParagraph className={prose}>Post-shutdown evolution contributes to endpoint overshoot. Cooling-tail measurements can inform anticipatory shutdown in later control studies.</ScientificParagraph>
      <Sub id="automation-states" n="5.7" title="Control states and faults" />
      <ScientificParagraph className={prose}>Calibration proceeds through TARE → ALIQUOT_LOAD → REFERENCE_HEAT → REFERENCE_COOL → SAVE; production through SELECT_LOT → TARE → BULK_LOAD → TARGET_CONFIRM → HEAT → STOPPING → COOLING → COMPLETE. Fault transitions de-energize the heater and require revalidation before resumption.</ScientificParagraph>
      <Table headings={['Condition detected', 'Required controller response']} rows={[
        ['Sensor output missing, stale or physically implausible', 'Deactivate heating; flag the interval and require revalidation rather than assuming the last progress reading remains current.'],
        ['Vessel removed, shifted or touching the heating sleeve', 'Interrupt heating and reject readings affected by changed load support; require operator intervention.'],
        ['Load-cell temperature, process temperature or maximum run time exceeds limits', 'Enter fault shutdown through an independent heater-control path; do not let an inferred progress target override a thermal or time limit.'],
        ['Observed mass loss exceeds the saved reference capacity', 'Retain the raw value, flag the lot-calibration mismatch and terminate automatic target seeking; in stoichiometric mode flag excess beyond the predicted CO₂ yield.'],
        ['Stop requested or selected apparent target reached', 'Remove or reduce heater power as permitted, preserve event and sensor data, continue safe monitoring through cooling, and report the observed endpoint.'],
        ['Power or controller connection interrupted', 'Default to heater-off on loss of control; prohibit blind automatic resumption after restoration.'],
      ]} />
      <ScientificParagraph className={prose}>Heater shutoff, thermal limiting, electrical isolation, and pressure relief remain independent of the progress estimator.</ScientificParagraph>
      <Sub id="automation-record" n="5.8" title="Lot-calibration records and reuse criteria" />
      <ScientificParagraph className={prose}>A calibration revision stores lot identity, preparation, thermal program, aliquot mass, measured initial and final gross masses, endpoint loss, <InlineMath math={"q_{\\rm cal}"} />, and sensor calibration and trace data.</ScientificParagraph>
      <ScientificParagraph className={prose}>Calibration reuse depends on lot homogeneity, moisture, preparation, storage, and the reference protocol. Replicate aliquots establish acceptance tolerances.</ScientificParagraph>
      <Sub id="automation-status" n="5.9" title="Implementation status" />
      <ScientificParagraph className={prose}>Manual stoichiometric tracking and pressure-inventory calculation exist in V4. Automated weighing, saved lot calibration, and heater actuation are proposed work.</ScientificParagraph>
    </Chapter>

    <Chapter id="volume" n="6" title="Pressure-based gas inventory and complementary methods">
      <ScientificParagraph className={prose}>Gravimetric tracking measures loss from the weighed assembly. Pressure tracking estimates evolved CO2 from the gas inventory inside a vessel and, when vented, the gas that has left it. The calculation develops from a sealed headspace to vented systems, initial gas composition, and optional dissolution.</ScientificParagraph>
      <Sub id="volume-principle" n="6.1" title="Sealed accumulation: pressure and gas inventory" />
      <ScientificParagraph className={prose}>A pressure gauge senses <em>total</em> gas pressure, not CO2 alone. The ideal-gas law converts absolute pressure <InlineMath math={"P"} />, free-gas volume <InlineMath math={"V_g"} />, and gas temperature <InlineMath math={"T"} /> to gas-phase moles. CO2 moles use CO2 <em>partial</em> pressure, while the stoichiometric CO2 capacity comes from Section 3.1. The symbol <InlineMath math={String.raw`n_g`} /> means total moles in the gas phase (subscript <em>g</em> for gas); <InlineMath math={String.raw`n_{CO_2,g}`} /> means moles of CO2 in that phase; <InlineMath math={String.raw`P_{CO_2}`} /> is CO2 partial pressure; <InlineMath math={String.raw`n_{CO_2,\max}`} /> is the theoretical CO2 capacity in moles; and <InlineMath math={String.raw`R`} /> is the universal gas constant:</ScientificParagraph>
      <MathBlock math={String.raw`\begin{aligned}n_g&=\frac{PV_g}{RT},\qquad n_{CO_2,g}=\frac{P_{CO_2}V_g}{RT},\\n_{CO_2,\max}&=\frac{m_{CO_2,\max}}{M_{CO_2}}\end{aligned}`} label="(14)" caption="Total-gas inventory, CO2 inventory, and theoretical CO2 release capacity." />
      <ScientificParagraph className={prose}>Use consistent SI units: pascals, cubic metres, kelvin, and <InlineMath math={"R=8.31446\\ \\mathrm{J\\,mol^{-1}\\,K^{-1}}"} />. Convert gauge pressure to absolute pressure before calculation. For 8.000 g THCa, 0.9822 g theoretical CO2 is about 0.0223 mol, corresponding to 0.546 L of ideal gas at 25 °C and 1 atm.</ScientificParagraph>
      <Sub id="volume-collection" n="6.2" title="Sealed accumulation: temperature-corrected progress" />
      <ScientificParagraph className={prose}>In a sealed headspace no gas intentionally escapes. Record initial absolute pressure and gas temperature <InlineMath math={"P_0"} /> and <InlineMath math={"T_0"} />, then repeat at time <InlineMath math={"t"} /> to obtain <InlineMath math={"P_t"} /> and <InlineMath math={"T_t"} />. With fixed free-gas volume, the increase in gas inventory is:</ScientificParagraph>
      <MathBlock math={String.raw`\Delta n_g(t)=\frac{V_g}{R}\left(\frac{P_t}{T_t}-\frac{P_0}{T_0}\right)`} label="(15)" caption="Temperature-normalized change in total headspace gas moles." />
      <ScientificParagraph className={prose}>Comparing inventories rather than pressures alone avoids counting an ideal-gas pressure rise due solely to heating. The symbol <InlineMath math={String.raw`\Delta n_g(t)`} /> denotes the change in total gas moles between the initial reading (subscript <em>0</em>) and time <InlineMath math={String.raw`t`} />. If CO2 is the only appreciable new gas, <InlineMath math={String.raw`X_{\mathrm{app,seal}}`} /> denotes apparent sealed-mode progress in percent; it follows from the theoretical moles calculated in Equation (14):</ScientificParagraph>
      <MathBlock math={String.raw`X_{\mathrm{app,seal}}=100\,\frac{\Delta n_g(t)}{n_{CO_2,\max}}`} label="(16)" caption="Sealed-system apparent CO2-equivalent progress." />
      <ScientificParagraph className={prose}>Starting under vacuum reduces residual air in the sealed headspace, so the accumulated gas is more CO2-rich and the initial-air contribution is smaller. The calculation still subtracts the starting inventory; vacuum improves gas attribution rather than the pressure sensor's inherent accuracy.</ScientificParagraph>
      <ScientificParagraph className={prose}>For a 0.100 L headspace at 298 K, increasing pressure from 100.0 to 110.0 kPa absolute adds approximately 0.000404 mol. Treated as CO2, this is 0.0178 g, or 1.81 percentage points of the 0.9822 g theoretical release capacity.</ScientificParagraph>
      <ScientificParagraph className={prose}>Rearranging the same mass balance gives the pressure corresponding to a selected target <InlineMath math={"X_\\star"} /> at the current gas temperature. Here <InlineMath math={String.raw`n_{g,0}`} /> is initial headspace gas moles, <InlineMath math={String.raw`P_{\mathrm{target,seal}}`} /> is the predicted absolute pressure for that extent, <InlineMath math={String.raw`P_{\mathrm{gauge,target}}`} /> is the corresponding gauge pressure, and <InlineMath math={String.raw`P_{\mathrm{ambient}}`} /> is ambient absolute pressure:</ScientificParagraph>
      <MathBlock math={String.raw`\begin{aligned}P_{\mathrm{target,seal}}(T_t)&=\frac{RT_t}{V_g}\left[n_{g,0}+\frac{X_\star}{100}\,n_{CO_2,\max}\right],\\P_{\mathrm{gauge,target}}&=P_{\mathrm{target,seal}}-P_{\mathrm{ambient}}\end{aligned}`} label="(17)" caption="Inverse sealed-mode absolute and gauge pressure targets." />
      <ScientificParagraph className={prose}>For 10.0 g feed at 80% THCa, 16 US fl oz of free gas volume, initial pressure 3.0 PSIA at 20 °C, and gas at 90 °C, 50% apparent extent corresponds to about 14.04 PSIA (−0.65 PSIG at 14.69595 PSIA ambient). This predicts a gauge reading; it does not prescribe a safe pressure for a heated vessel.</ScientificParagraph>
      <Sub id="volume-pulses" n="6.3" title="One vent: measuring gas discharged" />
      <ScientificParagraph className={prose}>Venting removes gas from the headspace. Measure absolute pressure and gas temperature immediately before and after an isolated event <InlineMath math={"j"} />. Subscripts <InlineMath math={"b"} /> and <InlineMath math={"a"} /> denote those two instants. The positive quantity <InlineMath math={String.raw`\Delta n_{\mathrm{vent},j}`} /> denotes the moles of total gas discharged by event <InlineMath math={String.raw`j`} /> (subscript <em>vent</em> for vented). This difference estimates discharge without a continuous flowmeter. <InlineCite refs={['pressure-decay-2024']} /></ScientificParagraph>
      <MathBlock math={String.raw`\Delta n_{\mathrm{vent},j}\simeq\frac{V_g}{R}\left(\frac{P_{j,b}}{T_{j,b}}-\frac{P_{j,a}}{T_{j,a}}\right)`} label="(18)" caption="Total gas moles lost through one measured vent." />
      <ScientificParagraph className={prose}>A drop from 110.0 to 100.0 kPa in 0.100 L at 298 K removes 0.000404 mol of total gas. Pressure alone cannot identify its CO2 fraction; concurrent gas generation during the release also biases the isolated-event estimate.</ScientificParagraph>
      <ScientificParagraph className={prose}>An initial vacuum is particularly useful for vent accounting. Less residual air means the discharged mixture contains a greater proportion of generated CO2, reducing the correction needed to attribute vented gas to the reaction. Each vent still requires its measured pressure and temperature endpoints.</ScientificParagraph>
      <PressureCycleFigure />
      <Sub id="volume-inventory" n="6.4" title="Cumulative release across multiple vents" />
      <span id="volume-tracker-modes" aria-hidden="true" />
      <ScientificParagraph className={prose}>At any later moment the vessel retains only part of the gas generated. Add the quantities already discharged to the change in retained headspace inventory. Let <InlineMath math={String.raw`c_j`} /> be the number of times a characterized event <InlineMath math={String.raw`j`} /> is counted. Then <InlineMath math={String.raw`n_{\mathrm{gen,eq}}`} /> denotes cumulative generated-gas <em>equivalent</em> moles (subscripts <em>gen</em> for generated and <em>eq</em> for equivalent), and <InlineMath math={String.raw`X_{\mathrm{app,vent}}`} /> is apparent vent-mode progress in percent. Decarboxulator V4 supports both individually measured events and a representative event counted multiple times:</ScientificParagraph>
      <MathBlock math={String.raw`\begin{aligned}n_{\mathrm{gen,eq}}(t)&\simeq\Delta n_g(t)+\sum_j c_j\,\Delta n_{\mathrm{vent},j},\\X_{\mathrm{app,vent}}(t)&=100\,\frac{n_{\mathrm{gen,eq}}(t)}{n_{CO_2,\max}}\end{aligned}`} label="(19)" caption="Cumulative total-gas generation equivalent and apparent vented-mode extent." />
      <ScientificParagraph className={prose}>The count <InlineMath math={"c_j=1"} /> represents a separately measured event; <InlineMath math={"c_j>1"} /> applies one temperature-corrected event to several nominally equivalent cycles. The counted method assumes those cycles reproduce the same inventory change. Recording each event avoids this approximation.</ScientificParagraph>
      <ScientificParagraph className={prose}>For example, if the headspace ends with the same inventory as it started but one vent discharged 0.000404 mol, the total generation equivalent is 0.000404 mol rather than zero. The target absolute pressure <InlineMath math={String.raw`P_{\mathrm{target,vent}}`} /> for a vented run follows by subtracting previously discharged gas from the inventory corresponding to the chosen extent:</ScientificParagraph>
      <MathBlock math={String.raw`P_{\mathrm{target,vent}}(T_t)=\frac{RT_t}{V_g}\left[n_{g,0}+\frac{X_\star}{100}\,n_{CO_2,\max}-\sum_j c_j\,\Delta n_{\mathrm{vent},j}\right]`} label="(20)" caption="Pressure target after accounting for cumulative vented gas." />
      <ScientificParagraph className={prose}>These estimates are <em>total-gas equivalents</em>. The following section establishes how CO2 can be separated from the initial gas inventory. Manual sealed and vented calculations are implemented in the <a href="https://thelabcorner.github.io/decarboxulator-v4-pr3-preview/tools/pressure-tracker/" target="_blank" rel="noopener noreferrer" className="underline">Decarboxulator V4 pressure tracker</a>; automatically measured vent events remain a proposed instrumentation step.</ScientificParagraph>
      <Sub id="volume-vacuum" n="6.5" title="Starting gas, vacuum, and CO2 attribution" />
      <ScientificParagraph className={prose}>The initial vessel may contain air even before any CO2 is generated. Vacuum reduces this inventory, but the same calculation works with any initial absolute pressure. Subscript <em>inert</em> denotes gas initially present that is not CO2; <InlineMath math={String.raw`P_{\mathrm{inert},t}`} /> is its partial pressure at time <InlineMath math={String.raw`t`} />. The superscript <em>est</em> on <InlineMath math={String.raw`P_{CO_2,t}^{\mathrm{est}}`} /> means inferred rather than independently measured CO2 partial pressure. For an initially CO2-free gas mixture with no subsequent air ingress:</ScientificParagraph>
      <MathBlock math={String.raw`P_{\mathrm{inert},t}=P_0\frac{T_t}{T_0},\qquad P_{CO_2,t}^{\mathrm{est}}=P_t-P_{\mathrm{inert},t}`} label="(21)" caption="Temperature-corrected inert-gas pressure and inferred CO2 partial pressure in a sealed vessel." />
      <ScientificParagraph className={prose}>At an initial 0.50 PSIA and 21 °C, the original gas contributes 0.66 PSIA at 115 °C. A measured 40.0 PSIA therefore implies 39.34 PSIA of CO2, or 98.35% of total pressure, if no other gases were generated.</ScientificParagraph>
      <VacuumCompositionFigure />
      <ScientificParagraph className={prose}>When a short, well-mixed vent releases gas, it removes a fraction of the initial air as well as CO2. The ratio of temperature-corrected inventories after and before each event gives the surviving inert-gas fraction; successive events multiply those fractions. Here <InlineMath math={String.raw`f_j`} /> is the dimensionless fraction of gas remaining after event <InlineMath math={String.raw`j`} />, <InlineMath math={String.raw`n_{\mathrm{inert},0}`} /> is the initial inert-gas inventory in moles, and <InlineMath math={String.raw`n_{\mathrm{inert},t}`} /> is its surviving inventory at time <InlineMath math={String.raw`t`} />. The product counts repeated representative events through exponent <InlineMath math={String.raw`c_j`} />:</ScientificParagraph>
      <MathBlock math={String.raw`\begin{aligned}f_j&=\frac{P_{j,a}/T_{j,a}}{P_{j,b}/T_{j,b}},\\n_{\mathrm{inert},t}&=n_{\mathrm{inert},0}\prod_j f_j^{c_j},\\P_{CO_2,t}^{\mathrm{est}}&=P_t-\frac{n_{\mathrm{inert},t}RT_t}{V_g}\end{aligned}`} label="(22)" caption="Surviving initial-gas fraction and inferred CO2 pressure after measured or counted vent events." />
      <ScientificParagraph className={prose}>CO2 retained in the headspace follows from total pressure minus the surviving inert contribution. Discharged CO2 can likewise be estimated from total vented gas minus the inert gas that escaped, without a separate gas-composition sensor. This requires well-mixed outward vents, negligible air ingress, and negligible unidentified gas production.</ScientificParagraph>
      <Sub id="volume-condensables" n="6.6" title="Competing gases and volatile mass loss" />
      <ScientificParagraph className={prose}>Pressure changes represent CO2 production only when CO2 is the dominant newly generated gas. Water vapor, solvent or other volatile material, leaks, and gas uptake can change the inferred inventory. Where the competing mass terms are independently known, the gravimetric mass balance uses <InlineMath math={String.raw`\Delta m_{\mathrm{gross}}`} /> for the measured gross-mass loss, <InlineMath math={String.raw`m_{\mathrm{other\,loss}}`} /> for positive non-CO2 mass loss, and <InlineMath math={String.raw`m_{\mathrm{uptake}}`} /> for positive mass gained from outside. The result <InlineMath math={String.raw`m_{CO_2,\mathrm{est}}`} /> is estimated CO2 mass (g):</ScientificParagraph>
      <MathBlock math={String.raw`m_{CO_2,\mathrm{est}}\simeq\Delta m_{\mathrm{gross}}-m_{\mathrm{other\,loss}}+m_{\mathrm{uptake}}`} label="(23)" caption="CO2 mass estimated from gross loss with independently measured competing mass changes." />
      <ScientificParagraph className={prose}>Recovered condensate may constrain the mass of other volatiles if the recovery efficiency and collection boundary are characterized. Unknown gas composition cannot be determined from total pressure alone.</ScientificParagraph>

      <Sub id="volume-henry" n="6.7" title="Optional equilibrium CO2 dissolution" />
      <ScientificParagraph className={prose}>CO2 generated by the reaction need not remain entirely in the gas phase. Decarboxulator V4 optionally estimates dissolved CO2 from inferred partial pressure, an entered liquid volume <InlineMath math={"V_\\ell"} />, and a temperature- and matrix-specific Henry coefficient <InlineMath math={"k_H^{cp}"} />, in mol per litre of liquid per atmosphere of CO2 pressure (superscript <em>cp</em> denotes concentration per pressure). Here <InlineMath math={String.raw`V_\ell`} /> is in litres, unlike headspace volume <InlineMath math={String.raw`V_g`} /> in cubic metres; <InlineMath math={String.raw`P_{\mathrm{atm}}`} /> is one standard atmosphere (101325 Pa), and <InlineMath math={String.raw`n_{CO_2,\ell}^{\mathrm{eq}}`} /> denotes equilibrium dissolved CO2 moles, with subscript <InlineMath math={String.raw`\ell`} /> for liquid and superscript <em>eq</em> for equilibrium. <InlineCite refs={['sander-henry-2023']} /></ScientificParagraph>
      <MathBlock math={String.raw`n_{CO_2,\ell}^{\mathrm{eq}}=k_H^{cp}(T,\mathrm{matrix})\,V_\ell\,\frac{P_{CO_2}}{P_{\mathrm{atm}}},\qquad P_{\mathrm{atm}}=101325\ \mathrm{Pa}`} label="(24)" caption="Equilibrium CO2 quantity dissolved in the modeled liquid." />
      <ScientificParagraph className={prose}>With the CO2 pressure inferred in Section 6.5, the quantity <InlineMath math={String.raw`n_{CO_2,\mathrm{stored}}`} /> means CO2 retained in the gas and liquid together (mol):</ScientificParagraph>
      <MathBlock math={String.raw`n_{CO_2,\mathrm{stored}}=P_{CO_2}\left(\frac{V_g}{RT}+\frac{k_H^{cp}(T,\mathrm{matrix})V_\ell}{P_{\mathrm{atm}}}\right)`} label="(25)" caption="Gas-phase and dissolved CO2 storage at equilibrium." />
      <ScientificParagraph className={prose}>Cumulative CO2 generation <InlineMath math={String.raw`n_{CO_2,\mathrm{gen}}`} /> (mol) therefore combines the change from initial (subscript <em>0</em>) to current (subscript <em>t</em>) gas-phase CO2 inventory <InlineMath math={String.raw`n_{CO_2,g}`} />, each event's discharged CO2 moles <InlineMath math={String.raw`n_{CO_2,\mathrm{vent},j}`} />, and the change in dissolved CO2 inventory <InlineMath math={String.raw`n_{CO_2,\ell}`} />:</ScientificParagraph>
      <MathBlock math={String.raw`n_{CO_2,\mathrm{gen}}\simeq(n_{CO_2,g,t}-n_{CO_2,g,0})+\sum_jn_{CO_2,\mathrm{vent},j}+(n_{CO_2,\ell,t}-n_{CO_2,\ell,0})`} label="(26)" caption="Cumulative CO2 balance with optional dissolved inventory." />
      <ScientificParagraph className={prose}>The V4 option assumes negligible initial dissolved CO2. Published CO2 solubility in water is not a coefficient for a heated cannabinoid-rich liquid; a representative coefficient must be supplied for the actual matrix and temperature. The equilibrium approximation also assumes negligible phase exchange during individual vents. <InlineCite refs={['nist-co2', 'sander-henry-2023']} /></ScientificParagraph>

      <Sub id="volume-gauge-resolution" n="6.8" title="Pressure-gauge readability" />
      <ScientificParagraph className={prose}>Pressure changes during heating even without a reaction, and an initial and later pressure reading are each rounded to the gauge's smallest display increment. The reaction-related signal is the CO2 pressure <em>above</em> the temperature-adjusted initial gas pressure. Both readings therefore contribute to how finely the signal can be resolved.</ScientificParagraph>
      <MathBlock math={"\\Delta P_{CO_2}=\\frac{m_sfx}{M_A}\\frac{RT_t}{V_g},\\qquad r_{\\mathrm{eff}}=\\frac{r_P}{2}\\left(1+\\frac{T_t}{T_0}\\right)"} caption="Predicted reaction-only pressure increment and worst-case two-reading display-rounding bound." />
      <ScientificParagraph className={prose}>Here m_s is sample mass in grams; f is the initial reactive-acid fraction; x is the proportion of full theoretical CO2 release to be observed (0 to 1); M_A is reactant molar mass in g/mol; R is the gas constant; V_g is free gas volume in cubic metres; T_0 and T_t are initial and later gas temperatures in kelvin. The symbol r_P is the gauge's smallest pressure increment, while r_eff is the combined rounding bound at the later temperature. Pressure values must use consistent units.</ScientificParagraph>
      <ScientificParagraph className={prose}>A reaction signal smaller than twice this bound falls below our display-screening threshold; five times the bound gives greater readout margin. These criteria describe idealized readability rather than an instrument's experimental detection limit. The interactive calculation converts pressure increments from PSI and uses your entered headspace volume, gas temperatures, sample mass, and chosen reaction progress.</ScientificParagraph>
      <GaugeReadabilityExplorer />
      <ScientificParagraph className={prose}>The same bound can be expressed as a possible error in the inferred percentage progress. Let S_P be the sensitivity in percentage points per unit pressure increment; delta X_seal the rounding contribution to apparent sealed-system progress; epsilon the chosen permissible rounding contribution in percentage points; and r_P,max the corresponding maximum pressure display increment:</ScientificParagraph>
      <MathBlock math={"\\begin{aligned}S_P&=\\frac{100V_g}{2Rn_{CO_2,\\max}}\\left(\\frac{1}{T_0}+\\frac{1}{T_t}\\right),\\\\|\\delta X_{\\mathrm{seal}}|&\\leq S_Pr_P,\\qquad r_{P,\\max}=\\frac{\\epsilon}{S_P}\\end{aligned}"} label="(27)" caption="First-order display rounding bound for sealed pressure-based progress, with consistent SI pressure units." />
      <ScientificParagraph className={prose}>Equation (27) uses absolute pressure increments in pascals and the theoretical CO2 capacity in moles from Equation (14). Each recorded vent adds further rounded endpoints to the error budget, with counted equivalent events accumulating the representative event's contribution. Readability cannot establish pressure accuracy, gas composition, or the safety of a pressurized apparatus.</ScientificParagraph>
      <Sub id="volume-pressure-limits" n="6.9" title="Measurement boundaries and safety" />
      <ScientificParagraph className={prose}>The free-gas volume is the vessel's internal capacity minus the volume displaced by material and immersed hardware. Accurate accounting requires absolute pressure, gas temperature, calibrated free volume, and, for vented operation, isolated event measurements. Thermal gradients, changes in liquid level, leaks, and sensor response contribute additional measurement error.</ScientificParagraph>
      <ScientificParagraph className={prose}>These pressure calculations are implemented as manual V4 tools; an automated acquisition and heating system remains proposed work. The equations do not establish that any heated pressure vessel is safe. Rated containment and independent overpressure relief are separate engineering requirements. <InlineCite refs={['lab-pressure-safety', 'asme-overpressure']} /></ScientificParagraph>
    </Chapter>

    <Chapter id="validation" n="7" title="Experimental methods for future evaluation">
      <Sub id="validation-claims" n="7.1" title="Measurement objectives" />
      <ScientificParagraph className={prose}>This paper derives the measurement relations and specifies experimental protocols for subsequent assessment of sensor stability, reference transfer, and chemical correlation. Performing those experiments is outside the scope of the present methods study.</ScientificParagraph>
      <Sub id="validation-controls" n="7.2" title="Proposed test sequence" />
      <ScientificParagraph className={prose}>Replicate aliquots quantify reference-loss dispersion; bulk runs evaluate transfer by batch size and storage interval.</ScientificParagraph>
      <ScientificParagraph className={prose}>Nonreactive gas tests compare known inventories with pressure-reconstructed releases across temperature, event duration, mixture fraction, and leakage.</ScientificParagraph>
      <ScientificParagraph className={prose}>Vacuum and vent-composition estimates are tested against prepared gas mixtures. Liquid-phase measurements assess the Henry approximation across temperature and vent duration.</ScientificParagraph>
      <Sub id="validation-uncertainty" n="7.3" title="Measurement sensitivity and uncertainty" />
      <ScientificParagraph className={prose}>For two independent mass readings of standard uncertainty <InlineMath math={"u_m"} />, the uncertainty of their difference is <InlineMath math={"\\sqrt{2}u_m"} />. The derived quantity <InlineMath math={String.raw`u_X`} /> is the standard uncertainty in apparent progress, expressed in percentage points; <InlineMath math={String.raw`u_m`} /> is the standard uncertainty of each individual balance mass reading (g). The corresponding first-order term is:</ScientificParagraph>
      <MathBlock math={"u_X\\approx\\frac{100\\sqrt{2}u_m}{m_{CO_2,\\max}}"} label="(28)" caption="First-order standard uncertainty of apparent extent." />
      <ScientificParagraph className={prose}>With 0.9822 g theoretical release and 0.01 g standard uncertainty per reading, combined difference uncertainty is 0.0141 g (1.44 percentage points).</ScientificParagraph>
      <Sub id="validation-records" n="7.4" title="Data reporting and reproducibility" />
      <ScientificParagraph className={prose}>Reports retain the raw gross-mass trace, calibration revision, aliquot dispersion, batch mass, endpoint error, and cooling tail. Exclusions and failed runs remain in the dataset.</ScientificParagraph>
    </Chapter>

    <Chapter id="limitations" n="8" title="Discussion">
      <Sub id="limitations-endpoint" n="8.1" title="Endpoint interpretation" />
      <ScientificParagraph className={prose}>A mass-loss plateau may result from depletion, slow kinetics, insufficient temperature, or gas retention. Apparent extent is therefore operationally defined.</ScientificParagraph>
      <Sub id="limitations-interference" n="8.2" title="Competing mass changes" />
      <ScientificParagraph className={prose}>Measured loss combines CO2 with volatile organics, water, handling loss, and other gases. Gas retention and mass uptake can offset these changes. <InlineCite refs={['wang-2016']} /></ScientificParagraph>
      <ScientificParagraph className={prose}>Pressure estimates depend on free-gas volume, thermal correction of initial gas, evolved vapors, and the measured vent history.</ScientificParagraph>
      <ScientificParagraph className={prose}>Vacuum reduces the initial inert inventory but can promote degassing. Henry partitioning remains a separate equilibrium assumption.</ScientificParagraph>
      <Sub id="limitations-universality" n="8.3" title="Transferability to other reactions" />
      <ScientificParagraph className={prose}>The stoichiometric balance extends to characterized CO2-evolving reactions. Lot calibration instead defines an empirical, protocol-specific mass-loss denominator.</ScientificParagraph>
    </Chapter>

    <Chapter id="implementation" n="9" title="Conclusions">
      <ScientificParagraph className={prose}>The gravimetric formulation provides stoichiometric and aliquot-referenced release capacities, while the acquisition model specifies how measured mass loss can be used for automatic endpoint tracking in a single reactor.</ScientificParagraph>
      <ScientificParagraph className={prose}>The pressure formulation extends the gas inventory to vacuum initial states, vent composition, and optional dissolved CO2. Equation-based progress depends on the specified reference capacity and measurement boundary.</ScientificParagraph>
      <ScientificParagraph className={prose}>The experimental protocol specifies replicate aliquot calibration and batch-scale transfer tests; pressure metrology is first evaluated separately with nonreactive gas.</ScientificParagraph>
    </Chapter>

    <section id="references" aria-labelledby="references-heading" className="prose-heading mb-10 border-t border-[var(--border)] pt-8">
      <SectionLabel number="—" title="References" id="references-heading" />
      <ol className="mt-4 space-y-3 ">
        {references.map((ref, i) => <li id={'ref-' + ref.id} key={ref.id} className="scroll-mt-24 flex items-start gap-3 text-xs leading-relaxed text-[var(--text)]">
          <span className="font-mono text-[var(--text-muted)]">[{i + 1}]</span>
          <span>{ref.authors} ({ref.year}). <em>{ref.title}</em>. {ref.venue}.
            {ref.url && <> <a href={ref.url} target="_blank" rel="noopener noreferrer" className="break-all text-[var(--accent)] hover:underline">Source ↗</a></>}
          </span>
        </li>)}
      </ol>
    </section>
  </ReferenceProvider>;
}
