import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Bookmark, Check, FileText, Printer, Share2 } from 'lucide-react'
import { cn } from './lib/utils'
import { cue } from './haptics'
import type { Manuscript } from './research'
import { ResearchLibrary } from './ResearchLibrary'
import { ResearchManuscriptBody, manuscriptNavigation } from './ResearchManuscriptBody'
import { ResearchContents, ResearchMobileContents, useResearchOutline } from './ResearchContents'
import './research.css'
import './research-reading.css'
import './gravimetric-manuscript-presentation.css'
import './research-library.css'

export default function ResearchPage({ paper, onOpen, isDark, isSaved, onToggleSaved, copied, onShare }: {
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
  const [pdfAvailable, setPdfAvailable] = useState(false)
  useEffect(() => {
    let active = true
    setPdfAvailable(false)
    if (paper) {
      void fetch(import.meta.env.BASE_URL + 'research/pdf-availability.json')
        .then(response => response.ok ? response.json() : {})
        .then((availability: Record<string, boolean>) => {
          if (active) setPdfAvailable(availability[paper.id] === true)
        }).catch(() => { if (active) setPdfAvailable(false) })
    }
    return () => { active = false }
  }, [paper?.id])
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
           {paper.id === "thca-limonene-cosmo-rs" && paper.version === "v0.1" && <a className="research-reader-action research-reader-pdf"
              href={import.meta.env.BASE_URL + "research/thca-limonene-cosmo-rs/manuscript-draft.pdf"}
              download="thca-limonene-cosmo-rs-manuscript-draft.pdf"
              aria-label="Download preliminary two-column research manuscript draft PDF" title="Download research draft PDF"><FileText aria-hidden="true"/></a>}
          {pdfAvailable && <a className="research-reader-action research-reader-pdf"
             href={import.meta.env.BASE_URL + 'research/' + encodeURIComponent(paper.id) + '/manuscript.pdf'}
             download={paper.id + '.pdf'}
             aria-label="Download complete scholarly manuscript PDF" title="Download manuscript PDF"><FileText aria-hidden="true"/></a>}
          <button type="button" className={cn('research-reader-action', 'research-reader-save', isSaved && 'is-saved')}
            aria-label={isSaved ? 'Remove manuscript from saved' : 'Save manuscript'} title={isSaved ? 'Remove from saved' : 'Save manuscript'}
            aria-pressed={isSaved} onClick={() => { cue(isSaved ? 'light' : 'success'); onToggleSaved(paper.id) }}>
            <Bookmark fill={isSaved ? 'currentColor' : 'none'} aria-hidden="true"/>
          </button>
          <button type="button" className="research-reader-action research-reader-share"
            aria-label={copied ? 'Link copied' : typeof navigator.share === 'function' ? 'Share manuscript' : 'Copy manuscript link'}
            title={copied ? 'Link copied' : typeof navigator.share === 'function' ? 'Share manuscript' : 'Copy manuscript link'}
            onClick={onShare}>{copied ? <Check aria-hidden="true"/> : <Share2 aria-hidden="true"/>}</button>
           {pdfAvailable && <a className="research-reader-action research-print"
             href={import.meta.env.BASE_URL + 'research/' + encodeURIComponent(paper.id) + '/manuscript.pdf'}
             target="_blank" rel="noopener noreferrer"
             aria-label="Open print-ready scholarly PDF" title="Print-ready PDF (opens viewer)"><Printer aria-hidden="true"/></a>}
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
