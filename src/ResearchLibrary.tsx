import { useMemo, useRef, useState, type MouseEvent } from 'react'
import { ArrowRight, FileText, Search, X } from 'lucide-react'
import { manuscripts, manuscriptPath, type Manuscript } from './research'

type StatusFilter = 'all' | Manuscript['status']
const statuses: StatusFilter[] = ['all', 'Draft', 'Under review', 'Published']
const publicationOrder = [...manuscripts].sort((a, b) => b.revisedAt.localeCompare(a.revisedAt) || a.title.localeCompare(b.title))
const publicationNumbers = new Map(publicationOrder.map((paper, index) => [paper.id, String(index + 1).padStart(2, '0')]))

const stamp = (date: string) => new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
})
const padded = (count: number) => String(count).padStart(2, '0')

/**
 * Scientific publications are a separate collection from the editorial journal.
 * All metadata is derived from the canonical manuscript registry.
 */
export function ResearchLibrary({ onOpen }: { onOpen: (paper: Manuscript) => void }) {
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<StatusFilter>('all')
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const counts = useMemo(() => ({
    Draft: manuscripts.filter(paper => paper.status === 'Draft').length,
    'Under review': manuscripts.filter(paper => paper.status === 'Under review').length,
    Published: manuscripts.filter(paper => paper.status === 'Published').length,
  }), [])
  const filters = statuses.filter(item => item === 'all' || counts[item] > 0)
  const mostRecent = publicationOrder[0]
  const results = useMemo(() => publicationOrder
    .filter(paper => status === 'all' || paper.status === status)
    .filter(paper => !normalizedQuery || [
      paper.title, paper.subtitle, paper.abstract, paper.field,
      paper.version, paper.status, ...paper.keywords,
    ].join(' ').toLocaleLowerCase().includes(normalizedQuery))
    .sort((a, b) => b.revisedAt.localeCompare(a.revisedAt) || a.title.localeCompare(b.title)),
  [normalizedQuery, status])

  const open = (event: MouseEvent<HTMLAnchorElement>, paper: Manuscript) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
    event.preventDefault()
    onOpen(paper)
  }

  return (
    <div className="research-library" aria-labelledby="research-library-title">
      <header className="research-library-masthead">
        <div className="research-library-heading">
          <h1 id="research-library-title">Research</h1>
        </div>
        <p className="research-library-description">
          Independent scientific research, engineering methods, and computational models.
          Formal manuscripts are maintained separately from the journal’s editorial notes.
        </p>
        <div className="research-library-facts" aria-label="Research collection summary">
          <span><strong>{padded(manuscripts.length)}</strong> Manuscripts</span>
          {counts['Under review'] > 0 && <span><strong>{padded(counts['Under review'])}</strong> Under review</span>}
          {counts.Draft > 0 && <span><strong>{padded(counts.Draft)}</strong> Draft</span>}
          {mostRecent && <span className="research-library-fact-revision">Last revised <strong>{stamp(mostRecent.revisedAt)}</strong></span>}
        </div>
      </header>

      <section className="research-library-index" aria-labelledby="research-index-title">
        <div className="research-index-heading">
          <div className="research-index-title">
            <h2 id="research-index-title">Manuscript index</h2>
            <span>{padded(results.length)} of {padded(manuscripts.length)}</span>
          </div>
          <div className="research-index-search">
            <Search size={15} aria-hidden="true"/>
            <label className="sr-only" htmlFor="research-manuscript-search">Search research manuscripts</label>
            <input ref={searchRef} id="research-manuscript-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search manuscripts…" autoComplete="off"/>
            {query && <button type="button" className="research-search-clear" aria-label="Clear manuscript search" onClick={() => { setQuery(''); searchRef.current?.focus() }}><X size={14} aria-hidden="true"/></button>}
          </div>
        </div>
        <div className="research-library-filter-row">
          <div className="research-library-filters" role="group" aria-label="Filter manuscripts by status">
            {filters.map(item => <button
              key={item}
              type="button"
              className="research-filter-button"
              aria-pressed={status === item}
              onClick={() => setStatus(item)}
            >
              {item === 'all' ? 'All papers' : item}
              <span>{padded(item === 'all' ? manuscripts.length : counts[item])}</span>
            </button>)}
          </div>
          <div className="research-library-sort-label">Newest revisions first</div>
        </div>

        <div className="research-publications" role="list" aria-label="Scientific manuscripts">
          {results.map((paper) => <div key={paper.id} role="listitem" className="research-publication-item"><a
            className="research-publication"
            href={manuscriptPath(paper.id)}
            onClick={event => open(event, paper)}
            aria-label={'Read ' + paper.title}
          >
            <span className="research-publication-number" aria-hidden="true">{publicationNumbers.get(paper.id)}</span>
            <div className="research-publication-main">
              <div className="research-publication-type">
                <FileText size={13} aria-hidden="true"/>
                <span>Research manuscript</span>
                <span className="research-publication-type-separator" aria-hidden="true">·</span>
                <span>{paper.field}</span>
              </div>
              <h3>{paper.title}</h3>
              {paper.subtitle && <p className="research-publication-subtitle">{paper.subtitle}</p>}
              <p className="research-publication-abstract">{paper.abstract}</p>
              <div className="research-publication-mobile-details">
                <span className="research-publication-status" data-status={paper.status}>{paper.status}</span>
                <span>{paper.version}</span>
                <span>Revised {stamp(paper.revisedAt)}</span>
              </div>
            </div>
            <div className="research-publication-aside">
              <span className="research-publication-status" data-status={paper.status}>{paper.status}</span>
              <span className="research-publication-aside-label">Last revised</span>
              <time dateTime={paper.revisedAt}>{stamp(paper.revisedAt)}</time>
              <span className="research-publication-aside-label">Version {paper.version}</span>
              <span className="research-publication-open">Read manuscript <ArrowRight size={14} aria-hidden="true"/></span>
            </div>
          </a></div>)}
          {results.length === 0 && <div className="research-library-empty">
            <strong>No matching manuscripts</strong>
            <p>Try another keyword or clear the status filter.</p>
            <button type="button" onClick={() => { setQuery(''); setStatus('all') }}>Show all manuscripts</button>
          </div>}
        </div>
        <p className="research-library-integrity">
          Manuscript status indicates the current author revision stage, not independent peer-review certification.
          Document versions and revision dates reflect the source manuscript records.
        </p>
      </section>
    </div>
  )
}
