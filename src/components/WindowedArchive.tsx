import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import type { Entry } from '../data'
import type { ArchiveLayout } from './journalPrefs'

/**
 * Window-backed archive virtualization, not a nested scroll viewport.
 * This keeps normal document scroll, sticky chrome, browser scroll position,
 * anchor navigation, and the existing mobile bottom bar intact.
 */

const getDocumentTop = (element: HTMLElement) => element.getBoundingClientRect().top + window.scrollY

export function WindowedArchive({
  entries, layout, renderEntry,
}: {
  entries: readonly Entry[]
  layout: ArchiveLayout
  renderEntry: (entry: Entry, index: number) => ReactNode
}) {
  const host = useRef<HTMLDivElement>(null)
  const [top, setTop] = useState(0)
  const [phone, setPhone] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  const columns = layout === 'cards' && !phone ? 2 : 1
  // Group entire grid rows, not independent masonry lanes: preserves date/sort order.
  const rows = useMemo(() => {
    const groups: Entry[][] = []
    for (let i = 0; i < entries.length; i += columns) groups.push(entries.slice(i, i + columns))
    return groups
  }, [entries, columns])
  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => layout === 'cards' ? (phone ? 154 : 182) : (phone ? 104 : 78),
    getItemKey: (index) => rows[index]?.map(entry => entry.slug).join('|') ?? String(index),
    overscan: 5,
    scrollMargin: top,
    useFlushSync: false,
  })

  useLayoutEffect(() => {
    const node = host.current
    if (!node) return
    let raf = 0
    const update = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const next = getDocumentTop(node)
        setTop(previous => Math.abs(previous - next) < 0.5 ? previous : next)
      })
    }
    update()
    // Layout above the collection can move after fonts, feature animation,
    // preference changes, or responsive resizing.
    const resizeObserver = new ResizeObserver(update)
    const main = node.closest('.content-main')
    if (main) {
      main.querySelectorAll('.workspace-heading, .workspace-status, .workspace-filters, .feature-row, .index-heading-row, .index-list-header').forEach(element => resizeObserver.observe(element))
    }
    const media = window.matchMedia('(max-width: 767px)')
    const onMedia = () => setPhone(media.matches)
    media.addEventListener('change', onMedia)
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      media.removeEventListener('change', onMedia)
      window.removeEventListener('resize', update)
    }
  }, [layout, entries])

  useLayoutEffect(() => {
    virtualizer.measure()
  }, [columns, layout, entries, virtualizer])

  return <div ref={host} className={'journal-list journal-list--virtual' + (layout === 'cards' ? ' journal-list--cards' : '')} data-virtualized="archive" data-count={entries.length} role="list" aria-label="Journal articles">
    <div className="windowed-archive-space" style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
      {virtualizer.getVirtualItems().map(item => <div
        key={item.key}
        data-index={item.index}
        ref={virtualizer.measureElement}
        className={'windowed-archive-row windowed-archive-row--' + layout}
        role="presentation"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: 'translateY(' + (item.start - virtualizer.options.scrollMargin) + 'px)' }}
      >{rows[item.index]?.map((entry, index) => <div className="windowed-archive-cell" role="presentation" key={entry.slug}>{renderEntry(entry, item.index * columns + index)}</div>)}</div>)}
    </div>
  </div>
}
