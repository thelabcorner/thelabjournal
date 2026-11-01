import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'

const origin = process.env.JOURNAL_ORIGIN ?? 'http://127.0.0.1:11264/'
const widths = [320, 375, 390, 430, 600, 700, 768, 1024, 1440]
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
await mkdir('artifacts', { recursive: true })
let failures = 0
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 850 }, deviceScaleFactor: 1 })
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  try {
    const response = await page.goto(new URL('posts/the-openfork-network-behind-one-oxp-connection/', origin).href, {
      waitUntil: 'networkidle', timeout: 30000,
    })
    if (!response?.ok()) throw new Error('Article status ' + response?.status())
    const data = await page.evaluate(() => {
      const plates = [...document.querySelectorAll('.of-plate')]
      const figures = [...document.querySelectorAll('.of-figure')]
      const geometry = plates.map(plate => {
        const box = plate.getBoundingClientRect()
        const visible = [...plate.querySelectorAll('strong, small, p, span, li, .of-net-capability, .of-gate, .of-machine')]
          .filter(el => getComputedStyle(el).display !== 'none')
        const offenders = visible.filter(el => {
          const b = el.getBoundingClientRect()
          return b.width > 0 && b.height > 0 &&
            (b.left < box.left-3 || b.right > box.right+3 || b.top < box.top-3 || b.bottom > box.bottom+3)
        }).map(el => el.textContent?.trim().slice(0,48))
        const overflow = visible.filter(el => !el.matches('li') && el.textContent?.trim() && (el.scrollWidth > el.clientWidth+3 || el.scrollHeight > el.clientHeight+3))
          .map(el => ({name:el.textContent?.trim().slice(0,35), dx:el.scrollWidth-el.clientWidth,dy:el.scrollHeight-el.clientHeight}))
        return { width:Math.round(box.width), height:Math.round(box.height), offenders, overflow }
      })
      return {
        doc:document.documentElement.scrollWidth,
        viewport:innerWidth,
        count:figures.length,
        captions:figures.map(el=>el.querySelector('figcaption')?.textContent?.trim().length||0),
        iframeCount:document.querySelectorAll('.of-plate iframe').length,
        routeRows:document.querySelectorAll('.of-net-row').length,
        routePairs:[...document.querySelectorAll('.of-net-row')].map(r=>r.querySelectorAll('.of-net-route').length),
        lifecycle:document.querySelectorAll('.of-mcp-stages li').length,
        hosts:document.querySelectorAll('.of-machine').length,
        principals:document.querySelectorAll('.of-auth-row').length,
        geometry,
      }
    })
    if(errors.length)throw new Error('Browser errors: '+errors.join(' / '))
    if(data.doc>width+1)throw new Error('Document horizontal overflow: '+data.doc+' > '+width)
    if(data.count!==5||data.captions.some(v=>v<50))throw new Error('Five captioned figures required')
    if(data.iframeCount)throw new Error('A diagram is embedded as an iframe rather than native code')
    if(data.routeRows!==5||data.routePairs.some(v=>v!==2))throw new Error('Five paired capability routes required')
    if(data.lifecycle!==4||data.hosts!==2||data.principals!==3)throw new Error('Missing architecture content')
    if(data.geometry.some(v=>v.offenders.length||v.overflow.length))throw new Error('Clipped figure: '+JSON.stringify(data.geometry))
    if([320,375,430,768,1440].includes(width)){
      for(let i=0;i<5;i++)
        await page.locator('.of-figure').nth(i).screenshot({path:'artifacts/oxp-editorial-figure-'+(i+1)+'-'+width+'.png'})
    }
    console.log(JSON.stringify({width,pass:true,plates:data.geometry.map(p=>[p.width,p.height])}))
  }catch(error){
    failures++
    console.error(JSON.stringify({width,pass:false,error:String(error),pageErrors:errors}))
  }finally{await page.close()}
}
await browser.close()
if(failures) process.exitCode=1
