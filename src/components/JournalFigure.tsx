import { useId } from 'react'
import { cn } from '../lib/utils'
import { DitherScene } from './DitherScene'
import { journalFigureSpecs, type JournalFigureSpec, type FigureNode } from './journalFigureData'
import '../journal-figures.css'

interface Props {
  slug: string
  variant?: 'overview' | 'detail'
  className?: string
}
function Node({ value, index }: { value: FigureNode; index?: number }) {
  return <div className="jf-node">
    {index !== undefined && <span className="jf-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>}
    <div className="jf-node-copy"><strong>{value[0]}</strong><span>{value[1]}</span></div>
  </div>
}
function Path({ nodes, loop = false }: { nodes: readonly FigureNode[]; loop?: boolean }) {
  return <div className={cn('jf-path', loop && 'jf-path--loop')}>
    <div className="jf-path-steps">{nodes.map((item, i) => <Node value={item} index={i} key={i}/>)}</div>
    {loop && <div className="jf-return"><span aria-hidden="true">↶</span> Feed the evidence into the next iteration</div>}
  </div>
}
function Compare({ left, right }: { left: readonly FigureNode[]; right: readonly FigureNode[] }) {
  return <div className="jf-comparison">
    <div className="jf-compare-column">{left.map((item,i) => <Node key={i} value={item}/>)}</div>
    <span className="jf-compare-divider" aria-hidden="true">↔</span>
    <div className="jf-compare-column jf-compare-column--contrast">{right.map((item,i) => <Node key={i} value={item}/>)}</div>
  </div>
}
function Grid({ nodes }: { nodes: readonly FigureNode[] }) {
  return <div className="jf-matrix">{nodes.map((item,i) => <Node value={item} index={i} key={i}/>)}</div>
}
function Layers({ nodes }: { nodes: readonly FigureNode[] }) {
  return <div className="jf-layers">{nodes.map((item,i) => <div className="jf-layer" key={i}>
    <span className="jf-layer-index">{String(i+1).padStart(2,'0')}</span>
    <Node value={item}/>
  </div>)}</div>
}
function PixelVisual({ slug, left, right }: { slug: string; left: readonly FigureNode[]; right: readonly FigureNode[] }) {
  const nacre = slug === 'nacre-vectorization'
  return <div className="jf-visual-pair">
    <div className="jf-visual-column">
      <div className="jf-illustration" aria-hidden="true">
        {nacre ? <svg viewBox="0 0 220 132">
          {Array.from({length:10},(_,y)=>Array.from({length:16},(_,x)=>{
            const dx=(x-7.5)/5.3,dy=(y-4.5)/3.9,coverage=Math.max(0,Math.min(1,(1.12-Math.hypot(dx,dy))*3))
            return <rect key={x+','+y} x={15+x*12} y={7+y*12} width="11" height="11" fill="currentColor" opacity={.06+coverage*.85}/>
          }))}
        </svg> : <svg viewBox="0 0 220 132">
          <path d="M10 118H210M10 13V118" stroke="currentColor" strokeOpacity=".23" fill="none"/>
          <path d="M10 83C45 83 49 28 87 35S148 94 210 23" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="14"/>
          <path d="M10 83C45 83 49 28 87 35S148 94 210 23" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M10 103C44 102 55 56 87 57S154 111 210 53" fill="none" stroke="currentColor" strokeDasharray="3 4" strokeOpacity=".45"/>
          {Array.from({length:12},(_,i)=><circle key={i} cx={19+i*17} cy={92-20*Math.sin(i*.45)} r="2.5" fill="currentColor" opacity=".6"/>)}
        </svg>}
      </div>
      <Node value={left[0]}/>
    </div>
    <div className="jf-visual-column jf-visual-column--contrast">
      <div className="jf-illustration" aria-hidden="true">
        {nacre ? <svg viewBox="0 0 220 132">
          <path d="M57 99C20 49 74 12 131 21S200 87 161 105S87 120 57 99Z" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M57 99L74 12M131 21L193 72M161 105L103 121" stroke="currentColor" strokeOpacity=".23" strokeDasharray="4 4"/>
          {[[57,99],[131,21],[161,105],[103,121]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="4.5" fill="var(--card)" stroke="currentColor" strokeWidth="1.8"/></g>)}
        </svg> : <svg viewBox="0 0 220 132">
          <path d="M10 19H210M10 113H210" stroke="currentColor" strokeOpacity=".52" strokeWidth="3"/>
          <g stroke="currentColor" strokeOpacity=".5" fill="none">
            {[42,110,178].map(x=><rect key={x} x={x-23} y="35" width="46" height="61" rx="23" />)}
          </g>
          {[42,110,178].map((x,i)=><g key={x}>
            {[0,1,2].map(j=><circle key={j} cx={x-8+j*8} cy={i===0?75:i===1?57:44} r="4.2" fill="currentColor" opacity={i===0?.38:.87}/>)}
            {[0,1,2].map(j=><circle key={j} cx={x-8+j*8} cy={i===0?49:i===1?78:86} r="4.2" fill="var(--card)" stroke="currentColor" strokeOpacity=".55"/>)}
          </g>)}
          <path d="M42 20v12m-4-4 4 4 4-4M178 111V99m-4 4 4-4 4 4" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        </svg>}
      </div>
      <Node value={right[0]}/>
    </div>
  </div>
}
function ArcVisual({ left, right }: { left: readonly FigureNode[]; right: readonly FigureNode[] }) {
  return <div className="jf-special">
    <svg className="jf-arc" viewBox="0 0 580 178" role="img" aria-label="Dashed oversized object bounds surround a smaller curved physical dieline that fixes the warp">
      <rect x="51" y="19" width="477" height="140" fill="none" stroke="currentColor" strokeOpacity=".34" strokeDasharray="5 6"/>
      <path d="M100 116Q285 -8 480 116L446 150Q286 58 134 150Z" fill="currentColor" fillOpacity=".055" stroke="currentColor" strokeWidth="2.2"/>
      <path d="M134 150Q285 58 446 150" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.2" fill="none"/>
      <path d="M290 18V166" stroke="currentColor" strokeOpacity=".25" strokeDasharray="3 5"/>
      <path d="M134 166H446m-312-4v8m312-8v8" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="100" cy="116" r="3.5" fill="currentColor"/><circle cx="480" cy="116" r="3.5" fill="currentColor"/>
    </svg>
    <Compare left={left} right={right}/>
  </div>
}
function BytesVisual({ left, right }: { left: readonly FigureNode[]; right: readonly FigureNode[] }) {
  return <div className="jf-special jf-bytes">
    <div className="jf-byte-row" aria-label="Eight symbolic reference byte slots">
      {Array.from({length:8},(_,i)=><span key={i} className="jf-byte">B{i}</span>)}
    </div>
    <div className="jf-byte-operation" aria-hidden="true">Copy · field delta Δ · sparse corrections R ↓</div>
    <div className="jf-byte-row" aria-label="Eight derived symbolic byte slots with arithmetic and sparse corrections">
      {Array.from({length:8},(_,i)=><span key={i} className={cn('jf-byte', (i===2||i===3||i===6) && 'jf-byte--changed')}>{i===2||i===3?'Δ':i===6?'R':`B${i}`}</span>)}
    </div>
    <Compare left={left} right={right}/>
  </div>
}
function PdfVisual({ left, right }: { left: readonly FigureNode[]; right: readonly FigureNode[] }) {
  return <div className="jf-special">
    <div className="jf-documents" aria-hidden="true">
      <div className="jf-page jf-page--flat"><span className="jf-page-header"/><span/><span/><div className="jf-page-art"/><small>One raster surface</small></div>
      <div className="jf-page jf-page--native"><span className="jf-page-header"/><span/><span/><div className="jf-page-art"/><small>Text + vector objects</small></div>
    </div>
    <Compare left={left} right={right}/>
  </div>
}
function Dependency({ nodes }: { nodes: readonly FigureNode[] }) {
  return <div className="jf-special">
    <div className="jf-dependency">
      {nodes.map((node,i)=><div className="jf-dependency-node" key={node[0]}>
        <strong>{node[0]}</strong><span>{node[1]}</span>{i<2 && <span className="jf-dependency-arrow" aria-hidden="true">→</span>}
      </div>)}
    </div>
    <div className="jf-loop-warning"><span aria-hidden="true">↶</span> C needs A, closing the directed cycle</div>
  </div>
}
function Content({ spec, slug }: { spec: JournalFigureSpec; slug: string }) {
  const nodes=spec.nodes ?? [], left=spec.left ?? [],right=spec.right ?? []
  switch(spec.kind) {
    case 'flow': return <Path nodes={nodes}/>
    case 'cycle': return <Path nodes={nodes} loop/>
    case 'compare': return <Compare left={left} right={right}/>
    case 'matrix': return <Grid nodes={nodes}/>
    case 'layers': return <Layers nodes={nodes}/>
    case 'pixel': return <PixelVisual slug={slug} left={left} right={right}/>
    case 'arc': return <ArcVisual left={left} right={right}/>
    case 'bytes': return <BytesVisual left={left} right={right}/>
    case 'pdf': return <PdfVisual left={left} right={right}/>
    case 'dependency': return <Dependency nodes={nodes}/>
  }
}
export function JournalFigure({ slug, variant='overview', className }: Props) {
  const id=useId()
  const pair=journalFigureSpecs[slug]
  const spec=pair?.[variant]
  if(!spec) return null
  return <figure className={cn('research-figure', 'jf-figure', className)} aria-labelledby={id+'-title'} aria-describedby={id+'-caption'}>
    <div className="figure-top jf-top">
      <span>Fig. {variant==='overview'?'01':'02'} / {variant==='overview'?'Overview':'Mechanism'}</span>
      {variant==='overview' && <span className="figure-motion" aria-hidden="true"><DitherScene variant="ledger" className="figure-dither" fps={14} speed={.68} intensity={.85}/></span>}
    </div>
    <div className="jf-body">
      <h3 id={id+'-title'} className="jf-title">{spec.title}</h3>
      <Content spec={spec} slug={slug}/>
      {spec.note && <p className="jf-note">{spec.note}</p>}
    </div>
    <figcaption className="jf-caption" id={id+'-caption'}>{spec.caption}</figcaption>
  </figure>
}
export function hasJournalDetailFigure(slug: string) { return Boolean(journalFigureSpecs[slug]?.detail) }
