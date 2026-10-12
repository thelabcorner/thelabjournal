import type { FigureType } from '../data'
import { cn } from '../lib/utils'
import { DitherScene } from './DitherScene'

interface FigureProps { type: FigureType; compact?: boolean; className?: string }

export function ResearchFigure({ type, compact = false, className }: FigureProps) {
  return <div className={cn('research-figure', compact && 'research-figure--compact', className)}>
    <div className="figure-top"><span>Fig. {type === 'pressure' ? '01' : '02'} / {type === 'learning' ? 'Learning sequence' : type === 'frontier' ? 'Problem feasibility' : type === 'agent' ? 'Agent engineering loop' : type === 'pressure' ? 'Transport model' : type === 'geometry' ? 'Geometry' : type === 'pdf' ? 'Document structure' : type === 'contours' ? 'Primitive fitting' : type === 'system' ? 'Trust boundaries' : type === 'signals' ? 'Phrase structure' : type === 'storage' ? 'Chunk index' : 'Module graph'}</span><span className="figure-motion" aria-hidden="true"><DitherScene variant="ledger" className="figure-dither" fps={14} speed={0.68} intensity={0.85}/></span></div>
    <div className="figure-canvas">
      {type === 'frontier' && <svg viewBox="0 0 580 226" role="img" aria-label="Conceptual comparison of where project work becomes difficult: formerly setup and manual groundwork, now the reasoning needed to investigate and verify harder problems">
        <g fontFamily="Inter,Arial,sans-serif" fill="currentColor">
          <text x="22" y="28" fontSize="11" opacity=".55" fontWeight="600">Before</text>
          <text x="22" y="126" fontSize="11" opacity=".55" fontWeight="600">With AI</text>
          {([['Idea',88,18,105],['Manual groundwork',217,18,156],['First serious test',397,18,157]] as const).map(([label,x,y,w],i) => <g key={label}>
            <rect x={x} y={y} width={w} height="53" rx="5" stroke="currentColor" strokeOpacity={i===1?.64:.28} fill="currentColor" fillOpacity={i===1?.075:.025}/>
            <text x={x+w/2} y={y+31} textAnchor="middle" fontSize="11.5" fontWeight={i===1?600:500}>{label}</text>
          </g>)}
          {([['Idea',88,117,105],['Agent groundwork',217,117,156],['Reasoning + tests',397,117,157]] as const).map(([label,x,y,w],i) => <g key={label}>
            <rect x={x} y={y} width={w} height="53" rx="5" stroke="currentColor" strokeOpacity={i===2?.65:.28} fill="currentColor" fillOpacity={i===2?.075:.025}/>
            <text x={x+w/2} y={y+31} textAnchor="middle" fontSize="11.5" fontWeight={i===2?600:500}>{label}</text>
          </g>)}
          <path d="M193 44H217m-7-5 7 5-7 5M373 44H397m-7-5 7 5-7 5M193 143H217m-7-5 7 5-7 5M373 143H397m-7-5 7 5-7 5" fill="none" stroke="currentColor" strokeOpacity=".55" strokeWidth="1.5"/>
          <text x="290" y="204" textAnchor="middle" fontSize="11" opacity=".6">The limiting work shifts as models improve</text>
        </g>
      </svg>}
      {type === 'learning' && <svg viewBox="0 0 580 226" role="img" aria-label="Two learning sequences: formerly research then understanding then prototype; now rough AI-assisted prototype then investigation then understanding and refinement">
        <g fontFamily="Inter,Arial,sans-serif" fill="currentColor">
          <text x="24" y="30" fontSize="11" fontWeight="600" opacity=".54">Before</text>
          <text x="24" y="131" fontSize="11" fontWeight="600" opacity=".54">With AI</text>
          {[[100,'Research'],[251,'Understand'],[402,'Prototype']].map(([x,label]) => <g key={label}><rect x={Number(x)} y="12" rx="5" width="126" height="51" fill="currentColor" fillOpacity=".035" stroke="currentColor" strokeOpacity=".24"/><text x={Number(x)+63} y="42" fontSize="12" textAnchor="middle" fontWeight="500">{label}</text></g>)}
          {[[100,'Rough prototype'],[251,'Investigate'],[402,'Refine + verify']].map(([x,label],i) => <g key={label}><rect x={Number(x)} y="113" rx="5" width="126" height="51" fill="currentColor" fillOpacity={i===2?'.10':'.035'} stroke="currentColor" strokeOpacity={i===2?'.65':'.24'}/><text x={Number(x)+63} y="143" fontSize="12" textAnchor="middle" fontWeight="500">{label}</text></g>)}
          <path d="M229 38H245m-7-5 7 5-7 5M380 38h16m-7-5 7 5-7 5M229 138h16m-7-5 7 5-7 5M380 138h16m-7-5 7 5-7 5" fill="none" stroke="currentColor" strokeOpacity=".58" strokeWidth="1.5" />
          <path d="M465 173V192H314V173m-5 8 5-8 5 8" fill="none" stroke="currentColor" strokeOpacity=".36" strokeWidth="1.5" strokeDasharray="4 4"/>
          <text x="391" y="209" fontSize="10" opacity=".56" textAnchor="middle">Repeat until the result holds up</text>
        </g>
      </svg>}
      {type === 'agent' && <svg viewBox="0 0 580 226" role="img" aria-label="The human gives the engineering objective. The coding agent selects tools to inspect, modify, test, and recover, using their results to refine its plan.">
        <g fontFamily="Inter,Arial,sans-serif" fill="currentColor">
          {([['Engineering goal',23],['Coding agent',225],['Codebase',427]] as const).map(([label,x],i) => <g key={label}><rect x={x} y="25" width="130" height="45" rx="5" fill="currentColor" fillOpacity={i===1?.09:.03} stroke="currentColor" strokeOpacity={i===1?.67:.3}/><text x={x+65} y="52" fontSize="12" fontWeight={i===1?600:500} textAnchor="middle">{label}</text></g>)}
          <path d="M153 47h72m-7-5 7 5-7 5M355 47h72m-7-5 7 5-7 5M290 70v29m-5-7 5 7 5-7" stroke="currentColor" strokeWidth="1.5" strokeOpacity=".55" fill="none"/>
          {([['Orient + inspect',19],['Edit + refactor',159],['Test + diagnose',299],['Recover + recall',439]] as const).map(([label,x]) => <g key={label}><rect x={x} y="106" width="122" height="48" rx="5" stroke="currentColor" strokeOpacity=".3" fill="currentColor" fillOpacity=".025"/><text x={x+61} y="134" fontSize="11.5" textAnchor="middle">{label}</text></g>)}
          <path d="M141 130h18m-7-5 7 5-7 5M281 130h18m-7-5 7 5-7 5M421 130h18m-7-5 7 5-7 5" fill="none" stroke="currentColor" strokeOpacity=".5" strokeWidth="1.5"/>
          <path d="M500 154v29H290V70" fill="none" stroke="currentColor" strokeWidth="1.4" strokeOpacity=".46" strokeDasharray="4 4"/>
          <text x="385" y="177" fontSize="10.5" opacity=".65" textAnchor="middle">Evidence returns to the agent</text>
          <text x="24" y="215" fontSize="10" opacity=".58">Conceptual workflow · the agent calls the tools</text>
        </g>
      </svg>}
      {type === 'pressure' && <svg viewBox="0 0 580 226" aria-labelledby="figure-pressure-title" role="img" preserveAspectRatio="xMidYMid meet">
        <title id="figure-pressure-title">Illustrative normalized conduction response as pressure increases. Not experimental measurements.</title>
        <g stroke="currentColor" strokeOpacity=".12" strokeWidth="1">
          <path d="M49 20V191H554M49 63H554M49 106H554M49 149H554M151 20V191M253 20V191M355 20V191M457 20V191" fill="none"/>
        </g>
        <g fill="currentColor" opacity=".56" fontSize="11" fontFamily="Inter,Arial,sans-serif"><text x="49" y="210">0</text><text x="242" y="210">Pressure →</text><text x="8" y="26">1.0</text><text x="8" y="110">0.5</text><text x="14" y="196">0</text></g>
        <path d="M49 191 C88 159 109 116 150 91 S243 46 312 34 S463 24 554 22" stroke="currentColor" strokeWidth="2.7" fill="none"/>
        <path d="M49 191 C88 159 109 116 150 91 S243 46 312 34 S463 24 554 22 L554 191 Z" fill="currentColor" opacity=".038"/>
        <circle cx="253" cy="46" r="5" fill="var(--card)" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M257 45L317 77" stroke="currentColor" opacity=".45" strokeDasharray="3 4"/>
        <rect x="317" y="67" width="156" height="25" rx="4" fill="var(--card)" stroke="currentColor" strokeOpacity=".2"/>
        <text x="326" y="83" fontSize="11" fill="currentColor" fontFamily="Inter,Arial,sans-serif">Pressure dependent</text>
      </svg>}
      {type === 'contours' && <svg viewBox="0 0 580 226" role="img" aria-label="Pixels on the left transform into smooth traced vector contours on the right">
        <g opacity=".18" stroke="currentColor" fill="none" strokeWidth="1">{Array.from({length:9},(_,i)=><path key={i} d={`M${38+i*26} 22V204M38 ${22+i*23}H246`}/>)}</g>
        <path d="M64 165V125H90V83H116V60H168V83H194V125H220V165H194V188H90V165Z" fill="currentColor" opacity=".14"/>
        <path d="M64 165V125H90V83H116V60H168V83H194V125H220V165H194V188H90V165Z" stroke="currentColor" opacity=".55" strokeWidth="1.5" fill="none"/>
        <path d="M278 113H305" stroke="currentColor" strokeWidth="1.5"/><path d="m298 106 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M344 164C333 126 343 74 384 52C419 33 472 51 492 89C524 149 478 186 425 185C380 184 357 189 344 164Z" stroke="currentColor" strokeWidth="2.6" fill="none"/>
        {[[344,164],[384,52],[492,89],[425,185]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="4.5" fill="var(--card)" stroke="currentColor" strokeWidth="1.6"/></g>)}
        <g fontSize="11" fill="currentColor" opacity=".6" fontFamily="Inter,Arial,sans-serif"><text x="88" y="217">Sampled edge</text><text x="393" y="217">Fitted contour</text></g>
      </svg>}
      {type === 'geometry' && <svg viewBox="0 0 580 226" role="img" aria-label="Unwrapped tapered packaging dieline and preserved curved label dimensions">
        <path d="M80 165Q284 24 500 165" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M123 194Q284 83 456 194" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M80 165L123 194M500 165L456 194" stroke="currentColor" strokeWidth="1.5"/>
        {Array.from({length:9},(_,i)=>{const x=100+i*47;const yTop=164-110*Math.sin(Math.PI*i/8);const yBottom=194-80*Math.sin(Math.PI*i/8);return <path key={i} d={`M${x} ${yTop}L${x+14} ${yBottom}`} stroke="currentColor" strokeOpacity=".22" strokeWidth="1"/>})}
        <path d="M290 28V214" stroke="currentColor" strokeOpacity=".3" strokeDasharray="4 5"/><circle cx="290" cy="28" r="4" fill="currentColor"/>
        <g fontSize="11" fill="currentColor" opacity=".7" fontFamily="Inter,Arial,sans-serif"><text x="300" y="35">Centerline</text><text x="210" y="216">Preserve width</text></g>
      </svg>}
      {type === 'pdf' && <svg viewBox="0 0 580 226" role="img" aria-label="HTML layout structures transformed into a native PDF document with text and vector layers">
        <rect x="35" y="29" width="177" height="165" rx="5" stroke="currentColor" strokeOpacity=".6" fill="none"/>
        <rect x="48" y="45" width="151" height="13" rx="2" fill="currentColor" opacity=".13"/>
        <rect x="48" y="68" width="90" height="6" rx="2" fill="currentColor" opacity=".36"/><rect x="48" y="80" width="132" height="6" rx="2" fill="currentColor" opacity=".19"/>
        <rect x="48" y="102" width="70" height="72" rx="3" fill="currentColor" opacity=".08" stroke="currentColor" strokeOpacity=".28"/>
        <circle cx="83" cy="138" r="22" fill="none" stroke="currentColor" strokeWidth="2"/>
        <rect x="130" y="106" width="67" height="7" rx="2" fill="currentColor" opacity=".3"/><rect x="130" y="118" width="59" height="7" rx="2" fill="currentColor" opacity=".13"/>
        <path d="M234 112H335m-12-10 12 10-12 10" stroke="currentColor" strokeWidth="1.8" fill="none"/>
        <path d="M374 31h123l34 34v129H374z" stroke="currentColor" strokeWidth="1.6" fill="var(--card)"/><path d="M497 31v34h34" stroke="currentColor" fill="none" strokeWidth="1.6"/>
        <rect x="387" y="77" width="132" height="5" rx="2" fill="currentColor" opacity=".22"/><rect x="387" y="90" width="109" height="5" rx="2" fill="currentColor" opacity=".22"/>
        <circle cx="431" cy="142" r="26" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M465 132h51m-51 12h44m-44 12h39" stroke="currentColor" strokeWidth="4" strokeOpacity=".22"/>
        <g fontSize="11" fill="currentColor" opacity=".65" fontFamily="Inter,Arial,sans-serif"><text x="86" y="216">Layout tree</text><text x="429" y="216">Native objects</text></g>
      </svg>}
      {type === 'storage' && <svg viewBox="0 0 580 226" role="img" aria-label="Indexed records stored as separately addressable compressed chunks">
        {Array.from({length:5},(_,i)=><g key={i}><rect x={35+i*106} y={42} width="93" height="42" rx="4" stroke="currentColor" strokeOpacity=".55" fill="none"/><rect x={44+i*106} y={53} width={62} height="5" rx="2" fill="currentColor" opacity=".3"/><rect x={44+i*106} y={65} width={45} height="4" rx="2" fill="currentColor" opacity=".13"/></g>)}
        <path d="M290 84V113M88 113H502M88 113V130M194 113V130M300 113V130M406 113V130M502 113V130" stroke="currentColor" strokeOpacity=".48" fill="none"/>
        {Array.from({length:5},(_,i)=><g key={i}><rect x={50+i*106} y="130" width="77" height="44" rx="5" stroke="currentColor" strokeWidth="1.5" fill={i===2?'currentColor':'var(--card)'} fillOpacity={i===2?.09:1}/><g stroke="currentColor" strokeOpacity=".24">{[0,1,2].map(j=><path key={j} d={`M${62+i*106} ${141+j*10}h52`}/>)}</g></g>)}
        <g fontSize="11" fill="currentColor" opacity=".65" fontFamily="Inter,Arial,sans-serif"><text x="223" y="26">Indexed records</text><text x="208" y="203">Compressed chunks</text></g>
      </svg>}
      {type === 'system' && <svg viewBox="0 0 580 226" role="img" aria-label="Client, verification plane and server separated by explicit trust boundaries">
        {['Untrusted client','Release verification','Server decisions'].map((label,i)=><g key={label}><rect x={20+i*190} y="67" width="161" height="91" rx="6" stroke="currentColor" strokeOpacity={i===2?.7:.32} fill={i===2?'currentColor':'none'} fillOpacity=".035"/><circle cx={41+i*190} cy="88" r="4" fill="currentColor" opacity={i===2?.8:.28}/><text x={34+i*190} y="120" fontSize="12" fill="currentColor" fontFamily="Inter,Arial,sans-serif">{label}</text></g>)}
        <path d="M182 112H210m-8-6 8 6-8 6M371 112H400m-8-6 8 6-8 6" stroke="currentColor" strokeWidth="1.8" fill="none"/>
        <g fontSize="11" fill="currentColor" opacity=".58" fontFamily="Inter,Arial,sans-serif"><text x="198" y="190">Observe</text><text x="392" y="190">Enforce</text><text x="37" y="45">Different guarantees / different planes</text></g>
      </svg>}
      {type === 'signals' && <svg viewBox="0 0 580 226" role="img" aria-label="Two similar byte patterns with an arithmetic delta and sparse residual correction">
        {Array.from({length:12},(_,i)=><g key={i}><rect x={35+i*43} y="48" width="36" height="35" rx="3" fill="currentColor" opacity={i===5||i===10?.23:.06} stroke="currentColor" strokeOpacity=".25"/><rect x={40+i*43} y="62" width={i===5?22:17} height="6" rx="1" fill="currentColor" opacity=".47"/></g>)}
        <path d="M290 92V132m-7-7 7 7 7-7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        {Array.from({length:12},(_,i)=><g key={i}><rect x={35+i*43} y="147" width="36" height="35" rx="3" fill={i===5||i===10?'currentColor':'none'} fillOpacity=".15" stroke="currentColor" strokeOpacity=".4"/><path d={`M${42+i*43} 165h16`} stroke="currentColor" opacity=".45" strokeWidth="4"/></g>)}
        <g fontSize="11" fill="currentColor" opacity=".66" fontFamily="Inter,Arial,sans-serif"><text x="35" y="32">Reference phrase</text><text x="35" y="208">Arithmetic copy + sparse correction</text></g>
      </svg>}
      {type === 'tokens' && <svg viewBox="0 0 580 226" role="img" aria-label="Modules connected by imports converge into one runtime compatible bundle">
        {[[28,22,'Author'],[28,94,'Modules'],[28,166,'Types']].map(([x,y,label],i)=><g key={i}><rect x={Number(x)} y={Number(y)} width="140" height="39" rx="5" stroke="currentColor" strokeOpacity=".38" fill="none"/><text x={Number(x)+15} y={Number(y)+24} fontSize="12" fontFamily="Inter,Arial,sans-serif" fill="currentColor">{label}</text></g>)}
        <path d="M168 42H240V113H280M168 113H280M168 185H240V113" stroke="currentColor" strokeOpacity=".5" fill="none"/>
        <rect x="280" y="93" width="122" height="40" rx="5" fill="currentColor" fillOpacity=".065" stroke="currentColor" strokeOpacity=".6"/>
        <text x="295" y="117" fontSize="12" fill="currentColor" fontFamily="Inter,Arial,sans-serif">ESSEMBLE</text>
        <path d="M402 113H450" stroke="currentColor" fill="none"/><rect x="450" y="93" width="104" height="40" rx="5" stroke="currentColor" strokeOpacity=".6" fill="none"/>
        <text x="468" y="117" fontSize="12" fill="currentColor" fontFamily="Inter,Arial,sans-serif">ES3 build</text>
      </svg>}
    </div>
    <div className="figure-foot"><span>{type === 'pressure' ? 'Illustrative normalized response · not measured data' : 'Schematic / conceptual representation'}</span><span>thelabjournal™</span></div>
  </div>
}
