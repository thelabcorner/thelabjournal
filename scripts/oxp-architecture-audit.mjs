import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'

const origin=process.env.JOURNAL_ORIGIN??'http://127.0.0.1:11264/'
const cases=[
  ...[320,375,390,430,600,700,768,1024,1440].map(width=>({width,theme:'light'})),
  {width:375,theme:'dark'},{width:430,theme:'dark'},{width:768,theme:'dark'},
]
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless:true,args:['--no-sandbox']})
await mkdir('artifacts',{recursive:true})
let failures=0
for(const {width,theme} of cases){
  const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1,colorScheme:theme})
  const errors=[]
  page.on('pageerror',error=>errors.push(error.message))
  try{
    const response=await page.goto(new URL('posts/the-openfork-network-behind-one-oxp-connection/',origin).href,
      {waitUntil:'networkidle',timeout:30000})
    if(!response?.ok())throw new Error('HTTP '+response?.status())
    const report=await page.evaluate(()=>{
      const figures=[...document.querySelectorAll('.ofarch-figure')]
      const bounding=figures.map(fig=>{
        const outer=fig.getBoundingClientRect()
        const art=fig.querySelector('.ofarch-art')
        const artbox=art?.getBoundingClientRect()
        const svg=fig.querySelector('.ofarch-art > svg')
        const svgbox=svg?.getBoundingClientRect()
        const all=[...fig.querySelectorAll('.ofarch-art strong,.ofarch-art small,.ofarch-art span,.ofarch-art p,.jf-title,.jf-caption')]
          .filter(node=>getComputedStyle(node).display!=='none')
        const outside=all.filter(node=>{
          const b=node.getBoundingClientRect()
          return b.width>0&&b.height>0&&(b.left<outer.left-2||b.right>outer.right+2||b.top<outer.top-2||b.bottom>outer.bottom+2)
        }).map(node=>node.textContent?.trim().slice(0,40))
        const clipped=all.filter(node=>node.textContent?.trim()&&(node.scrollWidth>node.clientWidth+2||node.scrollHeight>node.clientHeight+2))
          .map(node=>node.textContent?.trim().slice(0,40))
        return {
          height:Math.round(outer.height),width:Math.round(outer.width),
          artHeight:Math.round(artbox?.height??0),svgHeight:Math.round(svgbox?.height??0),
          artRadius:getComputedStyle(art).borderTopLeftRadius,
          outside,clipped,
        }
      })
      return {
        width:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,
        figures:figures.length,captions:figures.map(fig=>fig.querySelector('figcaption')?.textContent?.trim().length??0),
        topBars:document.querySelectorAll('.ofarch-figure .figure-top').length,
        svgCount:document.querySelectorAll('.ofarch-art > svg[role="img"]').length,
        svgTitleCount:document.querySelectorAll('.ofarch-art > svg title').length,
        illustrationCount:document.querySelectorAll('.ofarch-art').length,
        capabilities:document.querySelectorAll('.ofarch-capabilities>div').length,
        stageCount:document.querySelectorAll('.ofarch-stage-grid>div').length,
        pairCount:document.querySelectorAll('.ofarch-two-labels>div').length,
        checks:document.querySelectorAll('.ofarch-checks>div').length,
        bounding,
      }
    })
    if(errors.length)throw new Error('Browser JS errors '+errors.join(';'))
    if(report.doc>width+1||report.body>width+1)throw new Error('Horizontal document overflow '+JSON.stringify(report))
    if(report.figures!==5||report.topBars!==5||report.illustrationCount!==5||report.svgCount!==5||report.svgTitleCount!==5)
      throw new Error('Missing five journal-native SVG figures '+JSON.stringify(report))
    if(report.captions.some(n=>n<90))throw new Error('Captions missing')
    if(report.capabilities!==5||report.stageCount!==4||report.pairCount!==2||report.checks!==3)
      throw new Error('Lost architectural content '+JSON.stringify(report))
    if(report.bounding.some(b=>b.outside.length||b.clipped.length||b.artHeight<140||b.svgHeight<90))
      throw new Error('Clipped or missing figure content '+JSON.stringify(report.bounding))
    if([375,430,768,1440].includes(width)){
      for(let i=0;i<5;i++) await page.locator('.ofarch-figure').nth(i).screenshot({
        path:'artifacts/oxp-ncm-'+(i+1)+'-'+width+'-'+theme+'.png'
      })
    }
    console.log(JSON.stringify({width,theme,pass:true,heights:report.bounding.map(b=>b.height),radii:report.bounding.map(b=>b.artRadius)}))
  }catch(e){failures++;console.error(JSON.stringify({width,theme,pass:false,error:String(e),pageErrors:errors}))}
  finally{await page.close()}
}
await browser.close()
if(failures)process.exitCode=1
