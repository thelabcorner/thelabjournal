import type { ReactNode } from 'react';
import './ManuscriptLabel.css';

/** Quiet editorial metadata; never the dominant heading in a scientific figure. */
export function ManuscriptLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={['manuscript-label', className].filter(Boolean).join(' ')}>{children}</span>;
}
