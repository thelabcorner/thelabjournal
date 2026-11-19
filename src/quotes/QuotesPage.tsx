import { useMemo, useState, type MouseEvent } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpenText, Check, Copy, ExternalLink, Library, List, Quote as QuoteIcon, Search, Share2, SlidersHorizontal, X } from 'lucide-react'
import { entries } from '../data'
import { manuscripts } from '../research'
import { QuoteFacet } from './QuoteFacet'
import { composeQuoteMosaic, isLongPassage } from './mosaic'
import {
  authorName, collectionById, collectionPath, isOwnQuote, publishedCollections,
  publishedQuotes, quoteById, quotePath, quoteTitle, quotesPath,
  type Quote, type QuoteCollection, type QuoteRoute,
} from './data'
import { ArchiveFingerprint } from './ArchiveFingerprint'
import './quotes.css'
import './atlas-mobile.css'

type Browse = 'all' | 'mine' | 'collected' | 'collections'
type ArchiveView = 'reading' | 'index'
type QuoteSort = 'newest' | 'oldest' | 'author'

const archiveOrder = [...publishedQuotes].sort((a, b) => b.addedAt.localeCompare(a.addedAt) || a.id.localeCompare(b.id))
const ordinal = (index: number) => String(index + 1).padStart(2, '0')
interface Props {
  route: QuoteRoute
  onIndex: () => void
  onQuote: (quote: Quote) => void
  onCollection: (collection: QuoteCollection) => void
  onShare: () => void
  copied: boolean
}

const plainClick = (event: MouseEvent<HTMLAnchorElement>) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey
const relatedTitle = (path: string): string => {
  const [, kind, slug] = path.split('/')
  return (kind === 'posts' ? entries.find(entry => entry.slug === slug)?.title
    : manuscripts.find(paper => paper.id === slug)?.title) ?? slug
}

function InternalLink({ href, onOpen, className, children, label }: {
  href: string; onOpen: () => void; className?: string; children: React.ReactNode; label?: string
}) {
  return <a href={href} className={className} aria-label={label} onClick={event => {
    if (!plainClick(event)) return
    event.preventDefault()
    onOpen()
  }}>{children}</a>
}

function QuoteCard({ quote, onOpen, number }: { quote: Quote; onOpen: (quote: Quote) => void; number: number }) {
  const words = quote.text.trim().split(/\s+/).length
  const lengthy = isLongPassage(quote)
  const layout = lengthy ? ' quotes-card-long'
    : number % 11 === 0 && words < 17 && quote.text.length < 95 ? ' quotes-card-feature' : ''
  return <article className={'quotes-card' + layout + (isOwnQuote(quote) ? ' quotes-card-own' : ' quotes-card-collected')}>
    <InternalLink href={quotePath(quote.id)} onOpen={() => onOpen(quote)} className="quotes-card-main">
      <span className="quotes-card-index" aria-hidden="true">{ordinal(number)}</span>
      <span className="quotes-card-content">
        <span className="quotes-card-label">{isOwnQuote(quote) ? 'My words' : 'Collected'}</span>
        <blockquote>{quote.text}</blockquote>
        <span className="quotes-card-foot">
          <span className="quotes-card-author">{authorName(quote.authorId)}</span>
          <span className="quotes-card-open">{lengthy ? 'Read full passage' : 'Read entry'} <ArrowUpRight size={14} aria-hidden="true"/></span>
        </span>
      </span>
    </InternalLink>
  </article>
}

function SourceDetail({ quote }: { quote: Quote }) {
  const source = quote.source
  if (!source) return <span className="quotes-source-muted">No source supplied</span>
  return <div className="quotes-source-content">
    <span>{source.kind[0].toUpperCase() + source.kind.slice(1)}{source.title ? ' · ' + source.title : ''}{source.locator ? ' · ' + source.locator : ''}</span>
    <span className="quotes-source-status">{source.verification === 'primary'
      ? 'Primary source'
      : source.verification === 'secondary' ? 'Secondary source' : 'Attribution unverified'}</span>
    {source.url && <a href={source.url} target="_blank" rel="noopener noreferrer">Open source <ExternalLink size={13} aria-hidden="true"/></a>}
  </div>
}

export function QuotesPage({ route, onIndex, onQuote, onCollection, onShare, copied }: Props) {
  const [browse, setBrowse] = useState<Browse>('all')
  const [search, setSearch] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [subject, setSubject] = useState('all')
  const [author, setAuthor] = useState('all')
  const [verification, setVerification] = useState('all')
  const [view, setView] = useState<ArchiveView>('reading')
  const [sort, setSort] = useState<QuoteSort>('newest')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const allThemes = useMemo(() => [...new Set(publishedQuotes.flatMap(quote => quote.themes))].sort((a, b) => a.localeCompare(b)), [])
  const allAuthors = useMemo(() => [...new Set(publishedQuotes.map(quote => quote.authorId))].sort((a, b) =>
    authorName(a).localeCompare(authorName(b))), [])
  const visible = useMemo(() => publishedQuotes
    .filter(quote => browse === 'all' || browse === 'collections' ||
      (browse === 'mine' ? isOwnQuote(quote) : !isOwnQuote(quote)))
    .filter(quote => author === 'all' || quote.authorId === author)
    .filter(quote => verification === 'all' || (quote.source?.verification ?? 'none') === verification)
    .filter(quote => subject === 'all' || quote.themes.includes(subject))
    .filter(quote => {
      const q = search.trim().toLocaleLowerCase()
      return !q || [quote.text, authorName(quote.authorId), ...quote.themes,
        quote.source?.title ?? ''].some(text => text.toLocaleLowerCase().includes(q))
    }).sort((a, b) => sort === 'author'
      ? authorName(a.authorId).localeCompare(authorName(b.authorId)) || a.text.localeCompare(b.text)
      : sort === 'oldest'
        ? a.addedAt.localeCompare(b.addedAt) || a.id.localeCompare(b.id)
        : b.addedAt.localeCompare(a.addedAt) || a.id.localeCompare(b.id)),
  [browse, search, subject, author, verification, sort])
  const mosaic = useMemo(() => view === 'reading' && sort !== 'author' && !search.trim()
    ? composeQuoteMosaic(visible) : visible, [visible, view, sort, search])
  const copyText = async (text: string) => {
    setCopyState('idle')
    try {
      await navigator.clipboard.writeText(text)
      setCopyState('copied')
    } catch { setCopyState('failed') }
  }
  const selectBrowse = (next: Browse) => {
    setBrowse(next); setSearch(''); setSubject('all'); setAuthor('all'); setVerification('all'); setFiltersOpen(false)
  }
  const activeFilters = [subject !== 'all', author !== 'all', verification !== 'all'].filter(Boolean).length
  const resetFilters = () => { setSubject('all'); setAuthor('all'); setVerification('all') }
  const exploreTheme = (theme: string) => {
    setBrowse('all'); setSearch(''); setAuthor('all'); setVerification('all')
    setSubject(theme); setFiltersOpen(true); onIndex()
  }

  if (route.kind === 'not-found') return <main className="content-main quotes-page" id="main">
    <div className="quotes-width quotes-error">
      <span className="quotes-kicker">Quotes / Not found</span>
      <h1>This quotation is unavailable.</h1>
      <p>The link may be incorrect, or the entry is no longer published.</p>
      <InternalLink href={quotesPath()} onOpen={onIndex} className="quotes-text-link"><ArrowLeft size={15}/> Back to quotes</InternalLink>
    </div>
  </main>

  if (route.kind === 'quote') {
    const quote = quoteById.get(route.id)
    if (!quote) return null
    const archiveIndex = archiveOrder.findIndex(item => item.id === quote.id)
    const previous = archiveOrder[archiveIndex - 1]
    const next = archiveOrder[archiveIndex + 1]
    const inCollections = publishedCollections.filter(collection => collection.quoteIds.includes(quote.id))
    return <main className="content-main quotes-page" id="main">
      <div className="quotes-width quotes-reader">
        <div className="quotes-breadcrumb">
          <InternalLink href={quotesPath()} onOpen={onIndex}><ArrowLeft size={15} aria-hidden="true"/> Quotes</InternalLink>
          <span>/</span><span>{isOwnQuote(quote) ? 'My words' : 'Collected'}</span>
        </div>
        <article className="quotes-reading-surface">
          <div className="quotes-reading-folio" aria-label={'Quotation ' + ordinal(archiveIndex) + ' of ' + archiveOrder.length}>
            <span>Archive entry</span>
            <strong>{ordinal(archiveIndex)} <span>/ {archiveOrder.length.toString().padStart(2, '0')}</span></strong>
          </div>
          <div className="quotes-reading-content">
            <div className="quotes-reader-kicker">{isOwnQuote(quote) ? 'My words' : 'Collected words'}</div>
            <blockquote className="quotes-reader-text">{quote.text}</blockquote>
            <div className="quotes-reader-author">— {authorName(quote.authorId)}</div>
            <div className="quotes-reader-actions">
              <button type="button" onClick={() => void copyText(quote.text)} aria-label="Copy exact quotation">
                {copyState === 'copied' ? <Check size={16}/> : <Copy size={16}/>}
                {copyState === 'copied' ? 'Copied' : 'Copy quote'}
              </button>
              <button type="button" onClick={onShare}><Share2 size={16}/>{copied ? 'Link copied' : 'Share'}</button>
              {copyState === 'failed' && <span role="status">Clipboard unavailable</span>}
            </div>
          </div>
        </article>
        <section className="quotes-reader-details" aria-label="Quotation details">
          <div className="quotes-reader-details-heading">Record</div>
          <div className="quotes-reader-details-main">
            <div className="quotes-reader-metadata">
              <div><span>Added to archive</span><time dateTime={quote.addedAt}>{quote.addedAt}</time></div>
              {quote.recordedAt && <div><span>Originally recorded</span><time dateTime={quote.recordedAt}>{quote.recordedAt}</time></div>}
              <div><span>Attribution</span><strong>{authorName(quote.authorId)}</strong></div>
              {quote.source && <div className="quotes-source-row"><span>Source</span><SourceDetail quote={quote}/></div>}
            </div>
            {quote.themes.length > 0 && <div className="quotes-related-themes" aria-label="Explore by theme">
              {quote.themes.map(theme => <button key={theme} type="button" onClick={() => exploreTheme(theme)} title={'Explore ' + theme}>{theme}<ArrowUpRight size={11} aria-hidden="true"/></button>)}
            </div>}
          </div>
        </section>
        {inCollections.length > 0 && <section className="quotes-associated" aria-label="Collections featuring this quote">
          <h2>In collections</h2>
          {inCollections.map(collection => <InternalLink key={collection.id} href={collectionPath(collection.id)} onOpen={() => onCollection(collection)}>
            {collection.title}<ArrowRight size={15}/>
          </InternalLink>)}
        </section>}
        {quote.relatedWorks && quote.relatedWorks.length > 0 && <section className="quotes-associated" aria-label="Related journal and research">
          <h2>Related work</h2>
          {quote.relatedWorks.map(path => <a key={path} href={import.meta.env.BASE_URL + path.slice(1)}>
            {relatedTitle(path)}<ArrowUpRight size={14}/>
            </a>)}
        </section>}
        <nav className="quotes-traverse" aria-label="Browse archive entries">
          {previous ? <InternalLink href={quotePath(previous.id)} onOpen={() => onQuote(previous)} className="quotes-traverse-link">
            <span><ArrowLeft size={14}/> Previous</span><strong>{quoteTitle(previous)}</strong>
          </InternalLink> : <span className="quotes-traverse-empty"/>}
          {next ? <InternalLink href={quotePath(next.id)} onOpen={() => onQuote(next)} className="quotes-traverse-link quotes-traverse-next">
            <span>Next <ArrowRight size={14}/></span><strong>{quoteTitle(next)}</strong>
          </InternalLink> : <span className="quotes-traverse-empty"/>}
        </nav>
      </div>
    </main>
  }

  if (route.kind === 'collection') {
    const collection = collectionById.get(route.id)
    if (!collection) return null
    const collectionQuotes = collection.quoteIds.map(id => quoteById.get(id)).filter((quote): quote is Quote => Boolean(quote))
    return <main className="content-main quotes-page" id="main">
      <div className="quotes-width">
        <div className="quotes-breadcrumb"><InternalLink href={quotesPath()} onOpen={onIndex}><ArrowLeft size={15}/> Quotes</InternalLink><span>/</span><span>Collections</span></div>
        <header className="quotes-heading quotes-collection-heading"><span className="quotes-kicker">Collection / {publishedCollections.findIndex(item => item.id === collection.id) + 1} of {publishedCollections.length}</span><h1>{collection.title}</h1>
          {collection.description && <p>{collection.description}</p>}
          <div className="quotes-count">{collectionQuotes.length} {collectionQuotes.length === 1 ? 'quotation' : 'quotations'}</div>
        </header>
        <div className="quotes-list" aria-label={'Quotations in ' + collection.title}>
          {collectionQuotes.map((quote, number) => <QuoteCard key={quote.id} quote={quote} onOpen={onQuote} number={number}/>)}
          {!collectionQuotes.length && <div className="quotes-empty"><Library size={19}/><strong>No quotations published in this collection yet</strong></div>}
        </div>
      </div>
    </main>
  }

  const filters: { key: Browse; label: string; count: number }[] = [
    { key: 'all', label: 'All quotes', count: publishedQuotes.length },
    { key: 'mine', label: 'My words', count: publishedQuotes.filter(isOwnQuote).length },
    { key: 'collected', label: 'Collected', count: publishedQuotes.filter(quote => !isOwnQuote(quote)).length },
    { key: 'collections', label: 'Collections', count: publishedCollections.length },
  ]
  const shownCollections = publishedCollections.filter(collection => !search ||
    [collection.title, collection.description ?? ''].some(value => value.toLowerCase().includes(search.toLowerCase())))
  return <main className="content-main quotes-page" id="main">
    <div className="quotes-width">
      <header className="quotes-heading">
        <div className="quotes-heading-main">
          <span className="quotes-heading-overline">thelabjournal™ <span>/</span> Words retained</span>
          <h1>Quotes<span className="quotes-heading-count">{publishedQuotes.length.toString().padStart(2, '0')}</span></h1>
          <p>An archive of my own words and passages I've chosen to keep.</p>
          <div className="quotes-heading-inventory" aria-label="Archive inventory">
            <span><strong>{publishedQuotes.filter(isOwnQuote).length}</strong> My words</span>
            <span><strong>{publishedQuotes.filter(quote => !isOwnQuote(quote)).length}</strong> Collected</span>
            <span><strong>{publishedCollections.length}</strong> Collections</span>
          </div>
        </div>
      </header>
      <ArchiveFingerprint onQuote={onQuote}/>
      <nav className="quotes-filters" aria-label="Browse quotations">
        {filters.map(filter => <button key={filter.key} type="button" aria-pressed={browse === filter.key}
          onClick={() => selectBrowse(filter.key)}>{filter.label}<span>{filter.count}</span></button>)}
      </nav>
      <section className="quotes-workspace" aria-label="Quotation archive">
        <div className="quotes-toolbar">
          <div className="quotes-section-heading">
            <h2>{filters.find(filter => filter.key === browse)?.label}</h2>
            <span className="quotes-result-count" role="status">{browse === 'collections'
              ? shownCollections.length + (shownCollections.length === 1 ? ' collection' : ' collections')
              : visible.length + (visible.length === 1 ? ' entry' : ' entries')}</span>
          </div>
          <div className="quotes-tools">
            <label className="quotes-search"><Search size={15} aria-hidden="true"/><input type="search"
              value={search} placeholder={browse === 'collections' ? 'Find a collection' : 'Find a quotation'} aria-label={browse === 'collections' ? 'Search collections' : 'Search quotes'}
              onChange={event => setSearch(event.target.value)}/>{search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')}><X size={14}/></button>}</label>
            {browse !== 'collections' && <button type="button" className="quotes-filter-toggle" aria-expanded={filtersOpen}
              aria-controls="quotes-refinements" onClick={() => setFiltersOpen(open => !open)}>
              <SlidersHorizontal size={14} aria-hidden="true"/> Filters{activeFilters > 0 && <span className="quotes-filter-count">{activeFilters}</span>}
            </button>}
            {browse !== 'collections' && <div className="quotes-view-switch" role="group" aria-label="Archive layout">
              <button type="button" aria-label="Reading layout" title="Reading layout" aria-pressed={view === 'reading'} onClick={() => setView('reading')}><BookOpenText size={15}/></button>
              <button type="button" aria-label="Index layout" title="Compact index layout" aria-pressed={view === 'index'} onClick={() => setView('index')}><List size={15}/></button>
            </div>}
          </div>
        </div>
        {browse !== 'collections' && filtersOpen && <div className="quotes-refinements" id="quotes-refinements">
          <span className="quotes-refinements-caption"><SlidersHorizontal size={13} aria-hidden="true"/> Refine</span>
          <div className="quotes-refinements-facets">
            <QuoteFacet label="Sort" ariaLabel="Sort quotations" value={sort} onValueChange={value => setSort(value as QuoteSort)}
              options={[{value:'newest',label:'Recently archived'}, {value:'oldest',label:'Earliest archived'}, {value:'author',label:'Attribution A–Z'}]}
              active={sort !== 'newest'}/>
            {allAuthors.length > 1 && <QuoteFacet label="Author" ariaLabel="Filter by author" value={author} onValueChange={setAuthor}
              options={[{value:'all',label:'All authors'}, ...allAuthors.map(id => ({value:id,label:authorName(id)}))]}
              active={author !== 'all'}/>}
            {allThemes.length > 0 && <QuoteFacet label="Theme" ariaLabel="Filter by theme" value={subject} onValueChange={setSubject}
              options={[{value:'all',label:'All themes'}, ...allThemes.map(theme => ({value:theme,label:theme}))]}
              active={subject !== 'all'}/>}
            {publishedQuotes.some(quote => quote.source) && <QuoteFacet label="Source" ariaLabel="Filter by source verification"
              value={verification} onValueChange={setVerification}
              options={[{value:'all',label:'All sources'}, {value:'primary',label:'Primary'}, {value:'secondary',label:'Secondary'},
                {value:'unverified',label:'Unverified'}, {value:'none',label:'No source'}]}
              active={verification !== 'all'}/>}
          </div>
          {activeFilters > 0 && <button type="button" className="quotes-refine-reset" onClick={resetFilters}>Clear filters <X size={13}/></button>}
        </div>}
        {browse === 'collections' ? <div className="quotes-collections">
        {shownCollections.map((collection, number) => <InternalLink key={collection.id} href={collectionPath(collection.id)}
          onOpen={() => onCollection(collection)} className="quotes-collection">
          <div className="quotes-collection-upper"><span className="quotes-collection-number">{ordinal(number)}</span><ArrowUpRight size={16} aria-hidden="true"/></div>
          <div className="quotes-collection-body"><h3>{collection.title}</h3><p>{collection.description}</p></div>
          <div className="quotes-collection-foot">{collection.quoteIds.length} quotations</div>
        </InternalLink>)}
        {!shownCollections.length && <div className="quotes-empty"><Library size={20}/><strong>{search ? 'No matching collections' : 'No collections published yet'}</strong>
          {!search && <p>Curated collections will appear here once published.</p>}</div>}
        </div> : <div className={'quotes-list' + (view === 'index' ? ' quotes-list-compact' : '')}>
        {mosaic.map((quote, number) => <QuoteCard key={quote.id} quote={quote} onOpen={onQuote} number={number}/>)}
        {!visible.length && <div className="quotes-empty"><QuoteIcon size={20}/><strong>{search || subject !== 'all' || author !== 'all' || verification !== 'all' ? 'No matching quotations' :
          browse === 'mine' ? 'No original quotations published yet' :
          browse === 'collected' ? 'No collected quotations published yet' : 'No quotations published yet'}</strong>
          {!search && <p>Entries will appear here as the collection develops.</p>}</div>}
        </div>}
      </section>
    </div>
  </main>
}
