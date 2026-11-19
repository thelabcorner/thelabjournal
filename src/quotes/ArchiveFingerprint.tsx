import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowUpRight, Expand, Minus, Plus, Scan, X } from 'lucide-react'
import { ZoomPort, useZoomPort } from '@zoomport/react'
import type { Quote } from './data'
import { publishedQuotes, OWN_AUTHOR_ID, authorName } from './data'
import {
  createArchiveAtlas, projectArchiveAtlasPortrait,
  GRAPH_WIDTH, GRAPH_HEIGHT, PORTRAIT_GRAPH_WIDTH, PORTRAIT_GRAPH_HEIGHT,
  type ArchiveAtlas, type AtlasLink, type AtlasNode,
} from './archiveGraph'

const atlas = createArchiveAtlas(publishedQuotes, OWN_AUTHOR_ID)
const quotes = new Map(publishedQuotes.map(quote => [quote.id, quote]))
const PORTRAIT_BOUNDS = {x:0,y:0,width:PORTRAIT_GRAPH_WIDTH,height:PORTRAIT_GRAPH_HEIGHT}
const LANDSCAPE_BOUNDS = {x:0,y:0,width:GRAPH_WIDTH,height:GRAPH_HEIGHT}

function edgePath(link: AtlasLink, points: ReadonlyMap<string, AtlasNode>): string {
  const a = points.get(link.a)!, b = points.get(link.b)!
  const dx = b.x - a.x, dy = b.y - a.y
  const distance = Math.hypot(dx, dy) || 1
  const bend = Math.min(12, distance * .06) * (link.a < link.b ? 1 : -1)
  const middleX = (a.x+b.x)/2 - dy/distance*bend
  const middleY = (a.y+b.y)/2 + dx/distance*bend
  return 'M'+a.x.toFixed(2)+' '+a.y.toFixed(2)+' Q'+middleX.toFixed(2)+' '+middleY.toFixed(2)+' '+b.x.toFixed(2)+' '+b.y.toFixed(2)
}

function textPreview(quote: Quote): string {
  const flat = quote.text.replace(/\s+/g,' ').trim()
  return flat.length > 145 ? flat.slice(0, 142).trimEnd() + '…' : flat
}

interface CanvasProps {
  graph: ArchiveAtlas
  portrait: boolean
  selected: string | null
  setSelected: (id: string | null) => void
  roving: number
  setRoving: (index: number) => void
  svgRef: RefObject<SVGSVGElement | null>
  nodesRef: RefObject<(SVGGElement | null)[]>
  onQuote: (quote: Quote) => void
}

function AtlasCanvas({graph, portrait, selected, setSelected, roving, setRoving, svgRef, nodesRef, onQuote}: CanvasProps) {
  const points = useMemo(() => new Map(graph.nodes.map(point => [point.id, point])), [graph])
  const connected = useMemo(() => {
    const neighbors = new Set<string>()
    if (selected) {
      neighbors.add(selected)
      for (const link of graph.links) {
        if (link.a === selected) neighbors.add(link.b)
        if (link.b === selected) neighbors.add(link.a)
      }
    }
    return neighbors
  }, [graph, selected])

  const onNodeKey = (event: KeyboardEvent<SVGGElement>, index: number, quote: Quote) => {
    let next: number
    switch(event.key) {
      case 'ArrowRight':
      case 'ArrowDown': next = (index + 1) % graph.nodes.length; break
      case 'ArrowLeft':
      case 'ArrowUp': next = (index + graph.nodes.length - 1) % graph.nodes.length; break
      case 'Home': next = 0; break
      case 'End': next = graph.nodes.length - 1; break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (portrait) setSelected(quote.id)
        else onQuote(quote)
        return
      default: return
    }
    event.preventDefault()
    setRoving(next)
    setSelected(graph.nodes[next].id)
    nodesRef.current[next]?.focus()
  }

  const artwork = <>
    <title>Quotations connected only when they share archived themes</title>
    <path className="quotes-atlas-dither" d={graph.ditherPath} aria-hidden="true"/>
    <g className="quotes-atlas-links" aria-hidden="true">
      {graph.links.map(link => <path key={link.a+':'+link.b} d={edgePath(link,points)}
        className={selected ? (link.a===selected || link.b===selected ? 'is-connected' : 'is-muted') : ''}
        strokeWidth={link.primary ? 1.05 : .66}/>)}
    </g>
    <g className="quotes-atlas-current" aria-hidden="true">
      {graph.links.filter((link,index)=>link.primary && index%13===4).slice(0,7).map((link,index) =>
        <path key={link.a+':'+link.b} d={edgePath(link,points)}
          style={{animationDuration:(13+index*1.8)+'s',animationDelay:'-'+(index*2.2)+'s'}}/>)}
    </g>
    <g className="quotes-atlas-nodes">
      {graph.nodes.map((node,index) => {
        const quote = quotes.get(node.id)!
        const focused = selected===node.id
        return <g key={node.id} data-quote-id={node.id} role={portrait ? 'button' : 'link'}
          aria-pressed={portrait ? focused : undefined}
          className={'quotes-atlas-node'+(focused ? ' is-selected' : '')+(selected && !connected.has(node.id) ? ' is-muted' : '')}
          tabIndex={roving===index ? 0 : -1}
          ref={element => {nodesRef.current[index] = element}}
          aria-label={(portrait ? 'Inspect quotation: ' : '')+textPreview(quote)+' — '+authorName(quote.authorId)}
          onFocus={() => {if (!portrait) setSelected(node.id);setRoving(index)}}
          onBlur={() => { if (!portrait) setSelected(null) }}
          onMouseEnter={() => {if (!portrait) setSelected(node.id)}}
          onKeyDown={event => onNodeKey(event,index,quote)}
          onClick={() => portrait ? setSelected(node.id) : onQuote(quote)}>
          <circle className="quotes-atlas-hit" cx={node.x} cy={node.y} r={portrait ? 15 : 12}/>
          {focused && <circle className="quotes-atlas-focus" cx={node.x} cy={node.y} r={node.radius+7}/>}
          <circle className="quotes-atlas-dot" cx={node.x} cy={node.y}
            r={node.collected ? node.radius+.7 : node.radius}
            fill={node.collected ? 'var(--background)' : 'currentColor'}
            stroke={node.collected ? 'currentColor' : 'none'}
            strokeWidth={node.collected ? 1.4 : 0}/>
        </g>
      })}
    </g>
  </>

  const a11yLabel = graph.quoteCount+' quotations in one '+(portrait ? 'portrait' : 'landscape')+
    ' network. Arrow keys move between entries; '+(portrait ? 'Enter selects; use Read entry to open.' : 'Enter opens the focused quotation.')
  return portrait ?
    <ZoomPort.SVGViewport ref={svgRef} className="quotes-atlas-svg" role="group"
      aria-label={a11yLabel}>
      {artwork}
    </ZoomPort.SVGViewport> :
    <svg ref={svgRef} className="quotes-atlas-svg"
      viewBox={'0 0 '+GRAPH_WIDTH+' '+GRAPH_HEIGHT} role="group"
      aria-label={a11yLabel} preserveAspectRatio="xMidYMid meet"
      onMouseLeave={() => setSelected(null)}>{artwork}</svg>
}

function PortraitCamera({graph, bounds, selected, setSelected, roving, setRoving, svgRef, nodesRef, onQuote}:
  Omit<CanvasProps,'portrait'> & {bounds: typeof PORTRAIT_BOUNDS}) {
  const engine = useZoomPort()
  const viewportRef = useRef<HTMLDivElement|null>(null)
  const downPointers = useRef(new Set<number>())
  const pendingTap = useRef<{pointerId:number,quoteId:string,x:number,y:number}|null>(null)
  const fit = () => engine.fit(bounds,24,false)

  // ZoomPort captures pointers on the viewport so the final synthetic click
  // can be retargeted away from a child SVG node. Identify taps in the capture
  // phase, then commit only on release without drag or a second pointer.
  // Camera pan/pinch ownership remains entirely with ZoomPort.
  const onDown = (event:ReactPointerEvent<HTMLDivElement>) => {
    downPointers.current.add(event.pointerId)
    if (downPointers.current.size !== 1 || (event.pointerType === 'mouse' && event.button !== 0)) {
      pendingTap.current = null
      return
    }
    const target = event.target instanceof Element ? event.target.closest('[data-quote-id]') : null
    const quoteId = target?.getAttribute('data-quote-id')
    pendingTap.current = quoteId ? {pointerId:event.pointerId,quoteId,x:event.clientX,y:event.clientY} : null
  }
  const onMove = (event:ReactPointerEvent<HTMLDivElement>) => {
    const tap = pendingTap.current
    if (tap && tap.pointerId === event.pointerId &&
        Math.hypot(event.clientX - tap.x,event.clientY - tap.y) > 9) pendingTap.current = null
  }
  const onUp = (event:ReactPointerEvent<HTMLDivElement>) => {
    downPointers.current.delete(event.pointerId)
    const tap = pendingTap.current
    pendingTap.current = null
    if (tap && tap.pointerId === event.pointerId && downPointers.current.size === 0 &&
        Math.hypot(event.clientX - tap.x,event.clientY - tap.y) <= 9) setSelected(tap.quoteId)
  }
  const onCancel = (event:ReactPointerEvent<HTMLDivElement>) => {
    downPointers.current.delete(event.pointerId)
    pendingTap.current = null
  }

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    let initialized = false
    const measure = () => {
      const {clientWidth:width,clientHeight:height} = viewport
      if (!width || !height) return
      engine.setViewport(width,height)
      if (!initialized) { initialized = true; fit() }
    }
    measure()
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    resize?.observe(viewport)
    return () => resize?.disconnect()
  }, [engine])

  return <div className="quotes-atlas-zoom-area">
    <ZoomPort.Viewport ref={viewportRef} className="quotes-atlas-camera"
      aria-label="Thought atlas: drag to pan, pinch to zoom, or use the zoom controls"
      onPointerDownCapture={onDown} onPointerMove={onMove}
      onPointerUp={onUp} onPointerCancel={onCancel}>
      <AtlasCanvas graph={graph} portrait selected={selected} setSelected={setSelected}
        roving={roving} setRoving={setRoving} svgRef={svgRef} nodesRef={nodesRef} onQuote={onQuote}/>
    </ZoomPort.Viewport>
    <div className="quotes-atlas-camera-controls" aria-label="Atlas zoom controls">
      <button type="button" aria-label="Zoom in" onClick={() => engine.zoomBy(1.4)}><Plus size={16}/></button>
      <button type="button" aria-label="Zoom out" onClick={() => engine.zoomBy(1/1.4)}><Minus size={16}/></button>
      <button type="button" aria-label="Fit entire atlas" onClick={fit}><Scan size={16}/></button>
    </div>
  </div>
}

function AtlasCaption({selected}: {selected: string | null}) {
  const current = selected ? quotes.get(selected) : null
  return <figcaption className="quotes-atlas-caption">
    {current ? <>
      <span className="quotes-atlas-active-quote">“{textPreview(current)}”</span>
      <span>{authorName(current.authorId)} · Select to read</span>
    </> : <>
      <span>Every point is a quotation. Connections indicate exact shared themes.</span>
      <span className="quotes-atlas-legend">
        <i className="quotes-atlas-legend-solid"/> Original
        <i className="quotes-atlas-legend-ring"/> Collected
      </span>
    </>}
  </figcaption>
}

/**
 * Desktop retains the existing atlas. On phones, Expand opens a portrait
 * reprojection between the journal's global header and its bottom tabbar.
 * The bottom tabbar remains mounted, visible and interactive at all times.
 */
export function ArchiveFingerprint({onQuote}: {onQuote:(quote:Quote)=>void}) {
  const [expanded,setExpanded] = useState(false)
  // In a short landscape phone viewport the portrait projection shrinks all
  // 83 nodes. Reuse the existing deterministic landscape graph instead.
  const [landscape,setLandscape] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px) and (orientation: landscape)').matches)
  const [selected,setSelected] = useState<string|null>(null)
  const [roving,setRoving] = useState(0)
  const [inView,setInView] = useState(false)
  const inlineSvg = useRef<SVGSVGElement|null>(null)
  const expandedSvg = useRef<SVGSVGElement|null>(null)
  const inlineNodes = useRef<(SVGGElement|null)[]>([])
  const expandedNodes = useRef<(SVGGElement|null)[]>([])
  const expandButton = useRef<HTMLButtonElement|null>(null)
  const closeButton = useRef<HTMLButtonElement|null>(null)
  // The portrait dither/coordinates are calculated only if the user expands.
  const portraitCache = useRef<ArchiveAtlas|null>(null)
  if (expanded && !landscape && !portraitCache.current) portraitCache.current = projectArchiveAtlasPortrait(atlas)
  const expandedGraph = expanded ? (landscape ? atlas : portraitCache.current) : null
  const expandedBounds = landscape ? LANDSCAPE_BOUNDS : PORTRAIT_BOUNDS

  useEffect(() => {
    const orientation = window.matchMedia('(max-width: 767px) and (orientation: landscape)')
    const sync = () => setLandscape(orientation.matches)
    orientation.addEventListener('change',sync)
    return () => orientation.removeEventListener('change',sync)
  }, [])

  useEffect(() => {
    const svg = inlineSvg.current
    if (!svg) return
    if (typeof IntersectionObserver==='undefined') {setInView(true);return}
    const observer = new IntersectionObserver(
      entries => setInView(entries[0]?.isIntersecting ?? false),{rootMargin:'120px'})
    observer.observe(svg)
    return () => observer.disconnect()
  }, [])

  const close = () => {
    setExpanded(false)
    setSelected(null)
    window.requestAnimationFrame(() => expandButton.current?.focus())
  }

  useEffect(() => {
    if (!expanded) return
    const bodyOverflow = document.body.style.overflow
    const rootOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    window.requestAnimationFrame(() => closeButton.current?.focus())
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {event.preventDefault();close()}
    }
    const handleRoute = () => setExpanded(false)
    const media = window.matchMedia('(max-width: 767px)')
    const handleResize = () => {if (!media.matches) setExpanded(false)}
    window.addEventListener('keydown',handleEscape)
    window.addEventListener('popstate',handleRoute)
    media.addEventListener('change',handleResize)
    return () => {
      document.body.style.overflow = bodyOverflow
      document.documentElement.style.overflow = rootOverflow
      window.removeEventListener('keydown',handleEscape)
      window.removeEventListener('popstate',handleRoute)
      media.removeEventListener('change',handleResize)
    }
  }, [expanded])

  const openQuote = (quote:Quote) => {
    setExpanded(false)
    onQuote(quote)
  }

  return <>
    <figure className={'quotes-fingerprint'+(inView && !expanded ? ' is-visible' : '')}
      aria-label="Connected ideas archive diagram">
      <div className="quotes-fingerprint-top">
        <span>Thought atlas <span aria-hidden="true">/</span> Shared themes</span>
        <div className="quotes-atlas-top-actions">
          <span>{atlas.quoteCount} points <span aria-hidden="true">·</span> {atlas.links.length} connections</span>
          <button type="button" ref={expandButton} className="quotes-atlas-expand"
            aria-haspopup="dialog" aria-expanded={expanded} aria-label="Expand thought atlas to portrait view"
            onClick={() => {setSelected(null);setExpanded(true)}}>
            <Expand size={14} aria-hidden="true"/> <span>Expand</span>
          </button>
        </div>
      </div>
      <div className="quotes-atlas-stage">
        <AtlasCanvas graph={atlas} portrait={false} selected={selected}
          setSelected={setSelected} roving={roving} setRoving={setRoving}
          svgRef={inlineSvg} nodesRef={inlineNodes} onQuote={onQuote}/>
        <div className="quotes-atlas-coordinate" aria-hidden="true">NCM / 001–{String(atlas.quoteCount).padStart(3,'0')}</div>
      </div>
      <AtlasCaption selected={selected}/>
    </figure>

    {expanded && expandedGraph && typeof document!=='undefined' && createPortal(
      <section className="quotes-atlas-viewport" role="dialog" aria-modal="false"
        aria-label="Expanded thought atlas">
        <div className="quotes-atlas-viewport-header">
          <button type="button" className="quotes-atlas-viewport-back"
            onClick={close} aria-label="Return to Quotes">
            <ArrowLeft size={17} aria-hidden="true"/> Quotes
          </button>
          <span className="quotes-atlas-viewport-title">
            Thought atlas <span className="quotes-atlas-viewport-count">{expandedGraph.quoteCount}</span>
          </span>
          <button type="button" ref={closeButton} className="quotes-atlas-viewport-close"
            onClick={close} aria-label="Close expanded atlas"><X size={18} aria-hidden="true"/></button>
        </div>
        <figure className="quotes-fingerprint quotes-fingerprint--portrait is-visible">
          <div className="quotes-atlas-interactive-stage">
            <ZoomPort.Root key={landscape ? 'atlas-landscape' : 'atlas-portrait'}
              minScale={.25} maxScale={5}
              bounds={expandedBounds}
              centerWhenSmaller
              enablePan enablePinch enableInertia
              wheelMode="zoom" wheelAtBounds="capture"
              pointerMoveScheduling="frame"
              clickDistance={9} suppressClickOnDrag>
              <PortraitCamera graph={expandedGraph} bounds={expandedBounds} selected={selected} setSelected={setSelected}
                roving={roving} setRoving={setRoving}
                svgRef={expandedSvg} nodesRef={expandedNodes} onQuote={openQuote}/>
            </ZoomPort.Root>
           </div>
           <div className={'quotes-atlas-inspector'+(selected ? ' has-selection' : '')} aria-live="polite">
             {selected && quotes.get(selected) ? <>
               <div className="quotes-atlas-inspector-heading">
                 <span title={'Selected quotation / '+authorName(quotes.get(selected)!.authorId)}
                   aria-label={'Selected quotation by '+authorName(quotes.get(selected)!.authorId)}>
                   {authorName(quotes.get(selected)!.authorId)}
                 </span>
                 <div className="quotes-atlas-inspector-actions">
                   <button type="button" className="quotes-atlas-inspector-read"
                     onClick={() => openQuote(quotes.get(selected)!)}>
                     Read entry <ArrowUpRight size={15} aria-hidden="true"/>
                   </button>
                   <button type="button" className="quotes-atlas-inspector-clear"
                     aria-label="Clear selected quotation" onClick={() => setSelected(null)}>
                     <X size={15} aria-hidden="true"/>
                   </button>
                 </div>
               </div>
               <p>“{textPreview(quotes.get(selected)!) }”</p>
             </> : <>
               <div className="quotes-atlas-inspector-empty">
                 <span>Tap a point to inspect</span>
               </div>
              <div className="quotes-atlas-portrait-legend">
                <i className="quotes-atlas-legend-solid"/> Original
                <i className="quotes-atlas-legend-ring"/> Collected
              </div>
            </>}
          </div>
        </figure>
      </section>,
      document.body
    )}
  </>
}
