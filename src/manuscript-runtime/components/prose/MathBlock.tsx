import { useEffect, useRef, useMemo, useState, useId, lazy, Suspense } from 'react';

const PierrePythonBlock = lazy(() => import('./PierrePythonBlock'));
import { Code2, Sigma, Copy, Check } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// ---------------------------------------------------------------------------
// Shared KaTeX render helper
// ---------------------------------------------------------------------------
function renderLatex(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      errorColor: 'var(--danger)',
      trust: false,
      strict: 'warn',
      macros: {
        '\\R': '\\mathbb{R}',
        '\\N': '\\mathbb{N}',
        '\\E': '\\mathbb{E}',
        '\\P': '\\mathbb{P}',
        '\\norm': '\\left\\lVert #1 \\right\\rVert',
        '\\abs': '\\left\\lvert #1 \\right\\rvert',
        '\\inner': '\\left\\langle #1,\\, #2 \\right\\rangle',
        '\\argmin': '\\operatorname*{arg\\,min}',
        '\\argmax': '\\operatorname*{arg\\,max}',
        '\\Tr': '\\operatorname{Tr}',
        '\\rank': '\\operatorname{rank}',
        '\\diag': '\\operatorname{diag}',
        '\\sgn':  '\\operatorname{sgn}',
        '\\kstar': 'k^*(\\Sigma)',
      },
    });
  } catch {
    return `<span style="color:var(--danger);font-family:monospace;font-size:0.75rem">${latex}</span>`;
  }
}

// ---------------------------------------------------------------------------
// InlineMath — renders LaTeX inline within prose
// ---------------------------------------------------------------------------
interface InlineMathProps {
  math: string;
  className?: string;
}

export function InlineMath({ math, className = '' }: InlineMathProps) {
  const html = useMemo(() => renderLatex(math, false), [math]);
  return (
    <span
      className={`katex-inline ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
      aria-label={math}
    />
  );
}

// ---------------------------------------------------------------------------
// MathBlock — full display-mode equation block with optional label + caption
// ---------------------------------------------------------------------------
interface MathBlockProps {
  /** Raw LaTeX string (without surrounding $$ or \[ \]) */
  math: string;
  /** Equation number label, e.g. "(4.1)" */
  label?: string;
  /** Figure caption shown below the block */
  caption?: string;
  /** Additional wrapper class */
  className?: string;
  /** Hand-authored executable representation of this equation (not its LaTeX source). */
  python?: { readonly title: string; readonly code: string };
}

export function MathBlock({ math, label, caption, className = '', python }: MathBlockProps) {
  const html = useMemo(() => renderLatex(math, true), [math]);
  const [showPython, setShowPython] = useState(false);
  const [copied, setCopied] = useState(false);
  const contentId = useId();

  async function copyPython() {
    if (!python || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(python.code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <figure
      className={`math-block my-5 ${python ? 'math-block--python-enabled' : ''} ${className}`}
      data-equation-view={showPython && python ? 'python' : 'math'}
      aria-label={caption ?? `Equation ${label ?? ''}: ${math}`}
    >
      <div className={`math-block__shell bg-[var(--figure-bg)] border border-[var(--border)] rounded-md relative ${python ? '' : 'px-5 py-4 overflow-x-auto'}`}>
        {python && (
          <div className="math-block__toolbar">
            <span className="math-block__eyebrow">{label ? `Equation ${label}` : 'Calculation'}</span>
            <button
              type="button"
              className="math-block__view-toggle"
              aria-controls={contentId}
              aria-expanded={showPython}
              aria-label={showPython ? 'Show mathematical equation' : 'Show equivalent Python calculation'}
              onClick={() => { setShowPython(view => !view); setCopied(false); }}
            >
              {showPython ? <Sigma size={13} aria-hidden="true" /> : <Code2 size={13} aria-hidden="true" />}
              <span>{showPython ? 'Equation' : 'Python'}</span>
            </button>
          </div>
        )}
        <div id={contentId} className="math-block__content">
          <div className="math-block__formula flex items-center justify-between gap-6">
            <div
              className="flex-1 flex justify-center katex-display-wrap"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            {label && (
              <span
                className="shrink-0 text-xs font-mono text-[var(--text-muted)] self-center select-none"
                aria-label={`Equation number ${label}`}
              >
                {label}
              </span>
            )}
          </div>
          {python && (
            <div className="math-block__code">
              <div className="math-block__code-heading">
                <span><Code2 size={13} aria-hidden="true" /> Python · SymPy <span className="math-block__code-context">— {python.title}</span></span>
                <button
                  type="button"
                  className="math-block__copy"
                  aria-label={copied ? 'Python copied to clipboard' : 'Copy Python snippet'}
                  title={copied ? 'Copied' : 'Copy Python'}
                  onClick={copyPython}
                >
                  {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              {showPython && (
                <Suspense fallback={<pre className="math-block__code-loading"><code>{python.code}</code></pre>}>
                  <PierrePythonBlock code={python.code} title={python.title} />
                </Suspense>
              )}
            </div>
          )}
        </div>
      </div>
      {caption && (
        <figcaption className="mt-2 text-xs text-[var(--text-muted)] text-center leading-relaxed px-4">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ---------------------------------------------------------------------------
// AlignedMath — multi-line aligned equations (align* environment wrapper)
// ---------------------------------------------------------------------------
interface AlignedMathProps {
  lines: string[];   // each line is one row of the align* block
  label?: string;
  caption?: string;
}

export function AlignedMath({ lines, label, caption }: AlignedMathProps) {
  const joined = lines.join(' \\\\ ');
  const latex = `\\begin{aligned} ${joined} \\end{aligned}`;
  return (
    <MathBlock math={latex} label={label} caption={caption} />
  );
}

// ---------------------------------------------------------------------------
// LatexProof — collapsible proof block with QED mark
// ---------------------------------------------------------------------------
interface LatexProofProps {
  children: React.ReactNode;
  title?: string;
}

export function LatexProof({ children, title = 'Proof' }: LatexProofProps) {
  return (
    <details className="group my-4">
      <summary
        className={[
          'flex min-h-8 items-center gap-2 cursor-pointer select-none list-none -mx-1 px-1 py-1.5',
          'text-xs font-medium text-[var(--text-secondary)]',
          'hover:text-[var(--text)] transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
          'focus-visible:ring-offset-2 rounded-sm',
        ].join(' ')}
        aria-label={`Toggle ${title}`}
      >
        {/* chevron */}
        <svg
          className="h-3 w-3 text-[var(--text-muted)] transition-transform duration-200 group-open:rotate-90"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="italic">{title}.</span>
      </summary>
      <div className="mt-2 pl-4 border-l border-[var(--border)] space-y-2">
        <div className="text-sm text-[var(--text)] leading-relaxed">{children}</div>
        {/* QED tombstone */}
        <div className="flex justify-end">
          <span
            className="h-3 w-3 border border-[var(--text-secondary)] inline-block"
            aria-label="QED"
            title="Quod erat demonstrandum"
          />
        </div>
      </div>
    </details>
  );
}

// ---------------------------------------------------------------------------
// LatexDefinition — environment block (theorem / lemma / corollary / definition / remark)
// ---------------------------------------------------------------------------
type EnvType = 'theorem' | 'lemma' | 'corollary' | 'proposition' | 'definition' | 'remark' | 'assumption';

const ENV_LABELS: Record<EnvType, string> = {
  theorem:    'Theorem',
  lemma:      'Lemma',
  corollary:  'Corollary',
  proposition:'Proposition',
  definition: 'Definition',
  remark:     'Remark',
  assumption: 'Assumption',
};

// accent-left-border colour per env type
const ENV_BORDER: Record<EnvType, string> = {
  theorem:    'border-[var(--accent)]',
  lemma:      'border-[var(--accent)]',
  corollary:  'border-[var(--success)]',
  proposition:'border-[var(--accent)]',
  definition: 'border-[var(--warning)]',
  remark:     'border-[var(--text-muted)]',
  assumption: 'border-[var(--warning)]',
};

const ENV_LABEL_COLOR: Record<EnvType, string> = {
  theorem:    'text-[var(--accent)]',
  lemma:      'text-[var(--accent)]',
  corollary:  'text-[var(--success)]',
  proposition:'text-[var(--accent)]',
  definition: 'text-[var(--warning)]',
  remark:     'text-[var(--text-muted)]',
  assumption: 'text-[var(--warning)]',
};

interface LatexEnvProps {
  type: EnvType;
  number?: string;
  title?: string;
  children: React.ReactNode;
}

export function LatexEnv({ type, number, title, children }: LatexEnvProps) {
  const label = ENV_LABELS[type];
  const borderCls = ENV_BORDER[type];
  const labelCls = ENV_LABEL_COLOR[type];

  return (
    <div
      className={`border-l-2 ${borderCls} bg-[var(--figure-bg)] rounded-r-md pl-4 pr-3 py-3 my-4`}
      role="note"
      aria-label={`${label}${number ? ` ${number}` : ''}${title ? `: ${title}` : ''}`}
    >
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`text-xs font-mono font-semibold ${labelCls}`}>
          {label}{number ? ` ${number}` : ''}
        </span>
        {title && (
          <>
            <span className="text-xs text-[var(--text-muted)]" aria-hidden="true">·</span>
            <span className="text-xs font-medium text-[var(--text-secondary)] italic">{title}</span>
          </>
        )}
      </div>
      <div className="text-sm text-[var(--text)] leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// useKatexElement — imperative render into a ref (for dynamic content)
// ---------------------------------------------------------------------------
export function useKatexElement(latex: string, displayMode = false) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(latex, ref.current, {
        displayMode,
        throwOnError: false,
        errorColor: 'var(--danger)',
      });
    } catch {
      if (ref.current) ref.current.textContent = latex;
    }
  }, [latex, displayMode]);
  return ref;
}
