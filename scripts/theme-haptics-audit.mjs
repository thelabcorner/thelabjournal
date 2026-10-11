import { chromium } from 'playwright-core'

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
const url = 'http://127.0.0.1:11264/'
let fails = 0
async function pageAt(width, mode = 'light') {
  const page = await browser.newPage({ viewport: {width, height:width<768?844:900}, isMobile:width<768, hasTouch:width<768, colorScheme: mode })
  await page.addInitScript(() => {
    window.__hapticCalls=[]
    Object.defineProperty(navigator,'vibrate',{configurable:true,value:pattern=>{
      window.__hapticCalls.push({time:performance.now(),pattern})
      return true
    }})
  })
  return page
}
const check = (cond,message) => { if(!cond) throw new Error(message) }
const events = page => page.evaluate(() => window.__hapticCalls.filter(c=>Array.isArray(c.pattern) && c.pattern.length>1))
async function delayed(page,click,description) {
  // WebHaptics V2 intentionally coalesces identical cues within 60 ms.
  await page.waitForTimeout(90)
  await page.evaluate(()=>window.__hapticCalls.length=0)
  await click()
  const calls = await events(page)
  check(calls.length === 1, description+': expected one trigger, got '+JSON.stringify(calls))
  const pattern = calls[0].pattern
  check(pattern[0] === 0 && pattern[1] >= 50 && pattern[1] <= 100,description+': no delayed onset '+JSON.stringify(pattern))
  return {pattern,events:calls.length}
}
for (const width of [320,375,430,768,1024,1440]) {
  const p = await pageAt(width, 'light')
  try {
    await p.goto(url,{waitUntil:'networkidle'})
    check(await p.locator('html').getAttribute('data-theme')==='light','light initial')
    const prefsButton = p.getByRole('button',{name:'Journal preferences'})
    await prefsButton.click()
    const dialog = p.getByRole('dialog',{name:'Journal preferences'})
    await dialog.getByRole('button',{name:'Dark'}).click()
    check(await p.locator('html').getAttribute('data-theme') === 'dark','dark not applied')
    check(await p.locator('html').evaluate(e=>getComputedStyle(e).colorScheme) === 'dark','native scheme not dark')
    const dark = await p.evaluate(()=>({
      background:getComputedStyle(document.querySelector('.app-shell')).backgroundColor,
      root:getComputedStyle(document.documentElement).getPropertyValue('--background').trim(),
      fg:getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim(),
      bodyColor:getComputedStyle(document.querySelector('.article-prose')||document.body).color
    }))
    check(dark.root.includes('.155'),'dark token missing '+JSON.stringify(dark))
    await dialog.getByRole('button',{name:'Done'}).click()
    await p.reload({waitUntil:'networkidle'})
    check(await p.locator('html').getAttribute('data-theme') === 'dark','dark preference reload failed')
    if(width<768) {
      const nav = p.getByRole('navigation',{name:'Mobile primary navigation'})
      const browse = await delayed(p,()=>nav.getByRole('button',{name:'Browse'}).click(),'browse')
      check(await p.getByRole('dialog',{name:'Journal navigation'}).isVisible(),'browse failed')
      const theme = p.getByRole('dialog',{name:'Journal navigation'}).getByRole('button',{name:'Switch to light theme'})
      await theme.click()
      check(await p.locator('html').getAttribute('data-theme')==='light','browse theme toggle failed')
      await theme.count()
      await p.getByRole('dialog',{name:'Journal navigation'}).getByRole('button',{name:'Close navigation'}).click()
      await delayed(p,()=>nav.getByRole('button',{name:'Saved'}).click(),'saved')
      await delayed(p,()=>nav.getByRole('button',{name:'Journal'}).click(),'journal')
      await delayed(p,()=>nav.getByRole('button',{name:'Search'}).click(),'search')
      check(await p.getByRole('dialog',{name:'Search the journal'}).isVisible(),'search menu failed')
      await p.keyboard.press('Escape')
      await p.getByRole('button',{name:'Journal preferences'}).click()
      await p.getByRole('dialog',{name:'Journal preferences'}).getByRole('button',{name:'Dark'}).click()
      await p.getByRole('dialog',{name:'Journal preferences'}).getByRole('button',{name:'Done'}).click()
      if(width===375) await p.screenshot({path:'artifacts/theme-dark-mobile.png'})
    } else {
      await p.getByRole('button',{name:'Switch to light theme'}).click()
      check(await p.locator('html').getAttribute('data-theme')==='light','header theme toggle failed')
      await p.getByRole('button',{name:'Switch to dark theme'}).click()
    }
    const articleHaptic = await delayed(p,()=>p.locator('.feature-link').click(),'article')
    check(await p.getByRole('heading',{name:/Learning in reverse/}).count()>0,'article did not open')
    const fg = await p.locator('.article-prose').evaluate(el=>getComputedStyle(el).color)
    check(fg !== 'rgb(0, 0, 0)' && fg !== 'rgb(255, 255, 255)','article ink incorrect '+fg)
    const meta = await p.locator('meta[name="theme-color"]').getAttribute('content')
    check(meta==='#111113', 'meta color not dark')
    const sizes = await p.evaluate(()=>({inner:innerWidth,scroll:document.documentElement.scrollWidth}))
    check(sizes.scroll<=sizes.inner+1,'horizontal overflow '+JSON.stringify(sizes))
    if(width===375) await p.screenshot({path:'artifacts/theme-dark-reader-mobile.png'})
    if(width===1440) await p.screenshot({path:'artifacts/theme-dark-desktop.png'})
    console.log(JSON.stringify({width,pass:true,articlePattern:articleHaptic.pattern,bodyInk:fg,overflow:sizes,darkBg:dark.root}))
  }catch(error){fails++;console.log(JSON.stringify({width,pass:false,error:String(error)}))}
  await p.close()
}
// A system-following preference must honor a change without reload.
{
  const p=await pageAt(375,'light')
  try {
    await p.goto(url,{waitUntil:'networkidle'})
    await p.getByRole('button',{name:'Journal preferences'}).click()
    const dialog=p.getByRole('dialog',{name:'Journal preferences'})
    await dialog.getByRole('button',{name:'System'}).click()
    await dialog.getByRole('button',{name:'Done'}).click()
    await p.emulateMedia({colorScheme:'dark'})
    await p.waitForFunction(()=>document.documentElement.dataset.theme==='dark')
    await p.emulateMedia({colorScheme:'light'})
    await p.waitForFunction(()=>document.documentElement.dataset.theme==='light')
    console.log(JSON.stringify({system:true,pass:true}))
  }catch(e){fails++;console.log(JSON.stringify({system:true,pass:false,error:String(e)}))}
  await p.close()
}
// Opt out and reduced motion must suppress the delayed cue.
for(const reducedMotion of ['reduce','no-preference']){
  const p=await pageAt(375)
  try{
    await p.emulateMedia({reducedMotion})
    await p.goto(url,{waitUntil:'networkidle'})
    if(reducedMotion==='no-preference'){
      await p.getByRole('button',{name:'Journal preferences'}).click()
      await p.getByRole('dialog',{name:'Journal preferences'}).getByRole('checkbox').uncheck()
      await p.getByRole('dialog',{name:'Journal preferences'}).getByRole('button',{name:'Done'}).click()
    }
    await p.evaluate(()=>window.__hapticCalls.length=0)
    await p.getByRole('navigation',{name:'Mobile primary navigation'}).getByRole('button',{name:'Browse'}).click()
    await p.waitForTimeout(120)
    const calls=await events(p)
    check(calls.length===0,'haptic suppression failed '+JSON.stringify(calls))
    console.log(JSON.stringify({reducedMotion,disabled:reducedMotion!=='reduce',pass:true}))
  }catch(e){fails++;console.log(JSON.stringify({reducedMotion,pass:false,error:String(e)}))}
  await p.close()
}
await browser.close()
if(fails)process.exit(1)
