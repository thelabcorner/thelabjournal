/**
 * Virtualization is for large content collections, not UI chrome.
 * Lower counts retain direct DOM rendering for faster initial interactions,
 * native find-in-page, reliable focus, and simple browser semantics.
 */
export const ARCHIVE_VIRTUAL_THRESHOLD = 24
export const PANE_VIRTUAL_THRESHOLD = 24
