import { BookOpen, Bookmark, FlaskConical, Microscope, PanelLeftClose, PanelLeftOpen, PenLine, Settings2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { AuthorAvatar } from './AuthorAvatar'
import { cue } from '../haptics'
import type { Topic } from '../data'

interface Props {
  collapsed: boolean
  active: Topic | 'All'
  view: 'all' | 'saved'
  selected: boolean
  researchMode: boolean
  onResearch: () => void
  saved: number
  onCollapse: () => void
  onFilter: (topic: Topic | 'All') => void
  onSaved: () => void
  onSettings: () => void
}
export function DesktopRail({ collapsed, active, view, selected, researchMode, onResearch, saved, onCollapse, onFilter, onSaved, onSettings }: Props) {
  const nav = [
    {label:'All writing', icon:BookOpen, topic:'All' as const},
    {label:'Essays', icon:PenLine, topic:'Essays' as const},
    {label:'Research notes', icon:BookOpen, topic:'Research' as const},
    {label:'Experiments', icon:FlaskConical, topic:'Experiments' as const}
  ]
  return <div className="desktop-rail" aria-label="Journal quick navigation">
    <div className="rail-masthead">
      <button type="button" className="rail-collapse" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} onClick={() => { cue('selection'); onCollapse() }}>
        {collapsed ? <PanelLeftOpen size={18} aria-hidden="true"/> : <PanelLeftClose size={18} aria-hidden="true"/>}
      </button>
    </div>
    <div className="rail-micro-divider"/>
    <nav className="rail-primary-nav" aria-label="Quick sections">
      {nav.map(({label,icon:Icon,topic}) => <button key={topic} aria-label={label} title={label} aria-current={!selected && view==='all' && active===topic ? 'page' : undefined} className={cn(!selected && view==='all' && active===topic && 'active')} onClick={() => { cue('selection'); onFilter(topic) }}><Icon size={18}/></button>)}
      <button aria-label="Research manuscripts" title="Research manuscripts" className={cn(researchMode && 'active')} aria-current={researchMode ? 'page' : undefined} onClick={() => { cue('selection'); onResearch() }}><Microscope size={18}/></button>
      <div className="rail-micro-divider"/>
      <button aria-label="Saved entries" title="Saved entries" className={cn(!selected && view==='saved' && 'active')} aria-current={!selected && view==='saved' ? 'page' : undefined} onClick={() => { cue('selection'); onSaved() }}><Bookmark size={18}/>{saved>0 && <span className="rail-tiny-count">{saved}</span>}</button>
    </nav>
    <div className="rail-primary-footer">
      <button title="Preferences" aria-label="Preferences" onClick={onSettings}><Settings2 size={17}/></button>
      <AuthorAvatar className="rail-author"/>
    </div>
  </div>
}
