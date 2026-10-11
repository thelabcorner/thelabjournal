import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] })
let failed = 0
for (const width of [320, 375, 430, 768, 1440]) {
  const page = await browser.newPage({ viewport: {width,height:width < 768?812:900}, isMobile:width<768, hasTouch:width<768, deviceScaleFactor:1 })
  try {
    await page.goto('http://127.0.0.1:11264/', {waitUntil:'networkidle'})
    await page.getByRole('button', {name:'Journal preferences'}).click()
    const dialog = page.getByRole('dialog', {name:'Journal preferences'})
    const group = dialog.getByRole('group', {name:'Appearance'})
    for (const name of ['System','Light','Dark']) {
      const button = group.getByRole('button', {name})
      if (!(await button.isVisible())) throw Error('Invisible '+name)
      await button.click()
      const selected = await group.locator('[data-selected="true"]').count()
      if (selected !== 1) throw Error('Missing unambiguous selected state for '+name)
      const pressed = await button.getAttribute('aria-pressed')
      if (pressed !== 'true') throw Error('Wrong aria-pressed for '+name)
      const expected = name === 'System' ? undefined : name.toLowerCase()
      if (expected && (await page.locator('html').getAttribute('data-theme')) !== expected) throw Error('Theme did not apply: '+name)
    }
    await group.getByRole('button', {name:'Light'}).click()
    if (width === 320 || width === 375 || width === 430 || width === 1440) {
      await page.screenshot({path:'artifacts/appearance-v4-light-'+width+'.png'})
    }
    const metrics = await group.evaluate((node) => {
      const buttons = [...node.querySelectorAll('button')].map((button) => {
        const rect = button.getBoundingClientRect()
        const footer = button.querySelector('.theme-option-footer')
        const names = footer?.querySelector('span:nth-child(2)')
        const labelRect = names?.getBoundingClientRect()
        const indicatorRect = footer?.querySelector('.theme-option-indicator')?.getBoundingClientRect()
        return {width:rect.width,height:rect.height,labelWidth:labelRect?.width ?? 0,labelScroll:names?.scrollWidth ?? 0,indicatorX:indicatorRect?.x ?? 0,buttonX:rect.x,buttonRight:rect.right}
      })
      const panel=node.closest('.prefs-dialog')
      return {buttons,viewport:innerWidth,dialogHeight:panel?.getBoundingClientRect().height ?? 0,documentWidth:document.documentElement.scrollWidth}
    })
    if(metrics.documentWidth>width+1) throw Error('Horizontal overflow: '+metrics.documentWidth)
    if(metrics.buttons.some(b=>b.labelScroll>b.labelWidth+2)) throw Error('Label truncated: '+JSON.stringify(metrics.buttons))
    if(metrics.buttons.some(b=>b.height<70)) throw Error('Targets too small')
    await group.getByRole('button', {name:'Dark'}).click()
    if (width === 375 || width===1440) await page.screenshot({path:'artifacts/appearance-v4-dark-'+width+'.png'})
    console.log(JSON.stringify({width,passed:true,metrics}))
  } catch(e) {failed++; console.log(JSON.stringify({width,passed:false,error:String(e)}))}
  await page.close()
}
await browser.close()
if (failed) process.exit(1)
