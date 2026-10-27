/**
 * Standalone Diagram Design HTML/SVG source checks (no browser needed).
 * Browser geometry and typography are covered separately by the responsive
 * Playwright audit. This gate forbids the prior crossed-spline regression.
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = new URL('../public/diagrams/', import.meta.url)
const variants = [
  { name: 'portrait', size: '0 0 360 640', left: [36, 104], right: [324, 256] },
  { name: 'landscape', size: '0 0 1280 720', left: [176, 416], right: [1104, 864] },
]
const services = [
  'Native tools',
  'Existing Sessions',
  'Worker delegation',
  'MCP integrations',
  'OFXP peers',
]

for (const variant of variants) {
  const filename = 'openfork-integration-' + variant.name + '.html'
  const html = await readFile(new URL(filename, root), 'utf8')
  const error = reason => { throw Error(filename + ': ' + reason) }

  if (!html.includes('<!doctype html>') ||
      !html.includes('viewBox="' + variant.size + '"') ||
      !html.includes('role="img"') ||
      !html.includes('<title id="title">') ||
      !html.includes('<desc id="desc">'))
    error('Standalone HTML, size, or accessible SVG contract missing')

  if (html.includes('<script') || html.includes('box-shadow:'))
    error('Script or shadow found in static editorial figure')

  for (const name of services)
    if (!html.includes('>' + name + '</text>')) error('Missing service: ' + name)

  const arrows = [...html.matchAll(/<path\b[^>]*class="route"[^>]*>/g)].map(m => m[0])
  if (arrows.length !== 10) error('Expected ten independent horizontal arrows; found ' + arrows.length)

  const leftRows = new Set()
  const rightRows = new Set()
  for (const arrow of arrows) {
    const d = arrow.match(/\bd="([^"]+)"/)?.[1]
    if (!d) error('Missing SVG path geometry')
    const m = d.match(/^M(\d+) (\d+) H(\d+)$/)
    if (!m) error('Diagonal, curved, or multi-segment route: ' + d)
    const [, x1str, ystr, x2str] = m
    const x1 = Number(x1str), x2 = Number(x2str), y = Number(ystr)
    const left = x1 === variant.left[0] && x2 === variant.left[1]
    const right = x1 === variant.right[0] && x2 === variant.right[1]
    if (!left && !right) error('Incorrect caller or destination attachment: ' + d)
    const expected = left ? 'arrow-right' : 'arrow-left'
    if (!arrow.includes('marker-end="url(#' + expected + ')"'))
      error('Arrowhead misdirected for route: ' + d)
    const rows = left ? leftRows : rightRows
    if (rows.has(y)) error('Duplicate route at y=' + y)
    rows.add(y)
  }
  if (leftRows.size !== 5 || rightRows.size !== 5 ||
      [...leftRows].some(y => !rightRows.has(y)))
    error('Each capability must have exactly one OXP route and one native Session route')

  console.log(JSON.stringify({
    variant: variant.name,
    aspect: variant.name === 'portrait' ? '9:16' : '16:9',
    services: services.length,
    independentlyTraceableArrows: arrows.length,
    passed: true,
  }))
}

const component = await readFile(new URL('../src/components/InterconnectionNetwork.tsx', import.meta.url), 'utf8')
const figures = await readFile(new URL('../src/components/OXPArchitectureFigures.tsx', import.meta.url), 'utf8')
for (const variant of variants)
  if (!component.includes('diagrams/openfork-integration-' + variant.name + '.html'))
    throw Error('React integration missing ' + variant.name + ' diagram')
if (!component.includes('import.meta.env.BASE_URL') ||
    !figures.includes('ofarch-plate--integration'))
  throw Error('Responsive Vite asset-base integration is missing')

console.log('OpenFork Diagram Design integration source audit passed')
