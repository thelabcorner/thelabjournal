/**
 * Per-history-entry reading positions. The app deliberately owns history with
 * pushState, so browser-native restoration alone cannot reliably wait for
 * lazy manuscript/quote routes to render after a PWA update or a reload.
 *
 * No reading data leaves the device. Session-scoped and bounded (80 entries).
 */
type ReadingSnapshot = {
  key: string
  path: string
  y: number
  anchor?: string
  anchorOffset?: number
  at: number
}

type ReadingState = { __journalReadingKey?: string }

const STORAGE = 'thelabjournal.reading-positions.v1'
const LIMIT = 80
const RETAIN_MS = 14 * 24 * 60 * 60 * 1000
const RESTORE_TIMEOUT = 6000
const SAVE_IDLE_MS = 280
const snapshots = new Map<string, ReadingSnapshot>()
let storageEnabled = false
let currentKey = ''
let currentPath = ''
let pending: ReadingSnapshot | null = null
let pendingSince = 0
let restoreTimer = 0
let saveTimer = 0
let lastScrollAt = 0
let restoreChecks = 0
let lastRestoredKey = ''
let userActivity = 0

const pathNow = () => window.location.pathname + window.location.search
const keyNow = () => (window.history.state as ReadingState | null)?.__journalReadingKey
const freshKey = () => typeof crypto?.randomUUID === 'function'
  ? crypto.randomUUID()
  : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2)

function persist() {
  if (!storageEnabled) return
  try {
    const values = [...snapshots.values()].sort((a, b) => b.at - a.at).slice(0, LIMIT)
    // Bound memory as well as the persisted record count.
    if (snapshots.size > LIMIT) {
      snapshots.clear()
      for (const value of values) snapshots.set(value.key, value)
    }
    sessionStorage.setItem(STORAGE, JSON.stringify(values))
  } catch { storageEnabled = false }
}

function snapshotFor(key: string, path: string): ReadingSnapshot | null {
  const snapshot = snapshots.get(key)
  return snapshot?.path === path ? snapshot : null
}

function getAnchor() {
  // Stable article section IDs are more resilient than absolute pixels when
  // a release adds paragraphs, changes fonts, or moves figures above the reader.
  const headings = document.querySelectorAll<HTMLElement>(
    '.article-body .prose-section[id], .research-body section[id], .research-body h2[id], .research-body h3[id]',
  )
  const readingLine = Math.min(180, window.innerHeight * .25)
  // Sections follow reading order in both document systems. A binary search
  // measures O(log n) headings rather than every preceding heading in a long
  // manuscript. Run only after scrolling becomes idle or on route/page exit.
  let low = 0
  let high = headings.length
  while (low < high) {
    const middle = (low + high) >>> 1
    if (headings[middle].getBoundingClientRect().top <= readingLine) low = middle + 1
    else high = middle
  }
  const anchor = low ? headings[low - 1] : null
  if (!anchor) return {}
  return {
    anchor: anchor.id,
    anchorOffset: -anchor.getBoundingClientRect().top,
  }
}

function capture() {
  if (!currentKey || pending) return
  const y = Math.max(0, Number.isFinite(window.scrollY) ? window.scrollY : 0)
  const { anchor, anchorOffset } = getAnchor()
  snapshots.set(currentKey, { key: currentKey, path: currentPath, y, anchor, anchorOffset, at: Date.now() })
}

function flush() {
  window.clearTimeout(saveTimer)
  saveTimer = 0
  capture()
  persist()
}

function saveWhenIdle() {
  saveTimer = 0
  if (pending) return
  const remaining = SAVE_IDLE_MS - (performance.now() - lastScrollAt)
  if (remaining > 0) {
    saveTimer = window.setTimeout(saveWhenIdle, Math.max(16, Math.ceil(remaining)))
    return
  }
  flush()
}

function scheduleSave() {
  if (pending) return
  // The hot path only updates one number. One timer periodically checks for
  // inactivity; it does not serialize storage or measure geometry mid-scroll.
  lastScrollAt = performance.now()
  if (!saveTimer) saveTimer = window.setTimeout(saveWhenIdle, SAVE_IDLE_MS)
}

function setHistoryKey(key: string, replace: boolean, url?: string) {
  const state = window.history.state
  const next = { ...(state && typeof state === 'object' && !Array.isArray(state) ? state : {}), __journalReadingKey: key }
  if (replace) window.history.replaceState(next, '', url)
  else window.history.pushState(next, '', url)
}

function finishRestore() {
  const restored = pending
  const key = currentKey
  const activity = userActivity
  lastRestoredKey = currentKey
  pending = null
  window.clearTimeout(restoreTimer)
  restoreTimer = 0
  // Capture only after the target has landed; recording the blank/loading
  // screen would otherwise overwrite the reader's previous position.
  window.setTimeout(flush, 100)
  // One post-font correction preserves a paragraph if late font loading
  // changes the layout. Never move the reader after their next interaction.
  if (restored?.anchor) void document.fonts?.ready.then(() => {
    if (currentKey !== key || userActivity !== activity) return
    const anchor = document.getElementById(restored.anchor!)
    if (!anchor || !Number.isFinite(restored.anchorOffset)) return
    const top = window.scrollY + anchor.getBoundingClientRect().top + restored.anchorOffset!
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight)
    if (Math.abs(window.scrollY - top) > 2)
      window.scrollTo({ top: Math.max(0, Math.min(top, max)), behavior: 'instant' })
    flush()
  })
}

function tryRestore() {
  restoreTimer = 0
  if (!pending) return
  const frame = document.querySelector<HTMLElement>('[data-reading-route]')
  const main = frame?.querySelector<HTMLElement>('main#main')
  const expired = performance.now() - pendingSince > RESTORE_TIMEOUT
  if (!main || frame?.dataset.readingRoute !== window.location.pathname) {
    // A missing/failed route must not leave a perpetual 25Hz retry loop.
    // Leave the recovery UI usable instead of retaining a stale target.
    if (expired) {
      pending = null
      scheduleSave()
    } else scheduleRestore()
    return
  }
  // A manuscript may render its outer article while its actual body remains
  // behind a nested Suspense boundary. Wait for real content, not the shell.
  if (main.classList.contains('research-page') &&
      main.querySelector('.research-body') &&
      main.querySelector('.research-body .journal-loading-state, .research-body [role="status"]') &&
      !expired) {
    scheduleRestore()
    return
  }
  let target = pending.y
  if (pending.anchor) {
    const anchor = document.getElementById(pending.anchor)
    if (anchor && main.contains(anchor) && Number.isFinite(pending.anchorOffset)) {
      target = window.scrollY + anchor.getBoundingClientRect().top + pending.anchorOffset!
    } else if (!expired) {
      scheduleRestore()
      return
    }
  }
  const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  if (maxY + 3 < target && !expired) {
    scheduleRestore()
    return
  }
  window.scrollTo({ top: Math.max(0, Math.min(target, maxY)), behavior: 'instant' })
  finishRestore()
}

function scheduleRestore() {
  if (!pending || restoreTimer) return
  // A lazy manuscript may take multiple frames to mount. Back off polling
  // instead of doing DOM queries 25 times/sec for the entire loading period.
  const delay = Math.min(160, 40 + restoreChecks++ * 20)
  restoreTimer = window.setTimeout(() => requestAnimationFrame(tryRestore), delay)
}

function beginRestore(snapshot: ReadingSnapshot | null) {
  window.clearTimeout(restoreTimer)
  restoreTimer = 0
  pending = snapshot
  if (!pending) return
  restoreChecks = 0
  pendingSince = performance.now()
  requestAnimationFrame(tryRestore)
}

function onPopState() {
  // popstate fires after history.state and location have already changed,
  // but before React has swapped the old route's content.
  flush()
  currentPath = pathNow()
  currentKey = keyNow() || freshKey()
  if (!keyNow()) setHistoryKey(currentKey, true)
  const saved = snapshotFor(currentKey, currentPath)
  if (saved) beginRestore(saved)
  else if (!window.location.hash) {
    beginRestore({ key: currentKey, path: currentPath, y: 0, at: Date.now() })
  } else {
    beginRestore(null) // Explicit anchor link takes precedence.
  }
}

function cancelForUserInput() {
  userActivity++
  if (!pending) return
  pending = null
  window.clearTimeout(restoreTimer)
  restoreTimer = 0
  scheduleSave()
}

function initialize() {
  try {
    sessionStorage.setItem(STORAGE + '.test', '1')
    sessionStorage.removeItem(STORAGE + '.test')
    storageEnabled = true
    const value: unknown = JSON.parse(sessionStorage.getItem(STORAGE) || '[]')
    if (Array.isArray(value)) for (const item of value) {
      if (item && typeof item.key === 'string' && typeof item.path === 'string' &&
          typeof item.y === 'number' && Number.isFinite(item.y) && item.y >= 0 &&
          typeof item.at === 'number' && Date.now() - item.at < RETAIN_MS) {
        snapshots.set(item.key, item as ReadingSnapshot)
      }
    }
  } catch { storageEnabled = false }

  currentPath = pathNow()
  currentKey = keyNow() || freshKey()
  if (!keyNow()) setHistoryKey(currentKey, true)

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  if (navigation?.type === 'reload' || navigation?.type === 'back_forward') {
    // In rare browsers that discard history.state on reload, only the latest
    // same-path position is a safe fallback. Never resume on an ordinary link.
    const saved = snapshotFor(currentKey, currentPath) ??
      (navigation.type === 'reload' ? [...snapshots.values()].filter(item => item.path === currentPath)
        .sort((a, b) => b.at - a.at)[0] ?? null : null)
    beginRestore(saved)
  }

  // Don't disable native restoration in privacy modes where sessionStorage
  // is unavailable. It remains the best possible reload fallback there.
  if (storageEnabled && 'scrollRestoration' in history) history.scrollRestoration = 'manual'
  window.addEventListener('popstate', onPopState)
  window.addEventListener('scroll', scheduleSave, { passive: true })
  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush() })
  for (const name of ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const) {
    window.addEventListener(name, cancelForUserInput, { passive: true })
  }
}

/** Call for a new SPA route; a new history entry starts at the top. */
export function pushReadingRoute(url: string) {
  flush()
  currentKey = freshKey()
  setHistoryKey(currentKey, false, url)
  currentPath = pathNow()
  beginRestore(null)
}

/** TOC anchors are history entries too: Back restores pre-jump reading context. */
export function pushReadingAnchor(hash: string) {
  flush()
  currentKey = freshKey()
  setHistoryKey(currentKey, false, hash)
  currentPath = pathNow()
  beginRestore(null)
}

/** Canonicalize legacy ?post= links without invalidating their saved entry. */
export function replaceReadingRoute(url: string) {
  flush()
  setHistoryKey(currentKey, true, url)
  currentPath = pathNow()
  const snapshot = snapshots.get(currentKey)
  if (snapshot) {
    snapshots.set(currentKey, { ...snapshot, path: currentPath, at: Date.now() })
    persist()
  }
}

/** TOC navigation should not override a saved exact reading position. */
export function hasSavedReadingPosition() {
  return Boolean(pending || lastRestoredKey === currentKey || snapshotFor(currentKey, currentPath))
}

initialize()
