import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Maximize2, X } from 'lucide-react'
import '../../../manuscript-equations.css'

type FitState = { overflow: boolean; position: number; visibleFraction: number }
const INITIAL: FitState = { overflow: false, position: 0, visibleFraction: 1 }
const MIN_LEGIBLE_SCALE = 0.88

/**
 * The only horizontal scroller in a rendered scientific equation.
 *
 * KaTeX outputs a non-wrapping mathematical expression. Display math cannot
 * safely be broken at arbitrary DOM/text boundaries. We first reclaim small
 * width overruns; larger expressions retain mathematical integrity and become
 * pannable without exposing native scrollbars over the glyphs.
 */
export function MathViewport({ html, label }: { html: string; label?: string }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const typesetRef = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState<FitState>(INITIAL)
  const [expanded, setExpanded] = useState(false)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const typeset = typesetRef.current
    if (!viewport || !typeset) return
    let frame = 0
    let disposed = false

    const sync = () => {
      frame = 0
      if (disposed || !viewport.isConnected) return
      // Reset the local font scale before measuring natural KaTeX dimensions.
      // Never use its clipped parent width as the expression's intrinsic width.
      typeset.style.setProperty('--equation-scale', '1')
      // KaTeX stretches the outer blocks to the column even when the
      // expression is narrower. A DOM Range measures the actual glyphs.
      const glyphs = typeset.querySelector<HTMLElement>('.katex-display .katex-html')
      const range = document.createRange()
      if (glyphs) range.selectNodeContents(glyphs)
      const naturalWidth = glyphs ? range.getBoundingClientRect().width : 0
      const available = viewport.clientWidth
      if (!naturalWidth || !available) return
      const ratio = (available - 3) / naturalWidth
      const scale = ratio >= MIN_LEGIBLE_SCALE && ratio < 1 ? ratio : 1
      typeset.style.setProperty('--equation-scale', String(scale))

      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
      if (viewport.scrollLeft > maxScroll) viewport.scrollLeft = maxScroll
      const next: FitState = {
        overflow: maxScroll > 3,
        position: maxScroll ? viewport.scrollLeft / maxScroll : 0,
        visibleFraction: Math.min(1, viewport.clientWidth / Math.max(1, viewport.scrollWidth)),
      }
      setFit(prev =>
        prev.overflow === next.overflow &&
        Math.abs(prev.position - next.position) < 0.005 &&
        Math.abs(prev.visibleFraction - next.visibleFraction) < 0.005
          ? prev : next
      )
    }
    const schedule = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(sync)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(viewport)
    // Font loading changes intrinsic mathematics; the container may not resize.
    void document.fonts?.ready.then(schedule)
    schedule()
    return () => {
      disposed = true
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [html])

  const syncScroll = () => {
    const el = viewportRef.current
    if (!el) return
    const max = Math.max(0, el.scrollWidth - el.clientWidth)
    setFit(prev => {
      const position = max ? el.scrollLeft / max : 0
      return Math.abs(prev.position - position) < 0.005 ? prev : { ...prev, position }
    })
  }

  const progressWidth = Math.max(12, fit.visibleFraction * 100)
  return (
    <div className="math-block__reading-surface">
      <div
        ref={viewportRef}
        className="math-block__viewport"
        role={fit.overflow ? 'region' : undefined}
        aria-label={fit.overflow ? `Scrollable ${label ? 'equation '+label : 'mathematical expression'}; use arrow keys or swipe to read the full equation` : undefined}
        tabIndex={fit.overflow ? 0 : undefined}
        onScroll={syncScroll}
      >
        <div
          ref={typesetRef}
          className="katex-display-wrap math-block__typeset"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      {fit.overflow && (
        <div className="math-block__overflow-hint" aria-label="This equation extends horizontally">
          <span className="math-block__overflow-copy">Scroll to read</span>
          <span className="math-block__overflow-track" aria-hidden="true">
            <span className="math-block__overflow-thumb" style={{
              width: `${progressWidth}%`,
              left: `${fit.position * (100 - progressWidth)}%`,
            }} />
          </span>
          <button className="math-block__expand" type="button" onClick={() => setExpanded(true)} aria-label="Expand equation for reading" title="Expand equation">
            <Maximize2 size={12} aria-hidden="true" />
            <span>Expand</span>
          </button>
        </div>
      )}
      {expanded && <ExpandedMath html={html} label={label} onClose={() => setExpanded(false)} />}
    </div>
  )
}

function ExpandedMath({ html, label, onClose }: { html: string; label?: string; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => { if (dialog?.open) dialog.close() }
  }, [])
  return (
    <dialog ref={dialogRef} className="math-equation-dialog" aria-label={label ? `Expanded equation ${label}` : 'Expanded mathematical expression'} onClose={onClose} onCancel={onClose}>
      <div className="math-equation-dialog__head">
        <span>{label ? `Equation ${label}` : 'Mathematical expression'}</span>
        <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close expanded equation" title="Close">
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="math-equation-dialog__reading" role="region" aria-label="Full equation; scroll horizontally if needed" tabIndex={0}>
        <div className="katex-display-wrap" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </dialog>
  )
}
