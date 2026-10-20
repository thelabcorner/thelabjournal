import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { ScrollView } from './components/ScrollView'
import type { Entry } from './data'

/**
 * Journal editorial counterpart of the manuscript's compact section picker.
 * The entry keeps its flat editorial sequence; scientific chapter/subchapter
 * hierarchy remains exclusive to the research reader.
 *
 * The popup is portaled outside the sticky bar so it is never cropped by the
 * manuscript/journal reading chrome or the page's horizontal gutters.
 */
export function JournalSectionPicker({ entry, activeSection, onSelect }: {
  entry: Entry
  activeSection: number
  onSelect: (index: number) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(0)
  const [geometry, setGeometry] = useState({ top: 90, left: 12, width: 296, height: 320 })
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const active = Math.max(0, Math.min(entry.sections.length - 1, activeSection))
  const filtered = useMemo(() => {
    const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
    return entry.sections
      .map((section, index) => ({ heading: section.heading, index }))
      .filter(section => words.every(word => section.heading.toLocaleLowerCase().includes(word) ||
        String(section.index + 1).includes(word)))
  }, [entry.sections, query])

  const close = (restoreFocus = false) => {
    setOpen(false)
    setQuery('')
    if (restoreFocus) trigger.current?.focus({ preventScroll: true })
  }
  const choose = (index: number) => {
    close(true)
    onSelect(index)
  }
  const positionMenu = () => {
    const target = trigger.current?.getBoundingClientRect()
    if (!target) return
    const vv = window.visualViewport
    const bottom = (vv?.offsetTop ?? 0) + (vv?.height ?? window.innerHeight)
    const nav = document.querySelector<HTMLElement>('.mobile-tabbar')
    const navTop = nav && getComputedStyle(nav).display !== 'none'
      ? nav.getBoundingClientRect().top : bottom
    const available = Math.min(bottom, navTop)
    const width = Math.min(440, window.innerWidth - 24)
    const left = Math.max(12, Math.min(target.right - width, window.innerWidth - width - 12))
    const top = target.bottom + 7
    setGeometry({ top, left, width, height: Math.max(95, Math.min(480, available - top - 10)) })
  }
  useLayoutEffect(() => {
    if (!open) return
    positionMenu()
    if (!window.matchMedia('(pointer: coarse)').matches) search.current?.focus({ preventScroll: true })
    const outside = (event: PointerEvent) => {
      if (menu.current?.contains(event.target as Node) || trigger.current?.contains(event.target as Node)) return
      close()
    }
    const scrolled = () => close()
    const resized = () => { if (window.innerWidth >= 768) close(); else positionMenu() }
    document.addEventListener('pointerdown', outside, true)
    window.addEventListener('scroll', scrolled, { passive: true })
    window.addEventListener('resize', resized)
    window.visualViewport?.addEventListener('resize', resized)
    window.visualViewport?.addEventListener('scroll', resized)
    return () => {
      document.removeEventListener('pointerdown', outside, true)
      window.removeEventListener('scroll', scrolled)
      window.removeEventListener('resize', resized)
      window.visualViewport?.removeEventListener('resize', resized)
      window.visualViewport?.removeEventListener('scroll', resized)
    }
  }, [open])
  useEffect(() => {
    if (!open) return
    const item = menu.current?.querySelector<HTMLElement>('[data-focused="true"]')?.getBoundingClientRect()
    const pane = viewport.current?.getBoundingClientRect()
    if (!item || !pane || !viewport.current) return
    if (item.top < pane.top) viewport.current.scrollTop += item.top - pane.top
    else if (item.bottom > pane.bottom) viewport.current.scrollTop += item.bottom - pane.bottom
  }, [open, focused, filtered])
  const keyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopPropagation(); close(true)
    } else if (event.key === 'Tab') {
      // This is a non-modal disclosure, not a focus trap.
      close()
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setFocused(previous => filtered.length
        ? (previous + (event.key === 'ArrowDown' ? 1 : -1) + filtered.length) % filtered.length : 0)
    } else if (event.key === 'Enter' && filtered[focused]) {
      event.preventDefault(); choose(filtered[focused].index)
    }
  }
  return <>
    <div className="journal-mobile-contents" aria-label="Current journal section">
      <button ref={trigger} type="button" className="journal-mobile-jump research-mobile-jump"
        aria-label={'Jump to journal section, current: ' + entry.sections[active]?.heading}
        aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? 'journal-section-menu' : undefined}
        onClick={event => {
          if (open) { close(); return }
          setQuery(''); setFocused(active); setOpen(true)
          if (event.detail === 0) requestAnimationFrame(() => search.current?.focus({ preventScroll: true }))
        }}>
        <span className="journal-mobile-jump-title research-mobile-jump-title">{entry.sections[active]?.heading}</span>
        <ChevronDown aria-hidden="true"/>
      </button>
    </div>
    {open && createPortal(<div ref={menu} id="journal-section-menu"
      className="research-section-menu journal-section-menu"
      role="dialog" aria-modal="false" aria-label="Jump to journal section"
      style={{ top: geometry.top, left: geometry.left, width: geometry.width,
        height: geometry.height, maxHeight: geometry.height }} onKeyDown={keyDown}>
      <div className="research-section-menu-head">
        <Search aria-hidden="true"/>
        <input ref={search} type="search" autoComplete="off" spellCheck={false}
          aria-label="Find a journal section" placeholder="Find a section…" value={query}
          onChange={event => { setQuery(event.target.value); setFocused(0) }}
          role="combobox" aria-expanded="true" aria-controls="journal-section-options"
          aria-activedescendant={filtered[focused] ? 'journal-section-option-' + filtered[focused].index : undefined}/>
        {query && <button type="button" aria-label="Clear section search"
          onClick={() => { setQuery(''); setFocused(0); search.current?.focus() }}><X aria-hidden="true"/></button>}
      </div>
      <ScrollView id="journal-section-options" role="listbox" label="Journal sections"
        viewportRef={viewport} className="research-section-scroll">
        {filtered.length ? filtered.map((item, index) =>
          <button type="button" role="option" id={'journal-section-option-' + item.index}
            className="research-section-option" key={item.index} tabIndex={-1}
            data-level={0} data-focused={focused === index} aria-selected={active === item.index}
            onMouseEnter={() => setFocused(index)} onClick={() => choose(item.index)}>
            <span className="research-section-option-number">{String(item.index + 1).padStart(2, '0')}</span>
            <span className="research-section-option-title">{item.heading}</span>
            {active === item.index && <Check className="research-section-option-check" aria-hidden="true"/>}
          </button>) : <p className="research-section-empty">No matching sections</p>}
      </ScrollView>
      <div className="research-section-menu-footer"><span>{filtered.length} of {entry.sections.length} sections</span>
        <span>Tap a section to jump</span></div>
    </div>, document.body)}
  </>
}
