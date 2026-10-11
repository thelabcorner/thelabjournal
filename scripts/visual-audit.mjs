import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true, args:['--no-sandbox'] })
const origin = 'http://127.0.0.1:11264/'
for (const width of [375, 768, 1440]) {
  const page = await browser.newPage({ viewport:{width,height:width===375?812:900}, deviceScaleFactor:1,hasTouch:width===375,isMobile:width===375})
  await page.goto(origin,{waitUntil:'networkidle'})
  await page.evaluate(()=>window.scrollTo(0,0))
  await page.screenshot({path:'artifacts/audit-home-'+width+'.png'})
  if(width===375){ await page.getByRole('navigation',{name:'Mobile primary navigation'}).getByRole('button',{name:'Browse'}).click();await page.waitForTimeout(350);await page.screenshot({path:'artifacts/audit-drawer-375.png'});await page.keyboard.press('Escape');await page.waitForTimeout(350) }
  await page.locator('.feature-link').click()
  await page.evaluate(()=>window.scrollTo(0,0))
  await page.screenshot({path:'artifacts/audit-article-'+width+'.png'})
  if(width===375 || width===1440) { await page.locator('.article-figure').scrollIntoViewIfNeeded(); await page.locator('.article-figure').screenshot({path:'artifacts/audit-figure-'+width+'.png'}) }
  await page.close()
}
await browser.close()
