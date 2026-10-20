import { useState, type MouseEvent } from 'react'
import { BookOpen, Bookmark, ChevronDown, FileText, FlaskConical, Library, Microscope, Workflow, Wrench } from 'lucide-react'
import { entries, topics, topicCount, type Entry, type Topic } from '../data'
import { manuscripts, manuscriptPath, type Manuscript } from '../research'

type Filter = Topic | 'All'
type View = 'all' | 'saved'

interface ExpandedSidebarProps {
  active: Filter
  view: View
  researchMode: boolean
  activePaperId: string | null
  onResearch: () => void
  openManuscript: (paper: Manuscript) => void
  onFilter: (topic: Filter) => void
  showSaved: () => void
  openArticle: (entry: Entry) => void
  selected: Entry | null
  savedCount: number
  close: () => void
}

const topicIcons = {
  Essays: BookOpen,
  Research: Microscope,
  Engineering: Wrench,
  Experiments: FlaskConical,
  Process: Workflow,
} as const

const entryHref = (entry: Entry) => import.meta.env.BASE_URL + 'posts/' + encodeURIComponent(entry.slug) + '/'
// Explorer labels are intentionally concise; full formal titles remain in the paper index and link tooltips.
const paperSidebarTitles: Record<string, string> = {
  'gravimetric-decarboxylation-co2-progress': 'Gravimetric decarboxylation',
  'low-temp-lyophilization-three-theses': 'Low-temperature lyophilization',
}
const recentEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
const twoDigits = (value: number) => String(value).padStart(2, '0')
const shortDate = (date: string) => new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
const unmodifiedClick = (event: MouseEvent<HTMLAnchorElement>) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey

export function ExpandedSidebar({
  active, view, researchMode, activePaperId, onResearch, openManuscript, onFilter, showSaved,
  openArticle, selected, savedCount, close,
}: ExpandedSidebarProps) {
  const [subjectsOpen, setSubjectsOpen] = useState(true)
  const [recentOpen, setRecentOpen] = useState(true)
  const selectedIsRecent = recentEntries.some((item) => item.slug === selected?.slug)

  const navigate = (callback: () => void) => {
    callback()
    close()
  }
  const openEntry = (event: MouseEvent<HTMLAnchorElement>, entry: Entry) => {
    if (!unmodifiedClick(event)) return
    event.preventDefault()
    navigate(() => openArticle(entry))
  }
  const openPaper = (event: MouseEvent<HTMLAnchorElement>, paper: Manuscript) => {
    if (!unmodifiedClick(event)) return
    event.preventDefault()
    navigate(() => openManuscript(paper))
  }
  const renderRecent = (entry: Entry, contextual = false) => (
    <a
      key={entry.slug}
      href={entryHref(entry)}
      title={entry.title + ' · ' + entry.topic + ' · ' + entry.date}
      className={'side-article' + (contextual ? ' side-article--context' : '')}
      data-active={selected?.slug === entry.slug}
      aria-current={selected?.slug === entry.slug ? 'page' : undefined}
      onClick={(event) => openEntry(event, entry)}
    >
      <span className="side-article-identity">
        <span className="side-article-ref">{entry.issue}</span>
        <span className="side-article-meta">{contextual ? entry.topic + ' · ' + shortDate(entry.date) : shortDate(entry.date)}</span>
      </span>
      <span className="side-article-title">{entry.shortTitle}</span>
    </a>
  )

  return (
    <aside className="sidebar sidebar--explorer" aria-label="Journal navigation">
      <div className="side-explorer-header">
        <div className="side-explorer-title"><strong>Explorer</strong></div>
        <div className="side-explorer-description">Journal &amp; research</div>
      </div>

      <div className="sidebar-scroll">
        <section className="side-group side-group--journal" aria-labelledby="side-journal-heading">
          <div className="side-section-heading side-domain-heading">
            <h2 id="side-journal-heading">Journal</h2>
            <span className="side-section-count">{twoDigits(entries.length)} articles</span>
          </div>
          <nav className="side-items" aria-label="Journal articles">
            <button type="button" className="side-nav-row" data-active={!researchMode && !selected && view === 'all' && active === 'All'} aria-current={!researchMode && !selected && view === 'all' && active === 'All' ? 'page' : undefined} onClick={() => navigate(() => onFilter('All'))}>
              <Library aria-hidden="true"/><span className="side-nav-name">All articles</span><span className="side-count">{twoDigits(entries.length)}</span>
            </button>
            <button type="button" className="side-nav-row" data-active={!researchMode && !selected && view === 'saved'} aria-current={!researchMode && !selected && view === 'saved' ? 'page' : undefined} onClick={() => navigate(showSaved)}>
              <Bookmark aria-hidden="true"/><span className="side-nav-name">Saved articles</span><span className="side-count">{twoDigits(savedCount)}</span>
            </button>
          </nav>

          <div className="side-subgroup">
            <button type="button" className="side-section-heading side-section-toggle" aria-expanded={subjectsOpen} aria-controls="side-subject-items" onClick={() => setSubjectsOpen((value) => !value)}>
              <span id="side-subjects-heading">Subjects</span><span className="side-section-actions"><span className="side-section-count">{twoDigits(topics.length - 1)}</span><ChevronDown className={subjectsOpen ? '' : 'is-collapsed'} aria-hidden="true"/></span>
            </button>
            {subjectsOpen && <nav id="side-subject-items" className="side-items" aria-label="Journal subjects">
              {topics.filter((topic): topic is Topic => topic !== 'All').map((topic) => {
                const Icon = topicIcons[topic]
                const isActive = !researchMode && !selected && view === 'all' && active === topic
                return <button key={topic} type="button" className="side-nav-row" data-active={isActive} aria-current={isActive ? 'page' : undefined} onClick={() => navigate(() => onFilter(topic))}>
                  <Icon aria-hidden="true"/><span className="side-nav-name">{topic === 'Research' ? 'Research notes' : topic}</span><span className="side-count">{twoDigits(topicCount(topic))}</span>
                </button>
              })}
            </nav>}
          </div>
        </section>

        <section className="side-group side-group--papers" aria-labelledby="side-papers-heading">
          <div className="side-section-heading side-domain-heading">
            <h2 id="side-papers-heading">Research papers</h2>
            <span className="side-section-count">{twoDigits(manuscripts.length)} papers</span>
          </div>
          <nav className="side-items side-papers-items" aria-label="Research papers">
            <button type="button" className="side-nav-row" data-active={researchMode && !activePaperId} aria-current={researchMode && !activePaperId ? 'page' : undefined} onClick={() => navigate(onResearch)}>
              <FileText aria-hidden="true"/><span className="side-nav-name">All manuscripts</span><span className="side-count">{twoDigits(manuscripts.length)}</span>
            </button>
            {manuscripts.map((paper, index) => {
              const isActive = researchMode && activePaperId === paper.id
              return <a key={paper.id} href={manuscriptPath(paper.id)} title={paper.title + ' · ' + paper.status + ' · ' + paper.field} aria-label={paper.title} className="side-article side-paper-entry" data-active={isActive} aria-current={isActive ? 'page' : undefined} onClick={event => openPaper(event, paper)}>
                <span className="side-article-identity">
                  <span className="side-article-ref">P-{twoDigits(index + 1)}</span>
                  <span className="side-article-meta">{paper.status}</span>
                </span>
                <span className="side-article-title">{paperSidebarTitles[paper.id] ?? paper.title}</span>
              </a>
            })}
          </nav>
        </section>

        {selected && !selectedIsRecent && <section className="side-group side-group--current" aria-label="Open article">
          <div className="side-section-heading"><h2>Open article</h2><span className="side-section-count">ACTIVE</span></div>
          <nav className="side-items" aria-label="Current article">{renderRecent(selected, true)}</nav>
        </section>}

        <section className="side-group side-group--recent" aria-labelledby="side-recent-heading">
          <button type="button" className="side-section-heading side-section-toggle" aria-expanded={recentOpen} aria-controls="side-recent-items" onClick={() => setRecentOpen((value) => !value)}>
            <span id="side-recent-heading">Recent articles</span><span className="side-section-actions"><span className="side-section-count">{twoDigits(recentEntries.length)}</span><ChevronDown className={recentOpen ? '' : 'is-collapsed'} aria-hidden="true"/></span>
          </button>
          {recentOpen && <nav id="side-recent-items" className="side-items side-recent-items" aria-label="Recent articles">{recentEntries.map((entry) => renderRecent(entry))}</nav>}
        </section>
      </div>

      <div className="sidebar-footer" aria-label="Archive information">
        <div className="side-footer-line"><span className="side-footer-mark" aria-hidden="true"/><strong>Archive index</strong><span className="side-footer-total">{twoDigits(entries.length + manuscripts.length)}</span></div>
        <div className="side-footer-detail">{entries.length} journal entries <span aria-hidden="true">/</span> {manuscripts.length} manuscripts</div>
      </div>
    </aside>
  )
}
