import { Suspense, lazy, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { Microscope, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, BookOpen, Bookmark, Check, ChevronDown, ChevronRight, Clock3, FileText, Filter, LayoutGrid, List as ListIcon, ListTree, Menu, Printer, Search, Settings2, Share2, Sun, Moon, X } from 'lucide-react'
import { entries, topics, topicCount, type Entry, type Topic } from './data'
import { JournalFigure, hasJournalDetailFigure } from './components/JournalFigure'
import { DitherScene } from './components/DitherScene'

import { DesktopRail } from './components/DesktopRail'
import { ExpandedSidebar } from './components/ExpandedSidebar'
import { CenteredScrollbar } from './components/CenteredScrollbar'
import { BrandMark } from './components/BrandMark'
import { AuthorAvatar } from './components/AuthorAvatar'
import { ARCHIVE_VIRTUAL_THRESHOLD } from './components/virtualizationPolicy'
import { loadPrefs, prefsStorage, type ArchiveLayout } from './components/journalPrefs'
import { PWAUpdateNotice, useJournalPWA } from './components/JournalPWA'
import { cue, cueDelayed, setHapticsEnabled } from './haptics'
import { applyTheme, effectiveTheme } from './theme'
import { cn, dateLabel } from './lib/utils'
import { scrollToArticleSection } from './lib/articleNavigation'
import { relatedEntriesFor } from './lib/relatedEntries'
import { compareArchiveEntries, type ArchiveSort } from './lib/archiveSort'
import { manuscripts, manuscriptPath, manuscriptFromPath, type Manuscript } from './research'
import './research.css'
import './research-reading.css'
import './manuscript-visual.css'
import './gravimetric-manuscript-presentation.css'
import './research-library.css'
import { ResearchLibrary } from './ResearchLibrary'
import { ResearchManuscriptBody, manuscriptNavigation } from './ResearchManuscriptBody'
import { ResearchContents, ResearchMobileContents, useResearchOutline } from './ResearchContents'
import { JournalSectionPicker } from './JournalSectionPicker'

const MobileNavigator = lazy(() => import('./components/MobileNavigator').then(m => ({ default: m.MobileNavigator })))
const loadWindowedArchive = () => import('./components/WindowedArchive')
const WindowedArchive = lazy(() => loadWindowedArchive().then(m => ({ default: m.WindowedArchive })))
import { JournalPreferences } from './components/JournalPreferences'
import { SpotlightSearch } from './components/SpotlightSearch'
import type { SpotlightAction } from './lib/spotlightIndex'
type Filter = Topic | 'All'
type Sort = ArchiveSort
type View = 'all' | 'saved'
const draft = entries[0]
const storageKey = 'thelabcorner.journal.saved.v1'
const manuscriptSavedKey = 'thelabcorner.research.saved.v1'
const sectionId = (index: number) => 'section-' + (index + 1)
const journalBase = import.meta.env.BASE_URL
// Shareable, statically generated pages for crawlers. Legacy ?post= links still work.
const paperHref = (entry: Entry) => journalBase + 'posts/' + encodeURIComponent(entry.slug) + '/'
const getInitialSlug = () => {
  const path = window.location.pathname
  const prefix = journalBase + 'posts/'
  if (path.startsWith(prefix)) {
    const slug = path.slice(prefix.length).replace(/\/$/, '')
    if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return slug
  }
  return new URLSearchParams(window.location.search).get('post')
}
const findEntry = (slug: string | null) => entries.find((entry) => entry.slug === slug) || null
// App navigation and scroll restoration are jumps, not animated journeys.
const jumpScroll = (top: number) => window.scrollTo({ top, behavior: 'instant' })

function ResearchPage({ paper, onOpen, isDark, isSaved, onToggleSaved, copied, onShare }: {
  paper: Manuscript | null
  onOpen: (paper: Manuscript | null) => void
  isDark: boolean
  isSaved: boolean
  onToggleSaved: (id: string) => void
  copied: boolean
  onShare: () => void
}) {
  const sections = paper ? manuscriptNavigation[paper.id] ?? [] : []
  const outline = useResearchOutline(sections, paper?.id)
  const progressRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!paper) return
    const documentBody = document.querySelector<HTMLElement>('.research-body')
    if (!documentBody) return
    let start = 0, end = 1, frame = 0
    const paint = () => {
      frame = 0
      const ratio = Math.max(0, Math.min(1, (window.scrollY - start) / Math.max(1, end - start)))
      if (progressRef.current) progressRef.current.style.transform = 'scaleX(' + ratio + ')'
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint) }
    const measure = () => {
      const bounds = documentBody.getBoundingClientRect()
      start = window.scrollY + bounds.top
      end = Math.max(start + 1, start + bounds.height - window.innerHeight)
      schedule()
    }
    const resize = new ResizeObserver(measure)
    resize.observe(documentBody)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', measure, { passive: true })
    const initial = requestAnimationFrame(measure)
    void document.fonts?.ready.then(measure)
    return () => {
      resize.disconnect(); cancelAnimationFrame(initial); cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', measure)
    }
  }, [paper?.id])
  return <main className="content-main research-page" id="main">{paper ? <>
    <div className="research-reader-chrome">
      <div className="research-reader-top">
        <button type="button" className="research-back" onClick={() => onOpen(null)}><ArrowLeft size={14}/> Research</button>
        <span className="research-reader-separator" aria-hidden="true">/</span>
        <span className="research-reader-short-title">{paper.title}</span>
        <span className="research-reader-version">{paper.version}</span>
        <ResearchMobileContents outline={outline}/>
        <div className="research-reader-actions" role="group" aria-label="Manuscript actions">
          <button type="button" className={cn('research-reader-action', 'research-reader-save', isSaved && 'is-saved')}
            aria-label={isSaved ? 'Remove manuscript from saved' : 'Save manuscript'} title={isSaved ? 'Remove from saved' : 'Save manuscript'}
            aria-pressed={isSaved} onClick={() => { cue(isSaved ? 'light' : 'success'); onToggleSaved(paper.id) }}>
            <Bookmark fill={isSaved ? 'currentColor' : 'none'} aria-hidden="true"/>
          </button>
          <button type="button" className="research-reader-action research-reader-share"
            aria-label={copied ? 'Link copied' : typeof navigator.share === 'function' ? 'Share manuscript' : 'Copy manuscript link'}
            title={copied ? 'Link copied' : typeof navigator.share === 'function' ? 'Share manuscript' : 'Copy manuscript link'}
            onClick={onShare}>{copied ? <Check aria-hidden="true"/> : <Share2 aria-hidden="true"/>}</button>
          <button type="button" className="research-reader-action research-print"
            onClick={() => window.print()} aria-label="Print manuscript" title="Print manuscript"><Printer aria-hidden="true"/></button>
        </div>
      </div>
      <div ref={progressRef} className="research-reading-progress" aria-hidden="true"/>
    </div>
    <div className="research-document-layout">
      <article className={paper.id === "gravimetric-decarboxylation-co2-progress" ? "research-body research-body--gravimetric" : "research-body"} aria-label={paper.title}>
        <ResearchManuscriptBody paperId={paper.id} isDark={isDark}/>
        <footer className="research-integrity-note">Manuscript status: {paper.status}. This label describes the author's revision workflow; it does not establish external peer review. Scientific claims, equations and figures retain their source context.</footer>
      </article>
      <ResearchContents key={paper.id} sections={sections} outline={outline} version={paper.version}/>
    </div>
  </> : <ResearchLibrary onOpen={onOpen}/>}</main>
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
function JournalIndex({ active, view, sort, setSort, query, setQuery, onOpen, saved, toggle, onFilter, onShowAll, onResearch, layout, setLayout }: {
  active: Filter, view: View, sort: Sort, setSort: (sort: Sort) => void, query: string, setQuery: (value: string) => void,
  onOpen: (entry: Entry) => void, saved: string[], toggle: (slug: string) => void, onFilter: (value: Filter) => void, onShowAll: () => void, onResearch: () => void, layout: ArchiveLayout, setLayout: (layout: ArchiveLayout) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const results = useMemo(() => entries.filter((entry) => {
    const term = query.trim().toLowerCase()
    return (view !== 'saved' || saved.includes(entry.slug)) && (view === 'saved' || active === 'All' || entry.topic === active) && (!term || [entry.title, entry.summary, entry.topic, ...entry.keywords].join(' ').toLowerCase().includes(term))
  }).sort((a, b) => compareArchiveEntries(a, b, sort)), [active, view, query, sort, saved])
  const visibleResults = expanded ? results : results.slice(0, 10)
  const renderEntry = (entry: Entry, index: number) => <ListRow entry={entry} onOpen={onOpen} isSaved={saved.includes(entry.slug)} toggle={toggle} position={index + 1} setSize={visibleResults.length}/>
  const heading = view === 'saved' ? 'Saved entries' : active === 'All' ? 'Journal' : active === 'Research' ? 'Research notes' : active
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
      {topics.map((topic) => <button key={topic} onClick={() => onFilter(topic)} className={cn('topic-tab', view === 'all' && active === topic && 'is-active')} aria-pressed={view === 'all' && active === topic}>{topic === 'All' ? 'All entries' : topic === 'Research' ? 'Research notes' : topic}<span>{topicCount(topic)}</span></button>)}
    </div>
    {view === 'all' && active === 'All' && !query && <FeatureRow onOpen={onOpen} isSaved={saved.includes(draft.slug)} toggle={toggle}/>}
    {view === 'all' && active === 'All' && !query && <button type="button" className="journal-research-bridge" onClick={onResearch}><Microscope size={16} aria-hidden="true"/><span><strong>Formal research</strong><small>{manuscripts.length} scientific manuscripts · mathematical models, interactive figures and references</small></span><ArrowRight size={15} aria-hidden="true"/></button>}
    <section className="index-section" aria-labelledby="index-heading">
      <div className="index-heading-row">
        <div><span className="section-label">{view === 'saved' ? 'Reading list' : 'Archive'}</span><h2 id="index-heading">{view === 'saved' ? 'Bookmarked' : 'All writing'} <span className="count-inline">{results.length.toString().padStart(2, '0')}</span></h2></div>
         <div className="index-actions"><div className="layout-choice" role="group" aria-label="Archive display"><button className={layout === "list" ? "is-selected" : ""} aria-pressed={layout === "list"} aria-label="List view" title="List view" onClick={() => { cue("selection"); setLayout("list") }}><ListIcon/></button><button className={layout === "cards" ? "is-selected" : ""} aria-pressed={layout === "cards"} aria-label="Card view" title="Card view" onClick={() => { cue("selection"); setLayout("cards") }}><LayoutGrid/></button></div><div className="inline-search"><Search aria-hidden="true"/><input type="search" aria-label="Filter journal entries" placeholder="Filter entries..." value={query} onChange={(event) => setQuery(event.target.value)}/>{query && <button title="Clear query" aria-label="Clear query" onClick={() => setQuery('')}><X/></button>}</div><div className="sort-wrap"><label htmlFor="journal-sort"><Filter aria-hidden="true"/></label><select id="journal-sort" aria-label="Sort journal entries" value={sort} onChange={(event) => setSort(event.target.value as Sort)}><option value="recent">Newest</option><option value="subject">Subject</option><option value="short">Shortest</option><option value="long">Longest</option></select><ChevronDown aria-hidden="true"/></div></div>
      </div>
      <div className="index-list-header"><span>Ref</span><span>Title / abstract</span><span>Field</span><span>Date</span><span>Actions</span></div>
      {visibleResults.length >= ARCHIVE_VIRTUAL_THRESHOLD ? <Suspense fallback={<div className="journal-list journal-list--pending" role="status">Preparing archive…</div>}><WindowedArchive entries={visibleResults} layout={layout} renderEntry={renderEntry}/></Suspense> : <div className={cn("journal-list", layout === "cards" && "journal-list--cards")} role="list" aria-label="Journal articles">{results.length ? visibleResults.map((entry, index) => <ListRow key={entry.slug} entry={entry} onOpen={onOpen} isSaved={saved.includes(entry.slug)} toggle={toggle} position={index + 1} setSize={visibleResults.length}/>) : <div className="empty-state">{view === 'saved' && !query ? <Bookmark/> : <Search/>}<strong>{view === 'saved' && !query ? 'Nothing saved yet' : 'No matching entries'}</strong><p>{view === 'saved' && !query ? 'Use the bookmark icon on an entry to keep it here.' : 'Try a different keyword or subject.'}</p><button className="button button--outline" onClick={() => { setQuery(''); if (view === 'saved') onShowAll(); else onFilter('All') }}>{view === 'saved' ? 'Browse the journal' : 'Clear filters'} <ArrowRight/></button></div>}</div>}
      {results.length > 10 && <button className="show-more" onPointerEnter={() => { void loadWindowedArchive() }} onFocus={() => { void loadWindowedArchive() }} onClick={() => setExpanded((value) => !value)}>{expanded ? 'Show fewer entries' : 'Show all ' + results.length + ' entries'} <ArrowRight/></button>}
    </section>
    <div className="archive-disclaimer"><span className="small-dot"/><span>Drafts and working notes are labeled. A convincing prototype is not the same as a verified result.</span></div>
  </main>
}
function Article({ entry, onBack, onOpen, copied, onShare, isSaved, toggle }: {
  entry: Entry, onBack: () => void, onOpen: (entry: Entry) => void, copied: boolean, onShare: () => void, isSaved: boolean, toggle: (slug: string) => void
}) {
  const [activeSection, setActiveSection] = useState(0)
  const relatedEntries = useMemo(() => relatedEntriesFor(entry, entries), [entry])
  const progressRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    setActiveSection(0)
    const article = document.querySelector<HTMLElement>('.article-body')
    if (!article) return
    let frame = 0
    let disposed = false
    let start = 0
    let end = 1
    let maxPageScroll = 0
    let boundary = 0
    let positions: number[] = []
    // Capture document geometry on resize, not every scroll frame. The hot
    // path only updates a compositor transform and binary-searches anchors.
    const update = () => {
      frame = 0
      const y = Number.isFinite(window.scrollY) ? Math.max(0, window.scrollY) : 0
      const ratio = Math.min(1, Math.max(0, (y - start) / Math.max(1, end - start)))
      if (progressRef.current) progressRef.current.style.transform = 'scaleX(' + ratio + ')'
      let low = 0, high = positions.length
      while (low < high) {
        const middle = (low + high) >>> 1
        if (positions[middle] <= y + boundary) low = middle + 1
        else high = middle
      }
      const active = y >= maxPageScroll - 3 ? entry.sections.length - 1 : Math.max(0, low - 1)
      setActiveSection(previous => previous === active ? previous : active)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const measure = () => {
      if (disposed) return
      const y = Number.isFinite(window.scrollY) ? window.scrollY : 0
      const bounds = article.getBoundingClientRect()
      start = y + bounds.top
      end = Math.max(start + 1, start + bounds.height - window.innerHeight)
      maxPageScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      boundary = (document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0) +
        (document.querySelector<HTMLElement>('.reading-bar')?.offsetHeight ?? 0) + 42
      positions = entry.sections.map((_, index) => {
        const section = document.getElementById(sectionId(index))
        return section ? y + section.getBoundingClientRect().top : Number.POSITIVE_INFINITY
      })
      schedule()
    }
    const followHash = () => {
      const match = /^#section-([1-9]\d*)$/.exec(window.location.hash)
      if (!match) return
      const index = Number(match[1]) - 1
      if (index < 0 || index >= entry.sections.length) return
      scrollToArticleSection(sectionId(index), 'instant')
      setActiveSection(index)
      schedule()
    }
    const resize = new ResizeObserver(measure)
    resize.observe(article)
    const initial = requestAnimationFrame(() => { measure(); followHash() })
    void document.fonts?.ready.then(measure)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', measure)
    window.addEventListener('popstate', followHash)
    window.addEventListener('hashchange', followHash)
    return () => {
      disposed = true
      resize.disconnect()
      cancelAnimationFrame(initial)
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', measure)
      window.removeEventListener('popstate', followHash)
      window.removeEventListener('hashchange', followHash)
    }
  }, [entry])
  const jumpTo = (index: number) => {
    if (!scrollToArticleSection(sectionId(index), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth')) return
    const hash = '#' + sectionId(index)
    // pushState does not trigger the browser's second, independent anchor scroll.
    if (window.location.hash !== hash) window.history.pushState(window.history.state, '', hash)
    setActiveSection(index)
  }
  return <main className="content-main article-main" id="main">
    <div className="reading-bar">
      <div className="reading-bar-main">
        <button type="button" onClick={onBack} className="reading-back"><ArrowLeft aria-hidden="true"/> Journal</button>
        <span className="reading-divider" aria-hidden="true"/>
        <span className="reading-context">{entry.shortTitle}</span>
      </div>
      <JournalSectionPicker key={entry.slug} entry={entry} activeSection={activeSection} onSelect={jumpTo}/>
      <div className="reading-controls" role="group" aria-label="Journal entry actions">
        <span className="reading-time"><Clock3 aria-hidden="true"/> {entry.minutes} min</span>
        <BookmarkButton entry={entry} saved={isSaved} toggle={toggle}/>
        <IconControl label={copied ? "Link copied" : typeof navigator.share === "function" ? "Share article" : "Copy article link"} onClick={onShare}>
          {copied ? <Check aria-hidden="true"/> : <Share2 aria-hidden="true"/>}
        </IconControl>
      </div>
      <div ref={progressRef} className="reading-progress" aria-hidden="true"/>
    </div>
    <article className="article-layout">
      <div className="article-body">
        <div className="article-kicker"><span className="section-label">{entry.type} · {entry.issue}</span><StageBadge stage={entry.stage}/></div>
        <h1>{entry.title}</h1>
        <p className="article-dek">{entry.summary}</p>
        <div className="article-meta"><AuthorAvatar className="author-avatar" decorative/><div><strong>Jackson Cummings</strong><span>{dateLabel(entry.date)} · {entry.minutes} min read</span></div><span className="article-category"><TopicBadge topic={entry.topic}/></span></div>
        <div className="article-prose">{entry.intro && entry.intro.length > 0 && <div className="article-opening">{entry.intro.map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div>}{entry.sections.map((section, i) => <section id={sectionId(i)} key={section.heading} className="prose-section">
          <div className="section-count">{String(i + 1).padStart(2, '0')} / {String(entry.sections.length).padStart(2, '0')}</div>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {i === 0 && <div className="article-evidence"><JournalFigure slug={entry.slug} variant="overview" className="article-figure"/>
            {entry.slug === draft.slug && <div className="editor-note"><FileText aria-hidden="true"/><div><strong>Editorial draft</strong><p>Prepared for review. Examples are generalized to avoid private implementation details.</p></div></div>}
          </div>}
          {section.takeaway && <aside className="takeaway"><span className="section-label">Working principle</span><p>{section.takeaway}</p></aside>}
          {entry.sections.length > 1 && i === Math.max(1, Math.floor(entry.sections.length / 2)) && hasJournalDetailFigure(entry.slug) && <JournalFigure slug={entry.slug} variant="detail" className="article-figure"/>}
        </section>)}</div>
        <div className="article-bottom"><div><span className="section-label">End of entry</span><h3>Keep reading</h3></div><button onClick={onBack} className="button button--outline">All writing <ArrowRight/></button></div>
        <div className="related-list">{relatedEntries.map((item) => <PostLink entry={item} onOpen={onOpen} className="related-row" key={item.slug}><span>{item.shortTitle}</span><span>{item.issue}<ArrowUpRight/></span></PostLink>)}</div>
      </div>
      <aside className="article-toc" aria-label="On this page">
        <div className="toc-heading"><div className="toc-heading-label"><ListTree aria-hidden="true"/><span>Contents</span></div><span className="toc-total" aria-label={entry.sections.length + ' sections'}>{String(entry.sections.length).padStart(2, '0')}</span></div>
        <p className="toc-position">Section {String(activeSection + 1).padStart(2, '0')} of {String(entry.sections.length).padStart(2, '0')}</p>
        <nav aria-label="Entry sections">{entry.sections.map((section,i) => <a key={section.heading} href={'#' + sectionId(i)} aria-current={activeSection === i ? 'location' : undefined} onClick={(event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
          event.preventDefault()
          jumpTo(i)
        }}><span className="toc-index" aria-hidden="true">{String(i+1).padStart(2,'0')}</span><span className="toc-link-label">{section.heading}</span></a>)}</nav>
        <div className="toc-footer">
          {relatedEntries.length > 0 && <div className="toc-related">
            <p className="toc-related-heading">Connected writing</p>
            <nav aria-label="Related journal entries">
              {relatedEntries.map((related) => <PostLink key={related.slug} entry={related} onOpen={onOpen} className="toc-related-link">
                <span className="toc-related-label">{related.shortTitle}</span>
                <span className="toc-related-meta">{related.issue}<ArrowUpRight aria-hidden="true"/></span>
              </PostLink>)}
            </nav>
          </div>}
          <button type="button" className="toc-return" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}><ArrowUp aria-hidden="true"/>Back to introduction</button>
        </div>
      </aside>
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
function useSavedManuscripts() {
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(manuscriptSavedKey) || '[]')
      return Array.isArray(value) ? value.filter((id): id is string =>
        typeof id === 'string' && manuscripts.some(paper => paper.id === id)) : []
    } catch { return [] }
  })
  const toggle = (id: string) => setSaved(previous => {
    const next = previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]
    try { localStorage.setItem(manuscriptSavedKey, JSON.stringify(next)) } catch { /* Bookmark remains usable in memory */ }
    return next
  })
  return { savedManuscripts: saved, toggleManuscript: toggle }
}

export default function App() {
  const pwa = useJournalPWA()
  const [researchPaper, setResearchPaper] = useState<Manuscript | null>(() => manuscriptFromPath(window.location.pathname))
  const [researchMode, setResearchMode] = useState(() => /\/research\/?$/.test(window.location.pathname) || Boolean(manuscriptFromPath(window.location.pathname)))
  const [selected, setSelected] = useState<Entry | null>(() => findEntry(getInitialSlug()))
  useEffect(() => {
    // Upgrade existing bookmark links without breaking them.
    const legacy = new URLSearchParams(window.location.search).get('post')
    if (legacy) {
      const entry = findEntry(legacy)
      if (entry) window.history.replaceState(window.history.state, '', paperHref(entry))
    }
  }, [])
  useEffect(() => {
    document.title = selected ? selected.title + ' | thelabjournal™' : 'thelabjournal™'
  }, [selected])
  const [filter, setFilter] = useState<Filter>('All')
  const [view, setView] = useState<View>('all')
  const [sort, setSort] = useState<Sort>('recent')
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [spotlightRecent, setSpotlightRecent] = useState<string[]>(() => {
    try { const parsed: unknown = JSON.parse(sessionStorage.getItem('thelabjournal.spotlight.recent') ?? '[]'); return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string').slice(0, 5) : [] } catch { return [] }
  })
  const trackSpotlightRecent = (id: string) => setSpotlightRecent(previous => {
    const next = [id, ...previous.filter(value => value !== id)].slice(0, 5)
    try { sessionStorage.setItem('thelabjournal.spotlight.recent', JSON.stringify(next)) } catch { /* optional session memory */ }
    return next
  })
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
  const { savedManuscripts, toggleManuscript } = useSavedManuscripts()
  const drawerRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const archiveScroll = useRef(0)
  const selectedRef = useRef(selected)
  selectedRef.current = selected
  const openArticle = (entry: Entry) => {
    cueDelayed('light', 75)
    trackSpotlightRecent('entry:' + entry.slug)
    setResearchMode(false); setResearchPaper(null)
    if (!selected) archiveScroll.current = window.scrollY
    window.history.pushState({}, '', paperHref(entry))
    setSelected(entry); setCopied(false); setNavOpen(false); setDialogOpen(false); jumpScroll(0)
  }
  const goHome = () => {
    cue('selection')
    window.history.pushState({}, '', journalBase)
    setResearchMode(false); setResearchPaper(null)
    setSelected(null); setNavOpen(false); setDialogOpen(false)
    requestAnimationFrame(() => jumpScroll(archiveScroll.current))
  }
  const changeFilter = (topic: Filter, delayed = false) => {
    if (delayed) cueDelayed('selection', 60); else cue('selection')
    setResearchMode(false); setResearchPaper(null)
    setFilter(topic); setView('all'); setQuery('')
    if (selected || researchMode || window.location.pathname !== journalBase) { window.history.pushState({}, '', journalBase); setSelected(null) }
    jumpScroll(0)
  }
  const openResearch = (paper: Manuscript | null) => {
    cue('selection')
    setCopied(false)
    if (paper) trackSpotlightRecent('manuscript:' + paper.id)
    const target = paper ? manuscriptPath(paper.id) : journalBase + 'research/'
    if (window.location.pathname !== target) window.history.pushState({}, '', target)
    setSelected(null); setResearchMode(true); setResearchPaper(paper); setNavOpen(false); setDialogOpen(false); jumpScroll(0)
  }
  const showSaved = (delayed = false) => {
    if (delayed) cueDelayed('selection', 60); else cue('selection')
    setResearchMode(false); setResearchPaper(null)
    setView('saved'); setQuery('')
    if (selected || researchMode || window.location.pathname !== journalBase) { window.history.pushState({}, '', journalBase); setSelected(null) }
    jumpScroll(0)
  }
  const openSearch = (delayed = false) => { if (delayed) cueDelayed('light', 60); else cue('light'); setNavOpen(false); setDialogOpen(true) }
  const spotlightAction = (action: SpotlightAction) => {
    if (action === 'journal') changeFilter('All')
    else if (action === 'research') openResearch(null)
    else if (action === 'saved') showSaved()
    else changeFilter('Engineering')
  }
  const openNavigation = (delayed = false) => { if (delayed) cueDelayed('selection', 60); else cue('selection'); setDialogOpen(false); setNavOpen(true) }
  const openSettings = () => { cue('selection'); setNavOpen(false); setDialogOpen(false); setPrefsOpen(true) }
  useEffect(() => {
    const sync = () => {
      const previous = selectedRef.current
      const next = findEntry(getInitialSlug())
      const nextPaper = manuscriptFromPath(window.location.pathname)
      const nextMode = window.location.pathname === journalBase + 'research/' || Boolean(nextPaper)
      setResearchPaper(nextPaper); setResearchMode(nextMode)
      // A TOC hash is history within this article, not a new article route.
      // Do not clobber the browser's current scroll position on Back/Forward.
      if (previous && next && previous.slug === next.slug && !nextMode) return
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
  useEffect(() => { document.title = selected ? selected.title + ' · thelabjournal™' : researchPaper ? researchPaper.title + ' · Research · thelabjournal™' : researchMode ? 'Research · thelabjournal™' : (view === 'saved' ? 'Saved · ' : '') + 'thelabjournal™' }, [selected, view, researchMode, researchPaper])
  useEffect(() => {
    if (!dialogOpen && !prefsOpen && !(compact && navOpen)) return
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (compact && navOpen) requestAnimationFrame(() => drawerRef.current?.querySelector<HTMLElement>('.browse-close, .drawer-close')?.focus())
    return () => { document.body.style.overflow = previous; returnFocus.current?.focus() }
  }, [dialogOpen, navOpen, compact, prefsOpen])
  const shareLink = async () => {
    setCopied(false)
    const value = window.location.href
    // Invoke native sharing immediately in the click's transient user-activation
    // window. Awaiting clipboard or another API first prevents iOS from opening
    // its share sheet. A canceled sheet is not a request to copy.
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: researchPaper?.title ?? selected?.title ?? document.title, url: value })
        return
      } catch (error) {
        if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') return
        // Permission / implementation errors fall back to copying the link.
      }
    }
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(value); cue('success'); setCopied(true); return }
      catch { /* Unsupported / insecure LAN origin: use legacy selection copy. */ }
    }
    const field = document.createElement('textarea')
    field.className = 'clipboard-fallback'; field.value = value; field.setAttribute('readonly', '')
    document.body.appendChild(field); field.focus(); field.select()
    let successful = false
    try {
      successful = document.execCommand('copy')
    } catch { /* Some embedded browsers disable legacy clipboard commands. */ }
    finally { field.remove() }
    setCopied(successful)
    if (successful) cue('success')
  }
  return <div className={cn('app-shell', railCollapsed && 'rail-collapsed')} data-text-scale={prefs.textScale} data-layout={prefs.layout}>
    <a href="#main" className="skip-link">Skip to content</a>
    <div className="journal-gutter-fields" aria-hidden="true">
      <div className="journal-gutter-field journal-gutter-field--left">
        <DitherScene variant="nav" className="journal-gutter-dither" ambientEdge="left" fps={8} speed={0.34} intensity={1.12}/>
      </div>
      <div className="journal-gutter-field journal-gutter-field--right">
        <DitherScene variant="nav" className="journal-gutter-dither" ambientEdge="right" fps={8} speed={0.34} intensity={1.12}/>
      </div>
    </div>
    <CenteredScrollbar/>
    <header className="site-header"><span className="header-dither-field" aria-hidden="true"><DitherScene variant="nav" className="header-dither-canvas" fps={14} intensity={0.95}/></span><div className="header-inner">
      <IconControl className="mobile-nav-toggle" onClick={openNavigation} label="Open journal navigation"><Menu/></IconControl>
      <button onClick={goHome} className="brand" aria-label="thelabjournal™ home"><BrandMark/><span className="brand-text">thelabjournal™</span></button>
      <nav className="header-links" aria-label="Primary navigation"><button className={!researchMode && !selected && view === 'all' && filter === 'All' ? 'current' : ''} onClick={() => changeFilter('All')}>Journal</button><button className={researchMode ? 'current' : ''} onClick={() => openResearch(null)}>Research</button><button className={!researchMode && !selected && view === 'all' && filter === 'Engineering' ? 'current' : ''} onClick={() => changeFilter('Engineering')}>Engineering</button></nav>
       <div className="header-end"><button className="header-search" onClick={() => openSearch()} aria-label="Search journal"><Search/><span>Search entries</span><kbd>{/Macintosh|Mac OS X|iPad|iPhone/i.test(navigator.userAgent) ? '⌘ K' : 'Ctrl K'}</kbd></button><IconControl className="mobile-search" label="Search journal" onClick={() => openSearch()}><Search/></IconControl><div className="header-tools"><IconControl className="header-preferences" label="Journal preferences" onClick={openSettings}><Settings2/></IconControl><IconControl className="header-theme" label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"} onClick={toggleTheme}>{resolvedTheme === "dark" ? <Sun/> : <Moon/>}</IconControl></div></div>
    </div></header>
    <div className={cn("frame", railCollapsed && "rail-collapsed", !researchMode && !selected && view === 'all' && filter === 'All' && "frame--journal-dither")}>
      {!researchMode && !selected && view === 'all' && filter === 'All' && <div className="journal-landing-dither-field" aria-hidden="true"><div className="journal-landing-dither-viewport"><DitherScene variant="nav" className="journal-landing-dither-canvas" fps={14}/></div></div>}
      <div className="workspace-edge" aria-hidden="true"><div className="workspace-edge-viewport"><span className="workspace-edge-dots"/></div></div>
      {compact && navOpen && <div className="mobile-drawer-backdrop is-open" onClick={() => setNavOpen(false)} aria-hidden="true"/>}
      <div ref={drawerRef} className={cn('sidebar-wrap', navOpen && 'is-open')} inert={compact && !navOpen} role={compact && navOpen ? 'dialog' : undefined} aria-modal={compact && navOpen ? 'true' : undefined} aria-label={compact && navOpen ? 'Journal navigation' : undefined} onKeyDown={trapTab}>
        <DesktopRail collapsed={railCollapsed} active={filter} view={view} selected={Boolean(selected)} saved={saved.length} researchMode={researchMode} onResearch={() => openResearch(null)} onCollapse={toggleRail} onFilter={changeFilter} onSaved={showSaved} onSettings={openSettings}/>
        {phone ? <Suspense fallback={null}><MobileNavigator active={filter} saved={saved.length} onFilter={changeFilter} onSaved={showSaved} onSearch={openSearch} onOpen={openArticle} onSettings={openSettings} onResearch={() => openResearch(null)} theme={resolvedTheme} onToggleTheme={toggleTheme} onClose={() => setNavOpen(false)}/></Suspense> : <><div className="mobile-drawer-head"><span className="drawer-handle" aria-hidden="true"/><span>Browse journal</span><IconControl className="drawer-close" label="Close navigation" onClick={() => setNavOpen(false)}><X/></IconControl></div><div className="side-panel"><ExpandedSidebar active={filter} view={view} researchMode={researchMode} activePaperId={researchPaper?.id ?? null} onResearch={() => openResearch(null)} openManuscript={openResearch} onFilter={changeFilter} showSaved={showSaved} openArticle={openArticle} selected={selected} savedCount={saved.length} close={() => setNavOpen(false)}/></div></>}
      </div>
      {researchMode ? <ResearchPage paper={researchPaper} onOpen={openResearch} isDark={resolvedTheme === "dark"}
        isSaved={Boolean(researchPaper && savedManuscripts.includes(researchPaper.id))}
        onToggleSaved={toggleManuscript} copied={copied} onShare={shareLink}/> : selected ? <Article entry={selected} onBack={goHome} onOpen={openArticle} copied={copied} onShare={shareLink} isSaved={saved.includes(selected.slug)} toggle={toggle}/> : <JournalIndex active={filter} view={view} sort={sort} setSort={setSort} query={query} setQuery={setQuery} onOpen={openArticle} saved={saved} toggle={toggle} onFilter={changeFilter} onShowAll={() => changeFilter('All')} onResearch={() => openResearch(null)} layout={prefs.layout} setLayout={layout => changePrefs({...prefs,layout})}/>}
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
    {dialogOpen && <SpotlightSearch recent={spotlightRecent} onClose={() => setDialogOpen(false)} onEntry={openArticle} onManuscript={paper => openResearch(paper)} onAction={spotlightAction}/>}
  </div>
}
