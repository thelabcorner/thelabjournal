import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

/** Regression for Pierre's cold highlighter + initial toggle render.
 * Must exercise a fresh page and assert actual code lines, not the toggle flag.
 */
const origin = process.env.JOURNAL_ORIGIN ?? 'http://127.0.0.1:11264/';
const url = new URL('research/gravimetric-decarboxylation-co2-progress/', origin).href;
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
});
let passes = 0;
try {
  for (const width of [320, 390, 1440]) {
    for (const theme of ['light', 'dark']) {
      const page = await browser.newPage({
        viewport: { width, height: 840 },
        serviceWorkers: 'block',
        reducedMotion: 'reduce',
      });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      try {
        await page.addInitScript(
          t => localStorage.setItem('thelabcorner.journal.preferences.v2', JSON.stringify({ theme: t })),
          theme
        );
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        const blocks = page.locator('.research-body .math-block');
        await blocks.first().waitFor();
        assert.equal(await blocks.count(), 31, 'expected 31 equations');
        assert.equal(await page.locator('.math-block__view-toggle').count(), 31);
        for (const index of [0, 14, 30]) {
          const block = blocks.nth(index);
          assert.equal(await block.getAttribute('data-equation-view'), 'math');
          await block.locator('.math-block__view-toggle').click();
          assert.equal(await block.getAttribute('data-equation-view'), 'python');

          // During cold initialization a legible plaintext code fallback is
          // allowed; an empty surface is not. Then Pierre must display lines.
          await page.waitForFunction(i => {
            const el = document.querySelectorAll('.research-body .math-block')[i];
            const fallback = el?.querySelector('.math-block__code-loading');
            const renderer = el?.querySelector('.math-block__pierre diffs-container');
            const lines = renderer?.shadowRoot?.querySelectorAll('[data-line]')?.length ?? 0;
            return (fallback?.textContent?.includes('sympy') ?? false) || lines > 0;
          }, index, { timeout: 12000 });

          await page.waitForFunction(i => {
            const el = document.querySelectorAll('.research-body .math-block')[i];
            const renderer = el?.querySelector('.math-block__pierre diffs-container');
            const shadow = renderer?.shadowRoot;
            return (shadow?.querySelectorAll('[data-line]')?.length ?? 0) > 0
              && !!shadow?.querySelector('code')?.textContent?.includes('sympy');
          }, index, { timeout: 12000 });

          const state = await block.evaluate(el => {
            const renderer = el.querySelector('.math-block__pierre diffs-container');
            const shadow = renderer.shadowRoot;
            return {
              lines: shadow.querySelectorAll('[data-line]').length,
              tokenSpans: shadow.querySelectorAll('[data-line] span').length,
              height: renderer.getBoundingClientRect().height,
              colorScheme: getComputedStyle(renderer).colorScheme,
              scrollOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            };
          });
          assert(state.lines > 0 && state.tokenSpans > 0);
          assert(state.height > 20, 'rendered code should have nonzero height');
          assert.equal(state.colorScheme, theme);
          assert(state.scrollOverflow <= 1, 'horizontal document overflow');
          if (index === 0) {
            const alternate = theme === 'dark' ? 'light' : 'dark';
            await page.evaluate(t => document.documentElement.dataset.theme = t, alternate);
            await page.waitForFunction(({i, expected}) => {
              const el = document.querySelectorAll('.research-body .math-block')[i];
              const renderer = el?.querySelector('.math-block__pierre diffs-container');
              return renderer && getComputedStyle(renderer).colorScheme === expected
                && (renderer.shadowRoot?.querySelectorAll('[data-line]').length ?? 0) > 0;
            }, { i:index, expected:alternate }, { timeout:5000 });
            await page.evaluate(t => document.documentElement.dataset.theme = t, theme);
            await page.waitForFunction(({i, expected}) => {
              const el = document.querySelectorAll('.research-body .math-block')[i];
              const renderer = el?.querySelector('.math-block__pierre diffs-container');
              return renderer && getComputedStyle(renderer).colorScheme === expected
                && (renderer.shadowRoot?.querySelectorAll('[data-line]').length ?? 0) > 0;
            }, { i:index, expected:theme }, { timeout:5000 });
          }
          await block.locator('.math-block__view-toggle').click();
          assert.equal(await block.getAttribute('data-equation-view'), 'math');
        }
        assert.deepEqual(errors, []);
        passes++;
        console.log(JSON.stringify({ width, theme, checks: 3, firstToggle: 'passed', syntaxHighlighting: 'passed' }));
      } finally { await page.close(); }
    }
  }
} finally { await browser.close(); }
assert.equal(passes, 6);
console.log('6 viewport/theme scenarios × 3 cold-first-toggle equations passed.');
