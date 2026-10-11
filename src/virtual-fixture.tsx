import { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { entries, type Entry } from './data'
import { WindowedArchive } from './components/WindowedArchive'
import { WindowedPane } from './components/WindowedPane'
import { dateLabel } from './lib/utils'
import './styles.css'
import './app-shell.css'
import './chrome-v3.css'
import './theme.css'
import './virtualization.css'

const fixtureStart = performance.now()
const baseline = new URLSearchParams(location.search).has('baseline')
const fixture = Array.from({length: 1500}, (_, i): Entry => ({
  ...entries[i % entries.length]!,
  slug: 'fixture-' + i,
  title: 'Fixture article ' + i + ' : ' + (i % 7 === 0 ? 'A long headline to exercise line wrapping and dynamic height estimation' : 'Engineering notes'),
  shortTitle: 'Fixture article ' + i,
  issue: 'T-' + String(i).padStart(4, '0'),
  summary: 'A representative dynamic-height summary with variable text content. '.repeat(i % 5 + 1),
  date: '2026-09-' + String((i % 28) + 1).padStart(2, '0'),
}))

function FixtureRow({entry,onOpen}: {entry:Entry,onOpen:(entry:Entry)=>void}) {
  return <div data-fixture-index={Number(entry.slug.slice(8))} className="journal-row">
    <a href={'?post=' + entry.slug} className="journal-row-link" onClick={event=>{event.preventDefault();onOpen(entry)}}>
      <span className="row-number">{entry.issue}</span>
      <span className="journal-row-main"><span className="row-title">{entry.title}</span><span className="row-summary">{entry.summary}</span><span className="row-mobile-meta">{entry.topic} · {entry.minutes} min</span></span>
      <span className="row-type">{entry.topic}</span>
      <span className="row-date">{dateLabel(entry.date)}</span>
      <span className="row-arrow">›</span>
    </a>
    <button type="button" aria-label={'Save ' + entry.shortTitle} className="row-bookmark icon-control" onClick={e=>e.currentTarget.setAttribute('aria-pressed','true')}>☆</button>
  </div>
}
function App() {
  useEffect(() => { (window as unknown as { __fixtureCommitted?: number }).__fixtureCommitted = performance.now() - fixtureStart }, [])
  const [opened,setOpened] = useState<Entry|null>(null)
  const beforeOpenScroll = useRef(0)
  const openArticle = (entry:Entry) => { beforeOpenScroll.current = scrollY;setOpened(entry);scrollTo({top:0,behavior:'instant'}) }
  const returnToArchive = () => {setOpened(null);requestAnimationFrame(()=>scrollTo({top:beforeOpenScroll.current,behavior:'instant'}))}
  const [layout,setLayout] = useState<'list'|'cards'>(new URLSearchParams(location.search).has('cards') ? 'cards' : 'list')
  const [reverse,setReverse] = useState(false)
  const [count,setCount] = useState(1500)
  const [activeIndex,setActiveIndex] = useState(0)
  const rows = useMemo(()=>reverse?[...fixture.slice(0,count)].reverse():fixture.slice(0,count),[count,reverse])
  if(opened) return <div className="app-shell fixture-article"><main className="content-main"><button onClick={returnToArchive}>Return to archive</button><h1>{opened.title}</h1><p>{opened.summary}</p></main></div>
  return <div className="app-shell">
    <header className="site-header"><div className="header-inner">Virtualization performance fixture</div></header>
    <main className="content-main" style={{maxWidth:1000}}>
      <section className="workspace-heading"><h1>Virtualization test</h1><p>Large dataset with variable row heights.</p></section>
      <div className="workspace-status">Test fixture: {rows.length} entries</div>
      <div className="workspace-filters" style={{gap:8}}>
        <button onClick={()=>setLayout(l=>l==='list'?'cards':'list')}>Toggle layout</button>
        <button onClick={()=>setReverse(r=>!r)}>Reverse order</button>
        <button onClick={()=>setCount(c=>c===1500?36:1500)}>Toggle count</button>
        <button onClick={()=>window.scrollTo(0,0)}>Top</button>
      </div>
      <section className="index-section">
        <div className="index-heading-row"><h2>Archive fixture</h2></div>
        <div className="index-list-header"><span>Ref</span><span>Title</span><span>Type</span><span>Date</span><span>Actions</span></div>
        {baseline ? <div className={"journal-list" + (layout === "cards" ? " journal-list--cards" : "")} data-baseline="archive">{rows.map(entry=><FixtureRow key={entry.slug} entry={entry} onOpen={openArticle}/>)}</div> : <WindowedArchive entries={rows} layout={layout} renderEntry={entry=><FixtureRow entry={entry} onOpen={openArticle}/>}/>}
      </section>
      <section style={{marginTop:40}}><h2>Search pane virtualized fixture</h2><button onClick={()=>setActiveIndex(i=>(i+80)%rows.length)}>Advance selection</button>
        <WindowedPane items={rows} getKey={item=>item.slug} estimateSize={60} className="dialog-window-scroll" rowClassName="dialog-window-row" label="Fixture search results" activeIndex={activeIndex} renderItem={(item,index)=><button data-pane-index={index} style={{display:'block',height:'100%',width:'100%',textAlign:'left'}}>{item.title}</button>}/>
      </section>
      <section style={{marginTop:30}}><h2>Browse pane virtualized fixture</h2>
        <div style={{height:400,display:'flex',flexDirection:'column'}}><WindowedPane items={rows} getKey={item=>item.slug} estimateSize={70} className="browse-recent-list browse-recent-list--virtual" rowClassName="browse-window-row" label="Fixture recent writing" renderItem={(item,index)=><button data-browse-index={index} style={{display:'block',height:'100%',width:'100%',textAlign:'left'}}>{item.title}</button>}/></div>
      </section>
    </main>
  </div>
}
createRoot(document.getElementById('root')!).render(<App/>)
