import assert from 'node:assert/strict'
import { entries, topics } from '../src/data.ts'
import { compareArchiveEntries } from '../src/lib/archiveSort.ts'

const subjectOrder = topics.filter((topic) => topic !== 'All')
const sorted = (mode) => [...entries].sort((a, b) => compareArchiveEntries(a, b, mode))

for (const mode of ['subject', 'recent', 'short', 'long']) {
  const result = sorted(mode)
  assert.equal(result.length, entries.length, mode + ' preserves all entries')
  assert.equal(new Set(result.map((entry) => entry.slug)).size, entries.length, mode + ' contains no duplicate entries')
  assert.deepEqual(result, [...result].sort((a, b) => compareArchiveEntries(a, b, mode)), mode + ' is sorted')
  assert.ok(result.every((entry, index) => index === 0 || compareArchiveEntries(result[index - 1], entry, mode) <= 0), mode + ' comparator is ordered')
}

const bySubject = sorted('subject')
assert.deepEqual([...new Set(bySubject.map((entry) => entry.topic))], subjectOrder.filter((topic) => entries.some((entry) => entry.topic === topic)))
for (const subject of subjectOrder) {
  const dates = bySubject.filter((entry) => entry.topic === subject).map((entry) => entry.date)
  assert.deepEqual(dates, [...dates].sort((a, b) => b.localeCompare(a)), subject + ' shows newest first')
}
assert.ok(sorted('recent').every((entry, index, all) => index === 0 || all[index - 1].date >= entry.date))
assert.ok(sorted('short').every((entry, index, all) => index === 0 || all[index - 1].minutes <= entry.minutes))
assert.ok(sorted('long').every((entry, index, all) => index === 0 || all[index - 1].minutes >= entry.minutes))

console.log('Archive sort: subject grouping, chronology, reading-length sorts and full entry coverage passed.')