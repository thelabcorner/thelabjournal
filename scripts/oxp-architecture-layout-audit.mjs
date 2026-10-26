import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'

const origin = process.env.JOURNAL_ORIGIN ?? 'http://127.0.0.1:11267/'
const path = new URL('posts/the-openfork-network-behind-one-oxp-connection/', origin).href
const widths = [320, 375, 390, 430, 600, 699, 700, 768, 1024, 1440]
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
await mkdir('artifacts', { recursive: true })
let failures = 0
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 })
  const pageErrors = []
  page.on('pageerror', e => pageErrors.push(e.message))
  try {
    const response = await page.goto(path, { waitUntil: 'networkidle', timeout: 30000 })
    if (!response?.ok()) throw new Error('Response status ' + response?.status())
    const audit = await page.evaluate(() => {
      const plates = [...document.querySelectorAll('.ofarch-plate')]
      const eps = 2
      const details = plates.map((plate, index) => {
        const outer = plate.getBoundingClientRect()
        const actualRatio = outer.width / outer.height
        // Skip purely ornamental rulers; all readable labels and semantic panels
        // must remain visible within their own artboard.
        const offenders = [...plate.querySelectorAll('strong, small, .ofarch-description, .ofarch-index, .ofarch-kicker, .ofarch-bus-item, .ofarch-lifecycle-card, .ofarch-principal, .ofarch-panel, .ofarch-exchange-gate, .ofarch-boundary, .ofarch-plate-footer')]
          .filter(e => getComputedStyle(e).display !== 'none')
          .map(e => ({ element:e, r:e.getBoundingClientRect() }))
          .filter(({ r }) => r.width > 0 && r.height > 0 && (r.left < outer.left-eps || r.right > outer.right+eps || r.top < outer.top-eps || r.bottom > outer.bottom+eps))
          .map(({ element, r }) => ({ label: element.textContent?.trim().slice(0,40), delta: [Math.round(r.left-outer.left),Math.round(r.right-outer.right),Math.round(r.top-outer.top),Math.round(r.bottom-outer.bottom)] }))
        const localClipping = [...plate.querySelectorAll('.ofarch-panel, .ofarch-lifecycle-card, .ofarch-bus-copy, .ofarch-entrance, .ofarch-principal')]
          .filter(e => e.scrollWidth > e.clientWidth + 2 || e.scrollHeight > e.clientHeight + 2)
          .map(e => ({ label:e.textContent?.trim().slice(0,40), excess:[e.scrollWidth-e.clientWidth,e.scrollHeight-e.clientHeight] }))
        const structure = plate.querySelectorAll('.ofarch-bus-item').length
        const entrances = plate.querySelectorAll('.ofarch-network-node').length
        const lifecycle = plate.querySelectorAll('.ofarch-lifecycle-card').length
        const markers = plate.querySelectorAll('.ofarch-principal').length
        return { index:index+1, w:Math.round(outer.width), h:Math.round(outer.height), ratio:Number(actualRatio.toFixed(4)),
          overflowX:plate.scrollWidth-plate.clientWidth, overflowY:plate.scrollHeight-plate.clientHeight,
          offenders: offenders.slice(0,8), localClipping:localClipping.slice(0,8), structure, entrances, lifecycle, markers }
      })
      const box = selector => [...document.querySelectorAll(selector)].map(e => {
        const r=e.getBoundingClientRect()
        return {left:Math.round(r.left),top:Math.round(r.top)}
      })
      return { doc:document.documentElement.scrollWidth, viewport:window.innerWidth, details,
        entryBoxes:box('.ofarch-network-node'), lifecycleBoxes:box('.ofarch-lifecycle-card'),
        peerBoxes:box('.ofarch-peer-content > .ofarch-panel'),
        principalBoxes:box('.ofarch-principal') }
    })
    if (audit.details.length !== 5) throw new Error('Expected five architecture plates')
    if (audit.doc > audit.viewport+1) throw new Error('Document overflows horizontally')
    const target = width >= 700 ? 16/9 : 9/16
    for (const figure of audit.details) {
      if (Math.abs(figure.ratio-target) > 0.02) throw new Error('Figure '+figure.index+' wrong ratio: '+figure.ratio+' (wanted '+target+')')
      if (figure.overflowX > 2 || figure.overflowY > 2) throw new Error('Figure '+figure.index+' internal overflow: '+JSON.stringify(figure))
      if (figure.offenders.length) throw new Error('Figure '+figure.index+' clipped elements: '+JSON.stringify(figure.offenders))
      if (figure.localClipping.length) throw new Error('Figure '+figure.index+' clipped internal labels: '+JSON.stringify(figure.localClipping))
    }
    const landscape = width >= 700
    const ordered = (items, axis) => items.length > 1 && items.every((v,i) => !i || v[axis] >= items[i-1][axis]+3)
    if (audit.entryBoxes.length !== 8) throw new Error('Missing interconnected-system nodes: '+JSON.stringify(audit.entryBoxes))
    for (const [name,boxes] of [['lifecycle',audit.lifecycleBoxes],['principals',audit.principalBoxes]]) {
      if (!ordered(boxes,landscape?'left':'top')) throw new Error(name+' lacks '+(landscape?'horizontal':'vertical')+' composition: '+JSON.stringify(boxes))
    }
    if (audit.peerBoxes.length !== 2) throw new Error('Missing two distinct host panels')
    const connection = await page.locator('.ofarch-network').evaluate(network => {
      const graph=network.getBoundingClientRect()
      const nodes=[...network.querySelectorAll('.ofarch-network-node')].map(node=>{
        const r=node.getBoundingClientRect()
        return {id:node.className,box:[r.left,r.top,r.right,r.bottom],overflowX:node.scrollWidth-node.clientWidth,overflowY:node.scrollHeight-node.clientHeight,
          outside:r.left<graph.left-1||r.right>graph.right+1||r.top<graph.top-1||r.bottom>graph.bottom+1}
      })
      const active= [...network.querySelectorAll('.ofarch-network-wires')].filter(e=>getComputedStyle(e).display!=='none')
      return {nodes,visibleGraphs:active.length,edges:active[0]?.querySelectorAll('.ofarch-network-edge').length,solid:active[0]?.querySelectorAll('.ofarch-network-edge:not(.ofarch-network-edge--native)').length,dashed:active[0]?.querySelectorAll('.ofarch-network-edge--native').length}
    })
    if(connection.visibleGraphs!==1||connection.edges!==11||connection.solid!==7||connection.dashed!==4) throw new Error('Interconnection edges missing: '+JSON.stringify(connection))
    if(connection.nodes.some(x=>x.outside||x.overflowX>2||x.overflowY>2)) throw new Error('Interconnection node clipped: '+JSON.stringify(connection.nodes.filter(x=>x.outside||x.overflowX>2||x.overflowY>2)))
    for(let i=0;i<connection.nodes.length;i++)for(let j=i+1;j<connection.nodes.length;j++){
      const a=connection.nodes[i].box,b=connection.nodes[j].box
      const intersection=Math.min(a[2],b[2])-Math.max(a[0],b[0])>2&&Math.min(a[3],b[3])-Math.max(a[1],b[1])>2
      if(intersection)throw new Error('Network nodes overlap: '+connection.nodes[i].id+' '+connection.nodes[j].id)
    }
    if (landscape) {
      if (!(audit.peerBoxes[1].left > audit.peerBoxes[0].left+20 && Math.abs(audit.peerBoxes[1].top-audit.peerBoxes[0].top) < 3))
        throw new Error('Desktop peer network is not side-by-side: '+JSON.stringify(audit.peerBoxes))
    } else if (!(audit.peerBoxes[1].top > audit.peerBoxes[0].top+20))
      throw new Error('Mobile peer network does not flow down: '+JSON.stringify(audit.peerBoxes))
    if (pageErrors.length) throw new Error('JS page errors: '+pageErrors.join(' / '))
    if ([320,375,430,768,1440].includes(width)) {
      const figures = page.locator('.ofarch-figure')
      for (let i=0;i<5;i++) await figures.nth(i).screenshot({path:'artifacts/oxp-redesign-figure-'+(i+1)+'-'+width+'.png'})
    }
    console.log(JSON.stringify({width,pass:true,figures:audit.details.map(x=>({number:x.index,w:x.w,h:x.h,ratio:x.ratio}))}))
  } catch(e) {
    failures++
    console.error(JSON.stringify({width,pass:false,error:String(e),pageErrors}))
  } finally { await page.close() }
}
await browser.close()
if (failures) process.exitCode=1
