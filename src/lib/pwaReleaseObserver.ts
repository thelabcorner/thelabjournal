/**
 * Service-worker lifecycle observer for the journal.
 *
 * Registration callbacks may arrive after `updatefound`; attach as soon as
 * the application module evaluates and re-check any in-flight installer.
 * "checking" is intentionally distinct from "downloading": update() can
 * spend time revalidating sw.js without a new release.
 *
 * This is a tiny, app-independent external store. No polling, React render,
 * DOM querying, or network request is performed on its notification path.
 */
export type ReleasePhase = 'idle' | 'checking' | 'downloading' | 'installing' | 'ready'
const listeners = new Set<() => void>()
let phase: ReleasePhase = 'idle'
let registration: ServiceWorkerRegistration | null = null
let worker: ServiceWorker | null = null
let checkTimer: number | undefined
let checkCount = 0

function transition(next: ReleasePhase) {
  if (phase === next) return
  phase = next
  for (const listener of listeners) listener()
}

export const releasePhase = () => phase
export function subscribeReleasePhase(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function onWorkerState() {
  if (!worker) return
  if (worker.state === 'installing') transition('downloading')
  else if (worker.state === 'installed' || worker.state === 'activating') transition('installing')
  else if (worker.state === 'activated') transition('ready')
  else if (worker.state === 'redundant') transition('idle')
}

function onUpdateFound() {
  const next = registration?.installing
  // Initial installation is not an update; show normal journal content.
  if (!next || !(registration?.active || navigator.serviceWorker.controller)) return
  if (next === worker) return
  worker?.removeEventListener('statechange', onWorkerState)
  worker = next
  next.addEventListener('statechange', onWorkerState)
  // updatefound fires when a new worker begins installing, before its
  // install event finishes downloading the revised precache.
  onWorkerState()
}

export function observeReleaseRegistration(next: ServiceWorkerRegistration | null | undefined) {
  if (!next || next === registration) return
  registration?.removeEventListener('updatefound', onUpdateFound)
  worker?.removeEventListener('statechange', onWorkerState)
  worker = null
  registration = next
  registration.addEventListener('updatefound', onUpdateFound)
  // This handles registration arriving after updatefound but during install.
  onUpdateFound()
}

export function beginReleaseObservation() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return
  void navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL)
    .then(observeReleaseRegistration)
    .catch(() => { /* Offline and storage-restricted browsers keep reading. */ })
}

/**
 * Reveals a non-blocking "checking" notice only when a foreground check is
 * genuinely slow; quick no-update checks never flash a banner.
 */
export function beginReleaseCheck() {
  checkCount++
  if (!checkTimer && phase === 'idle' && navigator.serviceWorker?.controller) {
    checkTimer = window.setTimeout(() => {
      checkTimer = undefined
      if (checkCount > 0 && phase === 'idle') transition('checking')
    }, 350)
  }
  let ended = false
  return () => {
    if (ended) return
    ended = true
    checkCount = Math.max(0, checkCount - 1)
    if (checkCount > 0) return
    window.clearTimeout(checkTimer)
    checkTimer = undefined
    if (phase === 'checking') transition('idle')
  }
}
