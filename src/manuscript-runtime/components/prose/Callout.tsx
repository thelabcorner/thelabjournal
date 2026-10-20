import type React from 'react';
import { cn } from '../../utils/cn';

type CalloutType = 'info' | 'warning' | 'tip' | 'danger';

interface CalloutProps {
  type: CalloutType;
  title: string;
  body: string;
}

const configs: Record<CalloutType, {
  icon: React.ReactNode;
  containerClass: string;
  titleClass: string;
  iconClass: string;
}> = {
  info: {
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    containerClass: 'bg-[var(--accent-muted)] border-[var(--latex-badge-border)]',
    titleClass: 'text-[var(--accent)]',
    iconClass: 'text-[var(--accent)]',
  },
  warning: {
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    containerClass: 'bg-[var(--status-warning-bg)] border-[var(--status-warning-border)]',
    titleClass: 'text-[var(--status-warning-text)]',
    iconClass: 'text-[var(--status-warning-text)]',
  },
  tip: {
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 8 12 12 14 14" />
      </svg>
    ),
    containerClass: 'bg-[var(--status-success-bg)] border-[var(--status-success-border)]',
    titleClass: 'text-[var(--status-success-text)]',
    iconClass: 'text-[var(--status-success-text)]',
  },
  danger: {
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    containerClass: 'bg-[var(--status-danger-bg)] border-[var(--status-danger-border)]',
    titleClass: 'text-[var(--status-danger-text)]',
    iconClass: 'text-[var(--status-danger-text)]',
  },
};

export function Callout({ type, title, body }: CalloutProps) {
  const cfg = configs[type];
  return (
    <aside
      role="note"
      className={cn(
        'rounded-md border px-3 py-2.5 my-4',
        cfg.containerClass
      )}
    >
      <div className="flex items-start gap-2">
        <span className={cn('mt-0.5 shrink-0', cfg.iconClass)} aria-hidden="true">
          {cfg.icon}
        </span>
        <div>
          <p className={cn('text-xs font-semibold mb-0.5', cfg.titleClass)}>{title}</p>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{body}</p>
        </div>
      </div>
    </aside>
  );
}
