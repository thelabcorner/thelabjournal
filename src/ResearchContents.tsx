import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUp, Check, ChevronDown, ListTree, Search, X } from 'lucide-react'
import { ScrollView } from './components/ScrollView'
import type { NavSection } from './manuscript-runtime/types/thesis'

type OutlineItem = { id: string; label: string; parentId: string; level: number }
type Outline = {
  activeId: string
  activeIndex: number
  items: OutlineItem[]
  navigate: (id: string, smooth?: boolean) => void
}

const stripNumber = (label: string) => label.replace(/^\d+(?:\.\d+)*[.\s]+/, '')
const numberLabel = (label: string, fallback: string) =>
  /^\d+(?:\.\d+)*(?=[.\s])/.exec(label)?.[0] ?? fallback

export function useResearchOutline(sections: readonly NavSection[], paperId: string | undefined): Outline {
  const items = useMemo<OutlineItem[]>(() =>
    sections.flatMap(chapter => [
      { id: chapter.id, label: chapter.label, parentId: chapter.id, level: 0 },
      ...(chapter.children ?? []).map(child => ({
        id: child.id, label: child.label, parentId: chapter.id, level: 1,
      })),
    ]), [sections])
  const [activeId, setActiveId] = useState(() => items[0]?.id ?? '')
  const positions = useRef<{ id: string; y: number }[]>([])
  const raf = useRef<number | null>(null)

  useEffect(() => {
    if (!paperId || !items.length) return
    let stopped = false
    let initialHashApplied = false
    const headerOffset = () => {
      const value = getComputedStyle(document.documentElement).getPropertyValue('--header-height')
      return (parseFloat(value) || 48) +
        (document.querySelector<HTMLElement>('.research-reader-chrome')?.offsetHeight ?? 44) + 10
    }
    const cancel = () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current)
      raf.current = null
    }
    const track = () => {
      raf.current = null
      const anchors = positions.current
      if (!anchors.length) return
      const edge = window.scrollY + headerOffset() + 8
      let low = 0, high = anchors.length
      while (low < high) {
        const mid = (low + high) >> 1
        if (anchors[mid].y <= edge) low = mid + 1
        else high = mid
      }
      const next = anchors[Math.max(0, low - 1)]?.id
      if (next) setActiveId(current => current === next ? current : next)
    }
    const schedule = () => {
      if (raf.current === null) raf.current = requestAnimationFrame(track)
    }
    const followHash = () => {
      let hash = ''
      try { hash = decodeURIComponent(window.location.hash.slice(1)) } catch { return }
      if (!items.some(item => item.id === hash)) return
      const target = document.getElementById(hash)
      if (!target) return
      const y = target.getBoundingClientRect().top + window.scrollY - headerOffset()
      window.scrollTo({ top: Math.max(0, y), behavior: 'instant' })
      setActiveId(hash)
    }
    const recalculate = () => {
      if (stopped) return
      const anchors = items.flatMap(item => {
        const element = document.getElementById(item.id)
        if (!element) return []
        return [{ id: item.id, y: window.scrollY + element.getBoundingClientRect().top }]
      })
      positions.current = anchors.sort((a, b) => a.y - b.y)
      if (!initialHashApplied && positions.current.length === items.length) {
        initialHashApplied = true
        if (window.location.hash) followHash()
      }
      schedule()
    }
    const article = document.querySelector<HTMLElement>('.research-body')
    const resize = new ResizeObserver(recalculate)
    if (article) resize.observe(article)
    // The body is lazy-loaded. Observe only until the exact manuscript anchors
    // exist; continued updates are handled by ResizeObserver, not mutation scans.
    const mutations = new MutationObserver(() => {
      recalculate()
      if (positions.current.length === items.length) mutations.disconnect()
    })
    if (article) mutations.observe(article, { childList: true, subtree: true })
    const onHashChange = () => { followHash(); recalculate() }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', recalculate, { passive: true })
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('popstate', onHashChange)
    const startFrame = requestAnimationFrame(recalculate)
    void document.fonts?.ready.then(recalculate)
    return () => {
      stopped = true
      cancelAnimationFrame(startFrame); cancel()
      resize.disconnect(); mutations.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', recalculate)
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('popstate', onHashChange)
    }
  }, [items, paperId])

  const navigate = (id: string, smooth = true) => {
    if (!items.some(item => item.id === id)) return
    const target = document.getElementById(id)
    if (!target) return
    const value = getComputedStyle(document.documentElement).getPropertyValue('--header-height')
    const offset = (parseFloat(value) || 48) +
      (document.querySelector<HTMLElement>('.research-reader-chrome')?.offsetHeight ?? 44) + 10
    const y = target.getBoundingClientRect().top + window.scrollY - offset
    if (window.location.hash !== '#' + id)
      window.history.pushState(window.history.state, '', '#' + id)
    setActiveId(id)
    window.scrollTo({
      top: Math.max(0, y),
      behavior: smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant',
    })
  }
  const activeIndex = Math.max(0, items.findIndex(item => item.id === activeId))
  return { activeId: items[activeIndex]?.id ?? '', activeIndex, items, navigate }
}

export function ResearchMobileContents({ outline }: { outline: Outline }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(0)
  const [geometry, setGeometry] = useState({ top: 100, left: 12, width: 350, maxHeight: 500 })
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const selected = outline.items[outline.activeIndex]
  const chapters = useMemo(() => {
    const groups: { chapter: OutlineItem; children: OutlineItem[] }[] = []
    for (const item of outline.items) {
      if (!item.level) groups.push({ chapter: item, children: [] })
      else groups[groups.length - 1]?.children.push(item)
    }
    return groups
  }, [outline.items])
  const filtered = useMemo(() => {
    const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
    return chapters.flatMap(group => {
      if (!words.length) return [group.chapter, ...group.children]
      const matches = (item: OutlineItem) => words.every(word => item.label.toLocaleLowerCase().includes(word))
      const parentMatch = matches(group.chapter)
      return [
        ...(parentMatch || group.children.some(matches) ? [group.chapter] : []),
        ...group.children.filter(child => parentMatch || matches(child)),
      ]
    })
  }, [chapters, query])
  const moveTo = (item: OutlineItem) => {
    setOpen(false); setQuery('')
    trigger.current?.focus({ preventScroll: true })
    outline.navigate(item.id)
  }
  const updateGeometry = () => {
    const target = trigger.current?.getBoundingClientRect()
    if (!target) return
    const vv = window.visualViewport
    const visibleBottom = (vv?.offsetTop ?? 0) + (vv?.height ?? window.innerHeight)
    const bottomNav = document.querySelector<HTMLElement>('.mobile-tabbar')?.getBoundingClientRect()
    const availableBottom = Math.min(visibleBottom, bottomNav?.top ?? visibleBottom)
    const maxWidth = window.innerWidth - 24
    const width = Math.min(440, maxWidth)
    const left = Math.max(12, Math.min(target.right - width, window.innerWidth - width - 12))
    const top = target.bottom + 7
    setGeometry({ left, top, width, maxHeight: Math.max(90, Math.min(505, availableBottom - top - 10)) })
  }
  useLayoutEffect(() => {
    if (!open) return
    updateGeometry()
    const coarse = window.matchMedia('(pointer: coarse)').matches
    if (!coarse) search.current?.focus({ preventScroll: true })
    const dismiss = (event: PointerEvent) => {
      if (menu.current?.contains(event.target as Node) || trigger.current?.contains(event.target as Node)) return
      setOpen(false)
    }
    const onScroll = () => setOpen(false)
    const onResize = () => updateGeometry()
    document.addEventListener('pointerdown', dismiss, true)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('scroll', onResize)
    return () => {
      document.removeEventListener('pointerdown', dismiss, true)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
      window.visualViewport?.removeEventListener('scroll', onResize)
    }
  }, [open])
  useEffect(() => {
    if (!open) return
    const chosen = menu.current?.querySelector<HTMLElement>('[data-focused="true"]')
    const viewport = list.current
    if (!viewport || !chosen) return
    const item = chosen.getBoundingClientRect(), pane = viewport.getBoundingClientRect()
    if (item.top < pane.top) viewport.scrollTop += item.top - pane.top
    else if (item.bottom > pane.bottom) viewport.scrollTop += item.bottom - pane.bottom
  }, [open, focused, filtered])
  const onKeys = (event: KeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented) return
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopPropagation()
      setOpen(false); trigger.current?.focus({ preventScroll: true })
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setFocused(current => filtered.length
        ? (current + (event.key === 'ArrowDown' ? 1 : -1) + filtered.length) % filtered.length : 0)
    } else if (event.key === 'Enter' && filtered[focused]) {
      event.preventDefault(); moveTo(filtered[focused])
    }
  }
  if (!outline.items.length) return null
  return <>
    <div className="research-mobile-contents">
      <button ref={trigger} type="button" className="research-mobile-jump" aria-label={'Jump to section, current: ' + selected.label}
        aria-haspopup="dialog" aria-expanded={open} aria-controls="research-section-menu"
        onClick={() => { setQuery(''); setFocused(outline.activeIndex); setOpen(current => !current) }}>
        <span className="research-mobile-jump-title">{stripNumber(selected.label)}</span><ChevronDown aria-hidden="true"/>
      </button>
    </div>
    {open && createPortal(<div id="research-section-menu" ref={menu} className="research-section-menu"
      role="dialog" aria-modal="false" aria-label="Jump to manuscript section"
      style={{ top: geometry.top, left: geometry.left, width: geometry.width, height: geometry.maxHeight, maxHeight: geometry.maxHeight }}
      onKeyDown={onKeys}>
      <div className="research-section-menu-head">
        <Search aria-hidden="true"/>
        <input ref={search} type="search" autoComplete="off" spellCheck={false}
          aria-label="Find a manuscript section" placeholder="Find a section…" value={query}
          onChange={event => { setQuery(event.target.value); setFocused(0) }}
          role="combobox" aria-expanded="true" aria-controls="research-section-options"
          aria-activedescendant={filtered[focused] ? 'research-section-option-' + filtered[focused].id : undefined}/>
        {query && <button type="button" aria-label="Clear section search" onClick={() => { setQuery(''); setFocused(0); search.current?.focus() }}><X aria-hidden="true"/></button>}
      </div>
      <ScrollView id="research-section-options" role="listbox" label="Manuscript sections" viewportRef={list} className="research-section-scroll">
        {filtered.length ? filtered.map((item, index) =>
          <button type="button" role="option" id={'research-section-option-' + item.id}
            key={item.id} className="research-section-option" data-level={item.level} data-focused={index === focused}
            aria-selected={item.id === outline.activeId} tabIndex={-1}
            onMouseEnter={() => setFocused(index)} onClick={() => moveTo(item)}>
            <span className="research-section-option-number">{numberLabel(item.label, item.id === 'title' ? 'T' : item.id === 'abstract' ? 'A' : item.id === 'references' ? 'R' : '·')}</span>
            <span className="research-section-option-title">{stripNumber(item.label)}</span>
            {item.id === outline.activeId && <Check aria-hidden="true" className="research-section-option-check"/>}
          </button>) : <p className="research-section-empty">No matching sections</p>}
      </ScrollView>
      <div className="research-section-menu-footer"><span>{filtered.length} of {outline.items.length} sections</span><span>Tap a section to jump</span></div>
    </div>, document.body)}
  </>
}

export function ResearchContents({ sections, outline, version }: { sections: readonly NavSection[]; outline: Outline; version: string }) {
  const activeParent = outline.items[outline.activeIndex]?.parentId
  // Scope manual expansion to the current chapter; auto-follow as reading moves.
  const [manualOpen, setManualOpen] = useState<{ parentId: string | undefined; chapterId: string | null } | null>(null)
  const openChapter = manualOpen?.parentId === activeParent ? manualOpen.chapterId : activeParent
  const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    outline.navigate(id)
  }
  return <aside className="research-document-toc article-toc" aria-label="On this manuscript">
    <div className="toc-heading"><div className="toc-heading-label"><ListTree aria-hidden="true"/><span>Contents</span></div>
      <span className="toc-total" aria-label={outline.items.length + ' sections'}>{String(outline.items.length).padStart(2, '0')}</span>
    </div>
    <p className="toc-position">Section {String(outline.activeIndex + 1).padStart(2, '0')} of {String(outline.items.length).padStart(2, '0')}</p>
    <nav aria-label="Manuscript outline" className="research-outline">
      {sections.map((chapter, index) => {
        const expanded = openChapter === chapter.id
        const includesActive = outline.items[outline.activeIndex]?.parentId === chapter.id
        const hasChildren = Boolean(chapter.children?.length)
        return <div className="research-outline-group" key={chapter.id}>
          <div className="research-outline-chapter">
            <a href={'#' + chapter.id} aria-current={outline.activeId === chapter.id ? 'location' : undefined}
              className={includesActive ? 'research-outline-parent-active' : ''}
              onClick={event => go(event, chapter.id)}>
              <span className="toc-index" aria-hidden="true">{numberLabel(chapter.label, chapter.id === 'title' ? 'T' : chapter.id === 'abstract' ? 'A' : chapter.id === 'references' ? 'R' : String(index + 1).padStart(2, '0'))}</span>
              <span className="toc-link-label">{stripNumber(chapter.label)}</span>
            </a>
            {hasChildren && <button type="button" className="research-outline-expander" aria-expanded={expanded}
              aria-label={(expanded ? 'Collapse ' : 'Expand ') + chapter.label}
              onClick={() => setManualOpen({ parentId: activeParent, chapterId: expanded ? null : chapter.id })}><ChevronDown aria-hidden="true"/></button>}
          </div>
          {hasChildren && expanded && <div className="research-outline-children">
            {chapter.children!.map(child => <a key={child.id} href={'#' + child.id}
              aria-current={outline.activeId === child.id ? 'location' : undefined}
              onClick={event => go(event, child.id)}>
              <span className="toc-index" aria-hidden="true">{numberLabel(child.label, '·')}</span>
              <span className="toc-link-label">{stripNumber(child.label)}</span>
            </a>)}
          </div>}
        </div>
      })}
    </nav>
    <div className="toc-footer">
      <div className="toc-related"><p className="toc-related-heading">Document</p>
        <div className="research-outline-facts"><span>Research manuscript</span><span>{version}</span></div>
      </div>
      <button type="button" className="toc-return" onClick={() => outline.navigate('title')}>
        <ArrowUp aria-hidden="true"/>Back to title page
      </button>
    </div>
  </aside>
}
