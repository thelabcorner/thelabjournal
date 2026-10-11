import { mkdir, writeFile } from 'node:fs/promises'
import { firstPost } from '../src/first-post'
import { agentToolsPost } from '../src/agent-tools-post'

const quote = (s: string) => JSON.stringify(s)
for (const post of [firstPost, agentToolsPost]) {
  const lines = [
    '---',
    'title: ' + quote(post.title),
    'date: ' + post.date,
    'author: "Jackson Cummings"',
    'status: draft',
    'slug: ' + post.slug,
    'category: ' + quote(post.topic),
    'summary: ' + quote(post.summary),
    'tags: [' + post.keywords.map(quote).join(', ') + ']',
    '---',
    '',
    '# ' + post.title,
    '',
    post.summary,
    '',
  ]
  for (const section of post.sections) {
    lines.push('## ' + section.heading, '')
    for (const text of section.paragraphs) lines.push(text, '')
    if (section.takeaway) lines.push('> ' + section.takeaway, '')
  }
  await mkdir('content/drafts', { recursive: true })
  const target = 'content/drafts/' + post.slug + '.md'
  await writeFile(target, lines.join('\n'), 'utf8')
  console.log('Wrote ' + target + ' (' + post.sections.length + ' sections)')
}
