import { BookOpen, Bookmark, ChevronLeft, ChevronRight, FlaskConical, Microscope, PanelLeftClose, PanelLeftOpen, PenLine, Settings2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { cue } from '../haptics'
import type { Topic } from '../data'

interface Props {
  collapsed: boolean
  active: Topic | 'All'
  view: 'all' | 'saved'
  selected: boolean
  saved: number
  onCollapse: () => void
  onFilter: (topic: Topic | 'All') => void
  onSaved: () => void
  onSettings: () => void
}
export function DesktopRail({ collapsed, active, view, selected, saved, onCollapse, onFilter, onSaved, onSettings }: Props) {
  const nav = [
    {label:'All writing', icon:BookOpen, topic:'All' as const},
    {label:'Essays', icon:PenLine, topic:'Essays' as const},
    {label:'Research', icon:Microscope, topic:'Research' as const},
    {label:'Experiments', icon:FlaskConical, topic:'Experiments' as const}
  ]
  return <div className="desktop-rail" aria-label="Journal quick navigation">
    <div className="rail-masthead" title="thelabjournal™"><div className="rail-mark" aria-hidden="true"><span/><span/><span/><span/></div></div>
    <div className="rail-micro-divider"/>
    <nav className="rail-primary-nav" aria-label="Quick sections">
      {nav.map(({label,icon:Icon,topic}) => <button key={topic} aria-label={label} title={label} aria-current={!selected && view==='all' && active===topic ? 'page' : undefined} className={cn(!selected && view==='all' && active===topic && 'active')} onClick={() => { cue('selection'); onFilter(topic) }}><Icon size={18}/></button>)}
      <div className="rail-micro-divider"/>
      <button aria-label="Saved entries" title="Saved entries" className={cn(!selected && view==='saved' && 'active')} aria-current={!selected && view==='saved' ? 'page' : undefined} onClick={() => { cue('selection'); onSaved() }}><Bookmark size={18}/>{saved>0 && <span className="rail-tiny-count">{saved}</span>}</button>
    </nav>
    <div className="rail-primary-footer">
      <button title="Preferences" aria-label="Preferences" onClick={onSettings}><Settings2 size={17}/></button>
      <button className="rail-collapse" title={collapsed?'Expand sidebar':'Collapse sidebar'} aria-label={collapsed?'Expand sidebar':'Collapse sidebar'} aria-expanded={!collapsed} onClick={() => { cue('selection'); onCollapse() }}>{collapsed?<PanelLeftOpen size={17}/>:<PanelLeftClose size={17}/>}</button>
      <div className="rail-author" title="thelabjournal™">JC</div>
    </div>
    {!collapsed && <span className="rail-edge-control" aria-hidden="true">{collapsed?<ChevronRight size={11}/>:<ChevronLeft size={11}/>}</span>}
  </div>
}
