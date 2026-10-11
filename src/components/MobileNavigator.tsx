import { Suspense, lazy, useState, useRef, type PointerEvent } from 'react'
import { ArrowRight, Bookmark, BookOpen, Check, ChevronRight, FileText, FlaskConical, FolderOpen, Microscope, PenLine, Search, Settings2, SlidersHorizontal, Sun, Moon, X } from 'lucide-react'
import { entries, topics, topicCount, type Entry, type Topic } from '../data'
import { dateLabel } from '../lib/utils'
import { cue } from '../haptics'
import { cn } from '../lib/utils'
const WindowedPane = lazy(() => import('./WindowedPane').then(m => ({ default: m.WindowedPane<Entry> })))
import { PANE_VIRTUAL_THRESHOLD } from './virtualizationPolicy'

type Page = 'topics' | 'recent'
const icons: Record<Topic, typeof BookOpen> = {
  Essays: PenLine,
  Research: Microscope,
  Engineering: SlidersHorizontal,
  Experiments: FlaskConical,
  Process: FileText,
}

interface Props {
  active: Topic | 'All'
  saved: number
  onFilter: (topic: Topic | 'All') => void
  onSaved: () => void
  onSearch: () => void
  onOpen: (entry: Entry) => void
  onSettings: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onClose: () => void
}
export function MobileNavigator({ active, saved, onFilter, onSaved, onSearch, onOpen, onSettings, theme, onToggleTheme, onClose }: Props) {
  const [page, setPage] = useState<Page>('topics')
  const pointer = useRef<number | null>(null)
  const change = (next: Page) => { if (page !== next) cue('selection'); setPage(next) }
  const choose = (topic: Topic | 'All') => { onFilter(topic); onClose() }
  const recent = entries.slice().sort((a, b) => b.date.localeCompare(a.date))
  const renderRecent = (entry: Entry) => <button key={entry.slug} onClick={() => { onOpen(entry); onClose() }}><span className="browse-recent-ref">{entry.issue}</span><span><strong>{entry.shortTitle}</strong><small>{entry.topic} · {dateLabel(entry.date)}</small></span><ChevronRight size={15}/></button>
  const start = (e: PointerEvent<HTMLDivElement>) => { pointer.current = e.clientY; try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* Synthetic event or browser without pointer capture. */ } }
  const end = (e: PointerEvent<HTMLDivElement>) => {
    const origin = pointer.current
    pointer.current = null
    if (origin !== null && e.clientY - origin > 68) { cue('light'); onClose() }
  }
  return <div className="browse-sheet">
    <div className="browse-grab" onPointerDown={start} onPointerUp={end} onPointerCancel={() => { pointer.current = null }} aria-hidden="true"><span /></div>
    <div className="browse-heading">
      <div><span className="section-label">thelabjournal™ / Library</span><h2>Browse journal</h2><p>Explore notes, essays and independent research.</p></div>
      <button type="button" className="browse-close" onClick={() => { cue('light'); onClose() }} aria-label="Close navigation"><X size={17}/></button>
    </div>
    <div className="browse-shortcuts">
      <button type="button" onClick={() => onSearch()}><Search size={16}/><span>Find an entry...</span><span className="browse-shortcut-trailing">Search <ArrowRight size={14}/></span></button>
    </div>
    <div className="browse-segments" aria-label="Navigation sections">
      <button className={cn(page === 'topics' && 'active')} aria-pressed={page === 'topics'} onClick={() => change('topics')}><FolderOpen size={14}/> Collections</button>
      <button className={cn(page === 'recent' && 'active')} aria-pressed={page === 'recent'} onClick={() => change('recent')}><BookOpen size={14}/> Recent writing</button>
    </div>
    <div className="browse-main">
      {page === 'topics' ? <>
        <div className="browse-featured-links">
          <button onClick={() => choose('All')} className={cn(active === 'All' && 'selected')}><span className="browse-feature-icon"><BookOpen size={17}/></span><span><strong>All writing</strong><small>Complete archive</small></span><span className="browse-numeric">{entries.length.toString().padStart(2, '0')}</span><ChevronRight size={15}/></button>
          <button onClick={() => { onSaved(); onClose() }}><span className="browse-feature-icon"><Bookmark size={17}/></span><span><strong>Saved entries</strong><small>Stored on this device</small></span><span className="browse-numeric">{saved.toString().padStart(2, '0')}</span><ChevronRight size={15}/></button>
        </div>
        <div className="browse-section-label"><span>Subjects</span><span>5 collections</span></div>
        <div className="browse-topic-grid">{topics.filter((topic): topic is Topic => topic !== 'All').map(topic => {
          const Icon = icons[topic]
          return <button key={topic} className={cn(active === topic && 'selected')} onClick={() => choose(topic)}><Icon size={17}/><span>{topic}</span><span className="browse-topic-count">{topicCount(topic).toString().padStart(2,'0')}</span>{active === topic && <Check className="browse-check" size={13}/>}</button>
        })}</div>
        <div className="browse-spotlight"><div><span className="section-label">From the workbench</span><strong>Learning in reverse</strong><p>What AI changed about how I learn and build.</p></div><button aria-label="Open Learning in reverse" onClick={() => { onOpen(entries[0]); onClose() }}><ArrowRight size={17}/></button></div>
      </> : <>
        <div className="browse-section-label"><span>Recently added</span><span>{recent.length.toString().padStart(2, '0')} entries</span></div>
        {recent.length >= PANE_VIRTUAL_THRESHOLD ? <Suspense fallback={<div className="browse-recent-list" role="status">Preparing recent writing…</div>}><WindowedPane items={recent} getKey={entry => entry.slug} estimateSize={68} className="browse-recent-list browse-recent-list--virtual" rowClassName="browse-window-row" label="Recent writing" renderItem={renderRecent}/></Suspense> : <div className="browse-recent-list">{recent.map(renderRecent)}</div>}
      </>}
    </div>
    <div className="browse-footer"><span><span className="small-dot"/> Journal · Vol. 01 / 2026</span><div className="browse-footer-actions"><button aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} title="Toggle theme" onClick={onToggleTheme}>{theme === "dark" ? <Sun size={15}/> : <Moon size={15}/>}</button><button onClick={() => { onSettings(); onClose() }}><Settings2 size={15}/> Preferences <ChevronRight size={13}/></button></div></div>
  </div>
}
