import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Filter } from 'lucide-react'
import type { ArchiveSort } from '../lib/archiveSort'
import '../archive-sort.css'

const OPTIONS: readonly { value: ArchiveSort; label: string }[] = [
  { value: 'recent', label: 'Newest' },
  { value: 'subject', label: 'Subject' },
  { value: 'short', label: 'Shortest' },
  { value: 'long', label: 'Longest' },
]

const MENU_MIN_WIDTH = 186
const VIEWPORT_GAP = 12
const MENU_GAP = 7
const INITIAL_MENU_HEIGHT = 190

function placeMenu(bounds: DOMRect, height: number) {
  const width = Math.min(Math.max(MENU_MIN_WIDTH, bounds.width), window.innerWidth - VIEWPORT_GAP * 2)
  const left = Math.max(VIEWPORT_GAP, Math.min(bounds.right - width, window.innerWidth - VIEWPORT_GAP - width))
  const fitsAbove = bounds.top >= height + MENU_GAP + VIEWPORT_GAP
  const flip = bounds.bottom + MENU_GAP + height > window.innerHeight - VIEWPORT_GAP && fitsAbove
  const idealTop = flip ? bounds.top - height - MENU_GAP : bounds.bottom + MENU_GAP
  const top = Math.max(VIEWPORT_GAP, Math.min(idealTop, window.innerHeight - VIEWPORT_GAP - height))
  return { top, left, width }
}

/**
 * Compact, select-only listbox. Matches the QuoteFacet popup styling without
 * eagerly loading its entire Radix dependency graph on every journal visit.
 * Focus remains on the trigger; aria-activedescendant tracks the active item.
 */
export function ArchiveSortSelect({
  value,
  onChange,
}: {
  value: ArchiveSort
  onChange: (next: ArchiveSort) => void
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0, width: MENU_MIN_WIDTH })
  const trigger = useRef<HTMLButtonElement>(null)
  const popup = useRef<HTMLDivElement>(null)
  const typeahead = useRef({ text: '', at: 0 })
  const id = useId()
  const menuId = id + '-options'

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false)
    typeahead.current.text = ''
    if (restoreFocus) trigger.current?.focus({ preventScroll: true })
  }, [])

  const choose = useCallback((index: number) => {
    const next = OPTIONS[index]
    if (!next) return
    if (next.value !== value) onChange(next.value)
    close(true)
  }, [value, onChange, close])

  const openMenu = useCallback((index = OPTIONS.findIndex(option => option.value === value)) => {
    // Calculate the initial placement before mounting the portal so the
    // menu never briefly appears at (0,0) on fast desktop devices.
    if (trigger.current) setPosition(placeMenu(trigger.current.getBoundingClientRect(), INITIAL_MENU_HEIGHT))
    setActive(Math.max(0, index))
    setOpen(true)
  }, [value])

  const positionMenu = useCallback(() => {
    const button = trigger.current
    const menu = popup.current
    if (!button || !menu) return
    const next = placeMenu(button.getBoundingClientRect(), menu.offsetHeight)
    setPosition(previous => previous.top === next.top && previous.left === next.left && previous.width === next.width
      ? previous : next)
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    positionMenu()
    const onMove = () => positionMenu()
    window.addEventListener('resize', onMove)
    // Track a scrolling layout only while the popover is open.
    window.addEventListener('scroll', onMove, true)
    return () => {
      window.removeEventListener('resize', onMove)
      window.removeEventListener('scroll', onMove, true)
    }
  }, [open, positionMenu])

  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => {
      const node = event.target
      if (!(node instanceof Node)) return
      if (!trigger.current?.contains(node) && !popup.current?.contains(node)) close(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open, close])

  const keyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!open) openMenu()
        else setActive(index => (index + 1) % OPTIONS.length)
        return
      case 'ArrowUp':
        event.preventDefault()
        if (!open) openMenu()
        else setActive(index => (index - 1 + OPTIONS.length) % OPTIONS.length)
        return
      case 'Home':
        if (!open) return
        event.preventDefault()
        setActive(0)
        return
      case 'End':
        if (!open) return
        event.preventDefault()
        setActive(OPTIONS.length - 1)
        return
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (open) choose(active)
        else openMenu()
        return
      case 'Escape':
        if (!open) return
        event.preventDefault()
        close(true)
        return
      case 'Tab':
        if (open) close(false)
        return
      default:
        if (event.key.length !== 1 || event.altKey || event.ctrlKey || event.metaKey) return
        const now = performance.now()
        const typed = typeahead.current
        typed.text = (now - typed.at > 700 ? '' : typed.text) + event.key.toLowerCase()
        typed.at = now
        let found = OPTIONS.findIndex(option => option.label.toLowerCase().startsWith(typed.text))
        if (found === -1) {
          typed.text = event.key.toLowerCase()
          found = OPTIONS.findIndex(option => option.label.toLowerCase().startsWith(typed.text))
        }
        if (found !== -1) {
          event.preventDefault()
          if (open) setActive(found)
          else choose(found)
        }
    }
  }

  return <>
    <button
      type="button"
      id="journal-sort"
      ref={trigger}
      role="combobox"
      aria-label="Sort journal entries"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={open ? menuId : undefined}
      aria-activedescendant={open ? menuId + '-' + active : undefined}
      className="sort-trigger"
      data-state={open ? 'open' : 'closed'}
      onClick={() => open ? close(false) : openMenu()}
      onKeyDown={keyDown}
    >
      <Filter size={13} strokeWidth={1.8} aria-hidden="true" className="sort-trigger-icon" />
      <span>{OPTIONS.find(option => option.value === value)?.label}</span>
      <span className="sort-trigger-chevron" aria-hidden="true"><ChevronDown size={13} strokeWidth={1.8}/></span>
    </button>
    {open && createPortal(<div
      id={menuId}
      ref={popup}
      role="listbox"
      aria-label="Sort journal entries"
      className="sort-popover"
      style={{ position: 'fixed', top: position.top, left: position.left, width: position.width }}
    >
      <div className="sort-popover-title" aria-hidden="true">Sort writing</div>
      <div className="sort-popover-viewport">
        {OPTIONS.map((option, index) => <div
          key={option.value}
          id={menuId + '-' + index}
          role="option"
          aria-selected={value === option.value}
          data-state={value === option.value ? 'checked' : 'unchecked'}
          data-highlighted={index === active ? '' : undefined}
          className="sort-popover-option"
          onPointerMove={() => { if (active !== index) setActive(index) }}
          onClick={() => choose(index)}
        >
          <span>{option.label}</span>
          {value === option.value && <span className="sort-popover-check" aria-hidden="true">
            <Check size={14} strokeWidth={2}/>
          </span>}
        </div>)}
      </div>
    </div>, document.body)}
  </>
}
