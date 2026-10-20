import { useEffect, useMemo, useState } from 'react';
import { preloadHighlighter } from '@pierre/diffs';
import { File } from '@pierre/diffs/react';

type Theme = 'dark' | 'light';

// Pierre's first hydrate is not replayed when the async Shiki language/theme
// loader finishes. Warm the shared singleton before mounting any File instance.
// This promise is shared by all equation blocks; no per-toggle reinitialization.
let pythonHighlighterReady: Promise<void> | undefined;
function preparePythonHighlighting(): Promise<void> {
  pythonHighlighterReady ??= preloadHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: ['python'],
    preferredHighlighter: 'shiki-js',
  }).catch((error: unknown) => {
    pythonHighlighterReady = undefined; // allow a subsequent open to retry
    throw error;
  });
  return pythonHighlighterReady;
}

/**
 * Pierre's Shiki-powered, paper-themed Python viewer. The plain-text loading
 * surface is always visible until syntax highlighting is actually available.
 */
export default function PierrePythonBlock({ code, title }: { code: string; title: string }) {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark'
      ? 'dark' : 'light'
  );
  const [highlighterState, setHighlighterState] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    let active = true;
    preparePythonHighlighting().then(
      () => { if (active) setHighlighterState('ready'); },
      () => { if (active) setHighlighterState('failed'); }
    );
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const file = useMemo(() => ({
    name: 'calculation.py',
    lang: 'python' as const,
    contents: code,
    cacheKey: `manuscript-python:${title}:${code.length}:${code}`,
  }), [code, title]);

  return (
    <div className="math-block__pierre" aria-label={`Syntax-highlighted Python: ${title}`}>
      {highlighterState !== 'ready'
        ? <pre className="math-block__code-loading" aria-label="Python calculation">
            <code>{code}</code>
          </pre>
        : <File
            file={file}
            disableWorkerPool
            options={{
              disableFileHeader: true,
              disableLineNumbers: false,
              overflow: 'scroll',
              theme: { light: 'github-light', dark: 'github-dark' },
              themeType: theme,
            }}
          />
      }
    </div>
  );
}
