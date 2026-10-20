import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { ArrowRight, ArrowUpRight, CornerDownLeft, FileText, FlaskConical, History, Search, X } from 'lucide-react'
import { entries, type Entry } from '../data'
import { manuscripts, type Manuscript } from '../research'
import { ScrollView } from './ScrollView'
import {
  buildSpotlightIndex, normalizeSpotlight, searchSpotlight, spotlightSuggestions,
  type SpotlightAction, type SpotlightHit, type SpotlightKind, type SpotlightScope,
} from '../lib/spotlightIndex'

const index = buildSpotlightIndex(entries, manuscripts)
const scopes: Array<{ id: SpotlightScope; name: string }> = [
  { id: 'all', name: 'All' },
  { id: 'writing', name: 'Writing' },
  { id: 'manuscripts', name: 'Manuscripts' },
  { id: 'navigate', name: 'Actions' },
]
const maxRendered = 80

function Highlight({ value, query }: { value: string; query: string }) {
  const tokens = [...new Set(normalizeSpotlight(query).split(' ').filter(token => token.length > 1))]
  if (!tokens.length) return <>{value}</>
  const parts = value.split(new RegExp('(' + tokens.map(token => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'ig'))
  return <>{parts.map((part, i) =>
    tokens.includes(normalizeSpotlight(part)) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>,
  )}</>
}
function KindIcon({ kind }: { kind: SpotlightKind }) {
  return kind === 'writing' ? <FileText aria-hidden="true"/> :
    kind === 'manuscripts' ? <FlaskConical aria-hidden="true"/> : <ArrowRight aria-hidden="true"/>
}
function groupLabel(kind: SpotlightKind, recent: boolean) {
  if (recent) return 'Recently opened'
  return kind === 'writing' ? 'Writing' : kind === 'manuscripts' ? 'Research' : 'Quick access'
}
function Shortcut({ children }: { children: ReactNode }) { return <kbd className="spotlight-key">{children}</kbd> }

export function SpotlightSearch({ onClose, onEntry, onManuscript, onAction, recent }: {
  onClose: () => void
  onEntry: (entry: Entry) => void
  onManuscript: (manuscript: Manuscript) => void
  onAction: (action: SpotlightAction) => void
  recent: readonly string[]
}) {
  const input = useRef<HTMLInputElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const dialog = useRef<HTMLElement>(null)
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<SpotlightScope>('all')
  const [active, setActive] = useState(0)
  const searched = query.trim().length > 0
  const allHits = useMemo(() => searched ? searchSpotlight(index, query, scope) :
    spotlightSuggestions(index, recent, scope), [query, scope, recent, searched])
  const hits = useMemo(() => allHits.slice(0, maxRendered), [allHits])
  const focused = hits[Math.min(active, hits.length - 1)]
  const counts = useMemo(() => {
    const records = searched ? searchSpotlight(index, query) : index.map(record => ({ record }))
    return {
      all: records.length,
      writing: records.filter(hit => hit.record.kind === 'writing').length,
      manuscripts: records.filter(hit => hit.record.kind === 'manuscripts').length,
      navigate: records.filter(hit => hit.record.kind === 'navigate').length,
    }
  }, [query, searched])

  useLayoutEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    input.current?.focus()
    return () => { if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }) }
  }, [])
  useEffect(() => { scroller.current?.scrollTo({ top: 0, behavior: 'instant' }) }, [query, scope])
  useEffect(() => {
    const selected = scroller.current?.querySelector<HTMLElement>('[data-active="true"]')
    const pane = scroller.current
    if (!selected || !pane) return
    const item = selected.getBoundingClientRect()
    const bounds = pane.getBoundingClientRect()
    if (item.top < bounds.top) pane.scrollTop += item.top - bounds.top
    else if (item.bottom > bounds.bottom) pane.scrollTop += item.bottom - bounds.bottom
  }, [active, hits])
  const activate = (hit: SpotlightHit) => {
    if (hit.record.entry) onEntry(hit.record.entry)
    else if (hit.record.manuscript) onManuscript(hit.record.manuscript)
    else if (hit.record.action) onAction(hit.record.action)
    onClose()
  }
  const changeScope = (next: SpotlightScope) => { setScope(next); setActive(0); input.current?.focus() }
  const keyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); return }
    if (event.key === 'Tab') {
      const focusable = Array.from(dialog.current?.querySelectorAll<HTMLElement>(
        'input:not([disabled]),button:not([disabled]):not([tabindex="-1"]),[role="scrollbar"][tabindex="0"]',
      ) ?? []).filter(element => element.getClientRects().length > 0)
      if (!focusable.length) return
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      return
    }
    if (document.activeElement !== input.current) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setActive(current => hits.length ? (current + (event.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length : 0)
    } else if (event.key === 'Enter' && focused) {
      event.preventDefault()
      activate(focused)
    }
  }

  let previousGroup = ''
  return <div className="spotlight-backdrop" onMouseDown={event => { if (event.currentTarget === event.target) onClose() }}>
    <section className="spotlight-dialog" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="spotlight-title" onKeyDown={keyDown}>
      <h2 id="spotlight-title" className="spotlight-sr-only">Search the journal</h2>
      <div className="spotlight-search-bar">
        <Search className="spotlight-magnifier" aria-hidden="true"/>
        <input ref={input} value={query} onChange={event => { setQuery(event.target.value); setActive(0) }}
          role="combobox" aria-label="Search the journal and research" aria-expanded="true"
          aria-controls="spotlight-options" aria-autocomplete="list"
          aria-activedescendant={focused ? 'spotlight-option-' + focused.record.id : undefined}
          placeholder="Search writing, research and more..." autoComplete="off" spellCheck={false}/>
        {query && <button className="spotlight-clear" aria-label="Clear search" onClick={() => { setQuery(''); setActive(0); input.current?.focus() }}><X aria-hidden="true"/></button>}
        <button className="spotlight-dismiss" aria-label="Close search" onClick={onClose}><X aria-hidden="true"/></button>
      </div>
      <div className="spotlight-scopes" role="group" aria-label="Search category">
        {scopes.map(tab => <button type="button" key={tab.id} aria-pressed={scope === tab.id}
          className={scope === tab.id ? 'selected' : ''} onClick={() => changeScope(tab.id)}>
          {tab.name}<span>{counts[tab.id]}</span>
        </button>)}
      </div>
      <div className="spotlight-workspace">
        <ScrollView id="spotlight-options" className="spotlight-results" viewportRef={scroller} role="listbox" label="Search results">
          {hits.length === 0 ? <div className="spotlight-empty" role="status">
            <Search aria-hidden="true"/><strong>No results found</strong>
            <p>Try another term or search in a different category.</p>
            <button type="button" onClick={() => { setQuery(''); setScope('all'); setActive(0); input.current?.focus() }}>Clear search <ArrowRight aria-hidden="true"/></button>
          </div> : hits.map((hit, i) => {
            const group = searched ? 'Results' : recent.includes(hit.record.id) ? groupLabel(hit.record.kind, true) : groupLabel(hit.record.kind, false)
            const showHeading = previousGroup !== group
            previousGroup = group
            return <div className="spotlight-result-block" key={hit.record.id}>
              {showHeading && <div className="spotlight-group-heading" aria-hidden="true">{group === 'Recently opened' && <History/>}<span>{group}</span>{searched && <span className="spotlight-group-count">{allHits.length} matches</span>}</div>}
              <button type="button" role="option" id={'spotlight-option-' + hit.record.id}
                aria-selected={active === i} tabIndex={-1} className="spotlight-option" data-active={active === i}
                onMouseEnter={() => setActive(i)} onMouseDown={event => event.preventDefault()}
                onClick={() => activate(hit)}>
                <KindIcon kind={hit.record.kind}/>
                <span className="spotlight-result-content">
                  <span className="spotlight-result-title"><Highlight value={hit.record.title} query={query}/></span>
                  <span className="spotlight-result-subtitle">{hit.record.eyebrow}{hit.record.reference ? '  ·  ' + hit.record.reference : ''}</span>
                  {searched && hit.excerpt && <span className="spotlight-result-context"><Highlight value={hit.excerpt} query={query}/></span>}
                </span>
                {active === i ? <CornerDownLeft className="spotlight-result-arrow" aria-hidden="true"/> : <ArrowUpRight className="spotlight-result-arrow" aria-hidden="true"/>}
              </button>
            </div>
          })}
          {allHits.length > maxRendered && <p className="spotlight-result-limit">First {maxRendered} results shown. Refine your search to narrow the list.</p>}
        </ScrollView>
      </div>
      <div className="spotlight-statusbar">
        <span className="spotlight-status-count">{searched ? allHits.length + ' results' : index.length + ' searchable items'}</span>
        <div className="spotlight-status-shortcuts">
          <span><Shortcut>↑</Shortcut><Shortcut>↓</Shortcut> Navigate</span>
          <span><Shortcut>↵</Shortcut> Open</span>
          <span><Shortcut>Esc</Shortcut> Close</span>
        </div>
      </div>
    </section>
  </div>
}
