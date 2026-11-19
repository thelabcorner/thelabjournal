import type { Quote } from './data'

/**
 * Reprojects the exact same nodes and connections into a tall mobile
 * coordinate system. Uniform circular node geometry is preserved (rather
 * than applying an anisotropic SVG transform that makes dots elliptical).
 * This is a display projection, not a second graph layout or new clustering.
 */
export function projectArchiveAtlasPortrait(atlas: ArchiveAtlas): ArchiveAtlas {
  if (!atlas.nodes.length) return { ...atlas, ditherPath: '' }
  const minX = Math.min(...atlas.nodes.map(node => node.x))
  const maxX = Math.max(...atlas.nodes.map(node => node.x))
  const minY = Math.min(...atlas.nodes.map(node => node.y))
  const maxY = Math.max(...atlas.nodes.map(node => node.y))
  const insetX = 30
  const insetY = 34
  const nodes = atlas.nodes.map(node => ({
    ...node,
    x: insetX + ((node.y - minY) / (maxY - minY || 1)) * (PORTRAIT_GRAPH_WIDTH - 2 * insetX),
    y: insetY + ((maxX - node.x) / (maxX - minX || 1)) * (PORTRAIT_GRAPH_HEIGHT - 2 * insetY),
  }))
  return {
    ...atlas,
    nodes,
    ditherPath: createOrderedDitherSized(nodes, atlas.links, PORTRAIT_GRAPH_WIDTH, PORTRAIT_GRAPH_HEIGHT),
  }
}

function createOrderedDitherSized(nodes:readonly AtlasNode[], links:readonly AtlasLink[], width:number, height:number):string {
  const STEP = 4.4
  const cols = Math.ceil(width / STEP), rows = Math.ceil(height / STEP)
  const density = new Float32Array(cols * rows)
  const stamp = (x:number, y:number, reach:number, power:number) => {
    const x0 = Math.max(0, Math.floor((x-reach)/STEP)), x1 = Math.min(cols-1,Math.ceil((x+reach)/STEP))
    const y0 = Math.max(0, Math.floor((y-reach)/STEP)), y1 = Math.min(rows-1,Math.ceil((y+reach)/STEP))
    const r2 = reach * reach
    for (let cy=y0; cy<=y1; cy++) for (let cx=x0; cx<=x1; cx++) {
      const dx=(cx+.5)*STEP-x, dy=(cy+.5)*STEP-y
      const d2=dx*dx+dy*dy
      if (d2 < r2) density[cy*cols+cx] += power * (1-d2/r2)**2
    }
  }
  for (const node of nodes) stamp(node.x,node.y,36+node.degree*2,.7+node.degree*.065)
  const byId = new Map(nodes.map(node => [node.id,node]))
  for (const edge of links) {
    const a=byId.get(edge.a)!, b=byId.get(edge.b)!
    const count=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/13))
    for (let j=1;j<count;j++) {
      const t=j/count
      stamp(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,12,edge.primary?.085:.043)
    }
  }
  const marks:string[]=[]
  for (let y=0;y<rows;y++) for (let x=0;x<cols;x++) {
    const amount=Math.min(.76,density[y*cols+x]*.68)
    if (amount <= (BAYER[(y%8)*8+(x%8)]+.5)/64) continue
    const px=(x*STEP+1.2).toFixed(1), py=(y*STEP+1.2).toFixed(1)
    marks.push('M'+px+' '+py+'h1.8v1.8h-1.8z')
  }
  return marks.join('')
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
export const GRAPH_WIDTH = 1080
export const GRAPH_HEIGHT = 365
export const PORTRAIT_GRAPH_WIDTH = 390
export const PORTRAIT_GRAPH_HEIGHT = 700

function hashId(id: string): number {
  let value = 2166136261
  for (let i = 0; i < id.length; i++) value = Math.imul(value ^ id.charCodeAt(i), 16777619)
  return value >>> 0
}

export interface AtlasNode {
  id: string
  x: number
  y: number
  radius: number
  collected: boolean
  degree: number
}

export interface AtlasLink {
  a: string
  b: string
  shared: number
  strength: number
  primary: boolean
}

export interface ArchiveAtlas {
  nodes: AtlasNode[]
  links: AtlasLink[]
  ditherPath: string
  quoteCount: number
  isolatedCount: number
}

/**
 * A SINGLE archival network, not six fabricated semantic neighborhoods.
 *
 * Edges require exact common human-assigned theme tags. Rare shared themes
 * receive higher weights. A maximum spanning forest preserves connectivity
 * wherever themes support it; extra edges add modest redundancy. Positions
 * are computed once via a seeded, bounded force simulation. No real-time
 * layout loop, no edge clamping, no generated network that changes on refresh.
 */
export function createArchiveAtlas(quotes: readonly Quote[], ownAuthorId: string): ArchiveAtlas {
  const sorted = [...quotes].sort((a,b) => a.id.localeCompare(b.id))
  const n = sorted.length
  if (!n) return {nodes: [], links: [], ditherPath: '', quoteCount: 0, isolatedCount: 0}
  const frequency = new Map<string, number>()
  for (const q of sorted) for (const t of new Set(q.themes)) frequency.set(t,(frequency.get(t) ?? 0) + 1)

  const candidates: AtlasLink[] = []
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      const intersect = sorted[a].themes.filter(t => sorted[b].themes.includes(t))
      if (!intersect.length) continue
      const weight = intersect.reduce((total,theme) => total + Math.log(1 + n / (frequency.get(theme) || n)), 0)
      candidates.push({
        a: sorted[a].id, b: sorted[b].id,
        shared: intersect.length, strength: weight, primary: false,
      })
    }
  }
  candidates.sort((a,b) => b.strength - a.strength || a.a.localeCompare(b.a) || a.b.localeCompare(b.b))

  const index = new Map(sorted.map((q,i) => [q.id,i]))
  const parent = Array.from({length:n},(_,i)=>i)
  const find = (i:number):number => parent[i] === i ? i : (parent[i] = find(parent[i]))
  const degrees = new Uint8Array(n)
  const links: AtlasLink[] = []
  const selected = new Set<string>()
  const linkKey = (l:AtlasLink) => l.a + '\u0000' + l.b

  for (const link of candidates) {
    const a = index.get(link.a)!, b = index.get(link.b)!
    const ra = find(a), rb = find(b)
    if (ra === rb || degrees[a] >= 5 || degrees[b] >= 5) continue
    parent[rb] = ra
    degrees[a]++
    degrees[b]++
    links.push({...link, primary:true})
    selected.add(linkKey(link))
  }
  const linkBudget = Math.round(n * 1.42)
  for (const link of candidates) {
    if (links.length >= linkBudget) break
    if (selected.has(linkKey(link))) continue
    const a = index.get(link.a)!, b = index.get(link.b)!
    if (degrees[a] >= 5 || degrees[b] >= 5) continue
    degrees[a]++
    degrees[b]++
    links.push({...link, primary:false})
    selected.add(linkKey(link))
  }

  const positions = sorted.map((q,i) => {
    const phase = ((hashId(q.id) % 1000) / 1000) * .15
    const theta = i * GOLDEN_ANGLE + phase
    const r = Math.sqrt((i + .55) / n) * 207
    return {
      x: Math.cos(theta) * r * 1.42,
      y: Math.sin(theta) * r * .87,
      vx: 0, vy: 0,
    }
  })

  // Static force relaxation; N~80, < 3M pair evaluations. Neither hard walls
  // nor arbitrary region centers force nodes into artificial vertical lines.
  for (let step = 0; step < 310; step++) {
    const fx = new Float64Array(n), fy = new Float64Array(n)
    for (let a = 0; a < n; a++) {
      for (let b = a + 1; b < n; b++) {
        const dx = positions[b].x - positions[a].x
        const dy = positions[b].y - positions[a].y
        const d2 = dx * dx + dy * dy + 90
        const force = 560 / (d2 * Math.sqrt(d2))
        const x = dx * force, y = dy * force
        fx[a] -= x; fy[a] -= y
        fx[b] += x; fy[b] += y
      }
    }
    for (const l of links) {
      const a = index.get(l.a)!, b = index.get(l.b)!
      const dx = positions[b].x - positions[a].x
      const dy = positions[b].y - positions[a].y
      const distance = Math.hypot(dx, dy) || .01
      const target = l.shared > 1 ? 57 : 76
      const strength = .0048 * (l.primary ? 1.12 : .48)
      const force = (distance - target) * strength / distance
      const x = dx * force, y = dy * force
      fx[a] += x; fy[a] += y
      fx[b] -= x; fy[b] -= y
    }
    for (let i=0;i<n;i++) {
      const p = positions[i]
      // Soft gravitation, not an enclosing box. Late cooling aids stability.
      const cool = Math.max(.2, 1 - step/450)
      p.vx = (p.vx + (fx[i] - p.x*.0006) * cool) * .82
      p.vy = (p.vy + (fy[i] - p.y*.0008) * cool) * .82
      p.x += p.vx
      p.y += p.vy
    }
  }

  const lowX = Math.min(...positions.map(p=>p.x)), highX = Math.max(...positions.map(p=>p.x))
  const lowY = Math.min(...positions.map(p=>p.y)), highY = Math.max(...positions.map(p=>p.y))
  const midX = (lowX+highX)/2, midY=(lowY+highY)/2
  // Preserve a single organic constellation across the entire available field.
  const scaleX = Math.min(2.2, (GRAPH_WIDTH-100)/(highX-lowX || 1))
  const scaleY = Math.min(1.6, (GRAPH_HEIGHT-62)/(highY-lowY || 1))
  const nodes:AtlasNode[] = sorted.map((q,i) => {
    const words = q.text.trim().split(/\s+/).length
    return {
      id:q.id,
      x:GRAPH_WIDTH/2 + (positions[i].x-midX)*scaleX,
      y:GRAPH_HEIGHT/2 + (positions[i].y-midY)*scaleY,
      radius: Math.min(4.1, 2.7 + Math.sqrt(Math.min(words,95)/95)*1.6),
      degree:degrees[i],
      collected:q.authorId !== ownAuthorId,
    }
  })
  return {
    nodes, links, ditherPath: createOrderedDither(nodes, links),
    quoteCount:n, isolatedCount:degrees.filter(d=>d===0).length,
  }
}

/** 8x8 Bayer ordered-dither threshold field (0..63), not blurred shadows. */
const BAYER = [
  0,48,12,60,3,51,15,63,
  32,16,44,28,35,19,47,31,
  8,56,4,52,11,59,7,55,
  40,24,36,20,43,27,39,23,
  2,50,14,62,1,49,13,61,
  34,18,46,30,33,17,45,29,
  10,58,6,54,9,57,5,53,
  42,26,38,22,41,25,37,21,
]

function createOrderedDither(nodes:readonly AtlasNode[], links:readonly AtlasLink[]):string {
  const STEP=4.4
  const cols=Math.ceil(GRAPH_WIDTH/STEP), rows=Math.ceil(GRAPH_HEIGHT/STEP)
  const density=new Float32Array(cols*rows)
  const stamp=(x:number,y:number,reach:number,power:number) => {
    const x0=Math.max(0,Math.floor((x-reach)/STEP)),x1=Math.min(cols-1,Math.ceil((x+reach)/STEP))
    const y0=Math.max(0,Math.floor((y-reach)/STEP)),y1=Math.min(rows-1,Math.ceil((y+reach)/STEP))
    const r2=reach*reach
    for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++){
      const dx=(cx+.5)*STEP-x,dy=(cy+.5)*STEP-y
      const d2=dx*dx+dy*dy
      if(d2>=r2)continue
      density[cy*cols+cx]+=power*(1-d2/r2)**2
    }
  }
  for(const p of nodes)stamp(p.x,p.y,36+p.degree*2,.7+p.degree*.065)
  const byId=new Map(nodes.map(p=>[p.id,p]))
  for(const edge of links) {
    const a=byId.get(edge.a)!,b=byId.get(edge.b)!
    const length=Math.hypot(b.x-a.x,b.y-a.y)
    const segments=Math.max(1,Math.ceil(length/13))
    for(let j=1;j<segments;j++){
      const t=j/segments
      stamp(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,12,edge.primary?.085:.043)
    }
  }
  const marks:string[]=[]
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
    const amount=Math.min(.76,density[y*cols+x]*.68)
    const threshold=(BAYER[(y%8)*8+(x%8)]+.5)/64
    if(amount<=threshold)continue
    const px=(x*STEP+1.2).toFixed(1), py=(y*STEP+1.2).toFixed(1)
    marks.push('M'+px+' '+py+'h1.8v1.8h-1.8z')
  }
  return marks.join('')
}
