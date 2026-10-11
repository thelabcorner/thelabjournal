import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] })
const origin = new URL(process.env.JOURNAL_ORIGIN || 'http://127.0.0.1:11265/')
const base = origin.pathname.endsWith('/') ? origin.pathname : origin.pathname + '/'
const expected = ['icon-192.png','icon-512.png','icon-maskable-512.png']
let failed=0
for (const width of [375, 1440]) {
  const context=await browser.newContext({viewport:{width,height:width===375?844:900},isMobile:width===375,hasTouch:width===375,serviceWorkers:'allow'})
  const page=await context.newPage()
  const errors=[]
  page.on('pageerror',e=>errors.push(e.message))
  try {
    const response=await page.goto(origin.href,{waitUntil:'networkidle'})
    if (response?.status() !== 200) throw Error('entry response')
    const manifestLink=await page.locator('link[rel="manifest"]').getAttribute('href')
    if(!manifestLink)throw Error('Manifest missing')
    const headIcons=await page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').evaluateAll(links=>links.map(link=>({
      rel:link.rel,href:link.getAttribute('href'),type:link.getAttribute('type'),sizes:link.getAttribute('sizes')
    })))
    for (const filename of ['favicon.svg','favicon.ico','favicon-16.png','favicon-32.png','icons/apple-touch-icon.png']) {
      const link=headIcons.find(icon=>icon.href?.includes(filename+'?v=2'))
      if (!link) throw Error('Missing versioned browser/touch icon '+filename)
      const response=await context.request.get(new URL(link.href,origin).href)
      if(response.status()!==200)throw Error('Broken browser/touch icon '+filename+' HTTP '+response.status())
    }
    const manifest=await (await context.request.get(new URL(manifestLink,origin).href)).json()
    if(manifest.name!=='thelabjournal™'||manifest.short_name!=='thelabjournal™')throw Error('PWA brand mismatch '+JSON.stringify(manifest))
    if(manifest.display!=='standalone'||manifest.scope!==base||manifest.start_url!==base||manifest.id!==base)throw Error('Manifest scope or standalone '+JSON.stringify(manifest))
    for (const file of expected) {
      const entry=manifest.icons.find(icon=>icon.src.includes(file))
      if (!entry) throw Error('Missing icon '+file)
      if(!entry.src.includes('?v=2'))throw Error('Missing icon cache version '+file)
      if(entry.purpose!==(file==='icon-maskable-512.png'?'maskable':'any'))throw Error('Icon purpose mismatch '+file)
      const image=await context.request.get(new URL(entry.src,origin).href)
      if (image.status()!==200 || image.headers()['content-type']?.includes('image/png')!==true)throw Error('Broken icon '+file)
    }
    await page.waitForFunction(async()=>!!(navigator.serviceWorker && await navigator.serviceWorker.ready), {timeout:20000})
    await page.reload({waitUntil:'networkidle'})
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller)
    const sw=await page.evaluate(async()=>{
      const reg=await navigator.serviceWorker.ready
      const keys=await caches.keys()
      return {scope:reg.scope,sw:reg.active?.scriptURL,cacheKeys:keys,controlled:!!navigator.serviceWorker.controller}
    })
    if (!sw.controlled||!sw.cacheKeys.some(v=>v.includes('workbox-precache'))||!sw.scope.endsWith(base)||!sw.sw?.endsWith(base+'sw.js'))throw Error('Service worker not controlling and caching the application scope '+JSON.stringify(sw))
    // First essay is an existing query-string deep link, not a separate HTML file.
    const link=await page.locator('.feature-link').getAttribute('href')
    if(!link?.startsWith('?post='))throw Error('Article URL changed '+link)
    const deep=new URL(link,origin)
    await context.setOffline(true)
    await page.goto(deep.href,{waitUntil:'domcontentloaded',timeout:15000})
    await page.getByRole('heading',{name:/Learning in reverse/}).first().waitFor({timeout:10000})
    await page.waitForTimeout(300)
    const online=await page.evaluate(()=>navigator.onLine)
    if(online)throw Error('Browser offline flag not reflected')
    await page.getByRole('button',{name:'Journal preferences'}).click()
    const prefs=page.getByRole('dialog',{name:'Journal preferences'})
    if(!await prefs.getByText('Installed as an app').count()) {
      if(!await prefs.getByText('Install journal',{exact:true}).count())throw Error('PWA install section absent')
    }
    if(errors.length)throw Error('JS errors: '+errors.join(' | '))
    console.log(JSON.stringify({width,pass:true,offlineArticle:true,worker:sw.sw,cacheCount:sw.cacheKeys.length,manifestName:manifest.name,brandIconsChecked:headIcons.length}))
  } catch(err) {
    failed++
    console.log(JSON.stringify({width,pass:false,error:String(err),pageErrors:errors}))
  }
  await context.close()
}
// Verify browser sees LAN HTTP as insecure, without claiming that Safari can install it.
if (process.env.JOURNAL_CHECK_LAN !== 'false') {
  const context=await browser.newContext()
  const page=await context.newPage()
  try {
    await page.goto('http://192.168.1.70:11264/',{waitUntil:'domcontentloaded',timeout:10000})
    const secure=await page.evaluate(()=>isSecureContext)
    if(secure)throw Error('LAN was unexpectedly secure')
    await page.getByRole('button',{name:'Journal preferences'}).click()
    await page.getByText('HTTPS required').waitFor()
    console.log(JSON.stringify({lanHttp:true,pass:true,secure}))
  } catch(err){ failed++; console.log(JSON.stringify({lanHttp:true,pass:false,error:String(err)})) }
  await context.close()
}
await browser.close()
if (failed) process.exit(1)
