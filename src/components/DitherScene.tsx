import { useEffect, useRef } from 'react'

/**
 * thelabjournal™'s small-area variant of the WebSeal dither language.
 * Inspired by webseal-landing/src/components/dither:
 * - Bayer 4×4 ordered dot thresholding, desaturated zinc ink, restrained sweeps.
 * - No continuous animation loop when hidden, out of view, or reduced-motion.
 * - Decorative only: rendered pixels never represent measured experimental data.
 */
type Variant = 'sequence' | 'ledger' | 'nav'
interface DitherSceneProps {
  variant: Variant
  className?: string
  fps?: number
  speed?: number
  intensity?: number
}

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5] as const
const clamp = (v: number) => Math.max(0, Math.min(1, v))
const threshold = (x: number, y: number) => (BAYER[((y & 3) << 2) | (x & 3)] + 0.5) / 16
const pulse = (x: number, center: number, spread: number) => Math.exp(-(((x - center) / spread) ** 2))
const hash = (x: number, y: number) => {
  const v = Math.sin(x * 127.1 + y * 311.7 + 41.7) * 43758.5453123
  return v - Math.floor(v)
}

interface Frame {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  dpr: number
  seconds: number
  still: boolean
  intensity: number
}

function dots({ ctx, width, height, dpr, seconds, still, intensity }: Frame, variant: Variant) {
  const pitch = variant === 'nav' ? 3 : variant === 'ledger' ? 3.5 : 4.2
  const dotSize = Math.max(1 / dpr, Math.round(pitch * 0.44 * dpr) / dpr)
  const cols = Math.ceil(width / pitch)
  const rows = Math.ceil(height / pitch)
  const scan = still ? 0.52 : ((seconds * (variant === 'ledger' ? 0.04 : variant === 'nav' ? 0.085 : 0.062)) % 1)
  const fade = (u: number) => clamp(u / 0.13) * clamp((1 - u) / 0.13)
  const navPhase = still ? 0.8 : seconds * 0.85

  for (let ry = 0; ry < rows; ry += 1) {
    const v = (ry + 0.5) / rows
    for (let cx = 0; cx < cols; cx += 1) {
      const u = (cx + 0.5) / cols
      let coverage = 0
      if (variant === 'nav') {
        // A tiny ordered-dot signal trace. This is a purely decorative, sparse
        // oscilloscope motif: no shader, SVG filter, or CSS animation loop.
        const wave = 0.5 + 0.23 * Math.sin(u * 12.5 - navPhase) * (0.58 + 0.42 * Math.sin(u * 3.1 + navPhase * 0.35))
        const distance = Math.abs(v - wave)
        const line = Math.exp(-((distance / 0.16) ** 2))
        coverage = (line * 0.72 + pulse(u, scan, 0.095) * line * 0.45) * fade(u)
      } else if (variant === 'ledger') {
        // Seven short rows of archival records, with a resolving scan column.
        const lane = Math.floor(v * 7)
        const local = (v * 7) % 1
        if (local > 0.57) continue
        const blocks = cx % 27 < 7 ? 0.63 : cx % 27 < 21 ? 0.32 + hash(cx >> 1, lane) * 0.38 : 0.14
        coverage = (blocks + pulse(u, scan, 0.065) * 0.35) * fade(u)
        if (lane === 3) coverage *= 1.18
      } else {
        // Paired pipelines: top = research → prototype, bottom = prototype → refine.
        const lane = v < 0.5 ? 0 : 1
        const y = lane === 0 ? v * 2 : (v - 0.5) * 2
        if (y < 0.22 || y > 0.86) continue
        const centers = [0.18, 0.50, 0.82]
        const cell = centers.reduce((best, center, index) =>
          Math.abs(u - center) < Math.abs(u - centers[best]) ? index : best, 0)
        const insideNode = centers.some(center => Math.abs(u - center) < 0.12 && y > 0.30 && y < 0.72)
        const onRail = y > 0.49 && y < 0.54
        const nodeDensity = [0.47, 0.70, 0.56][lane === 0 ? cell : 2 - cell]
        const directedScan = lane === 0 ? scan : 1 - scan
        const active = pulse(u, directedScan, 0.105)
        coverage = (insideNode ? nodeDensity + active * 0.34 : onRail ? 0.18 + active * 0.52 : 0) * fade(u)
        const breaks = hash(Math.floor(u * 45), Math.floor(v * 25)) * 0.16
        coverage -= breaks
      }
      if (coverage <= 0) continue
      const ordered = threshold(cx, ry)
      const brightness = clamp(coverage * intensity)
      if (brightness <= ordered) continue
      ctx.globalAlpha = 0.24 + brightness * 0.64
      const x = Math.round((cx * pitch) * dpr) / dpr
      const y = Math.round((ry * pitch) * dpr) / dpr
      ctx.fillRect(x, y, dotSize, dotSize)
    }
  }
  ctx.globalAlpha = 1
}

export function DitherScene({ variant, className = '', fps = 16, speed = 1, intensity = 0.9 }: DitherSceneProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const initial = canvas.getContext('2d', { alpha: true })
    if (!initial) { canvas.dataset.ditherState = 'failed'; return }
    let ctx = initial
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const rate = 1000 / Math.min(24, Math.max(1, fps))
    let width = 0
    let height = 0
    let dpr = 1
    let elapsed = 0
    let previous = 0
    let visible = false
    let available = true
    let timer: ReturnType<typeof setTimeout> | undefined
    let frame = 0
    let destroyed = false

    const cancel = () => {
      if (timer !== undefined) { clearTimeout(timer); timer = undefined }
      if (frame) { cancelAnimationFrame(frame); frame = 0 }
      previous = 0
    }
    const eligible = () => available && visible && !document.hidden && width > 0 && height > 0
    const draw = () => {
      if (!eligible()) return
      const still = motion.matches
      const color = getComputedStyle(canvas).color
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = color
      dots({ ctx, width, height, dpr, seconds: elapsed / 1000 * speed, still, intensity }, variant)
      canvas.dataset.ditherState = still ? 'still' : 'playing'
      canvas.dataset.ditherFrames = String(Number(canvas.dataset.ditherFrames || 0) + 1)
    }
    const tick = (now: number) => {
      frame = 0
      if (!eligible() || motion.matches) { suspend(); return }
      if (previous) elapsed += Math.max(0, Math.min(100, now - previous))
      previous = now
      draw()
      timer = setTimeout(() => {
        timer = undefined
        if (eligible() && !motion.matches) frame = requestAnimationFrame(tick)
        else suspend()
      }, rate)
    }
    const suspend = () => {
      cancel()
      if (!destroyed && available) canvas.dataset.ditherState = motion.matches ? 'still' : 'paused'
    }
    const sync = () => {
      cancel()
      if (!eligible()) { suspend(); return }
      draw()
      if (!motion.matches) frame = requestAnimationFrame(tick)
    }
    const resize = () => {
      if (destroyed) return
      const rect = canvas.getBoundingClientRect()
      const nextWidth = Math.max(1, rect.width)
      const nextHeight = Math.max(1, rect.height)
      const nextDpr = Math.min(devicePixelRatio || 1, 1.5)
      const w = Math.max(1, Math.round(nextWidth * nextDpr))
      const h = Math.max(1, Math.round(nextHeight * nextDpr))
      if (w === canvas.width && h === canvas.height && width === nextWidth && height === nextHeight) return
      width = nextWidth
      height = nextHeight
      dpr = nextDpr
      canvas.width = w
      canvas.height = h
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sync()
    }
    const lost = (event: Event) => {
      event.preventDefault()
      available = false
      cancel()
      canvas.dataset.ditherState = 'lost'
    }
    const restored = () => {
      const recovered = canvas.getContext('2d', { alpha: true })
      if (!recovered) { canvas.dataset.ditherState = 'failed'; return }
      ctx = recovered
      available = true
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sync()
    }
    canvas.dataset.ditherState = 'initializing'
    const sizeObserver = new ResizeObserver(resize)
    sizeObserver.observe(canvas)
    const intersection = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting)
      sync()
    }, { rootMargin: '60px' })
    intersection.observe(canvas)
    canvas.addEventListener('contextlost', lost)
    canvas.addEventListener('contextrestored', restored)
    document.addEventListener('visibilitychange', sync)
    motion.addEventListener('change', sync)
    resize()
    return () => {
      destroyed = true
      cancel()
      sizeObserver.disconnect()
      intersection.disconnect()
      canvas.removeEventListener('contextlost', lost)
      canvas.removeEventListener('contextrestored', restored)
      document.removeEventListener('visibilitychange', sync)
      motion.removeEventListener('change', sync)
    }
  }, [variant, fps, speed, intensity])
  return <canvas ref={ref} className={'journal-dither ' + className} data-dither-variant={variant} aria-hidden="true" />
}
