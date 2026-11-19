/**
 * thelabjournal™ publication composer.
 * Builds a purpose-designed, print-only document around the unchanged,
 * fully rendered scientific manuscript and its native equation/figure DOM.
 * The user's actual nav Bayer matrix is reproduced as a static vector field.
 */
import { BRAND_MARK_OUTLINE, BRAND_MARK_FILL, BRAND_MARK_STROKE } from '../src/lib/brandMark.ts'

const escape = value => String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
const bayer = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5]
const clamp = value => Math.max(0, Math.min(1,value))
function cellNoise(x,y) {
  let v = Math.imul(x+1,374761393)^Math.imul(y+1,668265263)
  v = Math.imul(v^(v>>>13),1274126177)
  return ((v^(v>>>16))>>>0)/4294967296
}
function navDitherSvg(w=1120,h=178,pitch=6) {
  const cols=Math.ceil(w/pitch),rows=Math.ceil(h/pitch),rects=[]
  for(let ry=0;ry<rows;ry++)for(let cx=0;cx<cols;cx++){
    const u=(cx+.5)/cols,v=(ry+.5)/rows
    const lane=Math.floor(ry/4),section=(Math.floor(cx/18)+lane*3)%4
    const local=cx%18,noise=cellNoise(cx,ry)
    let occupancy
    if(section===0)occupancy=(local<3||local>15)? .17 : .58+noise*.24
    else if(section===1)occupancy=(ry%5===0||local>12)? .15 : .36+noise*.30
    else if(section===2)occupancy=(ry%7<3)? .48+noise*.26 : .12
    else occupancy=noise>.48 ? .61 : .15
    const gap=ry%9===0?.28:1
    const edge=clamp(u/.065)*clamp((1-u)/.065)
    const drift=(Math.sin(u*18+v*3)+1)*.09
    const coverage=clamp((occupancy*gap+drift)*edge*.95)
    const ordered=(bayer[((ry&3)<<2)|(cx&3)]+.5)/16
    if(coverage<=ordered)continue
    const x=(cx*pitch).toFixed(1),y=(ry*pitch).toFixed(1)
    const alpha=(.24+coverage*.64)*.78
    rects.push('<rect x="'+x+'" y="'+y+'" width="'+(pitch*.42).toFixed(1)+'" height="'+(pitch*.42).toFixed(1)+'" fill="#71717a" opacity="'+alpha.toFixed(3)+'"/>')
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+
    '" role="img" aria-label="Decorative ordered Bayer-dither information field">'+
    rects.join('')+'</svg>'
}
const logo = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" aria-hidden="true">'+
  '<path d="'+escape(BRAND_MARK_OUTLINE)+'" stroke="#27272a" stroke-width="'+BRAND_MARK_STROKE+'" fill="none"/>'+
  '<path d="'+escape(BRAND_MARK_FILL)+'" fill="#27272a"/></svg>'
function cover(paper) {
  const year=paper.metadata.publicationYear || (paper.metadata.year.match(/\b(?:19|20)\d{2}\b/g)||[]).at(-1)||paper.lastModified.slice(0,4)
  const authorRows=paper.metadata.authors.map(author=>
    '<div class="pdf-cover__value">'+escape(author.name)+'</div>'+
    '<div class="pdf-cover__meta">'+escape(author.role||'Independent applied research')+'</div>'+
    '<div class="pdf-cover__meta">'+escape(author.email)+'</div>').join('')
  const canon='https://journal.thedabcorner.site/research/'+encodeURIComponent(paper.id)+'/'
  return '<section class="pdf-cover" id="title" aria-labelledby="pdf-cover-title">'+
    '<div class="pdf-cover__topline"><div class="pdf-brand">'+logo+
      '<span class="pdf-brand__wordmark">thelabjournal™</span></div>'+
      '<div class="pdf-cover__brand-meta">Independent applied research<br/>Scientific manuscript archive</div></div>'+
    '<div class="pdf-dither">'+navDitherSvg()+'</div>'+
    '<div class="pdf-cover__series"><span class="pdf-cover__badge">'+escape(paper.field)+'</span>'+
      '<span>Technical manuscript &nbsp; · &nbsp; '+escape(paper.metadata.version)+'</span></div>'+
    '<h1 id="pdf-cover-title" class="pdf-cover__title">'+escape(paper.metadata.title)+'</h1>'+
    (paper.metadata.subtitle?'<p class="pdf-cover__subtitle">'+escape(paper.metadata.subtitle)+'</p>':'')+
    '<div class="pdf-cover__authorship">'+
      '<div><div class="pdf-cover__label">Author</div>'+authorRows+'</div>'+
      '<div><div class="pdf-cover__label">Research record</div>'+
        '<div class="pdf-cover__value">'+escape(year)+'</div>'+
        '<div class="pdf-cover__meta">Revision '+escape(paper.lastModified)+'</div>'+
        '<div class="pdf-cover__meta">Status: '+escape(paper.metadata.status.replace(/-/g,' '))+'</div>'+
        '<div class="pdf-cover__meta">Version '+escape(paper.metadata.version)+'</div>'+
      '</div></div>'+
    '<div class="pdf-cover__abstract" aria-label="Scientific abstract"></div>'+
    '<div class="pdf-cover__foot"><span>thelabjournal™ &nbsp; / &nbsp; '+escape(year)+'</span>'+
      '<a href="'+escape(canon)+'">View the canonical research manuscript ↗</a></div>'+
    '</section>'
}
function contents(paper,navSections) {
  const chapters=navSections.filter(s=>s.id!=='title')
  return '<section class="pdf-contents" aria-labelledby="pdf-contents-heading">'+
    '<p class="pdf-contents__strap">thelabjournal™ &nbsp; / &nbsp; '+escape(paper.metadata.version)+'</p>'+
    '<h2 id="pdf-contents-heading">Contents</h2>'+
    '<nav aria-label="Manuscript table of contents" class="pdf-contents__table">'+
      chapters.map((chapter,i)=>
        '<div class="pdf-contents__item"><span class="pdf-contents__number">'+
        String(i+1).padStart(2,'0')+'</span><a href="#'+escape(chapter.id)+'">'+
        escape(chapter.label)+'</a><span class="pdf-contents__target">↗</span></div>').join('')+
    '</nav><div class="pdf-contents__note">Select any chapter title to jump directly to its section. '+
    'The PDF sidebar contains the complete chapter hierarchy, and numbered citations link to the reference list.'+
    '<p><a href="https://journal.thedabcorner.site/research/'+escape(paper.id)+'/">'+
    'Interactive online edition ↗</a></p></div></section>'
}
export async function composePublication(page,paper,navSections) {
  const coverHtml=cover(paper),contentsHtml=contents(paper,navSections)
  return page.evaluate(async ({coverHtml,contentsHtml})=>{
    const original=document.querySelector('article.research-body')
    if(!original) throw Error('Scientific source article not found')
    // Canvas is mutable pixels, not cloneable DOM. Freeze real chart canvases
    // to their own PNG images to preserve any already-rendered plots.
    for(const canvas of original.querySelectorAll('canvas')) {
      try {
        if(canvas.width<4||canvas.height<4)continue
        const img=document.createElement('img')
        img.src=canvas.toDataURL('image/png')
        img.alt=canvas.getAttribute('aria-label')||'Scientific chart'
        img.style.cssText='width:100%;height:auto;max-width:100%;object-fit:contain;'
        canvas.replaceWith(img)
      } catch(error){throw Error('Unable to preserve scientific chart canvas: '+String(error))}
    }
    for(const details of original.querySelectorAll('details'))details.open=true
    // Scientific tables with four or more variables are full-width plates.
    // Tables already inside a figure inherit the figure's spanning geometry.
    // Small two/three-variable tables stay in their reading column.
    let wideTables=0
    for(const table of original.querySelectorAll('table')){
      if(table.closest('figure')) continue
      const columns=table.querySelector('thead tr')?.children.length || table.querySelector('tr')?.children.length || 0
      if(columns<4)continue
      const wrapper=table.closest('.overflow-x-auto') || table
      wrapper.classList.add('pdf-wide-table')
      if(table.querySelectorAll('tbody tr').length>10)wrapper.classList.add('pdf-tall-table')
      wideTables++
    }
    // UI-only mobile interaction instructions do not belong in a static paper.
    const pressureHint=original.querySelector('.lyo-pressure-explorer figcaption > span:nth-child(2)')
    if(pressureHint && pressureHint.textContent?.includes('select a physical quantity'))
      pressureHint.textContent='Fixed-coefficient analytical sensitivity across three physical quantities.'
    // Disclosures are preserved verbatim as dedicated provenance back matter.
    // Keeping a long collapsible website disclosure between abstract and
    // chapter 1 caused accidental near-blank PDF pages.
    const disclosure=original.querySelector('aside[aria-label="AI-assisted research disclosure"]')
    disclosure?.remove()
    const oldTitle=original.querySelector('#title')
    oldTitle?.remove()
    const abstract=original.querySelector('#abstract')
    const abstractCard=abstract?.querySelector('.research-editorial-abstract__body')
    if(!abstractCard)throw Error('Original scientific abstract body was not found')
    const pdf=document.createElement('main')
    pdf.id='pdf-publication'
    const insert=document.createElement('div')
    insert.innerHTML=coverHtml+contentsHtml
    while(insert.firstChild)pdf.append(insert.firstChild)
    const coverAbstract=pdf.querySelector('.pdf-cover__abstract')
    coverAbstract.id='abstract'
    coverAbstract.insertAdjacentHTML('afterbegin','<h2>Abstract</h2>')
    coverAbstract.append(abstractCard)
    // A scientific illustration accompanying the author's abstract remains in
    // its original order as a dedicated graphical-abstract section.
    if(abstract){
      if(abstract.querySelector('figure')) {
        abstract.id='graphical-abstract'
        const heading=abstract.querySelector('#abstract-heading')
        if(heading) {
          heading.textContent='Graphical abstract'
          heading.id='graphical-abstract-heading'
        }
        abstract.setAttribute('aria-labelledby','graphical-abstract-heading')
      } else abstract.remove()
    }
    pdf.append(original)
    if(disclosure){
      const appendix=document.createElement('section')
      appendix.id='publication-integrity'
      appendix.className='pdf-provenance'
      const heading=document.createElement('h2')
      heading.textContent='Research provenance and disclosure'
      appendix.append(heading,disclosure)
      pdf.append(appendix)
      const toc=pdf.querySelector('.pdf-contents__table')
      const item=document.createElement('div')
      item.className='pdf-contents__item'
      item.innerHTML='<span class="pdf-contents__number">+</span><a href="#publication-integrity">Research provenance</a><span class="pdf-contents__target">↗</span>'
      toc?.append(item)
    }
    document.documentElement.dataset.theme='light'
    document.documentElement.style.colorScheme='light'
    document.body.className='pdf-export-mode'
    document.body.replaceChildren(pdf)
    await document.fonts.ready
    return {
      navLinks:pdf.querySelectorAll('.pdf-contents a[href^="#"]').length,
      citations:pdf.querySelectorAll('a[href^="#ref-"]').length,
      figures:pdf.querySelectorAll('figure').length,
      wideTables,
      externalLinks:pdf.querySelectorAll('a[href^="https://"]').length,
      sections:pdf.querySelectorAll('section[id]').length,
      words:(pdf.innerText||'').split(/\s+/).length,
    }
  },{coverHtml,contentsHtml})
}
