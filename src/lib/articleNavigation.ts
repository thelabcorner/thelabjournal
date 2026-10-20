/**
 * Section navigation deliberately uses the window as the scroll owner.
 * Calculating from the live viewport avoids the native fragment-navigation
 * jump (and its separate browser scroll animation) while keeping the reader's
 * current position as the starting point in either direction.
 */
export function articleScrollOffset(): number {
  const headerBottom = document.querySelector<HTMLElement>('.site-header')?.getBoundingClientRect().bottom ?? 0
  const readingBarBottom = document.querySelector<HTMLElement>('.reading-bar')?.getBoundingClientRect().bottom ?? 0
  return Math.ceil(Math.max(headerBottom, readingBarBottom) + 18)
}

export function scrollToArticleSection(id: string, behavior: ScrollBehavior): boolean {
  const element = document.getElementById(id)
  if (!element) return false

  const top = Math.max(0, window.scrollY + element.getBoundingClientRect().top - articleScrollOffset())
  window.scrollTo({ top, behavior })
  return true
}
