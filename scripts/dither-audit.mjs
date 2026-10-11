import { chromium } from 'playwright-core'

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
const origin = process.env.JOURNAL_ORIGIN || 'http://127.0.0.1:11264/'
let failures = 0
const measure = async (canvas) => canvas.evaluate((element) => {
  const c = element
  const ctx = c.getContext('2d')
  if (!ctx) return { error: 'no context' }
  const pixels = ctx.getImageData(0, 0, c.width, c.height).data
  let ink = 0
  let sum = 0
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] > 0) ink++
    sum = (sum + pixels[i] * ((i * 2654435761) >>> 0)) >>> 0
  }
  return { ink, hash: sum, frames: Number(c.dataset.ditherFrames || 0), state: c.dataset.ditherState, backing: [c.width,c.height] }
})
for (const width of [320,375,768,1024,1440]) {
  const page = await browser.newPage({ viewport:{width,height: width < 768 ? 812 : 900},deviceScaleFactor:width <= 375 ? 2 : 1 })
  page.on('pageerror', error => console.error('pageerror',width,error.message))
  try {
    await page.goto(origin, {waitUntil:'networkidle'})
    const feature = page.locator('.feature-dither')
    await page.waitForFunction(() => document.querySelector('.feature-dither')?.dataset.ditherState === 'playing')
    const start = await measure(feature)
    await page.waitForTimeout(480)
    const end = await measure(feature)
    if (start.ink < 20 || end.frames <= start.frames || start.hash === end.hash)
      throw new Error('Feature animation did not advance or lacks ink: ' + JSON.stringify({start,end}))
    const rect = await feature.boundingBox()
    if (!rect || rect.height < 40 || rect.width < 70) throw new Error('Feature canvas is not visible: '+JSON.stringify(rect))
    const checkNavigationDither = async (selector) => {
      const canvas = page.locator(selector)
      await page.waitForFunction((className) => document.querySelector(className)?.dataset.ditherState === 'playing', selector)
      const bounds = await canvas.boundingBox()
      if (!bounds || bounds.width < width * 0.95 || bounds.height < 35)
        throw new Error('Nav background is not full width: ' + JSON.stringify({selector,bounds}))
      const layering = await canvas.evaluate((node) => ({
        opacity: Number(getComputedStyle(node).opacity),
        pointerEvents: getComputedStyle(node).pointerEvents,
        background: getComputedStyle(node.parentElement).backgroundColor,
      }))
      const isBottomBar = selector === '.tabbar-dither-canvas'
      if ((isBottomBar ? layering.opacity < 0.07 || layering.opacity > 0.17 : layering.opacity < 0.2) || layering.pointerEvents !== 'none')
        throw new Error('Nav canvas contrast or pointer-events incorrect: ' + JSON.stringify({selector,layering}))
      if (isBottomBar) {
        const opacities = await page.evaluate(() => {
          const root = document.documentElement
          const original = root.dataset.theme
          const canvas = document.querySelector('.tabbar-dither-canvas')
          root.dataset.theme = 'light'
          const light = Number(getComputedStyle(canvas).opacity)
          root.dataset.theme = 'dark'
          const dark = Number(getComputedStyle(canvas).opacity)
          root.dataset.theme = original
          return {light, dark}
        })
        if (opacities.light !== 0.16 || opacities.dark !== 0.08)
          throw new Error('Mobile menu dither is not subdued in both themes: ' + JSON.stringify(opacities))
      }
      const before = await measure(canvas)
      await page.waitForTimeout(480)
      const after = await measure(canvas)
      if (before.ink < 50 || after.frames <= before.frames || before.hash === after.hash)
        throw new Error('Nav background did not animate: ' + JSON.stringify({selector,before,after}))
      await page.emulateMedia({reducedMotion:'reduce'})
      await page.waitForFunction((className) => document.querySelector(className)?.dataset.ditherState === 'still', selector)
      const still = await measure(canvas)
      await page.waitForTimeout(220)
      const afterStill = await measure(canvas)
      if (still.frames !== afterStill.frames || still.hash !== afterStill.hash)
        throw new Error('Reduced-motion nav background kept redrawing: ' + selector)
      await page.emulateMedia({reducedMotion:'no-preference'})
      return { ink: after.ink, frames: after.frames - before.frames }
    }
    const headerDither = await checkNavigationDither('.header-dither-canvas')
    const bottomDither = width < 768 ? await checkNavigationDither('.tabbar-dither-canvas') : null

    await page.locator('.feature-link').click()
    const ledger = page.locator('.figure-dither')
    await ledger.scrollIntoViewIfNeeded()
    await page.waitForFunction(() => document.querySelector('.figure-dither')?.dataset.ditherState === 'playing')
    const info = await measure(ledger)
    if (info.ink < 5) throw new Error('Figure titlebar is empty: '+JSON.stringify(info))

    await page.emulateMedia({reducedMotion:'reduce'})
    await page.waitForFunction(() => document.querySelector('.figure-dither')?.dataset.ditherState === 'still')
    const still = await measure(ledger)
    await page.waitForTimeout(360)
    const afterStill = await measure(ledger)
    if (afterStill.frames !== still.frames) throw new Error('Reduced-motion still re-rendering')
    if (still.hash !== afterStill.hash) throw new Error('Reduced-motion pixels changed')
    await page.emulateMedia({reducedMotion:'no-preference'})
    await page.waitForFunction(() => document.querySelector('.figure-dither')?.dataset.ditherState === 'playing')
    console.log(JSON.stringify({width,pass:true,animatedFrames:end.frames-start.frames,startInk:start.ink,endInk:end.ink,headerDither,bottomDither,figureInk:info.ink,stillFrames:afterStill.frames-still.frames,featureBounds:rect}))
  } catch (error) {
    failures++
    console.log(JSON.stringify({width,pass:false,error:String(error)}))
  }
  await page.close()
}
// Targeted offscreen and visibility lifecycle test.
{
  const page = await browser.newPage({viewport:{width:375,height:700}})
  try {
    await page.goto(origin,{waitUntil:'networkidle'})
    const feature = page.locator('.feature-dither')
    await page.waitForFunction(() => document.querySelector('.feature-dither')?.dataset.ditherState === 'playing')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForFunction(() => document.querySelector('.feature-dither')?.dataset.ditherState === 'paused')
    const before = await measure(feature)
    await page.waitForTimeout(400)
    const after = await measure(feature)
    if (before.frames !== after.frames) throw new Error('Offscreen canvas continued drawing')
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForFunction(() => document.querySelector('.feature-dither')?.dataset.ditherState === 'playing')
    await page.evaluate(() => { Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange')) })
    await page.waitForFunction(() => document.querySelector('.feature-dither')?.dataset.ditherState === 'paused')
    const hiddenFrames = (await measure(feature)).frames
    await page.waitForTimeout(350)
    if ((await measure(feature)).frames !== hiddenFrames) throw new Error('Hidden tab continued drawing')
    await page.evaluate(() => { delete Object.getOwnPropertyDescriptor(document,'hidden') && delete document.hidden;document.dispatchEvent(new Event('visibilitychange')) })
    await page.waitForFunction(() => document.querySelector('.feature-dither')?.dataset.ditherState === 'playing')
    console.log(JSON.stringify({lifecycle:true,pass:true,offscreenFrameDelta:after.frames-before.frames,hiddenFrameDelta:0}))
  } catch (error) {failures++;console.log(JSON.stringify({lifecycle:true,pass:false,error:String(error)}))}
  await page.close()
}
await browser.close()
if (failures) process.exit(1)
