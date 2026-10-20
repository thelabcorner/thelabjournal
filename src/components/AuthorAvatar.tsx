/** The author portrait is served from the journal's own static assets. */
export function AuthorAvatar({ className, decorative = false }: {
  className: string
  decorative?: boolean
}) {
  return <img
    className={className}
    src={import.meta.env.BASE_URL + 'author-avatar.png'}
    alt={decorative ? '' : 'Jackson Cummings'}
    width={33}
    height={33}
    decoding="async"
    draggable={false}
  />
}
