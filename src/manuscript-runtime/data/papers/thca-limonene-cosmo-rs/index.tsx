import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { TitlePage } from '../../../components/sections/TitlePage'
import { Abstract, SectionLabel, SubsectionLabel } from '../../../components/sections/Abstract'
import { MathBlock, InlineMath } from '../../../components/prose/MathBlock'
import { ReferenceProvider } from '../../../components/prose/ReferenceContext'
import { InlineCite } from '../../../components/prose/InlineCite'
import { thcaLimoneneEntry as entry } from './entry'
import { thcaLimoneneReferences as references } from './references'
import { ActivitySurfaceFigure, ThermalSensitivityFigure, PhaseRegimesFigure } from './figures'

const prose = 'text-sm leading-relaxed text-[var(--text)]'
function Chapter({id,n,title,children}:{id:string;n:string;title:string;children:ReactNode}) {
  return <section id={id} aria-labelledby={id+'-heading'} className="prose-heading mb-10">
    <div className="mb-5"><SectionLabel number={n} title={title} id={id+'-heading'}/></div>
    <div className="space-y-4">{children}</div>
  </section>
}
function Sub({id,n,title,children}:{id:string;n:string;title:string;children:ReactNode}) {
  return <section id={id} aria-labelledby={id+'-heading'} className="space-y-3 scroll-mt-24">
    <SubsectionLabel number={n} title={title} id={id+'-heading'}/>{children}
  </section>
}
function DataTable({caption,headers,rows}:{caption:string;headers:string[];rows:ReactNode[][]}) {
  return <figure className="my-5">
    <div className="research-data-table overflow-x-auto rounded-md border border-[var(--border)]">
      <table className="w-full border-collapse text-xs leading-relaxed tabular-nums">
        <thead><tr className="bg-[var(--figure-bg)]">{headers.map((h,i)=><th key={i} scope="col" className="border-b border-[var(--border)] px-3 py-2.5 text-left font-semibold text-[var(--text-secondary)]">{h}</th>)}</tr></thead>
        <tbody>{rows.map((row,i)=><tr key={i} className="border-t border-[var(--border)]">{row.map((cell,j)=><td key={j} className="px-3 py-2.5 align-top text-[var(--text)]">{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
    <figcaption className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">{caption}</figcaption>
  </figure>
}
function Note({title,children}:{title:string;children:ReactNode}) {
  return <aside className="my-4 border-l-2 border-[var(--border)] py-1 pl-4">
    <p className="text-xs font-semibold text-[var(--text-secondary)]">{title}</p>
    <div className="mt-1 text-sm leading-relaxed text-[var(--text)]">{children}</div>
  </aside>
}
function Bibliography() {
  return <section id="references" className="prose-heading mb-10" aria-labelledby="references-heading">
    <div className="mb-5"><SectionLabel number="Ref" title="References" id="references-heading"/></div>
    {references.map((ref,i)=><div key={ref.id} id={'ref-'+ref.id} className="reference-entry flex gap-3 py-2">
      <span className="w-6 shrink-0 text-right text-xs font-mono text-[var(--text-muted)]">[{i+1}]</span>
      <p className={prose}><strong>{ref.authors}</strong> ({ref.year}).{' '}
        {ref.url?<a href={ref.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-[var(--accent)]">{ref.title}</a>:<em>{ref.title}</em>}.{' '}
        <span className="text-[var(--text-secondary)]">{ref.venue}</span></p>
    </div>)}
  </section>
}

export function PaperBody({isDark:_isDark}:{isDark:boolean}) {
  useEffect(()=>{
    if(!window.location.hash)return
    let id:string
    try{id=decodeURIComponent(window.location.hash.slice(1))}catch{return}
    const frame=requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({block:'start'}))
    return ()=>cancelAnimationFrame(frame)
  },[])
  return <ReferenceProvider references={references}>
    <article className="thca-research-paper">
      <TitlePage metadata={entry.metadata}/>
      <Abstract content={entry.abstract}/>
      <aside aria-label="Research integrity disclosure" className="my-6">
        <details className="rounded-lg border border-[var(--border)] bg-[var(--sidenote-bg)]">
          <summary className="cursor-pointer px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">AI-assisted research and evidence disclosure</summary>
          <p className="border-t border-[var(--border)] px-4 py-3 text-xs leading-relaxed text-[var(--text)]">
            AI research agents assisted literature recovery, calculations, cross-checking and editorial synthesis. Independent agreement verifies the reported numerical calculations, not their physical assumptions. Literature, executed simulation, derived quantities, observations and untested hypotheses remain distinct. No experimentally assayed THCA-A/limonene equilibrium saturation or peer-reviewed release is claimed.
          </p>
        </details>
      </aside>

      <Chapter id="introduction" n="1" title="Introduction">
        <p className={prose}>
          In cannabinoid extraction and crystallization, the word <em>solubility</em> often conflates different equilibria. Dissolution of a specified crystalline cannabinoid requires equality between solid and dissolved chemical potentials. Two liquid phytoterpenes can form one continuous liquid phase without a finite liquid–liquid limit. Liquefied propane and butane require pressure-specific vapor–liquid analysis before a liquid-solvent prediction is meaningful. These questions have different thermodynamic conditions and should not share a single undifferentiated solubility number.
        </p>
        <p className={prose}>
          An earlier THCA-A/limonene crystal-to-gas free-energy cycle suggested unexpectedly low saturation. A reconstructed finite-composition openCOSMO-RS calculation produced a substantially different conditional result. The October 2026 six-lane research program tested those numerical calculations, the solid-state premise, liquid stability, solvent identity, external experimental literature and high-pressure extensions. This paper integrates that campaign and treats unresolved experimental properties as scientific findings about the model's limits rather than as nuisances to be hidden.
        </p>
        <PhaseRegimesFigure/>
      </Chapter>

      <Chapter id="framework" n="2" title="Thermodynamic Framework">
        <Sub id="framework-sle" n="2.1" title="Solid–liquid equilibrium">
          <p className={prose}>For a specified crystal, the dissolved solute activity is constrained by the difference between the solid chemical potential and that of a pure, potentially supercooled liquid reference. The dissolved and solid species must match, including chemical identity and relevant stereochemistry.</p>
          <MathBlock label="(1)" math={'\\ln x_i+\\ln\\gamma_i(T,P,\\mathbf{x})=-\\frac{\\Delta G_{\\mathrm{fus}}(T,P)}{RT}'}/>
          <p className={prose}>The fusion free energy can be approximated using the assumed melting temperature, fusion enthalpy and the liquid–solid heat-capacity difference:</p>
          <MathBlock label="(2)" math={'\\Delta G_{\\mathrm{fus}}(T)\\simeq\\Delta H_{\\mathrm{fus}}\\left(1-\\frac{T}{T_m}\\right)+\\Delta C_p\\left[T-T_m-T\\ln\\left(\\frac{T}{T_m}\\right)\\right]'}/>
          <p className={prose}>Solving equation (1) with a small numerical residual cannot establish whether the chosen fusion values describe the actual THCA-A crystal. In that sense the solid phase is a first-order input, not an output of a liquid activity calculation.</p>
        </Sub>
        <Sub id="framework-lle" n="2.2" title="Liquid mixing stability">
          <p className={prose}>Liquid–liquid separation is governed by the Gibbs energy of mixing. Local positive curvature excludes infinitesimal demixing at a tested state, whereas a global common-tangent analysis is required to exclude all separated compositions. A liquid pair that remains miscible does not acquire a finite binary liquid solubility boundary merely because one constituent can also crystallize.</p>
          <MathBlock label="(3)" math={'\\frac{g_{\\mathrm{mix}}}{RT}=\\sum_i x_i\\ln x_i+\\sum_i x_i\\ln\\gamma_i'}/>
        </Sub>
        <Sub id="framework-vle" n="2.3" title="Vapor–liquid equilibrium in hydrocarbon solvents">
          <p className={prose}>Propane, butane and mixed hydrocarbon solvents require a pressure- and composition-resolved phase envelope. Vapor and liquid fugacities must be reconciled at the reported temperature and pressure before declaring a stable liquid solvent and predicting dissolution into it.</p>
          <MathBlock label="(4)" math={'f_i^{\\mathrm{vap}}(T,P,\\mathbf{y})=f_i^{\\mathrm{liq}}(T,P,\\mathbf{x})'}/>
        </Sub>
        <Sub id="framework-basis" n="2.4" title="Concentration and charge-loading bases">
          <p className={prose}>The primary computational result is mole fraction. Mass fraction requires the molecular weights; an operational loading of mg solute per mL of <em>initially charged neat limonene</em> additionally uses initial solvent density. It is not a final-solution concentration. The campaign did not determine final mixture density.</p>
          <MathBlock label="(5)" math={'w_i=\\frac{x_iM_i}{x_iM_i+(1-x_i)M_s},\\qquad L_{i,0}=10^3\\rho_{s,0}\\frac{w_i}{1-w_i}'}/>
        </Sub>
      </Chapter>

      <Chapter id="methods" n="3" title="Methods and Provenance">
        <Sub id="methods-descriptors" n="3.1" title="Liquid activity descriptors and model restrictions">
          <p className={prose}>The archived openCOSMO-RS 24a run uses ORCA-derived files <code>THCa_c000.orcacosmo</code> and <code>Limonene_c000.orcacosmo</code>, with BP86/CPCM, def2-TZVP geometry and def2-TZVPD surface treatment recorded in descriptor provenance. The activity model uses pure-component liquid reference-state type 0 and a legacy mode-0 parameterization <InlineCite refs={['muller2025']}/>.</p>
          <p className={prose}>The available descriptors lack the polarizability data needed for newer model options; polarizability-enabled service requests caused a native extension abort. Replacing the old model without regenerating both level-matched descriptors would not be a controlled comparison. The restriction is recorded to make reruns reproducible, not to claim mode 0 is the most accurate physical model.</p>
        </Sub>
        <Sub id="methods-grid" n="3.2" title="Finite-composition grid and verification">
          <p className={prose}>The recovered calculation comprises 462 live activity evaluations, at seven temperatures (15–75°C) and 66 compositions each. Conditional roots were located by bracketing and live evaluation, with 41 eligible scenario roots independently checked. Separate implementations reproduced the archived grid and repeated root calculations through independent numerical paths. A numerical closure is an equation-solving result, not a measurement confidence interval.</p>
        </Sub>
        <Sub id="methods-solid" n="3.3" title="Crystal references and fusion thermal evidence">
          <p className={prose}>The earlier cycle relied on a constrained CP2K periodic crystal model based on the 2021 THCA-A structure; it used limited relaxation and lattice-vibrational approximations that do not establish a converged absolute solid chemical potential <InlineCite refs={['skell2021']}/>. A distinct SLE scenario adopted a patent's 146°C thermal event and 16.3 kJ/mol reported enthalpy, setting the unmeasured ΔCₚ to zero <InlineCite refs={['patent2026']}/> . The patent also reports a thermogravimetric event before or overlapping its endotherm, making reversible fusion and phase attribution unresolved.</p>
          <DataTable caption="Table 1. Crystallographic source crosswalk. Both cells report orthorhombic P2₁2₁2₁/Z=8 lattices; close metrics alone cannot bind the patent DSC signal to the archived sample." headers={['Record','Temperature','Cell lengths a · b · c (Å)','Cell volume (Å³)']} rows={[
            ['Skell et al. supplementary CIF','120 K','11.4069 · 17.9819 · 19.1565','3929.3'],
            ['Patent named crystalline form','100 K','11.4635 · 18.0506 · 19.2347','3980.1']
          ]}/>
        </Sub>
      </Chapter>

      <Chapter id="results" n="4" title="Results">
        <Sub id="results-liquid" n="4.1" title="Composition-dependent activity and liquid stability">
          <p className={prose}>The infinite-dilution THCA-A value at 25°C, <InlineMath math={'\\ln\\gamma_{\\infty}=0.9089760504'}/>, corresponds to γ≈2.48; the modeled γ at the conditional saturation root is approximately 1.35. Applying the infinite-dilution coefficient to a concentrated solution is therefore not equivalent to calculating finite-composition activity.</p>
          <ActivitySurfaceFigure/>
          <p className={prose}>Independent calculations of the modeled liquid mixing free energy found positive local curvature throughout the sampled interior grid at seven temperatures. The global sampled minimum reduced curvature was approximately +3.65; a refined neighborhood near the 25°C root gave approximately +3.56. Zero evaluated interior points violated the local stability condition.</p>
          <Note title="Scope of the miscibility result">This supports local one-liquid-phase stability on the evaluated grid; it is not a complete global Gibbs-energy minimization, does not exclude every unsampled phase separation and is not transferable to other solute–solvent pairs. A finite crystal-saturation composition may still exist.</Note>
        </Sub>
        <Sub id="results-sle" n="4.2" title="Conditional THCA-A crystal saturation">
          <p className={prose}>At 298.15 K, the nominal 146°C / 16.3 kJ mol⁻¹ / ΔCₚ=0 scenario yields <InlineMath math={'x_{\\mathrm{THCA}}=0.110694796647'}/>, corresponding to 24.6723 mass% and 275.4239 mg THCA-A per milliliter of <em>initially charged</em> limonene. The maximum independently rechecked logarithmic root residual was 7.18 × 10⁻⁷ across the archived 41 roots.</p>
          <DataTable caption="Table 2. Archived nominal SLE curve, conditional on the same unverified patent solid reference. The second column is a mole fraction, not an assayed liquid concentration." headers={['Temperature (°C)','Predicted x THCA-A','Evidence status']} rows={[
            ['15','0.07620','Conditional model root'],['25','0.11069','Conditional model root'],['35','0.15246','Conditional model root'],
            ['45','0.20078','Conditional model root'],['55','0.25499','Conditional model root'],['65','0.31459','Conditional model root'],['75','0.37932','Conditional model root']
          ]}/>
          <p className={prose}>The previous crystal-to-gas route returned much smaller 25°C mole fractions, approximately 1.71 × 10⁻¹⁵ to 2.83 × 10⁻¹¹. Its reported arithmetic was reproducible, but the combined standard-state route and approximate lattice reference do not establish a physically reliable absolute solubility. The values remain part of the research history, not an alternative validated process forecast.</p>
        </Sub>
        <Sub id="results-sensitivity" n="4.3" title="Fusion-parameter sensitivity">
          <p className={prose}>Varying the assumed, unmeasured ΔCₚ by ±50 J mol⁻¹ K⁻¹ changes the 25°C conditional composition from approximately 0.06485 to 0.18737. Adopting a different assumed 30 kJ/mol fusion enthalpy produces a separate scenario near 0.01442. Neither spread is a statistical confidence interval.</p>
          <ThermalSensitivityFigure/>
          <DataTable caption="Table 3. Evidence classes prevent solver precision from being mistaken for experimental accuracy." headers={['Statement','Evidence class','Boundary']} rows={[
            ['462 activity evaluations','Executed simulation','Archived model and descriptor settings'],
            ['41 equilibria and residuals','Independent numerical verification','SLE conditional on inputs'],
            ['146°C and 16.3 kJ/mol','Patent thermal report','Reversible fusion/phase match not established'],
            ['ΔCₚ=0','Model assumption','Not experimentally measured'],
            ['275.42 mg/mL','Derived charge loading','Initial neat-solvent volume only'],
            ['Slow crystallization observations','Qualitative observation','No induction time or measured saturation']
          ]}/>
        </Sub>
        <Sub id="results-identity" n="4.4" title="Stereochemistry and physical material identity">
          <p className={prose}>Independent CIP analyses assigned the archived modeled THCA-A geometry as (6aR,10aR) and the archived limonene as (R)-(+). One inherited solvent registry key incorrectly pointed to (S)-(−)-limonene; the metadata were corrected, while the original descriptor and computed values were unaffected. These are <em>model-level</em> identity determinations. Neither the actual THCA-A polymorph nor the experimental solvent's enantiomeric composition was measured.</p>
          <p className={prose}>For chiral THCA-A in a chiral solvent, opposite solvent enantiomers are diastereomeric environments and cannot be assumed to have equal activities. A single additional (S)-limonene descriptor could only bound the <em>single-conformer, symmetry-breaking component</em> of that discrimination without further conformer sampling. Sample identity remains a separate materials requirement.</p>
        </Sub>
      </Chapter>

      <Chapter id="extension" n="5" title="Solvent Research Program">
        <Sub id="extension-matrix" n="5.1" title="The 112-case research matrix">
          <p className={prose}>The expansion comprises eight cannabinoids across three hydrocarbon and eight botanical solvents, together with eight phytoterpenes across the three hydrocarbons. It identifies target systems for future phase-specific prediction, not 112 computed solubilities. A separate 17-composition screen was executed for the <em>existing</em> THCA-A/limonene pair; it is not 17 additional solvent pairs.</p>
          <DataTable caption="Table 4. Campaign readiness; not-computed cells are explicitly distinguished from numerical zero." headers={['Scope','Cases','Status']} rows={[
            ['THCA-A/(R)-(+)-limonene','1','Computed conditional SLE and activity grid'],
            ['Other botanical pairs','63','Additional matched descriptors/phase inputs needed'],
            ['Hydrocarbon solvent cases','48','Descriptor and EOS/liquid-state coupling gates'],
            ['All target pairs','112','1 conditional numerical case; 111 not computed']
          ]}/>
        </Sub>
        <Sub id="extension-benchmark" n="5.2" title="Experimental CBD/n-pentane reference">
          <p className={prose}>Pulido Bonilla et al. report experimental CBD in <em>n</em>-pentane at x=0.00244 (253.1 K) and x=0.215 (301.1 K), with a reported melting temperature of 341.4 ± 0.4 K and fusion enthalpy 21 ± 3 kJ/mol <InlineCite refs={['pulido2023']}/>. Inverting the SLE expression under ΔCₚ=0 gives implied activity coefficients approximately 31.02 and 1.73. Those are derived from published <em>measurements</em>, not independent COSMO-RS predictions.</p>
          <p className={prose}>At the quoted site ambient pressure near 74 kPa, modeled pure <em>n</em>-pentane vapor pressure is approximately 76.17 kPa at 301.1 K, with a saturation temperature of 300.31 K. The warm anchor therefore requires experimental vessel-pressure and phase-state qualification. The broader published four-solvent study spans 253.1–310.1 K, not merely the quoted <em>n</em>-pentane anchor range. No held-out COSMO prediction has yet been scored.</p>
        </Sub>
        <Sub id="extension-hydrocarbon" n="5.3" title="High-pressure phase constraints and botanical volatility">
          <p className={prose}>The hydrocarbon lane developed EOS and vapor–liquid phase-envelope calculations for propane, butane and pentane, including binary tests. These support physically possible fluid states but do not directly predict cannabinoid saturation. The botanical lanes independently audited solvent identities and vapor-pressure correlations. For limonene, the 25°C all-anchor extrapolation envelope of 0.201–0.231 kPa is appropriate; a single overly precise pressure value is not. Atmospheric boiling is not the principal uncertainty in the THCA-A/limonene case.</p>
          <p className={prose}>Rapinel et al. supply a relevant COSMO-RS extraction-screening precedent involving limonene, carvone and <em>n</em>-butane. Their relative solvent rankings and extraction yields are not an absolute experimental CBD or THCA-A SLE benchmark <InlineCite refs={['rapinel2017']}/>.</p>
        </Sub>
      </Chapter>

      <Chapter id="discussion" n="6" title="Discussion">
        <p className={prose}>The largest gap between precision and physical knowledge is in the solid reference. Multiple independent solvers can reproduce a conditional root to better than one part per million while the assumed fusion enthalpy and heat capacity change its value several-fold. A stable modeled liquid is compatible with a finite crystalline saturation composition, and a point on that conditional SLE curve should not be recast as a universal chemical solubility or a laboratory process recipe.</p>
        <p className={prose}>Carboxylic-acid self-association in limonene is a plausible missing physical term, not a measured dimer fraction. Hydrogen bonding established in the crystalline structure does not determine solution association equilibria. Persistent optical clarity followed by delayed crystallization suggests a kinetic research question, but without an assayed equilibrium concentration and time series it cannot quantify supersaturation, a metastable-zone width or induction time.</p>
        <p className={prose}>The model's numerical reproducibility, source-bound crystallographic comparison, stereochemical assignment and phase-state auditing represent actual advances. Improving the last decimals of numerical closure without first resolving polymorph identity or compound integrity would concentrate effort on the best-constrained part of the study rather than on its most consequential unknowns.</p>
      </Chapter>

      <Chapter id="experimental" n="7" title="Experimental Discrimination">
        <p className={prose}>Meaningful validation begins by characterizing the exact solid and solvent that enter the equilibrium experiment. The solid's diffraction pattern must be linked to its thermal events; simultaneous mass-loss information can distinguish decomposition from reversible fusion. Chiral solvent characterization is required before using a single-enantiomer COSMO descriptor. Equilibrated liquid aliquots should then be assayed over temperature and time, with chemical integrity checks and measured final mixture volume or density if a final-solution mg/mL figure is desired.</p>
        <DataTable caption="Table 5. Proposed empirical discrimination, not completed experimental work." headers={['Evidence to obtain','Question resolved']} rows={[
          ['PXRD / identified single-crystal solid','Which crystalline phase is in equilibrium?'],
          ['DSC with TGA and compound integrity assay','Is the endotherm reversible THCA-A fusion?'],
          ['Chiral GC or qualified certificate for limonene','Does actual solvent handedness match model?'],
          ['Time-resolved, temperature-equilibrated HPLC analysis','What is measured liquid equilibrium composition?'],
          ['Final-mixture density','What is concentration per final liquid volume?'],
          ['Time-resolved phase observation and assay','Is apparent delayed crystallization kinetic?']
        ]}/>
        <p className={prose}>Subsequent computational runs should regenerate matched solvent/solute descriptors, quantify conformer effects, and perform prospective experimental holdouts under pressure-compatible conditions. The remaining 111 matrix cases have no publishable predicted saturation output.</p>
      </Chapter>

      <Chapter id="conclusion" n="8" title="Conclusions">
        <p className={prose}>An independently reproducible finite-composition activity model for THCA-A/(R)-(+)-limonene has been recovered. Under one explicit, unvalidated patent-derived fusion scenario, its 25°C root is x=0.110695 or 275.42 mg THCA-A per mL of initially charged limonene. The sampled liquid-mixing curvature is positive, separating local single-liquid stability from equilibrium against a named crystal.</p>
        <p className={prose}>The calculation is not an observed solubility, a universal saturation limit or a prediction of crystallization kinetics. The broader phase-specific 112-case framework, the high-pressure solvent checks, stereo audit and external experimental benchmark clarify what is known, what is only modeled and what remains uncomputed. Identifying the real crystalline phase and validating the thermal reference are the highest-value next scientific tests.</p>
      </Chapter>

      <section id="provenance" className="prose-heading mb-10" aria-labelledby="provenance-heading">
        <div className="mb-4"><SectionLabel number="—" title="Research Provenance and Version History" id="provenance-heading"/></div>
        <p className={prose}>This <strong>v0.2 browser research edition</strong> integrates the 21–22 October 2026 six-lane research campaign: Thermodynamics, QuantumChemistry, BotanicalSolvents, HydrocarbonPhases, ExternalValidation and PublicationRepro. The archived <code>gamma_grid.csv</code>, <code>sle_rebuild_results.json</code>, independent verifier results, crystallographic crosswalk and PublicationRepro claims ledger remain the numerical evidence basis. Figure 1 is derived directly from the retained CSV.</p>
        <p className={prose}>The prior v0.1 <code>manuscript.tex</code>, its generated HTML and PDF remain historical, unchanged artifacts. The <a href={import.meta.env.BASE_URL+'research/thca-limonene-cosmo-rs/manuscript-draft.pdf'} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-[var(--accent)]">archived v0.1 PDF</a> does <strong>not</strong> represent this revised text; a new publication PDF requires a separate evidence-checked export. This remains an unpublished editorial draft and is excluded from Scholar indexing.</p>
      </section>
      <Bibliography/>
    </article>
  </ReferenceProvider>
}