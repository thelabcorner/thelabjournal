import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const origin = process.env.JOURNAL_ORIGIN ?? 'http://127.0.0.1:11264/'
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, args: ['--no-sandbox'],
})
let checks = 0
try {
  for (const width of [320, 390, 430]) {
    for (const path of ['/', '/posts/learning-in-reverse/', '/research/low-temp-lyophilization-three-theses/']) {
      const page = await browser.newPage({ viewport: { width, height: 844 }, isMobile: true,
        hasTouch: true, deviceScaleFactor: 3, reducedMotion: 'no-preference', serviceWorkers: 'block' })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      try {
        await page.goto(new URL(path.slice(1), origin).href, { waitUntil: 'domcontentloaded' })
        await page.locator('.centered-scrollbar[data-scrollable="true"]').waitFor({ timeout: 18000 })
        if (path.includes('research')) await page.locator('.research-body #title h1').waitFor({timeout:18000})
        await page.evaluate(() => scrollTo({top:0,behavior:'instant'}))
        await page.waitForTimeout(150)
        const samples = await page.evaluate(async () => {
          const track = document.querySelector('.centered-scrollbar')
          const thumb = document.querySelector('.centered-scrollbar-thumb')
          const start = thumb.getBoundingClientRect().top
          const max = Number(track.getAttribute('aria-valuemax'))
          const jump = Math.min(900, Math.max(200, max / 2))
          window.scrollTo({ top: jump, behavior: 'instant' })
          const values = []
          for (let i = 0; i < 16; i++) {
            await new Promise(resolve => requestAnimationFrame(resolve))
            const r = thumb.getBoundingClientRect()
            const t = track.getBoundingClientRect()
            values.push({ y: r.top, top: t.top, bottom: t.bottom, thumbBottom: r.bottom, ms: performance.now() })
          }
          return { start, max, scroll: scrollY, values }
        })
        const target = samples.values.at(-1).y
        const delta = target - samples.start
        assert(Math.abs(delta) > 4, 'not enough travel to verify smoothing')
        const ys = samples.values.map(s => s.y)
        assert(Math.abs(ys[0] - samples.start) < Math.abs(delta) * .96, 'first frame jumped instantly rather than interpolating')
        const direction = Math.sign(delta)
        assert(ys.every((y, i) => i === 0 || (y - ys[i - 1]) * direction >= -0.8),
          'scrollbar moved backward or oscillated')
        assert(samples.values.every(s => s.y >= s.top - 0.5 && s.thumbBottom <= s.bottom + 0.5),
          'interpolated thumb escaped clipped viewport')
        assert.deepEqual(errors, [])
        checks++
        const dt = samples.values.slice(1).map((s,i) => s.ms - samples.values[i].ms)
        const middleDt = dt.sort((a,b)=>a-b)[Math.floor(dt.length/2)]
        console.log(JSON.stringify({ width, path, passed: true, deltaPx: Math.round(delta), medianFrameMs: Math.round(middleDt*10)/10 }))
      } finally { await page.close() }
    }
  }
} finally { await browser.close() }
console.log('Interpolation audit passed: ' + checks + ' mobile route/viewport combinations.')
