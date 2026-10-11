/**
 * Canonical four-tile nav mark. Lower-right tile is filled.
 * All icon formats are generated from these same paths.
 */
export const BRAND_MARK_OUTLINE = 'M5 5H13V13H5V5ZM15 5H23V13H15V5ZM5 15H13V23H5V15ZM15 15H23V23H15V15Z'
export const BRAND_MARK_FILL = 'M15 15H23V23H15V15Z'
export const BRAND_MARK_STROKE = 1.3

export function brandIconSvg(maskable = false): string {
  const frame = '<rect x="7.5" y="7.5" width="49" height="49" rx="11.5" fill="#18181b" stroke="#52525b" stroke-width="1.6"/>'
  const mark = `<g transform="translate(8.62 8.62) scale(1.67)" fill="none"><path d="${BRAND_MARK_OUTLINE}" stroke="#fafafa" stroke-width="${BRAND_MARK_STROKE}"/><path d="${BRAND_MARK_FILL}" fill="#fafafa"/></g>`
  // 70% content scale: complete glyph and frame fit in the center safe circle.
  const symbol = maskable ? `<g transform="translate(32 32) scale(.7) translate(-32 -32)">${frame}${mark}</g>` : frame + mark
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#18181b"/>${symbol}</svg>`
}