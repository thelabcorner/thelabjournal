import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'

export interface QuoteFacetOption {
  value: string
  label: string
}

interface QuoteFacetProps {
  label: string
  ariaLabel: string
  value: string
  options: readonly QuoteFacetOption[]
  onValueChange: (value: string) => void
  active?: boolean
}

/** A compact, accessible filter selector; never a browser-native select menu. */
export function QuoteFacet({ label, ariaLabel, value, options, onValueChange, active = false }: QuoteFacetProps) {
  return <Select.Root value={value} onValueChange={onValueChange}>
    <Select.Trigger
      className={'quotes-facet-trigger' + (active ? ' is-active' : '')}
      aria-label={ariaLabel}
    >
      <span className="quotes-facet-name">{label}</span>
      <span className="quotes-facet-value"><Select.Value/></span>
      <Select.Icon className="quotes-facet-chevron"><ChevronDown size={13} strokeWidth={1.8} aria-hidden="true"/></Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content
        className="quotes-facet-menu"
        position="popper"
        side="bottom"
        align="start"
        sideOffset={7}
        collisionPadding={12}
      >
        <div className="quotes-facet-menu-title">
          {label}
          {options.length > 12 && <span>Type to jump</span>}
        </div>
        <Select.ScrollUpButton className="quotes-facet-scroll">
          <ChevronUp size={14} aria-hidden="true"/>
        </Select.ScrollUpButton>
        <Select.Viewport className="quotes-facet-menu-items">
          {options.map(option => <Select.Item
            key={option.value}
            value={option.value}
            textValue={option.label}
            className="quotes-facet-option"
          >
            <Select.ItemText>{option.label}</Select.ItemText>
            <Select.ItemIndicator className="quotes-facet-option-check">
              <Check size={14} strokeWidth={2} aria-hidden="true"/>
            </Select.ItemIndicator>
          </Select.Item>)}
        </Select.Viewport>
        <Select.ScrollDownButton className="quotes-facet-scroll">
          <ChevronDown size={14} aria-hidden="true"/>
        </Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
}