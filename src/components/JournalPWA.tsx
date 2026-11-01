import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { ArrowDownToLine, Check, CloudOff, RefreshCw, Share2, Smartphone } from 'lucide-react'

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
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
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
      try {
        const registration = await navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL)
        if (!disposed && registration?.active) await registration.update()
      } catch (error) {
        // Transient connectivity problems must never interrupt offline reading.
        console.debug('Journal release check deferred:', error)
      } finally {
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
  if (!pwa.needRefresh) return null
  return <div className="pwa-update" role="status">
    <span><RefreshCw size={15}/><span>A journal update is ready.</span></span>
    <div><button type="button" onClick={pwa.dismissUpdate}>Later</button><button type="button" onClick={pwa.applyUpdate}>Update</button></div>
  </div>
}
