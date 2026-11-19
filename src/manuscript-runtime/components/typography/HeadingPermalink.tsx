import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Check, Link2, X } from 'lucide-react';
import './HeadingPermalink.css';

type CopyState = 'idle' | 'copied' | 'error';

/**
 * Copy a deep link to the manuscript's existing, TOC-owned section ID.
 * Never mutates history, changes the document hash, or scrolls the reader.
 *
 * Parent sections own navigation IDs (e.g. #discussion-synthesis), while
 * child heading IDs (e.g. #discussion-heading) are accessibility targets.
 * The closest containing section/div with an ID is therefore canonical.
 */
/**
 * Renders the final word and copy affordance together in one inline run.
 * The browser may wrap a long heading normally, but must not orphan a link
 * glyph on its own line at 320–390px.
 */
export function HeadingTextWithPermalink({ title, fallbackId, targetId }: {
  title: string;
  fallbackId?: string;
  /** Use only for a standalone heading anchor with no TOC-owned parent ID. */
  targetId?: string;
}) {
  const boundary = title.lastIndexOf(' ');
  const prefix = boundary < 0 ? '' : title.slice(0, boundary + 1);
  const ending = boundary < 0 ? title : title.slice(boundary + 1);
  return (
    <>
      {prefix}<span className="research-heading-last-word">
        {ending}<HeadingPermalink title={title} fallbackId={fallbackId} targetId={targetId} />
      </span>
    </>
  );
}

export function HeadingPermalink({
  title,
  fallbackId,
  targetId,
}: {
  title: string;
  fallbackId?: string;
  targetId?: string;
}) {
  const [state, setState] = useState<CopyState>('idle');
  const reset = useRef<number | null>(null);

  useEffect(() => () => {
    if (reset.current !== null) window.clearTimeout(reset.current);
  }, []);

  const copy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const button = event.currentTarget;
    const anchor = button.parentElement?.closest<HTMLElement>(
      'section[id], article[id], div[id]',
    );
    const id = targetId || anchor?.id || fallbackId;
    if (!id || !document.getElementById(id)) {
      setState('error');
      return;
    }

    const url = new URL(window.location.href);
    url.hash = encodeURIComponent(id);
    const link = url.href;
    let successful = false;

    // Call the native clipboard immediately during the click's user activation.
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(link);
        successful = true;
      } catch {
        // LAN, insecure contexts and restrictive embedded browsers can fail.
      }
    }
    if (!successful) {
      const field = document.createElement('textarea');
      field.value = link;
      field.readOnly = true;
      field.setAttribute('aria-hidden', 'true');
      field.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0;';
      document.body.appendChild(field);
      try {
        field.focus({ preventScroll: true });
        field.select();
        successful = document.execCommand('copy');
      } catch {
        // Failure is surfaced through the control; never report false success.
      } finally {
        field.remove();
        button.focus({ preventScroll: true });
      }
    }

    setState(successful ? 'copied' : 'error');
    if (reset.current !== null) window.clearTimeout(reset.current);
    reset.current = window.setTimeout(() => {
      setState('idle');
      reset.current = null;
    }, 1800);
  };

  const label = state === 'copied'
    ? 'Link copied'
    : state === 'error'
      ? 'Unable to copy link'
      : 'Copy link to ' + title;

  return (
    <button
      type="button"
      className="research-heading-permalink"
      data-copy-state={state}
      data-anchor-id={targetId}
      aria-label={label}
      title={label}
      onClick={event => void copy(event)}
    >
      {state === 'copied'
        ? <Check aria-hidden="true" />
        : state === 'error'
          ? <X aria-hidden="true" />
          : <Link2 aria-hidden="true" />}
      <span className="research-heading-permalink__status" role="status" aria-live="polite">
        {state === 'copied' ? 'Link copied' : state === 'error' ? 'Unable to copy link' : ''}
      </span>
    </button>
  );
}
