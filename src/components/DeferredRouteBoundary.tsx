import { Component, type ReactNode } from 'react'

/** A missing optional release chunk must never turn a deep link into a blank
 * page. This also covers offline visits to a feature not yet cached. */
export class DeferredRouteBoundary extends Component<
  { children: ReactNode, section: 'quotes' | 'research' | 'search' },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    console.warn('Journal section could not load:', error)
  }

  private retry = async () => {
    if (navigator.onLine && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL)
        await registration?.update()
      } catch { /* Reload still works for a temporarily unavailable worker. */ }
    }
    // Reload the exact route, including the article/quote hash and query.
    window.location.reload()
  }

  render() {
    if (!this.state.failed) return this.props.children
    const label = this.props.section === 'search' ? 'search' :
      this.props.section === 'quotes' ? 'quotes' : 'research'
    return <section className="pwa-route-pending" role="alert">
      <span className="pwa-route-pending-mark" aria-hidden="true"><i/><i/><i/><i/></span>
      <p className="section-label">thelabjournal™</p>
      <h2>Unable to open {label}</h2>
      <p>{navigator.onLine
        ? 'A required part of this journal version could not be loaded. Retry to check the latest release without losing this link.'
        : 'This section has not been cached for offline reading yet. Reconnect and retry to open it.'}</p>
      <div className="pwa-route-pending-actions">
        <button type="button" onClick={() => void this.retry()}>Retry this page</button>
      </div>
    </section>
  }
}
