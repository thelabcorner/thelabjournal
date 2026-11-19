/** Synthetic fixtures exercise quote semantics without publishing fabricated text. */
import assert from 'node:assert/strict'
import { quoteAuthors, quoteRegistry, validateQuotes, OWN_AUTHOR_ID } from '../src/quotes/data.ts'
import { buildSpotlightIndex, searchSpotlight, spotlightSuggestions } from '../src/lib/spotlightIndex.ts'
import { makeArtwork } from './quote-pages.mjs'

const others = [...quoteAuthors, { id: 'test-author', name: 'Test Author' }]
const mine = {
  id: 'my-exact-quote', text: 'A precise observation about nucleation and dissolution.',
  authorId: OWN_AUTHOR_ID, addedAt: '2026-10-24', status: 'published',
  themes: ['Chemistry'],
}
const collected = {
  id: 'collected-quote', text: 'Testing collection identity and provenance.',
  authorId: 'test-author', addedAt: '2026-10-20', status: 'published',
  themes: ['Engineering'],
  source: { kind: 'book', title: 'Synthetic Book', verification: 'primary', locator: 'p. 11', url: 'https://example.com/source' },
}
const group = { id: 'test-collection', title: 'Ideas in context', quoteIds: [collected.id, mine.id], status: 'published' }
const check = (authors, quotes, collections) => validateQuotes(authors, quotes, collections)
check(others, [mine,collected], [group])
// Interpretive notes are not part of the quote registry: the reader interprets
// the quotation. Attribution and verification remain separate source metadata.
const uniqueWording = new Map()
const muskQuote = quoteRegistry.find(quote => quote.id === 'my-mind-is-a-storm')
assert(muskQuote, 'Shared Elon Musk quotation is present')
assert.equal(muskQuote.authorId, 'elon-musk', 'Shared quotation must not be misattributed to the journal author')
assert.equal(muskQuote.source?.verification, 'primary', 'Musk quotation has a primary-source citation')
assert.match(muskQuote.source?.url ?? '', /lexfridman\.com\/elon-musk-4-transcript/, 'Musk original interview is cited')
const vanGoghQuote = quoteRegistry.filter(quote => quote.id === 'van-gogh-great-fire-within-me')
assert.equal(vanGoghQuote.length, 1, 'Van Gogh great-fire passage must exist only once')
assert.equal(vanGoghQuote[0].authorId, 'vincent-van-gogh', 'Van Gogh authorship must be explicit')
assert.match(vanGoghQuote[0].source?.url ?? '', /vangoghletters\.org\/vg\/letters\/let155\/letter\.html/, 'Source must point to the original letter')
assert.match(vanGoghQuote[0].source?.locator ?? '', /adaptation/i, 'Do not represent the modern wording as a verbatim original')
// The owner's latest selections are an authorship-sensitive archive update.
// Sharing/collecting an external passage must never make it the owner's words.
const recentOriginals = [
  'defensive-about-being-defensive',
  'rationalization-as-logical-mask',
  'ambition-predates-rewards',
  'lock-yourself-in-a-cage',
  'coincidental-bitterisms',
  'apprehensive-toward-epistemology',
  'cave-ascent-social-cost',
  'losing-holds-more-data',
  'everything-because-i-was',
  'double-pendulums-swanging',
  'justification-as-avoidance',
  'justify-dream-versus-delusion',
]
const recentCollected = new Map([
  ['homer-bitter-experiences', 'homer'],
  ['burning-blamed-for-ashes', 'unknown-author'],
  ['lil-wayne-running-with-it', 'lil-wayne'],
  ['wiz-khalifa-we-all-stunt', 'wiz-khalifa'],
  ['ramanujan-fear-of-delusion', 'unknown-author'],
  ['apple-heres-to-crazy-ones', 'apple-think-different'],
  ['jack-stauber-pup-three-words', 'jack-stauber'],
  ['jack-stauber-rain-awning', 'jack-stauber'],
])
for (const id of recentOriginals) {
  const matches = quoteRegistry.filter(quote => quote.id === id)
  assert.equal(matches.length, 1, 'Original quotation must be present once: ' + id)
  assert.equal(matches[0].authorId, OWN_AUTHOR_ID, 'Personal authorship must be preserved: ' + id)
}
for (const [id, authorId] of recentCollected) {
  const matches = quoteRegistry.filter(quote => quote.id === id)
  assert.equal(matches.length, 1, 'Collected quotation must be present once: ' + id)
  assert.equal(matches[0].authorId, authorId, 'Collected attribution must be preserved: ' + id)
  assert(matches[0].source, 'Collected quotation must include provenance: ' + id)
}
const bionicWayneQuote = quoteRegistry.filter(quote => quote.id === 'lil-wayne-beyond-beautiful')
assert.equal(bionicWayneQuote.length, 1, 'Lil Wayne Every Girl excerpt must not be duplicated')
assert.equal(bionicWayneQuote[0].authorId, 'lil-wayne', 'Shared lyric must not be credited to the journal author')
assert.match(bionicWayneQuote[0].source?.title ?? '', /Every Girl/, 'The original song must be identified')
for (const id of ['burning-blamed-for-ashes', 'ramanujan-fear-of-delusion']) {
  assert.equal(quoteRegistry.find(quote => quote.id === id)?.source?.verification,
    'unverified', 'Unsupported attributions must not be certified: ' + id)
}
assert.equal(quoteRegistry.find(quote => quote.id === 'double-pendulums-swanging')?.text,
  "we're all just double pendulums swanging", "Do not editorially correct the author's original phrasing")
for (const quote of quoteRegistry) {
  assert.equal('curationNote' in quote, false, 'Interpretive note must not be published: ' + quote.id)
  const normalized = quote.text.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim()
  assert(!uniqueWording.has(normalized), 'Duplicate quotation content: ' + quote.id + ' versus ' + uniqueWording.get(normalized))
  uniqueWording.set(normalized, quote.id)
  assert(!/facebook\.com|fbcdn\.net|fb\.com/i.test(quote.source?.url ?? ''), 'Facebook source URL must not be published: ' + quote.id)
}
const invalid = (q, reason) => assert.throws(() => check(others, q, [group]), /./, reason)
invalid([mine,mine,collected], 'duplicate quote ID')
invalid([mine,{...collected,authorId:'not-in-registry'}], 'missing author')
invalid([mine,{...collected,source:undefined}], 'unattributed sourced quote')
invalid([mine,{...collected,curationNote:'What this quote means'}], 'interpretive commentary is disallowed')
invalid([mine,{...collected,source:{ ...collected.source, url:'javascript:alert(1)' }}], 'unsafe source URL')
invalid([mine,{...collected,addedAt:'2026-02-31'}], 'invalid calendar date')
invalid([mine,{...collected,relatedWorks:['javascript:alert(1)']}], 'unsafe related work path')
assert.throws(() => check(others,[mine,{...collected,status:'draft'}],[group]), /draft/, 'draft quote in published collection')
assert.throws(() => check(others,[mine,collected],[{...group,quoteIds:[mine.id,mine.id]}]), /Duplicate/, 'duplicate membership')
assert.throws(() => check(others,[mine,collected],[{...group,quoteIds:['unknown-quote']}]), /Missing quote/, 'unknown membership')
const index = buildSpotlightIndex([], [], [mine,collected], [group])
assert.equal(index.filter(x => x.kind === 'quotes').length, 3)
assert.equal(searchSpotlight(index, 'nucleation').at(0)?.record.quote?.id, mine.id)
assert.equal(searchSpotlight(index, 'synthetic test-only curation').length, 0, 'Interpretive note must not be indexed')
assert.equal(searchSpotlight(index, 'Test Author', 'quotes').at(0)?.record.quote?.id, collected.id)
assert.equal(searchSpotlight(index, 'Ideas in context').at(0)?.record.collection?.id, group.id)
assert.equal(searchSpotlight(index, 'nucleation', 'manuscripts').length, 0)
assert.equal(spotlightSuggestions(index,['quote:my-exact-quote'],'all')[0]?.record.quote?.id,mine.id)
assert.equal(searchSpotlight(index,'quotes').some(x => x.record.action === 'quotes'),true)
const rendered = await makeArtwork(collected)
assert(rendered.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])), 'social image is a real PNG')
assert(rendered.byteLength > 1000, 'rendered social asset is nonempty')
console.log('Quotes: integrity, source provenance, collection identity and Spotlight tests passed.')
