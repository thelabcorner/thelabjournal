import { useEffect, useRef, type ReactNode } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

/**
 * Element-scrolling companion to the document-scrolling archive virtualizer.
 * Used only when result sets are large enough that windowing wins.
 */


export function WindowedPane<T>({
  items, getKey, estimateSize, className, rowClassName, overscan = 4,
  activeIndex, renderItem, label,
}: {
  items: readonly T[]
  getKey: (item: T) => string
  estimateSize: number
  className: string
  rowClassName: string
  overscan?: number
  activeIndex?: number
  renderItem: (item: T, index: number) => ReactNode
  label: string
}) {
  const viewport = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => viewport.current,
    estimateSize: () => estimateSize,
    getItemKey: index => getKey(items[index]!),
    overscan,
    useFlushSync: false,
  })

  useEffect(() => {
    if (activeIndex !== undefined && activeIndex >= 0 && activeIndex < items.length)
      virtualizer.scrollToIndex(activeIndex, { align: 'auto' })
  }, [activeIndex, items, virtualizer])

  return <div ref={viewport} className={className} aria-label={label} data-virtualized="pane" data-count={items.length}>
    <div className="windowed-pane-space" style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
      {virtualizer.getVirtualItems().map(row => <div
        key={row.key}
        data-index={row.index}
        ref={virtualizer.measureElement}
        className={rowClassName}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: 'translateY(' + row.start + 'px)' }}
      >{renderItem(items[row.index]!, row.index)}</div>)}
    </div>
  </div>
}
