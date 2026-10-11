import type { ThemePreference } from '../theme'
import { useEffect, useRef, type KeyboardEvent } from 'react'
import { Check, Monitor, Moon, MousePointer2, Settings2, Sun, X } from 'lucide-react'
import { cn } from '../lib/utils'
import { cue, setHapticsEnabled } from '../haptics'
import { InstallSection, type JournalPWA } from './JournalPWA'

import type { JournalPrefs } from './journalPrefs'
interface Props {
  prefs: JournalPrefs
  pwa: JournalPWA
  onChange: (prefs: JournalPrefs) => void
  onClose: () => void
}
function trap(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== 'Tab') return
  const nodes = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button,input')).filter(el => !el.hasAttribute('disabled'))
  if (!nodes.length) return
  if (event.shiftKey && document.activeElement === nodes[0]) { event.preventDefault(); nodes[nodes.length - 1].focus() }
  if (!event.shiftKey && document.activeElement === nodes[nodes.length - 1]) { event.preventDefault(); nodes[0].focus() }
}
const modes = [{ id: 'system', label: 'System', Icon: Monitor }, { id: 'light', label: 'Light', Icon: Sun }, { id: 'dark', label: 'Dark', Icon: Moon }] as const

/** Purely decorative miniature app frame. System shows both surfaces side by side. */
function MiniWindow({ dark = false }: { dark?: boolean }) {
  return <span className={cn('theme-mini-window', dark && 'theme-mini-window--dark')}>
    <span className="theme-mini-titlebar"><i/><i/><i/></span>
    <span className="theme-mini-content">
      <span className="theme-mini-rail"><i/><i/><i/></span>
      <span className="theme-mini-copy"><i/><i/><i/></span>
    </span>
  </span>
}
function ThemeChoice({ id, label, selected, onSelect, Icon }: {
  id: ThemePreference, label: string, selected: boolean, onSelect: () => void, Icon: typeof Monitor
}) {
  return <button type="button" className="theme-option" data-selected={selected} aria-pressed={selected} onClick={onSelect}>
    <span className={cn('theme-option-preview', 'theme-option-preview--' + id)} aria-hidden="true">
      {id === 'system' ? <span className="theme-system-pair"><MiniWindow/><MiniWindow dark/></span> : <MiniWindow dark={id === 'dark'}/>}
    </span>
    <span className="theme-option-footer">
      <Icon size={13} strokeWidth={1.8} aria-hidden="true"/>
      <span>{label}</span>
      <span className="theme-option-indicator" aria-hidden="true">{selected && <Check size={11} strokeWidth={2.5}/>}</span>
    </span>
  </button>
}
export function JournalPreferences({ prefs, pwa, onChange, onClose }: Props) {
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => { close.current?.focus() }, [])
  const update = (next: JournalPrefs) => {
    if (next.haptics !== prefs.haptics) setHapticsEnabled(next.haptics)
    onChange(next)
    if (next.haptics) cue('selection')
  }
  return <div className="prefs-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <section className="prefs-dialog" role="dialog" aria-label="Journal preferences" aria-modal="true" onKeyDown={trap}>
      <div className="prefs-titlebar"><div className="prefs-title"><Settings2 size={17}/><span>Preferences</span></div><button ref={close} type="button" onClick={onClose} aria-label="Close preferences"><X size={17}/></button></div>
      <div className="prefs-content">
        <div className="prefs-group"><div className="prefs-label"><strong>Appearance</strong><span>Match your device or choose a fixed theme.</span></div><div className="prefs-choice prefs-theme" role="group" aria-label="Appearance">
          {modes.map(({id,label,Icon}) => <ThemeChoice key={id} id={id} label={label} Icon={Icon} selected={prefs.theme === id} onSelect={() => { if (prefs.theme !== id) update({...prefs,theme:id}) }}/>)}
        </div></div>
        <div className="prefs-group"><div className="prefs-label"><strong>Reading type</strong><span>Adjust the article reading column.</span></div><div className="prefs-choice">
          <button className={cn(prefs.textScale === 'normal' && 'active')} aria-pressed={prefs.textScale === 'normal'} onClick={() => update({...prefs,textScale:'normal'})}><span className="prefs-scale-normal">Aa</span><span>Standard</span>{prefs.textScale === 'normal' && <Check size={13}/>}</button>
          <button className={cn(prefs.textScale === 'large' && 'active')} aria-pressed={prefs.textScale === 'large'} onClick={() => update({...prefs,textScale:'large'})}><span className="prefs-scale-large">Aa</span><span>Comfortable</span>{prefs.textScale === 'large' && <Check size={13}/>}</button>
        </div></div>
        <div className="prefs-group"><div className="prefs-label"><strong>Archive layout</strong><span>Choose how entries are shown.</span></div><div className="prefs-choice">
          <button aria-pressed={prefs.layout === 'list'} className={cn(prefs.layout === 'list' && 'active')} onClick={() => update({...prefs,layout:'list'})}><span className="prefs-preview-list"><i/><i/><i/></span><span>List</span>{prefs.layout === 'list' && <Check size={13}/>}</button>
          <button aria-pressed={prefs.layout === 'cards'} className={cn(prefs.layout === 'cards' && 'active')} onClick={() => update({...prefs,layout:'cards'})}><span className="prefs-preview-cards"><i/><i/><i/><i/></span><span>Cards</span>{prefs.layout === 'cards' && <Check size={13}/>}</button>
        </div></div>
        <InstallSection pwa={pwa}/>
        <div className="prefs-group prefs-haptics"><div className="prefs-label"><strong>Tactile feedback</strong><span>WebHaptics V2 · navigation and saved items when supported.</span></div><label className="prefs-switch"><input type="checkbox" checked={prefs.haptics} onChange={e => update({...prefs,haptics:e.target.checked})}/><span aria-hidden="true"/></label></div>
        <button className="prefs-test" onClick={() => cue('success')} disabled={!prefs.haptics}><MousePointer2 size={15}/> Test haptics<span>WebHaptics V2</span></button>
      </div>
      <div className="prefs-foot"><span>Settings are saved in this browser.</span><button onClick={onClose}>Done</button></div>
    </section>
  </div>
}
