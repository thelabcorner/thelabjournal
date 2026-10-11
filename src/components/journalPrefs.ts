import { hapticsEnabled } from '../haptics'
import type { ThemePreference } from '../theme'
export type ReadingScale = 'normal' | 'large'
export type ArchiveLayout = 'list' | 'cards'
export interface JournalPrefs {
  textScale: ReadingScale
  layout: ArchiveLayout
  haptics: boolean
  theme: ThemePreference
}
export const prefsStorage = 'thelabcorner.journal.preferences.v2'
export function loadPrefs(): JournalPrefs {
  const defaults: JournalPrefs = { textScale: 'normal', layout: 'list', haptics: hapticsEnabled(), theme: 'system' }
  try {
    const read = JSON.parse(localStorage.getItem(prefsStorage) || '{}') as Partial<JournalPrefs>
    return {
      textScale: read.textScale === 'large' ? 'large' : 'normal',
      layout: read.layout === 'cards' ? 'cards' : 'list',
      haptics: hapticsEnabled(),
      theme: read.theme === 'dark' || read.theme === 'light' ? read.theme : 'system',
    }
  } catch { return defaults }
}
