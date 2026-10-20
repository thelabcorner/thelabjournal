import { useEffect, useRef, type KeyboardEvent, type ReactNode, type RefObject } from 'react'

/**
 * Journal ScrollView — a native scrollport with shadcn-style overlay chrome.
 * The browser owns wheel, touch, scroll anchoring and momentum; only the
 * scrollbar presentation is custom. No per-scroll React reconciliation.
 */
export function ScrollView({ children, className = '', viewportRef, id, role, label }: {
  children: ReactNode
  className?: string
  viewportRef?: RefObject<HTMLDivElement | null>
  id: string
  role?: 'listbox' | 'region'
  label: string
}) {
  const root = useRef<HTMLDivElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLDivElement>(null)
  const drag = useRef<number | null>(null)
  const measure = useRef({ travel: 0, maxScroll: 0, thumbHeight: 0 })
  useEffect(() => {
    const host = root.current
    const pane = viewport.current
    const inner = content.current
    const slider = track.current
    const handle = thumb.current
    if (!host || !pane || !inner || !slider || !handle) return
    let raf = 0
    const paint = () => {
      const { maxScroll, travel } = measure.current
      const y = maxScroll > 0 ? (pane.scrollTop / maxScroll) * travel : 0
      handle.style.transform = `translate3d(0,${Math.max(0, Math.min(travel, y))}px,0)`
      slider.setAttribute('aria-valuenow', String(Math.round(pane.scrollTop)))
    }
    const resize = () => {
      const height = slider.clientHeight
      const maxScroll = Math.max(0, pane.scrollHeight - pane.clientHeight)
      const thumbHeight = maxScroll ? Math.min(height, Math.max(28, (height * pane.clientHeight) / pane.scrollHeight)) : height
      measure.current = { maxScroll, thumbHeight, travel: Math.max(0, height - thumbHeight) }
      host.dataset.scrollable = maxScroll > 1 ? 'true' : 'false'
      handle.style.height = `${thumbHeight}px`
      slider.setAttribute('aria-valuemax', String(Math.ceil(maxScroll)))
      paint()
    }
    const schedule = () => {
      if (raf) return
      raf = requestAnimationFrame(() => { raf = 0; paint() })
    }
    const observer = new ResizeObserver(resize)
    observer.observe(pane)
    observer.observe(inner)
    observer.observe(slider)
    pane.addEventListener('scroll', schedule, { passive: true })
    resize()
    return () => {
      observer.disconnect()
      pane.removeEventListener('scroll', schedule)
      cancelAnimationFrame(raf)
    }
  }, [])
  const scrollAt = (clientY: number, offset: number) => {
    const slider = track.current
    const pane = viewport.current
    if (!slider || !pane) return
    const { maxScroll, travel } = measure.current
    const fraction = travel ? Math.max(0, Math.min(1, (clientY - slider.getBoundingClientRect().top - offset) / travel)) : 0
    pane.scrollTop = maxScroll * fraction
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const pane = viewport.current
    if (!pane) return
    const shift = event.key === 'ArrowDown' ? 48 : event.key === 'ArrowUp' ? -48 :
      event.key === 'PageDown' ? pane.clientHeight * .88 : event.key === 'PageUp' ? -pane.clientHeight * .88 : null
    if (shift !== null) { event.preventDefault(); pane.scrollTop += shift }
    else if (event.key === 'Home') { event.preventDefault(); pane.scrollTop = 0 }
    else if (event.key === 'End') { event.preventDefault(); pane.scrollTop = pane.scrollHeight }
  }
  return <div ref={root} className={`journal-scrollview ${className}`} data-scrollable="false">
    <div id={id} ref={node => { viewport.current = node; if (viewportRef) viewportRef.current = node }}
      role={role} aria-label={label} className="journal-scrollview-viewport">
      <div ref={content} className="journal-scrollview-content">{children}</div>
    </div>
    <div ref={track} role="scrollbar" aria-label={label + ' scrollbar'} aria-controls={id}
      aria-orientation="vertical" aria-valuemin={0} aria-valuemax={0} aria-valuenow={0}
      tabIndex={0} onKeyDown={onKeyDown}
      onPointerDown={event => {
        if (event.button !== 0 || measure.current.maxScroll < 1) return
        const handle = thumb.current
        const rect = handle?.getBoundingClientRect()
        drag.current = rect && rect.top <= event.clientY && event.clientY <= rect.bottom
          ? event.clientY - rect.top : measure.current.thumbHeight / 2
        event.currentTarget.setPointerCapture(event.pointerId)
        scrollAt(event.clientY, drag.current)
        event.preventDefault()
      }}
      onPointerMove={event => { if (drag.current !== null) scrollAt(event.clientY, drag.current) }}
      onPointerUp={event => { drag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) }}
      onPointerCancel={() => { drag.current = null }}
      className="journal-scrollview-track"><div ref={thumb} className="journal-scrollview-thumb"/></div>
  </div>
}
