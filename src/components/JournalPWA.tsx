import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { ArrowDownToLine, Check, CloudOff, Share2, Smartphone } from 'lucide-react'
import {
  beginReleaseCheck, beginReleaseObservation, observeReleaseRegistration, releasePhase, subscribeReleasePhase,
} from '../lib/pwaReleaseObserver'

// Module evaluation precedes the first React render and Workbox registration,
// so updatefound can be observed before precache installation finishes.
beginReleaseObservation()

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
}
function isAppleMobile() {
  return /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
}

/**
 * Register once in the application root, before a Preferences dialog is
 * opened. beforeinstallprompt is one-shot: capture early or it is lost.
 */
export function useJournalPWA() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone)
  const [canInstall] = useState(() => window.isSecureContext)
  const [appleMobile] = useState(isAppleMobile)
  const updatePhase = useSyncExternalStore(subscribeReleasePhase, releasePhase)
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW: (_url, registered) => observeReleaseRegistration(registered),
    onRegisterError: (error) => console.warn('Journal offline registration unavailable:', error),
  })
  useEffect(() => {
    // Home-screen PWAs, especially on iOS, can resume without a new navigation.
    // Registration alone does not periodically check for new releases.
    if (!('serviceWorker' in navigator) || !window.isSecureContext) return

    const pollIntervalMs = 5 * 60_000
    const minCheckIntervalMs = 15_000
    let lastCheck = 0
    let checking = false
    let disposed = false

    const checkForRelease = async () => {
      if (disposed || checking || !navigator.onLine || document.visibilityState === 'hidden') return
      const now = Date.now()
      if (now - lastCheck < minCheckIntervalMs) return
      lastCheck = now
      checking = true
      const finishNotice = beginReleaseCheck()
      try {
        const registration = await navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL)
        observeReleaseRegistration(registration)
        if (!disposed && registration?.active) await registration.update()
      } catch (error) {
        // Transient connectivity problems must never interrupt offline reading.
        console.debug('Journal release check deferred:', error)
      } finally {
        finishNotice()
        checking = false
      }
    }

    const onVisibilityChange = () => { if (!document.hidden) void checkForRelease() }
    const onForeground = () => { void checkForRelease() }
    const initialCheck = window.setTimeout(onForeground, 1000)
    const interval = window.setInterval(onForeground, pollIntervalMs)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pageshow', onForeground)
    window.addEventListener('focus', onForeground)
    window.addEventListener('online', onForeground)
    return () => {
      disposed = true
      window.clearTimeout(initialCheck)
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pageshow', onForeground)
      window.removeEventListener('focus', onForeground)
      window.removeEventListener('online', onForeground)
    }
  }, [])
  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault()
      setPrompt(event as InstallPromptEvent)
    }
    const installedEvent = () => { setInstalled(true); setPrompt(null) }
    const display = window.matchMedia('(display-mode: standalone)')
    const sync = () => setInstalled(isStandalone())
    window.addEventListener('beforeinstallprompt', capture)
    window.addEventListener('appinstalled', installedEvent)
    display.addEventListener('change', sync)
    return () => {
      window.removeEventListener('beforeinstallprompt', capture)
      window.removeEventListener('appinstalled', installedEvent)
      display.removeEventListener('change', sync)
    }
  }, [])

  const install = async () => {
    if (!prompt) return
    try {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') setPrompt(null)
    } catch { setPrompt(null) }
  }

  return {
    install,
    promptAvailable: Boolean(prompt),
    installed,
    secure: canInstall,
    appleMobile,
    offlineReady,
    needRefresh,
    updatePhase,
    dismissUpdate: () => setNeedRefresh(false),
    applyUpdate: () => void updateServiceWorker(true),
  }
}

export type JournalPWA = ReturnType<typeof useJournalPWA>

export function InstallSection({ pwa }: { pwa: JournalPWA }) {
  return <div className="prefs-group prefs-install">
    <div className="prefs-label"><strong>Install journal</strong><span>Launch from your home screen and read cached entries offline.</span></div>
    {pwa.installed ? (
      <div className="install-status"><Check size={16}/><span><strong>Installed as an app</strong><small>{pwa.offlineReady ? 'Available offline on this device' : 'Offline assets are being prepared'}</small></span></div>
    ) : !pwa.secure ? (
      <div className="install-status install-status--notice"><CloudOff size={16}/><span><strong>HTTPS required</strong><small>This LAN preview uses HTTP. Open the journal over HTTPS to enable offline installation.</small></span></div>
    ) : pwa.promptAvailable ? (
      <button type="button" className="install-action" onClick={() => void pwa.install()}><ArrowDownToLine size={16}/><span>Install journal</span><span>Standalone app</span></button>
    ) : pwa.appleMobile ? (
      <div className="install-status"><Share2 size={16}/><span><strong>Add to Home Screen</strong><small>In Safari, tap Share, choose Add to Home Screen, then tap Add.</small></span></div>
    ) : (
      <div className="install-status"><Smartphone size={16}/><span><strong>Install from your browser</strong><small>Use the browser menu to install this site as an app when the option is available.</small></span></div>
    )}
  </div>
}

export function PWAUpdateNotice({ pwa }: { pwa: JournalPWA }) {
  if (!pwa.needRefresh && pwa.updatePhase === 'idle') return null
  const message = pwa.updatePhase === 'checking' ? 'Checking for the latest version…'
    : pwa.updatePhase === 'downloading' ? 'Downloading the latest version…'
    : pwa.updatePhase === 'installing' ? 'Installing the updated journal…'
      : pwa.updatePhase === 'ready' ? 'Opening the updated journal…'
        : 'An update is ready to install.'
  return <div className="pwa-update" role="status" aria-live="polite" aria-atomic="true">
    <span className="pwa-update-indicator" aria-hidden="true"><i/><i/><i/><i/></span>
    <span className="pwa-update-copy"><strong>Updating journal</strong><small>{message}</small></span>
    {pwa.needRefresh && <div className="pwa-update-actions"><button type="button" onClick={pwa.dismissUpdate}>Later</button><button type="button" onClick={pwa.applyUpdate}>Update</button></div>}
  </div>
}
