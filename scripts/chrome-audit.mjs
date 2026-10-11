import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] })
const origin = 'http://127.0.0.1:11264/'
const sizes = [320, 375, 390, 430, 768, 1024, 1440]
let errors = 0
const verify = (ok, why) => { if (!ok) throw Error(why) }
for (const width of sizes) {
  const page = await browser.newPage({ viewport: {width, height: width < 768 ? 812 : 900}, isMobile:width < 768, hasTouch: width < 768 })
  const failures = []
  page.on('pageerror', e => failures.push(e.message))
  await page.addInitScript(() => {
    window.__hapticCalls = []
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: pattern => { window.__hapticCalls.push(pattern); return true } })
  })
  try {
    await page.goto(origin, {waitUntil:'networkidle'})
    await page.getByRole('button', {name:'Journal preferences'}).click()
    const prefs = page.getByRole('dialog',{name:'Journal preferences'})
    verify(await prefs.isVisible(),'preferences not open')
    await prefs.getByRole('button',{name:/Comfortable/}).click()
    verify((await page.locator('.app-shell').getAttribute('data-text-scale'))==='large','reading scale not set')
    await prefs.getByRole('button',{name:/Cards/}).click()
    verify((await page.locator('.app-shell').getAttribute('data-layout'))==='cards','layout did not update')
    await prefs.getByRole('button',{name:'Test haptics'}).click()
    let calls = await page.evaluate(() => window.__hapticCalls.length)
    verify(calls>0,'no WebHaptics V2 call reached navigator.vibrate')
    await prefs.getByRole('checkbox').uncheck()
    await page.waitForTimeout(250)
    const beforeDisable = await page.evaluate(() => window.__hapticCalls.length)
    await prefs.getByRole('button',{name:/Standard/}).click()
    await page.waitForTimeout(100)
    verify((await page.evaluate(() => window.__hapticCalls.length))===beforeDisable,'disabled haptics still fired '+JSON.stringify(await page.evaluate(() => ({calls:window.__hapticCalls,storage:localStorage.getItem('thelabcorner.journal.haptics.v2')}))))
    await prefs.getByRole('checkbox').check()
    await prefs.getByRole('button',{name:/Comfortable/}).click()
    await prefs.getByRole('button',{name:'Done'}).click()
    verify(await prefs.count() === 0,'preferences did not close')
    if (width < 768) {
      const browse = page.getByRole('navigation', {name:'Mobile primary navigation'}).getByRole('button',{name:'Browse'})
      await browse.click()
      const dialog = page.getByRole('dialog', {name:'Journal navigation'})
      verify(await dialog.isVisible(),'browse menu missing')
      verify(await dialog.getByRole('button',{name:'Collections'}).isVisible(),'collections tab missing')
      await dialog.getByRole('button',{name:'Recent writing'}).click()
      verify(await dialog.getByRole('button',{name:/Learning in reverse/}).isVisible(),'recent writing not populated')
      await dialog.getByRole('button',{name:'Collections'}).click()
      await dialog.getByRole('button',{name:/Research 01/}).click()
      await page.getByRole('heading',{name:'Research'}).waitFor()
      verify(await page.locator('.journal-row').count()===1,'research view was not filtered')
      await browse.click()
      await dialog.getByRole('button',{name:/All writing/}).click()
      await page.getByRole('heading',{name:/^Journal/}).waitFor({timeout:3000})
      await browse.click()
      await dialog.getByRole('button',{name:'Recent writing'}).click()
      const grab = page.locator('.browse-grab')
      await grab.dispatchEvent('pointerdown',{clientY:100})
      await grab.dispatchEvent('pointerup',{clientY:205})
      verify(await dialog.count()===0,'grab swipe did not close sheet')
    }
    verify(await page.locator('.journal-list--cards .journal-row').count()>0,'card archive missing')
    await page.reload({waitUntil:'networkidle'})
    verify(await page.locator('.app-shell').getAttribute('data-layout')==='cards','card preference not persisted')
    if(width>=1024){
      await page.getByRole('button',{name:'Collapse sidebar'}).click()
      verify(await page.locator('.frame').getAttribute('class') !== null && await page.locator('.frame.rail-collapsed').count()===1,'rail failed to collapse')
      await page.reload({waitUntil:'networkidle'})
      verify(await page.locator('.frame.rail-collapsed').count()===1,'rail state did not persist')
      await page.getByRole('button',{name:'Expand sidebar'}).click()
      verify(await page.locator('.frame.rail-collapsed').count()===0,'rail failed to expand')
    }
    await page.locator('.feature-link').click()
    verify(await page.locator('.app-shell').getAttribute('data-text-scale')==='large','reading preference lost')
    const dim = await page.evaluate(() => ({inner:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth}))
    verify(dim.doc<=dim.inner+1 && dim.body<=dim.inner+1,'horizontal overflow '+JSON.stringify(dim))
    console.log(JSON.stringify({width,pass:true,hapticCalls:calls,overflow:dim,errors:failures}))
    if(failures.length) errors++
  } catch(e) {errors++;console.log(JSON.stringify({width,pass:false,error:String(e),pageerrors:failures}))}
  await page.close()
}
const page=await browser.newPage({viewport:{width:375,height:812}})
await page.addInitScript(() => {
  window.__hapticCalls=[]
  Object.defineProperty(navigator,'vibrate',{configurable:true,value:pattern=>{window.__hapticCalls.push(pattern);return true}})
})
try {
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.goto(origin,{waitUntil:'networkidle'})
 await page.getByRole('button',{name:'Journal preferences'}).click()
 await page.getByRole('button',{name:'Test haptics'}).click()
 const count=await page.evaluate(()=>window.__hapticCalls.length)
 verify(count===0,'reduced-motion haptics fired '+count)
 console.log(JSON.stringify({reducedMotion:true,pass:true,hapticCalls:count}))
}catch(e){errors++;console.log(JSON.stringify({reducedMotion:true,pass:false,error:String(e)}))}
await page.close()
await browser.close()
if(errors)process.exit(1)
