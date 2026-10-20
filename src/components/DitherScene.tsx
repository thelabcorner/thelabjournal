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
  /** Gradually remove dots toward the outside of a desktop margin.
   * Unlike a CSS mask, the falloff modifies coverage AND per-dot alpha. */
  ambientEdge?: 'left' | 'right'
}

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5] as const
const clamp = (v: number) => Math.max(0, Math.min(1, v))
const threshold = (x: number, y: number) => (BAYER[((y & 3) << 2) | (x & 3)] + 0.5) / 16
const pulse = (x: number, center: number, spread: number) => Math.exp(-(((x - center) / spread) ** 2))
const hash = (x: number, y: number) => {
  const v = Math.sin(x * 127.1 + y * 311.7 + 41.7) * 43758.5453123
  return v - Math.floor(v)
}
// Deterministic integer noise for the high-frequency, full-width nav field.
const cellNoise = (x: number, y: number) => {
  let value = Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263)
  value = Math.imul(value ^ (value >>> 13), 1274126177)
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296
}

interface Frame {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  dpr: number
  seconds: number
  still: boolean
  intensity: number
  ambientEdge?: 'left' | 'right'
}

function dots({ ctx, width, height, dpr, seconds, still, intensity, ambientEdge }: Frame, variant: Variant) {
  const pitch = variant === 'nav' ? 4.5 : variant === 'ledger' ? 3.5 : 4.2
  const dotSize = Math.max(1 / dpr, Math.round(pitch * 0.44 * dpr) / dpr)
  const cols = Math.ceil(width / pitch)
  const rows = Math.ceil(height / pitch)
  const scan = still ? 0.52 : ((seconds * (variant === 'ledger' ? 0.04 : variant === 'nav' ? 0.042 : 0.062)) % 1)
  const fade = (u: number) => clamp(u / 0.13) * clamp((1 - u) / 0.13)
  const navPhase = still ? 0 : seconds * 0.35
  // Side-margin silhouettes must NEVER come from clipping a mostly opaque
  // rectangle. Compute a soft, asymmetric pair of elliptical lobes per dot:
  // a dominant plume near the upper half, and a weak lower echo. The Bayer
  // threshold consumes this falloff as *coverage*, so individual dots
  // disappear gradually rather than drawing a CSS vignette over a rectangle.
  // All corners, the outermost horizontal edge, and both vertical endpoints
  // are mathematically guaranteed to contain no dots.
  const ambientX = ambientEdge ? new Float32Array(cols) : undefined
  const upperCenters = ambientEdge ? new Float32Array(cols) : undefined
  const lowerCenters = ambientEdge ? new Float32Array(cols) : undefined
  if (ambientX && upperCenters && lowerCenters) {
    const sidePhase = ambientEdge === 'left' ? 0 : 1.4
    for (let cx = 0; cx < cols; cx += 1) {
      const u = (cx + 0.5) / cols
      const inward = ambientEdge === 'left' ? u : 1 - u
      ambientX[cx] = (1 - inward) ** 2
      upperCenters[cx] = 0.34 + 0.046 * Math.sin(inward * 5.2 + sidePhase)
      lowerCenters[cx] = 0.68 + 0.035 * Math.sin(inward * 6.1 + sidePhase)
    }
  }
  const ambientY = ambientEdge
    ? Float32Array.from({ length: rows }, (_, ry) => {
      const v = (ry + 0.5) / rows
      const topFade = clamp(v / 0.115)
      const bottomFade = clamp((1 - v) / 0.16)
      return Math.min(topFade * topFade * (3 - 2 * topFade),
        bottomFade * bottomFade * (3 - 2 * bottomFade))
    })
    : undefined
  const organicEnvelope = (radiusSquared: number) => {
    const remaining = clamp(1 - radiusSquared)
    return remaining * remaining * (3 - 2 * remaining)
  }

  for (let ry = 0; ry < rows; ry += 1) {
    const v = (ry + 0.5) / rows
    for (let cx = 0; cx < cols; cx += 1) {
      const u = (cx + 0.5) / cols
      // Cull absent dots before hashing and computing their coverage. Sine
      // centers are precomputed once per column, not once per grid cell.
      let spatial = 1
      if (ambientX && ambientY && upperCenters && lowerCenters) {
        if (ambientY[ry] <= 0) continue
        const upper = organicEnvelope(ambientX[cx] / (0.91 * 0.91)
          + ((v - upperCenters[cx]) / 0.53) ** 2)
        const lower = organicEnvelope(ambientX[cx] / (0.77 * 0.77)
          + ((v - lowerCenters[cx]) / 0.27) ** 2)
        spatial = Math.max(upper, lower * 0.39) * ambientY[ry]
        if (spatial <= 0) continue
      }
      let coverage = 0
      if (variant === 'nav') {
        // WebSeal-style information wall: Bayer-dot telemetry, short rows of
        // records, sparse blocks, and a slow verification sweep. The field is
        // a background texture, never an illustration behind article prose.
        const lane = Math.floor(ry / 4)
        const section = (Math.floor(cx / 18) + lane * 3) % 4
        const noise = cellNoise(cx, ry)
        const local = cx % 18
        let occupancy: number
        if (section === 0) occupancy = (local < 3 || local > 15) ? 0.17 : 0.58 + noise * 0.24
        else if (section === 1) occupancy = (ry % 5 === 0 || local > 12) ? 0.15 : 0.36 + noise * 0.30
        else if (section === 2) occupancy = (ry % 7 < 3) ? 0.48 + noise * 0.26 : 0.12
        else occupancy = noise > 0.48 ? 0.61 : 0.15
        const gap = ry % 9 === 0 ? 0.28 : 1
        // The header keeps its normal activity. Peripheral fields use the
        // identical Bayer information pattern, but fewer shifting dots.
        const verification = pulse(u, scan, 0.085) * (ambientEdge ? 0.11 : 0.42)
        const drift = (Math.sin(u * 18 - navPhase + v * 3) + 1) * (ambientEdge ? 0.025 : 0.09)
        const edge = clamp(u / 0.065) * clamp((1 - u) / 0.065)
        coverage = clamp((occupancy * gap + verification + drift) * edge * intensity)
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
      const brightness = clamp(coverage * (ambientEdge ? 1 : intensity) * spatial)
      if (brightness <= ordered) continue
      // Modulate the actual surviving dot alpha, never the entire canvas.
      ctx.globalAlpha = ambientEdge
        ? (0.32 + brightness * 0.46) * (0.74 + spatial * 0.26)
        : 0.24 + brightness * 0.64
      const x = Math.round((cx * pitch) * dpr) / dpr
      const y = Math.round((ry * pitch) * dpr) / dpr
      ctx.fillRect(x, y, dotSize, dotSize)
    }
  }
  ctx.globalAlpha = 1
}

export function DitherScene({ variant, className = '', fps = 16, speed = 1, intensity = 0.9, ambientEdge }: DitherSceneProps) {
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
      dots({ ctx, width, height, dpr, seconds: elapsed / 1000 * speed, still, intensity, ambientEdge }, variant)
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
  }, [variant, fps, speed, intensity, ambientEdge])
  return <canvas ref={ref} className={'journal-dither ' + className} data-dither-variant={variant} data-dither-falloff={ambientEdge} aria-hidden="true" />
}
