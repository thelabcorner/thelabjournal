import { Children, Fragment, type ReactNode } from 'react';

/**
 * Presentation-only scientific typography for manuscript prose.
 * The authored text is unchanged; only a finite, reviewed symbol vocabulary
 * is decorated. Never scan arbitrary identifiers or use DOM mutation.
 */
export type ScientificTone = 'neutral' | 'gas' | 'thermal' | 'measure';

type SymbolSpec = {
  base: string;
  sub?: string;
  sup?: string;
  suffix?: string;
  tone?: ScientificTone;
};

const symbols: Record<string, SymbolSpec> = {
  'm_s': { base: 'm', sub: 's', tone: 'measure' },
  'm_0': { base: 'm', sub: '0', tone: 'measure' },
  'm₀': { base: 'm', sub: '0', tone: 'measure' },
  'm_c': { base: 'm', sub: 'c', tone: 'measure' },
  'm_b': { base: 'm', sub: 'b', tone: 'measure' },
  'm(t)': { base: 'm', suffix: '(t)', tone: 'measure' },
  'M_A': { base: 'M', sub: 'A' },
  'f_A': { base: 'f', sub: 'A', tone: 'measure' },
  'V_g': { base: 'V', sub: 'g', tone: 'gas' },
  'V_l': { base: 'V', sub: 'l', tone: 'measure' },
  'T_0': { base: 'T', sub: '0', tone: 'thermal' },
  'T_t': { base: 'T', sub: 't', tone: 'thermal' },
  'r_P': { base: 'r', sub: 'P', tone: 'gas' },
  'r_eff': { base: 'r', sub: 'eff', tone: 'gas' },
  'r_P,max': { base: 'r', sub: 'P,max', tone: 'gas' },
  'S_P': { base: 'S', sub: 'P', tone: 'gas' },
  'q_ref': { base: 'q', sub: 'ref', tone: 'measure' },
  'q_cal': { base: 'q', sub: 'cal', tone: 'measure' },
  'delta X_seal': { base: 'δX', sub: 'seal', tone: 'gas' },
  'delta X_display': { base: 'δX', sub: 'display', tone: 'measure' },
  'epsilon': { base: 'ε' },
  'f': { base: 'f', tone: 'measure' },
  'x': { base: 'x', tone: 'measure' },
  'k': { base: 'k', tone: 'measure' },
  'r': { base: 'r', tone: 'measure' },
  'R': { base: 'R', tone: 'gas' },
  'T': { base: 'T', tone: 'measure' },
};

/** Keep longest-first matching and explicit boundaries to protect regular words. */
const tokens = [
  ...Object.keys(symbols),
  'CO2', 'CO₂', 'cm^3', 'm^3', 'mol^-1',
].sort((a, b) => b.length - a.length);
const escapeRegex = (s: string) => s.replace(/[.*+?^$()|[\]{}]/g, '\\$&');
const tokenPattern = new RegExp(
  String.raw`(?<![\p{L}\p{N}_])(?:` + tokens.map(escapeRegex).join('|') +
  String.raw`)(?![\p{L}\p{N}_])`, 'gu',
);

export function VariableBadge({
  symbol, base, sub, sup, suffix, tone = 'neutral',
}: {
  symbol?: string;
  base: string;
  sub?: string;
  sup?: string;
  suffix?: string;
  tone?: ScientificTone;
}) {
  return (
    <span className={'research-variable-badge research-variable-badge--' + tone}
      aria-label={symbol ?? [base, sub && 'subscript ' + sub, sup && 'superscript ' + sup].filter(Boolean).join(' ')}>
      <span className="research-variable-glyph">{base}</span>
      {sub && <sub>{sub}</sub>}
      {sup && <sup>{sup}</sup>}
      {suffix && <span className="research-variable-suffix">{suffix}</span>}
    </span>
  );
}

export function ChemicalFormula({ formula }: { formula: string }) {
  // Atomic groups only; parentheses, hydrates and isotopic notation require
  // explicitly authored math instead of guessing chemical structure.
  return <span className="research-chemical-formula" aria-label={formula}>
    {formula.split(/([0-9]+)/).map((part, i) => /^[0-9]+$/.test(part) ? <sub key={i}>{part}</sub> : <Fragment key={i}>{part}</Fragment>)}
  </span>;
}

export function UnitInline({ base, power }: { base: string; power: string }) {
  return <span className="research-unit-inline" aria-label={base + ' to the power ' + power}>
    {base}<sup>{power}</sup>
  </span>;
}

export function renderScientificText(text: string): ReactNode {
  tokenPattern.lastIndex = 0;
  const fragments: ReactNode[] = [];
  let previous = 0;
  for (const match of text.matchAll(tokenPattern)) {
    const index = match.index;
    const raw = match[0];
    if (index > previous) fragments.push(text.slice(previous, index));
    const spec = symbols[raw];
    if (spec) {
      fragments.push(<VariableBadge key={index} symbol={raw} {...spec} />);
    } else if (raw === 'CO2' || raw === 'CO₂') {
      fragments.push(<ChemicalFormula key={index} formula="CO2" />);
    } else {
      const [base, power] = raw.split('^');
      fragments.push(<UnitInline key={index} base={base} power={power} />);
    }
    previous = index + raw.length;
  }
  if (!fragments.length) return text;
  if (previous < text.length) fragments.push(text.slice(previous));
  return fragments;
}

/**
 * Enhance direct text children only. React/KaTeX/citation elements keep their
 * own semantic structure, event handlers, and source-authored contents.
 */
export function ScientificText({ children }: { children: ReactNode }) {
  return <>{Children.map(children, child =>
    typeof child === 'string' ? renderScientificText(child) : child
  )}</>;
}

export function ScientificParagraph({
  children, className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={className}><ScientificText>{children}</ScientificText></p>;
}
