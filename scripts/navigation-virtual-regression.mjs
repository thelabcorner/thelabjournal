import {chromium} from 'playwright-core'
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']})
let failed=0
for(const width of [375,1440]){
 const page=await browser.newPage({viewport:{width,height:width<768?812:900},isMobile:width<768,hasTouch:width<768})
 try{
  await page.goto('http://127.0.0.1:11264/',{waitUntil:'networkidle'})
  const row=page.locator('.journal-row-link').last()
  await row.scrollIntoViewIfNeeded()
  const initial=await page.evaluate(()=>scrollY)
  if(initial<90) throw Error('not scrolled to archive entry '+initial)
  await row.click()
  await page.locator('.article-body h1').waitFor()
  const articleScroll=await page.evaluate(()=>scrollY)
  if(articleScroll>2) throw Error('open article did not reset scroll '+articleScroll)
  await page.locator('.reading-back').click()
  await page.locator('.journal-row-link').first().waitFor()
  await page.waitForTimeout(90)
  const restored=await page.evaluate(()=>scrollY)
  if(Math.abs(restored-initial)>60) throw Error('back button failed to restore '+JSON.stringify({initial,restored}))
  // Verify native history Back traverses the SPA pushState and restores the
  // archive without an unexpected smooth-scroll animation.
  await row.scrollIntoViewIfNeeded()
  const beforeHistory=await page.evaluate(()=>scrollY)
  await row.click()
  await page.locator('.article-body h1').waitFor()
  await page.goBack()
  await page.locator('.journal-row-link').first().waitFor()
  await page.waitForTimeout(90)
  const historyRestored=await page.evaluate(()=>scrollY)
  if(Math.abs(historyRestored-beforeHistory)>60) throw Error('history back failed '+JSON.stringify({beforeHistory,historyRestored}))
  console.log(JSON.stringify({width,pass:true,initial,restored,beforeHistory,historyRestored}))
 }catch(e){failed++;console.log(JSON.stringify({width,pass:false,error:String(e)}))}
 await page.close()
}
await browser.close()
if(failed)process.exit(1)
