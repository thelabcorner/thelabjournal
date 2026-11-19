import { useMemo } from 'react'
import activityGrid from '../../../../../content/manuscripts/thca-limonene-cosmo-rs/data/gamma_grid.csv?raw'

type Point = { temperature: number; x: number; lnGamma: number }
const rawRows: Point[] = activityGrid.trim().split(/\r?\n/).slice(1).map(line => {
  const fields = line.split(',')
  return { temperature: Number(fields[0]), x: Number(fields[2]), lnGamma: Number(fields[3]) }
}).filter(row => Number.isFinite(row.temperature) && Number.isFinite(row.x) && Number.isFinite(row.lnGamma))

const FIG = 'research-scientific-figure my-7 rounded-lg border border-[var(--border)] bg-[var(--figure-bg)] px-3 pt-4 pb-3'
const CAP = 'mt-3 border-t border-[var(--border)] pt-3 text-xs leading-relaxed text-[var(--text-secondary)]'
const ink = 'var(--text)'
const muted = 'var(--text-muted)'
const temperatures = [15,25,35,45,55,65,75]

export function ActivitySurfaceFigure() {
  const data = useMemo(() => rawRows.filter(point => point.x >= 0.005 && point.x <= 0.995), [])
  const left = 56, right = 650, top = 34, bottom = 242
  const minY = Math.floor(Math.min(...data.map(p => p.lnGamma)) * 2) / 2
  const maxY = Math.ceil(Math.max(...data.map(p => p.lnGamma)) * 2) / 2
  const X = (x: number) => left + x * (right - left)
  const Y = (y: number) => bottom - (y - minY) * (bottom - top) / (maxY - minY)
  const makePath = (t: number) => data.filter(p => p.temperature === t).sort((a,b)=>a.x-b.x)
    .map((p,i) => (i ? 'L' : 'M') + X(p.x).toFixed(2) + ',' + Y(p.lnGamma).toFixed(2)).join(' ')
  return <figure id="activity-figure" className={FIG}>
    <svg viewBox="0 0 710 298" className="w-full h-auto" role="img" aria-labelledby="activity-title activity-desc">
      <title id="activity-title">THCA-A liquid activity coefficient by composition and temperature</title>
      <desc id="activity-desc">Seven calculated ln-gamma curves from 15 to 75 degrees Celsius, reconstructed from the archived 462-row openCOSMO-RS activity grid; excludes the nonuniform near-zero endpoints only in the drawing, not in the underlying data.</desc>
      <g stroke={muted} strokeWidth="1" opacity=".36">
        {Array.from({length:5},(_,i)=>{const x=i/4;return <line key={i} x1={X(x)} y1={top} x2={X(x)} y2={bottom} strokeDasharray="3 6"/>})}
        {Array.from({length:5},(_,i)=>{const v=minY+i*(maxY-minY)/4;return <line key={i} x1={left} y1={Y(v)} x2={right} y2={Y(v)} strokeDasharray="3 6"/>})}
      </g>
      <g stroke={ink} strokeWidth="1.25" fill="none"><path d={'M'+left+','+top+'V'+bottom+'H'+right}/></g>
      <g fill={muted} fontFamily="Inter, sans-serif" fontSize="11">
        {Array.from({length:5},(_,i)=><text key={'x'+i} x={X(i/4)} y={bottom+20} textAnchor="middle">{(i/4).toFixed(2)}</text>)}
        {Array.from({length:5},(_,i)=>{const v=minY+i*(maxY-minY)/4;return <text key={'y'+i} x={left-10} y={Y(v)+4} textAnchor="end">{v.toFixed(2)}</text>})}
        <text x={(left+right)/2} y="289" textAnchor="middle">THCA-A mole fraction in the modeled liquid, x</text>
        <text x="17" y="18">ln γ (THCA-A)</text>
      </g>
      {temperatures.map((t,i)=><path key={t} d={makePath(t)} stroke={ink} strokeWidth={t===25?2.6:1.7} strokeOpacity={t===25?1:0.32+0.09*i} strokeDasharray={t===25?undefined:(i%2?'5 3':undefined)} fill="none" strokeLinejoin="round" />)}
      <g fontFamily="Inter, sans-serif" fontSize="10.5" fill={ink}>
        <rect x="484" y="9" width="8" height="8" fill={ink}/><text x="498" y="17">25 °C emphasized</text>
        <text x="653" y="17" textAnchor="end" fill={muted}>15–75 °C</text>
      </g>
    </svg>
    <figcaption className={CAP}><strong className="text-[var(--text)]">Figure 1.</strong> Composition-dependent THCA-A activity from the archived openCOSMO-RS 24a type-0 grid (seven temperatures, 66 compositions each). Curves are calculated liquid-phase quantities, <em>not measured saturation curves</em>. Source: <code>data/gamma_grid.csv</code>. The 25°C curve is emphasized without introducing new or fitted data.</figcaption>
  </figure>
}

export function ThermalSensitivityFigure() {
  const left=56,right=645,low=0.064845,base=0.11069479664707402,high=0.187373
  const X=(x:number)=>left+x/0.2*(right-left)
  return <figure id="thermal-sensitivity-figure" className={FIG}>
    <svg viewBox="0 0 710 212" className="h-auto w-full" role="img" aria-labelledby="thermal-title thermal-desc">
      <title id="thermal-title">Spread of conditional 25°C THCA-A equilibrium mole fractions</title>
      <desc id="thermal-desc">For an assumed 146-degree-Celsius fusion event and 16.3 kilojoules per mole, changing the assumed heat capacity difference from minus to plus 50 joules per mole kelvin gives a scenario spread from 0.064845 to 0.187373; the zero heat capacity baseline is 0.110695. This is a scenario interval, not a statistical confidence interval.</desc>
      <g fill={ink} fontFamily="Inter, sans-serif" fontSize="12">
        <text x={left} y="26" fontWeight="600">298.15 K · conditional equilibrium</text>
        <text x={left} y="49" fill={muted}>Unmeasured ΔCₚ explored over ±50 J mol⁻¹ K⁻¹</text>
      </g>
      <line x1={left} y1="132" x2={right} y2="132" stroke={muted} strokeOpacity=".6"/>
      {[0,.05,.1,.15,.2].map(x=><g key={x}><line x1={X(x)} y1="129" x2={X(x)} y2="139" stroke={muted}/><text x={X(x)} y="158" fill={muted} fontSize="11" textAnchor="middle">{x.toFixed(2)}</text></g>)}
      <line x1={X(low)} y1="100" x2={X(high)} y2="100" stroke={ink} strokeWidth="4" strokeLinecap="round" />
      {[low,high].map((x,i)=><g key={x}><circle cx={X(x)} cy="100" r="5" fill="var(--figure-bg)" stroke={ink} strokeWidth="2"/><text x={X(x)} y="83" textAnchor={i===0?'start':'end'} fontSize="11" fill={ink}>{x.toFixed(5)}</text></g>)}
      <circle cx={X(base)} cy="100" r="6.5" fill={ink} />
      <path d={'M'+X(base)+',109 V121'} stroke={ink} strokeWidth="1.4" />
      <text x={X(base)} y="178" textAnchor="middle" fill={ink} fontSize="11" fontWeight="600">Baseline 0.11069</text>
      <text x={(left+right)/2} y="200" textAnchor="middle" fill={muted} fontSize="11">Modeled THCA-A mole fraction</text>
    </svg>
    <figcaption className={CAP}><strong className="text-[var(--text)]">Figure 2.</strong> Conditional solid-reference sensitivity under the patent-reported 146°C/16.3 kJ mol⁻¹ thermal scenario. The endpoints represent alternate assumed ΔCₚ inputs, not uncertainty bounds inferred from calibrated measurement errors. Source: archived SLE scenario results and independent thermodynamic audit.</figcaption>
  </figure>
}

export function PhaseRegimesFigure() {
  const sections=[
    {n:'01',t:'Solid–liquid',s:'Crystal ↔ liquid mixture',note:'Identify crystalline phase; equate chemical potentials; solve xγ against fusion free energy'},
    {n:'02',t:'Liquid–liquid',s:'Liquid α ↔ liquid β',note:'Establish common-tangent/coexistence conditions; do not invent a limit for miscible pairs'},
    {n:'03',t:'Vapor–liquid',s:'Vapor ↔ compressed liquid',note:'Specify T and P; resolve fugacities, phase envelope and actual liquefied-solvent state'},
  ]
  return <figure id="regimes-figure" className={FIG}>
    <div className="grid gap-0 sm:grid-cols-3" role="group" aria-label="Three distinct phase-equilibrium regimes">
      {sections.map((s,i)=><div key={s.n} className={'px-3 py-3 '+(i?'border-t sm:border-t-0 sm:border-l border-[var(--border)]':'')}>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">{s.n} / equilibrium class</span>
        <div className="mt-2 text-sm font-semibold text-[var(--text)]">{s.t}</div>
        <div className="mt-2 text-xs font-medium text-[var(--text-secondary)]">{s.s}</div>
        <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">{s.note}</p>
      </div>)}
    </div>
    <figcaption className={CAP}><strong className="text-[var(--text)]">Figure 3.</strong> The research program's three different thermodynamic questions. A positive liquid-mixing stability result does not negate saturation against a specified crystal; vapor–liquid analysis is separately required when working with liquefied hydrocarbons.</figcaption>
  </figure>
}