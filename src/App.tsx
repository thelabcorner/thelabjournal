import { Suspense, lazy, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Bookmark, Check, ChevronDown, ChevronRight, Clock3, Copy, FileText, Filter, LayoutGrid, List as ListIcon, Library, Menu, Microscope, Search, Settings2, SlidersHorizontal, Sun, Moon, X } from 'lucide-react'
import { entries, topics, topicCount, type Entry, type Topic } from './data'
import { ResearchFigure } from './components/ResearchFigure'
import { DitherScene } from './components/DitherScene'

import { DesktopRail } from './components/DesktopRail'
import { ARCHIVE_VIRTUAL_THRESHOLD, PANE_VIRTUAL_THRESHOLD } from './components/virtualizationPolicy'
import { loadPrefs, prefsStorage, type ArchiveLayout } from './components/journalPrefs'
import { PWAUpdateNotice, useJournalPWA } from './components/JournalPWA'
import { cue, cueDelayed, setHapticsEnabled } from './haptics'
import { applyTheme, effectiveTheme } from './theme'
import { cn, dateLabel } from './lib/utils'
import { compareArchiveEntries, type ArchiveSort } from './lib/archiveSort'

const MobileNavigator = lazy(() => import('./components/MobileNavigator').then(m => ({ default: m.MobileNavigator })))
const loadWindowedArchive = () => import('./components/WindowedArchive')
const WindowedArchive = lazy(() => loadWindowedArchive().then(m => ({ default: m.WindowedArchive })))
const WindowedPane = lazy(() => import('./components/WindowedPane').then(m => ({ default: m.WindowedPane<Entry> })))
import { JournalPreferences } from './components/JournalPreferences'
type Filter = Topic | 'All'
type Sort = ArchiveSort
type View = 'all' | 'saved'
const draft = entries[0]
const storageKey = 'thelabcorner.journal.saved.v1'
const sectionId = (index: number) => 'section-' + (index + 1)
const paperHref = (entry: Entry) => '?post=' + encodeURIComponent(entry.slug)
const getInitialSlug = () => new URLSearchParams(window.location.search).get('post')
const findEntry = (slug: string | null) => entries.find((entry) => entry.slug === slug) || null
// App navigation and scroll restoration are jumps, not animated journeys.
const jumpScroll = (top: number) => window.scrollTo({ top, behavior: 'instant' })

function Mark() {
  return <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 28 28" fill="none"><path d="M5 5H13V13H5V5ZM15 5H23V13H15V5ZM5 15H13V23H5V15ZM15 15H23V23H15V15Z" stroke="currentColor" strokeWidth="1.3"/><path d="M15 15H23V23H15V15Z" fill="currentColor"/></svg></span>
}
function Badge({ children, kind = 'neutral' }: { children: ReactNode, kind?: 'neutral' | 'success' | 'warning' }) {
  return <span className={cn('badge', 'badge--' + kind)}>{children}</span>
}
function StageBadge({ stage }: { stage: Entry['stage'] }) {
  return <Badge kind={stage === 'Editorial draft' ? 'warning' : 'neutral'}>{stage}</Badge>
}
function TopicBadge({ topic }: { topic: Entry['topic'] }) {
  return <Badge>{topic}</Badge>
}
function IconControl({ label, onClick, children, className, pressed }: { label: string, onClick: () => void, children: ReactNode, className?: string, pressed?: boolean }) {
  return <button type="button" className={cn('icon-control', className)} aria-label={label} title={label} aria-pressed={pressed} onClick={onClick}>{children}</button>
}
function PostLink({ entry, onOpen, children, className }: { entry: Entry, onOpen: (entry: Entry) => void, children: ReactNode, className?: string }) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
    event.preventDefault()
    onOpen(entry)
  }
  return <a className={className} href={paperHref(entry)} onClick={onClick}>{children}</a>
}
function useSavedEntries() {
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]')
      return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && entries.some((entry) => entry.slug === item)) : []
    } catch { return [] }
  })
  const toggle = (slug: string) => setSaved((previous) => {
    const next = previous.includes(slug) ? previous.filter((value) => value !== slug) : [...previous, slug]
    try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* Bookmarks remain usable in memory when storage is blocked. */ }
    return next
  })
  return { saved, toggle }
}
function BookmarkButton({ entry, saved, toggle, className }: { entry: Entry, saved: boolean, toggle: (slug: string) => void, className?: string }) {
  return <IconControl className={cn('bookmark-control', saved && 'is-saved', className)} label={saved ? 'Remove ' + entry.shortTitle + ' from saved' : 'Save ' + entry.shortTitle} pressed={saved} onClick={() => { cue(saved ? 'light' : 'success'); toggle(entry.slug) }}>{saved ? <Bookmark fill="currentColor"/> : <Bookmark/>}</IconControl>
}
function Sidebar({ active, view, onFilter, showSaved, openArticle, selected, savedCount, close }: {
  active: Filter, view: View, onFilter: (value: Filter) => void, showSaved: () => void,
  openArticle: (entry: Entry) => void, selected: Entry | null, savedCount: number, close: () => void
}) {
  return <aside className="sidebar" aria-label="Journal navigation">
    <div className="sidebar-scroll">
      <div className="side-group">
        <p className="section-label side-head">Library <span>{entries.length.toString().padStart(2, '0')}</span></p>
        <nav aria-label="Library views">
          <button className="side-nav-row" data-active={!selected && view === 'all' && active === 'All'} aria-current={!selected && view === 'all' && active === 'All' ? 'page' : undefined} onClick={() => { onFilter('All'); close() }}><span className="side-nav-name"><Library/>All writing</span><span className="side-count">{entries.length}</span></button>
          <button className="side-nav-row" data-active={!selected && view === 'saved'} aria-current={!selected && view === 'saved' ? 'page' : undefined} onClick={() => { showSaved(); close() }}><span className="side-nav-name"><Bookmark/>Saved entries</span><span className="side-count">{savedCount}</span></button>
        </nav>
      </div>
      <div className="side-group">
        <p className="section-label side-head">Subjects</p>
        <nav aria-label="Subjects">
          {topics.filter((topic) => topic !== 'All').map((topic) => <button key={topic} className="side-nav-row" data-active={!selected && view === 'all' && active === topic} aria-current={!selected && view === 'all' && active === topic ? 'page' : undefined} onClick={() => { onFilter(topic); close() }}>
            <span className="side-nav-name">{topic === 'Research' ? <Microscope/> : topic === 'Essays' ? <FileText/> : <SlidersHorizontal/>}{topic}</span><span className="side-count">{topicCount(topic)}</span>
          </button>)}
        </nav>
      </div>
      <div className="side-group side-group--recent">
        <p className="section-label side-head">Recent entries</p>
        <nav aria-label="Recent writing">
          {entries.slice().sort((a,b) => b.date.localeCompare(a.date)).slice(0, 5).map((entry) => <PostLink key={entry.slug} entry={entry} onOpen={(item) => { openArticle(item); close() }} className={cn('side-article', selected?.slug === entry.slug && 'side-article--active')}><span className="side-article-title">{entry.shortTitle}</span><span className="side-article-meta">{entry.topic} · {entry.issue}</span></PostLink>)}
        </nav>
      </div>
    </div>
    <div className="sidebar-footer"><span className="small-dot"/><span>Independent research and engineering notes.<br/>A working archive, not a publication feed.</span></div>
  </aside>
}
function FeatureRow({ onOpen, isSaved, toggle }: { onOpen: (entry: Entry) => void, isSaved: boolean, toggle: (slug: string) => void }) {
  return <section className="feature-row" aria-label="Featured essay">
    <PostLink entry={draft} onOpen={onOpen} className="feature-link">
      <div className="feature-information">
        <div className="feature-label"><span className="small-dot"/> Selected writing <span className="feature-separator">/</span> {draft.issue}</div>
        <h2>{draft.shortTitle}<ArrowUpRight aria-hidden="true"/></h2>
        <p>{draft.summary}</p>
        <div className="feature-meta"><span>{draft.type}</span><span>·</span><span>{draft.minutes} min</span><TopicBadge topic={draft.topic}/><StageBadge stage={draft.stage}/></div>
      </div>
      <div className="feature-illustration" aria-hidden="true"><DitherScene variant="sequence" className="feature-dither" fps={16} speed={0.72} intensity={0.9}/><span className="feature-visual-label">Learning sequence · 01</span></div>
    </PostLink>
    <BookmarkButton entry={draft} saved={isSaved} toggle={toggle} className="feature-bookmark"/>
  </section>
}
function ListRow({ entry, onOpen, isSaved, toggle, position, setSize }: { entry: Entry, onOpen: (entry: Entry) => void, isSaved: boolean, toggle: (slug: string) => void, position?: number, setSize?: number }) {
  return <div className="journal-row" role="listitem" aria-posinset={position} aria-setsize={setSize}>
    <PostLink className="journal-row-link" entry={entry} onOpen={onOpen}>
      <span className="row-number">{entry.issue}</span>
      <span className="journal-row-main"><span className="row-title">{entry.title}</span><span className="row-summary">{entry.summary}</span><span className="row-mobile-meta"><TopicBadge topic={entry.topic}/><span>{dateLabel(entry.date)} · {entry.minutes} min</span></span></span>
      <span className="row-type"><TopicBadge topic={entry.topic}/><small>{entry.type}</small></span>
      <span className="row-date">{dateLabel(entry.date)}</span>
      <ChevronRight className="row-arrow" aria-hidden="true"/>
    </PostLink>
    <BookmarkButton entry={entry} saved={isSaved} toggle={toggle} className="row-bookmark"/>
  </div>
}
function JournalIndex({ active, view, sort, setSort, query, setQuery, onOpen, saved, toggle, onFilter, onShowAll, layout, setLayout }: {
  active: Filter, view: View, sort: Sort, setSort: (sort: Sort) => void, query: string, setQuery: (value: string) => void,
  onOpen: (entry: Entry) => void, saved: string[], toggle: (slug: string) => void, onFilter: (value: Filter) => void, onShowAll: () => void, layout: ArchiveLayout, setLayout: (layout: ArchiveLayout) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const results = useMemo(() => entries.filter((entry) => {
    const term = query.trim().toLowerCase()
    return (view !== 'saved' || saved.includes(entry.slug)) && (view === 'saved' || active === 'All' || entry.topic === active) && (!term || [entry.title, entry.summary, entry.topic, ...entry.keywords].join(' ').toLowerCase().includes(term))
  }).sort((a, b) => compareArchiveEntries(a, b, sort)), [active, view, query, sort, saved])
  const visibleResults = expanded ? results : results.slice(0, 10)
  const renderEntry = (entry: Entry, index: number) => <ListRow entry={entry} onOpen={onOpen} isSaved={saved.includes(entry.slug)} toggle={toggle} position={index + 1} setSize={visibleResults.length}/>
  const heading = view === 'saved' ? 'Saved entries' : active === 'All' ? 'Journal' : active
  return <main className="content-main" id="main">
    <section className="workspace-heading" aria-labelledby="workspace-title">
      <div className="workspace-heading-top"><span className="section-label">thelabjournal™</span><span className="workspace-volume">Vol. 01 · 2026</span></div>
      <div className="workspace-heading-line"><div><h1 id="workspace-title">{heading}<span className="count-inline">{results.length.toString().padStart(2, '0')}</span></h1><p>{view === 'saved' ? 'Entries saved in this browser for later reading.' : 'Research, engineering notes, and essays from the workbench.'}</p></div></div>
    </section>
    <div className="workspace-status" aria-label="Journal at a glance">
      <div className="status-unit"><span className="status-label">In the archive</span><div><strong>{entries.length.toString().padStart(2, "0")}</strong><span>indexed entries</span></div></div>
      <div className="status-unit"><span className="status-label">Areas of work</span><div><strong>{(topics.length - 1).toString().padStart(2, "0")}</strong><span>subjects</span></div></div>
      <div className="status-unit"><span className="status-label">Editorial status</span><div><strong>{entries.filter(entry => entry.stage === "Editorial draft").length.toString().padStart(2, "0")}</strong><span>draft essay</span></div></div>
      <div className="status-unit status-unit--action"><span className="status-label">Your library</span><div><strong>{saved.length.toString().padStart(2, "0")}</strong><span>saved here</span></div></div>
    </div>
    <div className="workspace-filters" aria-label="Filter entries by subject">
      {topics.map((topic) => <button key={topic} onClick={() => onFilter(topic)} className={cn('topic-tab', view === 'all' && active === topic && 'is-active')} aria-pressed={view === 'all' && active === topic}>{topic === 'All' ? 'All entries' : topic}<span>{topicCount(topic)}</span></button>)}
    </div>
    {view === 'all' && active === 'All' && !query && <FeatureRow onOpen={onOpen} isSaved={saved.includes(draft.slug)} toggle={toggle}/>}
    <section className="index-section" aria-labelledby="index-heading">
      <div className="index-heading-row">
        <div><span className="section-label">{view === 'saved' ? 'Reading list' : 'Archive'}</span><h2 id="index-heading">{view === 'saved' ? 'Bookmarked' : 'All writing'} <span className="count-inline">{results.length.toString().padStart(2, '0')}</span></h2></div>
         <div className="index-actions"><div className="layout-choice" role="group" aria-label="Archive display"><button className={layout === "list" ? "is-selected" : ""} aria-pressed={layout === "list"} aria-label="List view" title="List view" onClick={() => { cue("selection"); setLayout("list") }}><ListIcon/></button><button className={layout === "cards" ? "is-selected" : ""} aria-pressed={layout === "cards"} aria-label="Card view" title="Card view" onClick={() => { cue("selection"); setLayout("cards") }}><LayoutGrid/></button></div><div className="inline-search"><Search aria-hidden="true"/><input type="search" aria-label="Filter journal entries" placeholder="Filter entries..." value={query} onChange={(event) => setQuery(event.target.value)}/>{query && <button title="Clear query" aria-label="Clear query" onClick={() => setQuery('')}><X/></button>}</div><div className="sort-wrap"><label htmlFor="journal-sort"><Filter aria-hidden="true"/></label><select id="journal-sort" aria-label="Sort journal entries" value={sort} onChange={(event) => setSort(event.target.value as Sort)}><option value="subject">Subject</option><option value="recent">Newest</option><option value="short">Shortest</option><option value="long">Longest</option></select><ChevronDown aria-hidden="true"/></div></div>
      </div>
      <div className="index-list-header"><span>Ref</span><span>Title / abstract</span><span>Field</span><span>Date</span><span>Actions</span></div>
      {visibleResults.length >= ARCHIVE_VIRTUAL_THRESHOLD ? <Suspense fallback={<div className="journal-list journal-list--pending" role="status">Preparing archive…</div>}><WindowedArchive entries={visibleResults} layout={layout} renderEntry={renderEntry}/></Suspense> : <div className={cn("journal-list", layout === "cards" && "journal-list--cards")} role="list" aria-label="Journal articles">{results.length ? visibleResults.map((entry, index) => <ListRow key={entry.slug} entry={entry} onOpen={onOpen} isSaved={saved.includes(entry.slug)} toggle={toggle} position={index + 1} setSize={visibleResults.length}/>) : <div className="empty-state">{view === 'saved' && !query ? <Bookmark/> : <Search/>}<strong>{view === 'saved' && !query ? 'Nothing saved yet' : 'No matching entries'}</strong><p>{view === 'saved' && !query ? 'Use the bookmark icon on an entry to keep it here.' : 'Try a different keyword or subject.'}</p><button className="button button--outline" onClick={() => { setQuery(''); if (view === 'saved') onShowAll(); else onFilter('All') }}>{view === 'saved' ? 'Browse the journal' : 'Clear filters'} <ArrowRight/></button></div>}</div>}
      {results.length > 10 && <button className="show-more" onPointerEnter={() => { void loadWindowedArchive() }} onFocus={() => { void loadWindowedArchive() }} onClick={() => setExpanded((value) => !value)}>{expanded ? 'Show fewer entries' : 'Show all ' + results.length + ' entries'} <ArrowRight/></button>}
    </section>
    <div className="archive-disclaimer"><span className="small-dot"/><span>Drafts and working notes are labeled. A convincing prototype is not the same as a verified result.</span></div>
  </main>
}
function Article({ entry, onBack, onOpen, copied, onCopy, isSaved, toggle }: {
  entry: Entry, onBack: () => void, onOpen: (entry: Entry) => void, copied: boolean, onCopy: () => void, isSaved: boolean, toggle: (slug: string) => void
}) {
  const [activeSection, setActiveSection] = useState(0)
  const progressRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    setActiveSection(0)
    let pending = false
    const update = () => {
      pending = false
      const article = document.querySelector('.article-body')
      if (!article) return
      const box = article.getBoundingClientRect()
      const top = window.scrollY + box.top
      const end = top + box.height - window.innerHeight
      const ratio = Math.min(1, Math.max(0, (window.scrollY - top) / Math.max(1, end - top)))
      if (progressRef.current) progressRef.current.style.transform = 'scaleX(' + ratio + ')'
      let current = 0
      entry.sections.forEach((_, i) => {
        const element = document.getElementById(sectionId(i))
        if (element && element.getBoundingClientRect().top <= 170) current = i
      })
      setActiveSection((previous) => previous === current ? previous : current)
    }
    const onScroll = () => { if (!pending) { pending = true; requestAnimationFrame(update) } }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [entry])
  const jumpTo = (index: number) => document.getElementById(sectionId(index))?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  return <main className="content-main article-main" id="main">
    <div className="reading-bar"><div className="reading-bar-main"><button onClick={onBack} className="reading-back"><ArrowLeft/> Journal</button><span className="reading-divider"/><span className="reading-context">{entry.shortTitle}</span></div><div className="reading-controls"><span className="reading-time"><Clock3/> {entry.minutes} min</span><BookmarkButton entry={entry} saved={isSaved} toggle={toggle}/><IconControl label={copied ? 'Link copied' : 'Copy article link'} onClick={onCopy}>{copied ? <Check/> : <Copy/>}</IconControl></div><div ref={progressRef} className="reading-progress"/></div>
    <article className="article-layout">
      <div className="article-body">
        <div className="article-kicker"><span className="section-label">{entry.type} · {entry.issue}</span><StageBadge stage={entry.stage}/></div>
        <h1>{entry.title}</h1>
        <p className="article-dek">{entry.summary}</p>
        <div className="article-meta"><span className="author-avatar">JC</span><div><strong>Jackson Cummings</strong><span>{dateLabel(entry.date)} · {entry.minutes} min read</span></div><span className="article-category"><TopicBadge topic={entry.topic}/></span></div>
        <div className="article-mobile-contents"><label htmlFor="article-jump">In this entry</label><div className="article-select"><select id="article-jump" value={activeSection} onChange={(event) => jumpTo(Number(event.target.value))}>{entry.sections.map((section, i) => <option value={i} key={section.heading}>{String(i + 1).padStart(2,'0')} · {section.heading}</option>)}</select><ChevronDown/></div></div>
        <div className="article-prose">{entry.sections.map((section, i) => <section id={sectionId(i)} key={section.heading} className="prose-section">
          <div className="section-count">{String(i + 1).padStart(2, '0')} / {String(entry.sections.length).padStart(2, '0')}</div>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {i === 0 && <div className="article-evidence"><ResearchFigure type={entry.figure} className="article-figure"/>
            {entry.slug === draft.slug && <div className="editor-note"><FileText aria-hidden="true"/><div><strong>Editorial draft</strong><p>Prepared for review. Examples are generalized to avoid private implementation details.</p></div></div>}
          </div>}
          {section.takeaway && <aside className="takeaway"><span className="section-label">Working principle</span><p>{section.takeaway}</p></aside>}
        </section>)}</div>
        <div className="article-bottom"><div><span className="section-label">End of entry</span><h3>Keep reading</h3></div><button onClick={onBack} className="button button--outline">All writing <ArrowRight/></button></div>
        <div className="related-list">{entries.filter((item) => item.slug !== entry.slug).slice(0,2).map((item) => <PostLink entry={item} onOpen={onOpen} className="related-row" key={item.slug}><span>{item.shortTitle}</span><span>{item.issue}<ArrowUpRight/></span></PostLink>)}</div>
      </div>
      <aside className="article-toc" aria-label="On this page"><p className="section-label">In this entry</p><nav>{entry.sections.map((section,i) => <a key={section.heading} href={'#' + sectionId(i)} aria-current={activeSection === i ? 'location' : undefined}><span>{String(i+1).padStart(2,'0')}</span>{section.heading}</a>)}</nav><div className="toc-bottom"><Clock3/> {entry.minutes} min read · {entry.stage}</div></aside>
    </article>
  </main>
}
function trapTab(event: ReactKeyboardEvent<HTMLElement>) {
  if (event.key !== 'Tab') return
  const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled])')).filter((item) => item.getClientRects().length > 0)
  if (!items.length) return
  const first = items[0]; const last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}
function SearchDialog({ query, setQuery, onClose, onOpen }: { query: string, setQuery: (value: string) => void, onClose: () => void, onOpen: (entry: Entry) => void }) {
  const input = useRef<HTMLInputElement>(null)
  const [highlighted, setHighlighted] = useState(0)
  useEffect(() => { input.current?.focus() }, [])
  const matches = useMemo(() => entries.filter((entry) => [entry.title, entry.summary, entry.type, ...entry.keywords].join(' ').toLowerCase().includes(query.trim().toLowerCase())), [query])
  const onKeys = (event: ReactKeyboardEvent<HTMLElement>) => {
    trapTab(event)
    if (event.key === 'ArrowDown') { event.preventDefault(); setHighlighted((current) => (current + 1) % Math.max(matches.length, 1)) }
    if (event.key === 'ArrowUp') { event.preventDefault(); setHighlighted((current) => (current - 1 + Math.max(matches.length, 1)) % Math.max(matches.length, 1)) }
    if (event.key === 'Enter' && matches.length && document.activeElement === input.current) { event.preventDefault(); onOpen(matches[Math.min(highlighted, matches.length - 1)]); onClose() }
  }
  const renderMatch = (entry: Entry, i: number) => <button className={highlighted === i ? 'is-highlighted' : ''} key={entry.slug} onMouseEnter={() => setHighlighted(i)} onClick={() => { onOpen(entry); onClose() }}><FileText/><span><strong>{entry.shortTitle}</strong><small>{entry.topic} · {entry.type}</small></span><ArrowRight/></button>
  return <div className="overlay" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}><section className="search-dialog" role="dialog" aria-modal="true" aria-label="Search the journal" onKeyDown={onKeys}><div className="dialog-search"><Search/><input ref={input} value={query} onChange={(event) => { setQuery(event.target.value); setHighlighted(0) }} placeholder="Search the journal..." aria-label="Search entries"/><button onClick={onClose} aria-label="Close search"><X/></button></div><div className={cn("dialog-results", matches.length >= PANE_VIRTUAL_THRESHOLD && "dialog-results--virtual")}><p className="section-label">Results <span>{matches.length.toString().padStart(2,'0')}</span></p>{matches.length >= PANE_VIRTUAL_THRESHOLD ? <Suspense fallback={<div className="dialog-window-pending" role="status">Preparing results…</div>}><WindowedPane items={matches} getKey={entry => entry.slug} estimateSize={58} className="dialog-window-scroll" rowClassName="dialog-window-row" label="Search results" activeIndex={highlighted} renderItem={renderMatch}/></Suspense> : matches.map(renderMatch)}{matches.length === 0 && <p className="dialog-none">No results found.</p>}</div><div className="dialog-footer"><kbd>↑</kbd><kbd>↓</kbd> Navigate <span/><kbd>↵</kbd> Open <span/><kbd>Esc</kbd> Close</div></section></div>
}
export default function App() {
  const pwa = useJournalPWA()
  const [selected, setSelected] = useState<Entry | null>(() => findEntry(getInitialSlug()))
  const [filter, setFilter] = useState<Filter>('All')
  const [view, setView] = useState<View>('all')
  const [sort, setSort] = useState<Sort>('subject')
  const [query, setQuery] = useState('')
  const [dialogQuery, setDialogQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 1023px)').matches)
  const [copied, setCopied] = useState(false)
  const [phone, setPhone] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [railCollapsed, setRailCollapsed] = useState(() => { try { return localStorage.getItem('thelabcorner.journal.rail') === 'collapsed' } catch { return false } })
  const toggleRail = () => setRailCollapsed(current => { try { localStorage.setItem('thelabcorner.journal.rail', current ? 'expanded' : 'collapsed') } catch { /* persist if possible */ } return !current })
  const [prefs, setPrefs] = useState(loadPrefs)
  const changePrefs = (next: typeof prefs) => {
    setPrefs(next)
    applyTheme(next.theme)
    setHapticsEnabled(next.haptics)
    try { localStorage.setItem(prefsStorage, JSON.stringify({ textScale: next.textScale, layout: next.layout, theme: next.theme })) } catch { /* In-memory preference remains usable. */ }
  }
  const [resolvedTheme, setResolvedTheme] = useState(() => effectiveTheme(prefs.theme))
  useEffect(() => {
    const onSystemChange = () => { if (prefs.theme === 'system') setResolvedTheme(applyTheme('system')) }
    setResolvedTheme(applyTheme(prefs.theme))
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', onSystemChange)
    return () => media.removeEventListener('change', onSystemChange)
  }, [prefs.theme])
  const toggleTheme = () => { cue('selection'); changePrefs({ ...prefs, theme: resolvedTheme === 'dark' ? 'light' : 'dark' }) }
  const { saved, toggle } = useSavedEntries()
  const drawerRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const archiveScroll = useRef(0)
  const selectedRef = useRef(selected)
  selectedRef.current = selected
  const openArticle = (entry: Entry) => {
    cueDelayed('light', 75)
    if (!selected) archiveScroll.current = window.scrollY
    window.history.pushState({}, '', paperHref(entry))
    setSelected(entry); setCopied(false); setNavOpen(false); setDialogOpen(false); jumpScroll(0)
  }
  const goHome = () => {
    cue('selection')
    window.history.pushState({}, '', window.location.pathname)
    setSelected(null); setNavOpen(false); setDialogOpen(false)
    requestAnimationFrame(() => jumpScroll(archiveScroll.current))
  }
  const changeFilter = (topic: Filter, delayed = false) => {
    if (delayed) cueDelayed('selection', 60); else cue('selection')
    setFilter(topic); setView('all'); setQuery('')
    if (selected) { window.history.pushState({}, '', window.location.pathname); setSelected(null) }
    jumpScroll(0)
  }
  const showSaved = (delayed = false) => {
    if (delayed) cueDelayed('selection', 60); else cue('selection')
    setView('saved'); setQuery('')
    if (selected) { window.history.pushState({}, '', window.location.pathname); setSelected(null) }
    jumpScroll(0)
  }
  const openSearch = (delayed = false) => { if (delayed) cueDelayed('light', 60); else cue('light'); setNavOpen(false); setDialogQuery(''); setDialogOpen(true) }
  const openNavigation = (delayed = false) => { if (delayed) cueDelayed('selection', 60); else cue('selection'); setDialogOpen(false); setNavOpen(true) }
  const openSettings = () => { cue('selection'); setNavOpen(false); setDialogOpen(false); setPrefsOpen(true) }
  useEffect(() => {
    const sync = () => {
      const previous = selectedRef.current
      const next = findEntry(getInitialSlug())
      setSelected(next); setNavOpen(false); setDialogOpen(false)
      if (!next && previous) requestAnimationFrame(() => jumpScroll(archiveScroll.current))
      else jumpScroll(0)
    }
    const media = window.matchMedia('(max-width: 1023px)')
    const phoneMedia = window.matchMedia('(max-width: 767px)')
    const resize = () => setCompact(media.matches)
    const resizePhone = () => setPhone(phoneMedia.matches)
    window.addEventListener('popstate', sync)
    media.addEventListener('change', resize)
    phoneMedia.addEventListener('change', resizePhone)
    return () => { window.removeEventListener('popstate', sync); media.removeEventListener('change', resize); phoneMedia.removeEventListener('change', resizePhone) }
  }, [])
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setNavOpen(false); setDialogOpen((open) => !open) }
      if (event.key === 'Escape') { setDialogOpen(false); setNavOpen(false); setPrefsOpen(false) }
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement) && !(event.target instanceof HTMLSelectElement) && !(event.target instanceof HTMLElement && event.target.isContentEditable)) { event.preventDefault(); openSearch() }
    }
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler)
  }, [])
  useEffect(() => { document.title = selected ? selected.title + ' · thelabjournal™' : (view === 'saved' ? 'Saved · ' : '') + 'thelabjournal™' }, [selected, view])
  useEffect(() => {
    if (!dialogOpen && !prefsOpen && !(compact && navOpen)) return
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (compact && navOpen) requestAnimationFrame(() => drawerRef.current?.querySelector<HTMLElement>('.browse-close, .drawer-close')?.focus())
    return () => { document.body.style.overflow = previous; returnFocus.current?.focus() }
  }, [dialogOpen, navOpen, compact, prefsOpen])
  const copyLink = async () => {
    cue('success')
    const value = window.location.href
    if (navigator.clipboard?.writeText) { try { await navigator.clipboard.writeText(value); setCopied(true); return } catch { /* LAN HTTP fallback. */ } }
    const field = document.createElement('textarea')
    field.className = 'clipboard-fallback'; field.value = value; field.setAttribute('readonly', '')
    document.body.appendChild(field); field.focus(); field.select()
    setCopied(document.execCommand('copy')); field.remove()
  }
  return <div className="app-shell" data-text-scale={prefs.textScale} data-layout={prefs.layout}>
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="site-header"><span className="header-dither-field" aria-hidden="true"><DitherScene variant="nav" className="header-dither-canvas" fps={14} intensity={0.95}/></span><div className="header-inner">
      <IconControl className="mobile-nav-toggle" onClick={openNavigation} label="Open journal navigation"><Menu/></IconControl>
      <button onClick={goHome} className="brand" aria-label="thelabjournal™ home"><Mark/><span className="brand-text">thelabjournal™</span></button>
      <nav className="header-links" aria-label="Primary navigation"><button className={!selected && view === 'all' && filter === 'All' ? 'current' : ''} onClick={() => changeFilter('All')}>Journal</button><button className={!selected && view === 'all' && filter === 'Research' ? 'current' : ''} onClick={() => changeFilter('Research')}>Research</button><button className={!selected && view === 'all' && filter === 'Engineering' ? 'current' : ''} onClick={() => changeFilter('Engineering')}>Engineering</button></nav>
      <div className="header-end"><button className="header-search" onClick={() => openSearch()} aria-label="Search journal"><Search/><span>Search entries</span><kbd>⌘ K</kbd></button><IconControl className="mobile-search" label="Search journal" onClick={() => openSearch()}><Search/></IconControl><IconControl className="header-theme" label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"} onClick={toggleTheme}>{resolvedTheme === "dark" ? <Sun/> : <Moon/>}</IconControl><IconControl className="header-preferences" label="Journal preferences" onClick={openSettings}><Settings2/></IconControl><span className="header-issue">Vol. 01 / 2026</span></div>
    </div></header>
    <div className={cn("frame", railCollapsed && "rail-collapsed", !selected && view === 'all' && filter === 'All' && "frame--journal-dither")}>
      {!selected && view === 'all' && filter === 'All' && <div className="journal-landing-dither-field" aria-hidden="true"><div className="journal-landing-dither-viewport"><DitherScene variant="nav" className="journal-landing-dither-canvas" fps={14}/></div></div>}
      {compact && navOpen && <div className="mobile-drawer-backdrop is-open" onClick={() => setNavOpen(false)} aria-hidden="true"/>}
      <div ref={drawerRef} className={cn('sidebar-wrap', navOpen && 'is-open')} inert={compact && !navOpen} role={compact && navOpen ? 'dialog' : undefined} aria-modal={compact && navOpen ? 'true' : undefined} aria-label={compact && navOpen ? 'Journal navigation' : undefined} onKeyDown={trapTab}>
        <DesktopRail collapsed={railCollapsed} active={filter} view={view} selected={Boolean(selected)} saved={saved.length} onCollapse={toggleRail} onFilter={changeFilter} onSaved={showSaved} onSettings={openSettings}/>
        {phone ? <Suspense fallback={null}><MobileNavigator active={filter} saved={saved.length} onFilter={changeFilter} onSaved={showSaved} onSearch={openSearch} onOpen={openArticle} onSettings={openSettings} theme={resolvedTheme} onToggleTheme={toggleTheme} onClose={() => setNavOpen(false)}/></Suspense> : <><div className="mobile-drawer-head"><span className="drawer-handle" aria-hidden="true"/><span>Browse journal</span><IconControl className="drawer-close" label="Close navigation" onClick={() => setNavOpen(false)}><X/></IconControl></div><div className="side-panel"><Sidebar active={filter} view={view} onFilter={changeFilter} showSaved={showSaved} openArticle={openArticle} selected={selected} savedCount={saved.length} close={() => setNavOpen(false)}/></div></>}
      </div>
      {selected ? <Article entry={selected} onBack={goHome} onOpen={openArticle} copied={copied} onCopy={copyLink} isSaved={saved.includes(selected.slug)} toggle={toggle}/> : <JournalIndex active={filter} view={view} sort={sort} setSort={setSort} query={query} setQuery={setQuery} onOpen={openArticle} saved={saved} toggle={toggle} onFilter={changeFilter} onShowAll={() => changeFilter('All')} layout={prefs.layout} setLayout={layout => changePrefs({...prefs,layout})}/>}
    </div>
    <footer className="site-footer"><div className="footer-inner"><span>© {new Date().getFullYear()} thelabjournal™</span><span>Research · Engineering · Essays</span><button onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}>Back to top ↑</button></div></footer>
    <nav className="mobile-tabbar" aria-label="Mobile primary navigation">
      <span className="tabbar-dither-field" aria-hidden="true"><DitherScene variant="nav" className="tabbar-dither-canvas" fps={14} intensity={0.98}/></span>
      <button aria-current={!selected && view === 'all' && filter === 'All' ? 'page' : undefined} onClick={() => { changeFilter('All', true); window.scrollTo(0,0) }}><BookOpen/><span>Journal</span></button>
      <button aria-expanded={navOpen} onClick={() => openNavigation(true)}><Menu/><span>Browse</span></button>
      <button aria-current={!selected && view === 'saved' ? 'page' : undefined} onClick={() => { showSaved(true); window.scrollTo(0,0) }}><Bookmark/><span>Saved</span>{saved.length > 0 && <i className="tab-count">{saved.length}</i>}</button>
      <button onClick={() => openSearch(true)}><Search/><span>Search</span></button>
    </nav>
    {prefsOpen && <Suspense fallback={null}><JournalPreferences prefs={prefs} pwa={pwa} onChange={changePrefs} onClose={() => setPrefsOpen(false)}/></Suspense>}
    <PWAUpdateNotice pwa={pwa}/>
    {dialogOpen && <SearchDialog query={dialogQuery} setQuery={setDialogQuery} onClose={() => setDialogOpen(false)} onOpen={openArticle}/>}
  </div>
}
