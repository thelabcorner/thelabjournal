import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import katex from 'katex'
import { chromium } from 'playwright-core'

const root = import.meta.dirname
const tex = readFileSync(resolve(root, 'manuscript.tex'), 'utf8')
const escape = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
const refs={skell:1,patent:2,muller:3,filer:4,wang:5}
const refNums={ 'eq:mu':1,'eq:sle':2,'eq:fusion':3,'eq:loading':4,'eq:massfrac':5,
 'fig:curve':1,'fig:activity':2,'tab:lattice':1,'tab:temps':2,
 'sec:introduction':1,'sec:theory':2,'sec:methods':3,'sec:crosswalk':'3.4',
 'sec:results':4,'sec:discussion':5,'sec:validation':6,'sec:conclusion':7 }
const math = (s,display=false) => katex.renderToString(String(s).replace(/\\label\{[^}]+\}/g,'').replace(/\\notag/g,''),{displayMode:display,throwOnError:false,strict:'ignore'})
const units = {'K':'\\mathrm{K}','celsius':'^\\circ\\mathrm{C}','kJ.mol^{-1}':'\\mathrm{kJ\\,mol^{-1}}','J.mol^{-1}.K^{-1}':'\\mathrm{J\\,mol^{-1}K^{-1}}','g.mol^{-1}':'\\mathrm{g\\,mol^{-1}}','mg.mL^{-1}':'\\mathrm{mg\\,mL^{-1}}','g.mL^{-1}':'\\mathrm{g\\,mL^{-1}}','cm^{-1}':'\\mathrm{cm^{-1}}','\\angstrom':'\\mathrm{\\AA}','\\angstrom\\cubed':'\\mathrm{\\AA^3}'}
const field=readFileSync(resolve(root,'figure-series.dat'),'utf8').trim().split(/\r?\n/).slice(1).map(s=>{const a=s.trim().split(/\s+/).map(Number);return {t:a[0],mg:a[1],x:a[7]}})
const lattice=JSON.parse(readFileSync(resolve(root,'data/lattice_crosswalk.json'),'utf8'))
const activity=readFileSync(resolve(root,'figure-activity.dat'),'utf8').trim().split(/\r?\n/).slice(1).map(s=>{const [x,gamma15,gamma25,gamma55,gamma75]=s.trim().split(/\s+/).map(Number);return {x,gamma15,gamma25,gamma55,gamma75}})
function plot(){
  const L=50,R=550,T=14,B=235,H=280,W=590
  const xp=t=>L+(t-15)/60*(R-L),yp=m=>B-m/1400*(B-T)
  let out='<svg viewBox="0 0 590 280" role="img" aria-label="Conditional THCA loading increases with temperature"><rect width="590" height="280" fill="#fff"/>'
  for(const v of [0,350,700,1050,1400]) {let y=yp(v);out+='<line x1="'+L+'" y1="'+y+'" x2="'+R+'" y2="'+y+'" stroke="#e4e4e7"/><text x="'+(L-7)+'" y="'+(y+4)+'" font-size="12" text-anchor="end" fill="#52525b">'+v+'</text>'}
  for(const row of field) {let x=xp(row.t);out+='<text x="'+x+'" y="'+(B+21)+'" font-size="11" text-anchor="middle" fill="#52525b">'+row.t+'</text>'}
  out+='<polyline points="'+field.map(x=>xp(x.t)+','+yp(x.mg)).join(' ')+'" fill="none" stroke="#18181b" stroke-width="2.8"/>'
  for(const row of field)out+='<circle cx="'+xp(row.t)+'" cy="'+yp(row.mg)+'" r="3.4" fill="#18181b"/>'
  out+='<text x="295" y="276" text-anchor="middle" font-size="11" fill="#52525b">Temperature (°C)</text></svg>'
  return out
}

function plotActivity(){
  const L=55,R=540,T=17,B=237, ymin=-0.10,ymax=1.17
  const xp=x=>L+(Math.log10(x)+6)/6*(R-L)
  const yp=v=>B-(v-ymin)/(ymax-ymin)*(B-T)
  const tickText=v=>v.toFixed(2).replace(/0+$/,'').replace(/\.$/,'')
  let out='<svg viewBox="0 0 590 285" role="img" aria-label="Composition-dependent COSMO-RS natural logarithm of THCA activity coefficient at 15, 25, 55 and 75 degrees Celsius"><rect width="590" height="285" fill="#fff"/>'
  for(const tick of [0,.25,.5,.75,1]){
    const y=yp(tick)
    out+='<line x1="'+L+'" y1="'+y+'" x2="'+R+'" y2="'+y+'" stroke="#e4e4e7"/>'
    out+='<text x="'+(L-9)+'" y="'+(y+4)+'" font-size="11" text-anchor="end" fill="#52525b">'+tickText(tick)+'</text>'
  }
  for(const x of [1e-6,1e-4,.01,1]){
    const at=xp(x)
    const label=x===1?'1':x===.01?'10⁻²':x===1e-4?'10⁻⁴':'10⁻⁶'
    out+='<line x1="'+at+'" y1="'+T+'" x2="'+at+'" y2="'+B+'" stroke="#e4e4e7"/>'
    out+='<text x="'+at+'" y="'+(B+18)+'" font-size="11" text-anchor="middle" fill="#52525b">'+label+'</text>'
  }
  const visible=activity.filter(row=>row.x>=1e-6)
  const traces=[['gamma15','#18181b','15°C'],['gamma25','#52525b','25°C'],['gamma55','#a1a1aa','55°C'],['gamma75','#d4d4d8','75°C']]
  traces.forEach(([key,color,label],i)=>{
    const pts=visible.map(row=>xp(row.x).toFixed(2)+','+yp(row[key]).toFixed(2)).join(' ')
    out+='<polyline points="'+pts+'" fill="none" stroke="'+color+'" stroke-width="2.4"/>'
    const gx=78+i*118
    out+='<line x1="'+gx+'" y1="8" x2="'+(gx+19)+'" y2="8" stroke="'+color+'" stroke-width="2.4"/>'
    out+='<text x="'+(gx+24)+'" y="12" font-size="11" fill="#3f3f46">'+label+'</text>'
  })
  out+='<text x="298" y="279" font-size="11" text-anchor="middle" fill="#52525b">THCA mole fraction (log scale)</text></svg>'
  return out
}

function inline(s){
 const saved=[];function save(x){saved.push(x);return 'HOLDTOKEN'+(saved.length-1)+'END'}
 const uPattern='((?:[^{}]|\\{[^{}]*\\})+)'
 const rewrites = m => m
  .replace(/\\SIrange\{([^{}]+)\}\{([^{}]+)\}\{((?:[^{}]|\{[^{}]*\})+)\}/g,(_,a,b,u)=>a+'\\text{–}'+b+'\\,'+(units[u]||u))
  .replace(/\\SI\{([^{}]+)\}\{((?:[^{}]|\{[^{}]*\})+)\}/g,(_,a,u)=>a+'\\,'+(units[u]||u))
  .replace(/\\si\{((?:[^{}]|\{[^{}]*\})+)\}/g,(_,u)=>(units[u]||u))
 s=s.replace(/\$([^$]+)\$/g,(_,m)=>save(math(rewrites(m))))
 s=s.replace(/\\SIrange\{([^{}]+)\}\{([^{}]+)\}\{((?:[^{}]|\{[^{}]*\})+)\}/g,(_,a,b,u)=>save(math(a+'\\text{–}'+b+'\\,'+(units[u]||u))))
 s=s.replace(/\\SI\{([^{}]+)\}\{((?:[^{}]|\{[^{}]*\})+)\}/g,(_,a,u)=>save(math(a+'\\,'+(units[u]||u))))
 s=s.replace(/\\si\{((?:[^{}]|\{[^{}]*\})+)\}/g,(_,u)=>save(math(units[u]||u)))
 s=s.replace(/\\cite\{([^}]+)\}/g,(_,r)=>save('<a class="cite" href="#ref-'+r+'">['+(refs[r]||'?')+']</a>'))
 s=s.replace(/\\ref\{([^}]+)\}/g,(_,r)=>save('<a href="#'+r+'">'+(refNums[r]||'?')+'</a>'))
 s=s.replace(/\\href\{([^}]+)\}\{([^}]+)\}/g,(_,u,v)=>save('<a href="'+escape(u)+'">'+escape(v)+'</a>'))
 s=s.replace(/\\emph\{([^}]+)\}/g,(_,v)=>save('<em>'+escape(v)+'</em>'))
 s=s.replace(/\\texttt\{([^}]+)\}/g,(_,v)=>save('<code>'+escape(v)+'</code>'))
 s=s.replace(/\\textbf\{([^}]+)\}/g,(_,v)=>save('<strong>'+escape(v)+'</strong>'))
 s=s.replace(/\\,|\\enspace|~/g,' ').replace(/\\textbackslash/g,'\\').replace(/\s*\n\s*/g,' ')
 s=escape(s)
 saved.forEach((value,i)=>s=s.replace('HOLDTOKEN'+i+'END',value))
 return s
}
let body=tex.split('\\twocolumn[{\\fullwidthtitle}]')[1]?.split('\\begin{thebibliography}')[0] || ''
body=body.replace(/\\section\*\{References\}[\s\S]*$/,'')
const chunks=[]
const store=html=>{const n=chunks.push(html)-1;return '\n\nBLOCKTOKEN'+n+'END\n\n'}
let eq=0
body=body.replace(/\\begin\{(equation|align)\}([\s\S]*?)\\end\{\1\}/g,(all,kind,expr)=>{
 const key=expr.match(/\\label\{([^}]+)\}/)?.[1]
 const num=++eq
 return store('<div class="mathblock" '+(key?'id="'+key+'"':'')+'>'+math(kind==='align'?'\\begin{aligned}'+expr+'\\end{aligned}':expr,true)+'<span class="eqnum">('+num+')</span></div>')
})
body=body.replace(/\\begin\{table\}\[t\][\s\S]*?\\end\{table\}/g,(source)=>{
  const label=source.match(/\\label\{([^}]+)\}/)?.[1]
  if(label==='tab:lattice'){
    const old=lattice.crystal_2021_120K, patent=lattice.patent_2026_100K, differences=lattice.percent_delta_patent_over_cif
    const rows=[['a (Å)', 'a'],['b (Å)','b'],['c (Å)','c'],['V (Å³)','volume']]
      .map(([name,key])=>'<tr><td>'+name+'</td><td>'+old[key].toFixed(key==='volume'?1:4)+'</td><td>'+patent[key].toFixed(key==='volume'?1:4)+'</td><td>+'+differences[key].toFixed(3)+'%</td></tr>').join('')
    return store('<div class="scientific-table-wrap"><table class="scitable" id="tab:lattice"><caption><b>Table 1.</b> Crystal unit-cell comparison. Skell et al. at 120 K and patent structure at 100 K; differences relative to the 2021 CIF.</caption><thead><tr><th>Cell metric</th><th>2021 CIF</th><th>2026 patent</th><th>Δ (%)</th></tr></thead><tbody>'+rows+'</tbody></table></div>')
  }
  if(label==='tab:temps'){
    return store('<div class="scientific-table-wrap"><table class="scitable" id="tab:temps"><caption><b>Table 2.</b> Conditional SLE values for Tm 146°C and fusion enthalpy 16.3 kJ/mol with ΔCp=0. Mass loading is per mL of starting limonene.</caption><thead><tr><th>T (°C)</th><th>x THCA</th><th>mg/mL initial limonene</th></tr></thead><tbody>'+field.map(r=>'<tr><td>'+r.t+'</td><td>'+r.x.toFixed(5)+'</td><td>'+r.mg.toFixed(2)+'</td></tr>').join('')+'</tbody></table></div>')
  }
  throw Error('Unrecognized manuscript table '+String(label))
})
body=body.replace(/\\begin\{figure\}\[t\][\s\S]*?\\end\{figure\}/g,(source)=>{
  const label=source.match(/\\label\{([^}]+)\}/)?.[1]
  if(label==='fig:curve')
    return store('<figure id="fig:curve">'+plot()+'<figcaption><b>Figure 1.</b> Computed mass loading for the specified fusion scenario, normalized by starting limonene volume. No composition-dependent solution density was fitted.</figcaption></figure>')
  if(label==='fig:activity')
    return store('<figure id="fig:activity">'+plotActivity()+'<figcaption><b>Figure 2.</b> Composition-dependent natural-log activity coefficients returned by openCOSMO-RS at 15, 25, 55 and 75°C. The ordinate is ln γ of THCA-A relative to pure-liquid reference.</figcaption></figure>')
  throw Error('Unrecognized manuscript figure '+String(label))
})
const headingNumbers = new Map()
let chapter=0, subsection=0
for(const h of body.matchAll(/\\(section|subsection)(\*?)\{([^}]+)\}/g)){
 const kind=h[1], starred=h[2], title=h[3]
 if(starred){headingNumbers.set(kind+':'+title,'');continue}
 if(kind==='section'){chapter++;subsection=0;headingNumbers.set(kind+':'+title,chapter+'.')}
 else{++subsection;headingNumbers.set(kind+':'+title,chapter+'.'+subsection)}
}
body=body.replace(/\\section(\*?)\{([^}]+)\}(?:\\label\{([^}]+)\})?/g,(_,star,name,id)=>store('<h2 id="'+(id||name.toLowerCase().replace(/\s+/g,'-'))+'">'+(headingNumbers.get('section:'+name)?'<span class="number">'+headingNumbers.get('section:'+name)+'</span> ':'')+escape(name)+'</h2>'))
body=body.replace(/\\subsection\{([^}]+)\}(?:\\label\{([^}]+)\})?/g,(_,name,id)=>store('<h3 id="'+(id||name.toLowerCase().replace(/\s+/g,'-'))+'"><span class="number">'+headingNumbers.get('subsection:'+name)+'</span> '+escape(name)+'</h3>'))
const contents=[]
for(const para of body.split(/\n\s*\n/)){let p=para.trim();if(!p)continue;const match=p.match(/^BLOCKTOKEN(\d+)END$/);contents.push(match?chunks[Number(match[1])]:'<p>'+inline(p)+'</p>')}
const refData=[
 ['skell','Skell, J. M.; Kahn, M.; Foxman, B. M. Δ9-Tetrahydrocannabinolic acid A, the precursor to Δ9-THC. Acta Crystallogr. C 77 (2021) 84–89.','https://doi.org/10.1107/S2053229621000280'],
 ['patent','Yarger, J. L.; Davidowski, S.; Seth, M. Cannabinoid acids crystalline forms, methods of producing, and uses thereof. US20260008762A1 (2026).','https://patents.google.com/patent/US20260008762A1/en'],
 ['muller','Müller, S.; Nevolianis, T.; Garcia-Ratés, M.; Riplinger, C.; Leonhard, K.; Smirnova, I. Fluid Phase Equilib. 589 (2025) 114250.','https://doi.org/10.1016/j.fluid.2024.114250'],
 ['filer','Filer, C. N. Letter to the Editor: On the Reluctant Decarboxylation of THCA-B. Cannabis Cannabinoid Res. 6 (2021) 446–448.','https://doi.org/10.1089/can.2021.0003'],
 ['wang','Wang, M.; Wang, Y.-H.; Avula, B.; et al. Decarboxylation study of acidic cannabinoids. Cannabis Cannabinoid Res. 1 (2016) 262–271.','https://doi.org/10.1089/can.2016.0020']
]
const refHtml=refData.map((r,i)=>'<li id="ref-'+r[0]+'"><span>'+(i+1)+'.</span> '+escape(r[1])+' <a href="'+escape(r[2])+'">Source</a></li>').join('')
function extractAbstractFromTeX(source){
 const findAfter=source.indexOf('Abstract}\\enspace')
 const begin=source.indexOf('{\\fontsize{9}{12.4}\\selectfont',findAfter)
 if(findAfter<0||begin<0)throw Error('Canonical LaTeX abstract not found')
 const start=source.indexOf('\\selectfont',begin)+'\\selectfont'.length
 let depth=0,end=-1
 for(let i=begin;i<source.length;i++){
  if(source[i]==='{')depth++
  else if(source[i]==='}'){
   depth--
   if(depth===0){end=i;break}
  }
 }
 if(end<=start)throw Error('Unbalanced canonical LaTeX abstract')
 return inline(source.slice(start,end).trim().replace(/\s*\n\s*/g,' '))
}
const abstractHtml=extractAbstractFromTeX(tex)
const css = [
 '@font-face{font-family:Inter;src:url(../../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2)}',
 '@font-face{font-family:Inter;src:url(../../../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2);font-weight:700}',
 '*{box-sizing:border-box}body{margin:0;background:white;color:#18181b;font:13px/1.48 Inter,Arial,sans-serif}',
 'a{color:#27272a;text-underline-offset:2px}main{max-width:1050px;margin:auto;padding:24px 34px 55px}',
 '.dither{width:100%;height:48px;object-fit:cover}header .brand{color:#52525b;font-size:10px;letter-spacing:.07em;font-weight:700;margin-top:13px}',
 'h1{font-size:30px;line-height:1.18;letter-spacing:-.04em;margin:12px 0 8px;max-width:930px}',
 '.subtitle{font-size:14px;color:#52525b;margin:0 0 14px}.meta{border-block:1px solid #d4d4d8;padding:9px 0;font-size:11px;color:#52525b}',
 '.meta strong{color:#18181b}.abstract{border:1px solid #e4e4e7;background:#fafafa;padding:13px 15px;margin:13px 0 0}',
 '.abstract h2{font-size:12px;margin:0 0 7px}.abstract p{margin:0;font-size:12px;line-height:1.5}',
 '.keywords{font-size:10.5px;color:#71717a;margin:10px 0 16px}',
 '.columns{column-count:2;column-gap:30px;column-fill:balance}.columns p{margin:0 0 10px;text-align:justify;hyphens:auto;orphans:3;widows:3}',
 '.columns h2{font-size:15px;line-height:1.28;margin:15px 0 7px;break-after:avoid}.columns h3{font-size:12.5px;margin:11px 0 5px;break-after:avoid}',
 '.mathblock{break-inside:avoid;position:relative;margin:11px 0;padding:7px 0 12px}.mathblock .katex-display{margin:0;overflow:hidden}.eqnum{position:absolute;bottom:0;right:0;color:#71717a;font-size:10px}',
 'figure,.scitable{break-inside:avoid;page-break-inside:avoid}figure{margin:8px 0 13px}figure svg{width:100%;height:auto}figcaption{color:#52525b;font-size:10px;line-height:1.38;border-top:1px solid #e4e4e7;padding-top:6px}',
 '.scitable{width:100%;border-collapse:collapse;font-size:10px;font-variant-numeric:tabular-nums}.scitable th{background:#fafafa;border-block:1px solid #d4d4d8;font-size:9px}.scitable td{border-bottom:1px solid #e4e4e7}.scitable td,.scitable th{padding:5px;text-align:right}.scitable td:first-child,.scitable th:first-child{text-align:left}',
 '.scitable caption{caption-side:bottom;text-align:left;font-size:10px;line-height:1.35;color:#52525b;padding:6px 0}',
 '.citation{font-size:.8em;vertical-align:super}.references{padding:0;list-style:none}.references li{font-size:10px;color:#3f3f46;margin:0 0 7px;break-inside:avoid}.references li span{color:#71717a;margin-right:4px}',
 'code{font-size:.9em;overflow-wrap:anywhere}',
 '@media(max-width:720px){main{padding:15px 18px}.columns{column-count:1}.dither{height:35px}h1{font-size:24px}}',
 '@page{size:A4;margin:17mm 15mm 18mm}',
 '@media print{main{padding:0;max-width:none}body{font-size:9pt;line-height:1.42}.dither{height:9mm}.brand{font-size:7pt!important}h1{font-size:17.5pt;margin:7px 0 5px}.subtitle{font-size:8pt;margin:0 0 8px}.meta{font-size:7pt;padding:5px 0}.abstract{margin:8px 0 0;padding:7px 10px}.abstract h2{font-size:8pt}.abstract p{font-size:7.8pt}.keywords{font-size:7.2pt;margin:6px 0}.columns{column-count:2;column-gap:6mm;column-fill:auto}.columns p{margin:0 0 7px}.columns h2{font-size:10pt;margin:12px 0 4px}.columns h3{font-size:9.1pt}.mathblock .katex{font-size:.85em}.scitable{font-size:7pt}.scitable th{font-size:6pt}.scitable td,.scitable th{padding:3px}.scitable caption,figcaption,.references li{font-size:7pt}}'
].join('\n')
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>THCA-A / limonene · thelabjournal™ manuscript draft</title><link rel="stylesheet" href="../../../node_modules/katex/dist/katex.min.css"><style>'+css+'</style></head><body><main><header><img class="dither" src="dither.svg" alt=""><div class="brand">thelabjournal™ / INDEPENDENT APPLIED RESEARCH / SCIENTIFIC MANUSCRIPT DRAFT</div><h1>Reassessing THCA-A Solubility in Limonene Through Composition-Dependent COSMO-RS and Solid–Liquid Equilibrium</h1><p class="subtitle">Solid-state reference sensitivity, finite-composition activity, and crystallization interpretation</p><div class="meta"><strong>Jackson Cummings</strong> · Independent process engineer · <a href="mailto:jackson@thedabcorner.site">jackson@thedabcorner.site</a> · 21 October 2026 · v0.1</div><div class="abstract"><h2>Abstract</h2><p>'+abstractHtml+'</p></div><p class="keywords"><b>Keywords</b> &nbsp; THCA-A · limonene · solid–liquid equilibrium · COSMO-RS · crystallization · fusion thermodynamics</p></header><article class="columns">'+contents.join('\n')+'<h2 id="references">References</h2><ol class="references">'+refHtml+'</ol></article></main></body></html>'
writeFileSync(resolve(root,'manuscript-preview.html'),html)
console.log('Source paragraphs and blocks',contents.length,'equations',eq,'HTML bytes',html.length)
const browser=await chromium.launch({headless:true,channel:'chrome',args:['--no-sandbox']})
try{
 const page=await browser.newPage({viewport:{width:1440,height:920}})
 await page.goto(pathToFileURL(resolve(root,'manuscript-preview.html')).href)
 await page.evaluate(async()=>await document.fonts.ready)
 const err=await page.evaluate(()=>[...document.querySelectorAll('.katex-error')].map(x=>x.textContent?.slice(0,100)))
 if(err.length)console.log('MATH_WARN',JSON.stringify(err))
 const pdf=await page.pdf({path:resolve(root,'manuscript-draft.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true,displayHeaderFooter:true,
 headerTemplate:'<div style="font:7px Arial;color:#71717a;width:100%;margin:0 15mm;display:flex;justify-content:space-between"><span>thelabjournal™ / independent applied research</span><span>THCA-A · COSMO-RS</span></div>',
 footerTemplate:'<div style="font:7px Arial;color:#71717a;width:100%;margin:0 15mm;display:flex;justify-content:space-between"><span>Draft v0.1 · 21 October 2026</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'})
 await page.setViewportSize({width:390,height:844})
 const mobile=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,columns:getComputedStyle(document.querySelector('.columns')).columnCount}))
 await page.screenshot({path:resolve(root,'mobile-preview.png')})
 console.log(JSON.stringify({pdfBytes:pdf.length, mobile, mathErrorCount:err.length}))
 if(mobile.scrollWidth>mobile.clientWidth+2)throw Error('mobile horizontal overflow')
}finally{await browser.close()}
