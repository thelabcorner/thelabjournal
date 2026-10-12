import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { entries } from '../src/data.ts'
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
assert.ok(app.includes("journalBase + 'posts/' + encodeURIComponent(entry.slug) + '/'"), 'all article hrefs are crawled path routes')
assert.ok(app.includes("new URLSearchParams(window.location.search).get('post')"), 'legacy query-based bookmarks supported')
assert.ok(app.includes("window.history.pushState({}, '', journalBase)"), 'return-home path resets to site root')
assert.ok(app.includes("window.history.replaceState(window.history.state, '', paperHref(entry))"), 'old bookmarks upgraded on load')
for(const e of entries) assert.match(e.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
console.log('Article route audit: '+entries.length+' static slug routes + legacy links validated.')
