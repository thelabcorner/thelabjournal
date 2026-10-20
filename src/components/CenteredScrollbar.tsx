import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react'

const TRACK_INSET = 9
const MIN_THUMB_HEIGHT = 38

type Geometry = { maxScroll: number; travel: number; inset: number; thumbHeight: number }

/**
 * Accessible scrollbar embedded in the right edge of the centered shell.
 * The document remains the sole scroll owner: native wheel/touch, anchors,
 * browser history and TanStack's window virtualizer all stay compatible.
 *
 * Read layout only on resize/content-size changes. Ordinary scroll frames
 * move a composited thumb using cached geometry, without measuring layout.
 */
export function CenteredScrollbar() {
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const geometry = useRef<Geometry>({ maxScroll: 0, travel: 0, inset: TRACK_INSET, thumbHeight: 0 })
  const dragOffset = useRef<number | null>(null)

  useEffect(() => {
    const track = trackRef.current
    const thumb = thumbRef.current
    if (!track || !thumb) return

    let scrollFrame = 0
    let sizeFrame = 0
    let footerDocumentTop = Number.POSITIVE_INFINITY
    let viewport = 0
    let trackTop = 0
    let lastBottom = -1
    let mobileTabbarBottom = 0
    let trackInset = TRACK_INSET
    let chromeHeight = 0
    let pendingElasticMeasure = false
    let initialized = false
    let thumbFrame = 0
    let thumbY = Number.NaN
    let targetThumbY = 0
    let lastThumbFrame = 0
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let hasMobileChrome = false
    let observedReader: HTMLElement | null = null
    let headerBottom = 0
    let lastTop = -1

    // The reading toolbar (journal) and section navigator (research) form the
    // actual top edge of the visible scrollport. The research navigator starts
    // below the breadcrumb but eventually sticks directly under the masthead.
    // Cache its document position so normal scroll frames do NOT measure layout.
    // Sticky reader chrome is already attached under the 52px masthead.
    // Its intrinsic height is stable across iOS rubber-band displacement;
    // rect.top + scrollY is not. No scroll-dependent anchor reconstruction.
    const contentTop = () => Math.ceil(headerBottom + (hasMobileChrome ? chromeHeight : 0))
    const syncTop = () => {
      if (!mobileTabbarBottom) return false
      const next = Math.min(Math.max(headerBottom, viewport - mobileTabbarBottom), contentTop())
      if (next === lastTop) return false
      lastTop = next
      track.style.top = `${next}px`
      trackTop = next
      return true
    }

    // Native window scrolling is preserved, but the chrome itself belongs to
    // the content frame. Stop its fixed track at the footer as it enters view.
    // Cache the document-space footer edge to avoid layout reads on scroll.
    const footerInset = (scrollY: number) => {
      const lowerEdge = viewport - (footerDocumentTop - scrollY)
      return Math.max(0, Math.min(Math.max(0, viewport - trackTop), lowerEdge))
    }
    const setFooterInset = (scrollY: number) => {
      // The bottom application tabs occupy a fixed mobile region. It must
      // never be included in the scroll thumb's viewport or drag surface.
      const next = Math.max(mobileTabbarBottom, Math.ceil(footerInset(scrollY)))
      if (next === lastBottom) return false
      lastBottom = next
      track.style.bottom = `${next}px`
      return true
    }

    const isElastic = (raw = window.scrollY) => mobileTabbarBottom > 0 &&
      (!Number.isFinite(raw) || raw < -1 || raw > geometry.current.maxScroll + 1)

    const placeThumb = (y: number) => {
      thumbY = y
      thumb.style.transform = 'translate3d(0,' + y + 'px,0)'
    }
    // Frame-rate-independent, non-oscillating interpolation. Exactly one
    // compositor transform per animation frame; stop when settled.
    const tickThumb = (timestamp: number) => {
      thumbFrame = 0
      if (track.dataset.elastic === 'true') { lastThumbFrame = 0; return }
      const dt = lastThumbFrame ? Math.min(50, Math.max(1, timestamp - lastThumbFrame)) : 16.667
      lastThumbFrame = timestamp
      const remaining = targetThumbY - thumbY
      if (Math.abs(remaining) < 0.2) {
        placeThumb(targetThumbY)
        lastThumbFrame = 0
        return
      }
      // Larger deltas catch up faster without springs or overshooting.
      const tau = Math.max(20, 40 - Math.min(20, Math.abs(remaining) * 0.12))
      placeThumb(thumbY + remaining * (1 - Math.exp(-dt / tau)))
      thumbFrame = requestAnimationFrame(tickThumb)
    }
    const seekThumb = (y: number, immediate: boolean) => {
      const { inset, travel } = geometry.current
      targetThumbY = Math.max(inset, Math.min(inset + travel, y))
      if (immediate || reduceMotion.matches || !Number.isFinite(thumbY) ||
          Math.abs(targetThumbY - thumbY) < 0.2) {
        if (thumbFrame) cancelAnimationFrame(thumbFrame)
        thumbFrame = 0
        lastThumbFrame = 0
        placeThumb(targetThumbY)
        return
      }
      if (!thumbFrame) thumbFrame = requestAnimationFrame(tickThumb)
    }
    const updatePosition = (immediate = false) => {
      const { maxScroll, travel, inset } = geometry.current
      const raw = window.scrollY
      const y = Number.isFinite(raw) ? Math.max(0, Math.min(maxScroll, raw)) : 0
      const rubberBand = isElastic(raw)
      if (rubberBand) track.dataset.elastic = 'true'
      else delete track.dataset.elastic
      const fraction = maxScroll > 0 ? y / maxScroll : 0
      seekThumb(inset + fraction * travel, immediate || rubberBand || dragOffset.current !== null)
      track.setAttribute('aria-valuenow', String(Math.round(y)))
      track.setAttribute('aria-valuetext', Math.round(fraction * 100) + '% scrolled')
    }
    const measure = () => {
      if (initialized && isElastic()) {
        pendingElasticMeasure = true
        updatePosition()
        return
      }
      pendingElasticMeasure = false
      viewport = document.documentElement.clientHeight || window.innerHeight
      trackTop = track.getBoundingClientRect().top
      const nav = document.querySelector<HTMLElement>('.mobile-tabbar')
      mobileTabbarBottom = nav && getComputedStyle(nav).display !== 'none'
        ? nav.offsetHeight : 0
      trackInset = mobileTabbarBottom ? 5 : TRACK_INSET
      if (mobileTabbarBottom) {
        headerBottom = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? trackTop
        const reader = document.querySelector<HTMLElement>('.research-reader-chrome, .reading-bar')
        if (reader !== observedReader) {
          if (observedReader) observer.unobserve(observedReader)
          observedReader = reader
          if (observedReader) observer.observe(observedReader)
        }
        hasMobileChrome = Boolean(reader && getComputedStyle(reader).display !== 'none')
        if (hasMobileChrome && reader) {
          // Include descendants that can extend fractionally beyond the sticky
          // wrapper, plus a tiny breathing margin so the indicator cannot touch
          // the scientific section selector during compressed iOS layouts.
          chromeHeight = Math.max(reader.offsetHeight, reader.scrollHeight) + 6
        } else chromeHeight = 0
        syncTop()
      } else {
        // Moving across responsive breakpoints must release inline mobile geometry.
        hasMobileChrome = false
        if (observedReader) observer.unobserve(observedReader)
        observedReader = null
        lastTop = -1
        track.style.top = ''
      }
      const footer = document.querySelector<HTMLElement>('.site-footer')
      footerDocumentTop = footer && getComputedStyle(footer).display !== 'none'
        ? footer.getBoundingClientRect().top + window.scrollY
        : Number.POSITIVE_INFINITY
      setFooterInset(Math.max(0, window.scrollY))
      const fullHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, viewport)
      const maxScroll = Math.max(0, fullHeight - viewport)
      // Compute from document geometry rather than reading clientHeight just
      // after a fixed-position bottom change. Chromium can temporarily report
      // the previous layout here, leaving the thumb below the footer seam.
      const available = Math.max(0, viewport - trackTop - Math.max(mobileTabbarBottom, Math.ceil(footerInset(window.scrollY))) - 2 * trackInset)
      const thumbHeight = maxScroll > 1 && available > 0
        ? Math.min(available, Math.max(mobileTabbarBottom ? 26 : MIN_THUMB_HEIGHT, available * viewport / fullHeight))
        : available

      geometry.current = {
        maxScroll,
        thumbHeight,
        inset: trackInset,
        travel: Math.max(0, available - thumbHeight),
      }
      track.dataset.scrollable = maxScroll > 1 ? 'true' : 'false'
      track.setAttribute('aria-valuemax', String(Math.round(maxScroll)))
      thumb.style.height = `${thumbHeight}px`
      initialized = true
      updatePosition(true)
    }

    const onScroll = () => {
      // No additional rAF latency on mobile: enqueue compositor transform directly.
      if (mobileTabbarBottom && !pendingElasticMeasure) { updatePosition(); return }
      if (scrollFrame) return
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0
        // Track height changes only near the footer. Ordinary scroll frames
        // remain transform-only; no forced layout or React render is needed.
        // This only remeasures while the research navigator is entering its
        // sticky position (about its first 70px of travel), or at the footer.
        if (isElastic()) {
          updatePosition()
          return // no layout reads/writes based on out-of-range Safari scrollY
        }
        if (pendingElasticMeasure) onResize()
        else if (mobileTabbarBottom) updatePosition()
        else if (setFooterInset(Math.max(0, window.scrollY))) measure()
        else updatePosition()
      })
    }
    const onResize = () => {
      if (sizeFrame) return
      sizeFrame = requestAnimationFrame(() => {
        sizeFrame = 0
        measure()
      })
    }

    const motionChange = () => updatePosition(true)
    reduceMotion.addEventListener('change', motionChange)
    const observer = new ResizeObserver(onResize)
    observer.observe(document.documentElement)
    observer.observe(document.body)
    const mobileNav = document.querySelector<HTMLElement>('.mobile-tabbar')
    if (mobileNav) observer.observe(mobileNav)
    // Direct children change on SPA page transitions; observe only the shell,
    // not the multi-thousand-node mathematical manuscript subtree.
    const shell = document.querySelector('.frame')
    const routes = new MutationObserver(onResize)
    if (shell) routes.observe(shell, { childList: true })
    window.addEventListener('popstate', onResize)
    window.addEventListener('scrollend', onResize)
    window.visualViewport?.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    measure()

    return () => {
      observer.disconnect()
      routes.disconnect()
      window.removeEventListener('popstate', onResize)
      window.removeEventListener('scrollend', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(scrollFrame)
      cancelAnimationFrame(sizeFrame)
      cancelAnimationFrame(thumbFrame)
      reduceMotion.removeEventListener('change', motionChange)
    }
  }, [])

  const scrollAt = (clientY: number, offset: number) => {
    const track = trackRef.current
    if (!track) return
    const { maxScroll, travel, inset } = geometry.current
    const top = track.getBoundingClientRect().top
    const fraction = travel
      ? Math.max(0, Math.min(1, (clientY - top - inset - offset) / travel))
      : 0
    window.scrollTo({ top: fraction * maxScroll, behavior: 'instant' })
  }

  const down = (event: PointerEvent<HTMLDivElement>) => {
    // On touch devices the narrow mobile rail is a visual indicator, not a
    // draggable control. Capturing a touch near the screen edge can otherwise
    // seek halfway through a 70,000px manuscript during an ordinary swipe.
    if (event.pointerType === 'touch' || event.button !== 0 || geometry.current.maxScroll <= 1) return
    event.preventDefault()
    const thumb = thumbRef.current
    dragOffset.current = thumb?.contains(event.target as Node)
      ? event.clientY - thumb.getBoundingClientRect().top
      : geometry.current.thumbHeight / 2
    event.currentTarget.dataset.dragging = 'true'
    event.currentTarget.setPointerCapture(event.pointerId)
    scrollAt(event.clientY, dragOffset.current)
  }
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (dragOffset.current !== null) scrollAt(event.clientY, dragOffset.current)
  }
  const end = (event: PointerEvent<HTMLDivElement>) => {
    dragOffset.current = null
    delete event.currentTarget.dataset.dragging
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const unit = Math.max(40, window.innerHeight / 10)
    const page = window.innerHeight * .9
    let next: number
    switch (event.key) {
      case 'ArrowDown': next = window.scrollY + unit; break
      case 'ArrowUp': next = window.scrollY - unit; break
      case 'PageDown': next = window.scrollY + page; break
      case 'PageUp': next = window.scrollY - page; break
      case 'Home': next = 0; break
      case 'End': next = geometry.current.maxScroll; break
      default: return
    }
    event.preventDefault()
    window.scrollTo({ top: next, behavior: 'instant' })
  }

  return <div ref={trackRef} className="centered-scrollbar" role="scrollbar"
    aria-label="Page scrollbar" aria-controls="main" aria-orientation="vertical"
    aria-valuemin={0} aria-valuemax={0} aria-valuenow={0} tabIndex={0}
    onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerCancel={end}
    onKeyDown={keyDown}><div ref={thumbRef} className="centered-scrollbar-thumb"/></div>
}
