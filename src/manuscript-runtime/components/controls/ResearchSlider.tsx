import { useId } from 'react';

interface ResearchSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
  formatValue?: (value: number) => string;
  showBounds?: boolean;
}

export function ResearchSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit = '',
  formatValue,
  showBounds = true,
}: ResearchSliderProps) {
  const id = useId();
  const format = (next: number) => formatValue ? formatValue(next) : `${next}${unit}`;
  const display = format(value);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </label>
        <output
          htmlFor={id}
          className="shrink-0 text-xs font-mono tabular-nums text-[var(--accent)]"
        >
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="research-range w-full"
        aria-valuetext={display}
      />
      {showBounds && (
        <div className="flex justify-between text-xs text-[var(--text-muted)] font-mono tabular-nums" aria-hidden="true">
          <span>{format(min)}</span>
          <span>{format(max)}</span>
        </div>
      )}
    </div>
  );
}
