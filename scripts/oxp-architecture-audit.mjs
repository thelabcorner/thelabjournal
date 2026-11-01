import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'

const origin = process.env.JOURNAL_ORIGIN ?? 'http://127.0.0.1:11264/'
const cases = [
  ...[320,375,390,430,600,700,768,1024,1440].map(width=>({width,theme:'light'})),
  {width:375,theme:'dark'},{width:430,theme:'dark'},{width:768,theme:'dark'},
]
const browser = await chromium.launch({
  executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless:true,args:['--no-sandbox']
})
await mkdir('artifacts',{recursive:true})
let failures = 0
for(const {width,theme} of cases){
  const page = await browser.newPage({ viewport:{width,height:850}, deviceScaleFactor:1, colorScheme:theme })
  const errors=[]
  page.on('pageerror',e=>errors.push(e.message))
  try{
    const response=await page.goto(new URL('posts/the-openfork-network-behind-one-oxp-connection/',origin).href,{
      waitUntil:'networkidle',timeout:30000
    })
    if(!response?.ok())throw new Error('HTTP '+response?.status())
    const report=await page.evaluate(()=>{
      const figures=[...document.querySelectorAll('.ofarch-figure')]
      const dimensions=figures.map(figure=>{
        const outer=figure.getBoundingClientRect()
        const canvas=figure.querySelector('.ofx-diagram')
        const box=canvas?.getBoundingClientRect()
        const elements=[...figure.querySelectorAll('.ofx-diagram strong,.ofx-diagram small,.ofx-diagram span,.ofx-diagram div,.jf-title,.jf-caption')]
          .filter(node=>getComputedStyle(node).display!=='none'&&!node.getAttribute('aria-hidden'))
        const outside=elements.filter(node=>{
          const b=node.getBoundingClientRect()
          return b.width>0&&b.height>0&&(b.left<outer.left-3||b.right>outer.right+3||b.top<outer.top-3||b.bottom>outer.bottom+3)
        }).map(node=>node.textContent?.trim().slice(0,40))
        const overflow=elements.filter(node=>node.textContent?.trim()&&node.scrollWidth>node.clientWidth+3)
          .map(node=>({text:node.textContent?.trim().slice(0,35),dx:node.scrollWidth-node.clientWidth}))
        return {height:Math.round(outer.height),canvasHeight:Math.round(box?.height??0),outside,overflow}
      })
      const captions=figures.map(f=>f.querySelector('figcaption')?.textContent?.trim().length??0)
      return {
        width:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,
        figures:figures.length,captions,
        heads:document.querySelectorAll('.ofarch-figure .figure-top').length,
        dither:document.querySelectorAll('.ofarch-figure .figure-motion').length,
        entryCount:document.querySelectorAll('.ofx-network .ofx-caller').length,
        runtimeCount:document.querySelectorAll('.ofx-network .ofx-runtime').length,
        capabilityCount:document.querySelectorAll('.ofx-capability').length,
        projectProducer:document.querySelectorAll('.ofx-project .ofx-producer').length,
        mcpCatalog:document.querySelectorAll('.ofx-mcp .ofx-catalog').length,
        mcpClients:document.querySelectorAll('.ofx-mcp .ofx-client,.ofx-mcp .ofx-caller').length,
        mcpEndpoint:document.querySelectorAll('.ofx-mcp .ofx-endpoint').length,
        peerHosts:document.querySelectorAll('.ofx-host').length,
        peerCores:document.querySelectorAll('.ofx-host-core').length,
        authorityRows:document.querySelectorAll('.ofx-authority-row').length,
        authorityProducer:document.querySelectorAll('.ofx-authority .ofx-producer').length,
        dimensions
      }
    })
    if(errors.length)throw new Error('Browser JS: '+errors.join(';'))
    if(report.doc>width+1||report.body>width+1)throw new Error('Horizontal page overflow '+JSON.stringify(report))
    if(report.figures!==5||report.heads!==5||report.dither!==1||report.captions.some(n=>n<90))
      throw new Error('Missing journal figure structure '+JSON.stringify(report))
    if(report.entryCount!==2||report.runtimeCount!==1||report.capabilityCount!==5||
       report.projectProducer!==1||report.mcpCatalog!==1||report.mcpClients!==2||
       report.mcpEndpoint!==1||report.peerHosts!==2||report.peerCores!==2||
       report.authorityRows!==3||report.authorityProducer!==1)
      throw new Error('Incorrect shared implementation / reuse topology '+JSON.stringify(report))
    if(report.dimensions.some(d=>d.outside.length||d.overflow.length||d.canvasHeight<110))
      throw new Error('Clipped diagram '+JSON.stringify(report.dimensions))
    if([320,375,430,768,1440].includes(width)){
      for(let i=0;i<5;i++) await page.locator('.ofarch-figure').nth(i).screenshot({
        path:'artifacts/oxp-reuse-'+(i+1)+'-'+width+'-'+theme+'.png'
      })
    }
    console.log(JSON.stringify({width,theme,pass:true,heights:report.dimensions.map(d=>d.height)}))
  }catch(e){
    failures++
    console.error(JSON.stringify({width,theme,pass:false,error:String(e),pageErrors:errors}))
  }finally{await page.close()}
}
await browser.close()
if(failures)process.exitCode=1
