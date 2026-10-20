import { BRAND_MARK_OUTLINE, BRAND_MARK_FILL, BRAND_MARK_STROKE } from '../lib/brandMark'

/** One canonical glyph for the masthead and the desktop navigation rail. */
export function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 28 28" fill="none"><path d={BRAND_MARK_OUTLINE} stroke="currentColor" strokeWidth={BRAND_MARK_STROKE}/><path d={BRAND_MARK_FILL} fill="currentColor"/></svg></span>
}