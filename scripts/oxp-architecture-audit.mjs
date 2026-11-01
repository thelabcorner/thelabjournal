import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'

const origin = process.env.JOURNAL_ORIGIN ?? 'http://127.0.0.1:11264/'
const cases = [
  ...[320,375,390,430,600,700,768,1024,1440].map(width=>({width,theme:'light'})),
  {width:375,theme:'dark'},
  {width:768,theme:'dark'},
]
const browser = await chromium.launch({
  executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless:true, args:['--no-sandbox'],
})
await mkdir('artifacts',{recursive:true})
let failures=0
for(const {width,theme} of cases){
  const page = await browser.newPage({
    viewport:{width,height:850},deviceScaleFactor:1,colorScheme:theme,
  })
  const errors=[]
  page.on('pageerror',e=>errors.push(e.message))
  try{
    const response=await page.goto(new URL('posts/the-openfork-network-behind-one-oxp-connection/',origin).href,{
      waitUntil:'networkidle',timeout:30000,
    })
    if(!response?.ok())throw new Error('Article status '+response?.status())
    const data=await page.evaluate(()=>{
      const figures=[...document.querySelectorAll('.of-figure')]
      const plates=[...document.querySelectorAll('.of-plate')]
      const geometry=plates.map(plate=>{
        const outer=plate.getBoundingClientRect()
        const visible=[...plate.querySelectorAll('strong,small,p,span,li,.of-net-capability,.of-converge-service,.of-federation-host')]
          .filter(el=>getComputedStyle(el).display!=='none'&&!el.matches('.of-visually-hidden'))
        const clipped=visible.filter(el=>{
          const b=el.getBoundingClientRect()
          return b.width>0&&b.height>0&&(b.left<outer.left-3||b.right>outer.right+3||b.top<outer.top-3||b.bottom>outer.bottom+3)
        }).map(el=>el.textContent?.trim().slice(0,40))
        const localOverflow=visible.filter(el=>!el.matches('li')&&el.textContent?.trim()&&(el.scrollWidth>el.clientWidth+3||el.scrollHeight>el.clientHeight+3))
          .map(el=>({label:el.textContent?.trim().slice(0,40),x:el.scrollWidth-el.clientWidth,y:el.scrollHeight-el.clientHeight}))
        return {width:Math.round(outer.width),height:Math.round(outer.height),clipped,localOverflow}
      })
      return {
        viewport:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,
        figures:figures.length,captions:figures.map(el=>el.querySelector('figcaption')?.textContent?.trim().length||0),
        iframes:document.querySelectorAll('.of-plate iframe').length,
        routes:document.querySelectorAll('.of-net-row').length,
        pairs:[...document.querySelectorAll('.of-net-row')].map(el=>el.querySelectorAll('.of-net-route').length),
        lifecycle:document.querySelectorAll('.of-timeline-stages li').length,
        hosts:document.querySelectorAll('.of-federation-host').length,
        authority:document.querySelectorAll('.of-auth-row').length,
        geometry,
      }
    })
    if(errors.length)throw new Error('Browser errors: '+errors.join(' / '))
    if(data.doc>width+1||data.body>width+1)throw new Error('Horizontal page overflow: '+data.doc)
    if(data.figures!==5||data.captions.some(n=>n<50))throw new Error('Missing figures or substantive captions')
    if(data.iframes)throw new Error('Diagram must be native text and geometry')
    if(data.routes!==5||data.pairs.some(n=>n!==2))throw new Error('Independent OXP and native routes missing')
    if(data.lifecycle!==4||data.hosts!==2||data.authority!==3)throw new Error('Incomplete diagram structure')
    if(data.geometry.some(g=>g.clipped.length||g.localOverflow.length))
      throw new Error('Content clipped: '+JSON.stringify(data.geometry))
    // Design regression guard, in addition to geometric safety:
    // at the reference phone width the diagram content must fit compactly.
    if(width===375&&data.geometry.some(g=>g.height>430))
      throw new Error('Excessive diagram height: '+JSON.stringify(data.geometry.map(g=>g.height)))
    if([320,375,430,768,1440].includes(width)){
      for(let i=0;i<5;i++)
        await page.locator('.of-figure').nth(i).screenshot({
          path:'artifacts/oxp-editorial-figure-'+(i+1)+'-'+width+'-'+theme+'.png',
        })
    }
    console.log(JSON.stringify({width,theme,pass:true,plates:data.geometry.map(g=>[g.width,g.height])}))
  }catch(error){
    failures++
    console.error(JSON.stringify({width,theme,pass:false,error:String(error),pageErrors:errors}))
  }finally{await page.close()}
}
await browser.close()
if(failures)process.exitCode=1
