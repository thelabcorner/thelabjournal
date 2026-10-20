import { InlineMath as KaTeXInline, MathBlock as KaTeXBlock, LatexEnv } from '../../../components/prose/MathBlock';
import { lyophilizationEquationPython } from './equationPython';

/** Present isolated mathematical variables as compact editorial symbols.
 * Expressions, inequalities, units and full equations remain unboxed.
 */
const isolatedVariable = /^(?:\\[a-zA-Z]+|[a-zA-Z])(?:_(?:\{[^{}]+\}|[a-zA-Z0-9]+)|\^(?:\{[^{}]+\}|[a-zA-Z0-9*]+))?$/;
export function InlineMath({ math, className = '' }: { math: string; className?: string }) {
  return <KaTeXInline math={math} className={`${className} ${isolatedVariable.test(math.trim()) ? 'lyo-variable-math' : ''}`.trim()} />;
}

export function MathBlock({ math, label, caption, className = '' }: {
  math: string;
  label?: string;
  caption?: string;
  className?: string;
}) {
  return <KaTeXBlock math={math} label={label} caption={caption} className={className} python={lyophilizationEquationPython(label)} />;
}

export { LatexEnv };
