import type { ReactNode } from 'react';
import './ScientificFigureCaption.css';

interface ScientificFigureCaptionProps {
  title: ReactNode;
  detail?: ReactNode;
  className?: string;
}

/** A true two-row, selectable scientific-figure caption.
 * Neither sibling depends on incidental whitespace or inline-span margins.
 */
export function ScientificFigureCaption({ title, detail, className = '' }: ScientificFigureCaptionProps) {
  return (
    <figcaption className={['research-figure-caption', className].filter(Boolean).join(' ')}>
      <span className="research-figure-caption__title">{title}</span>
      {detail != null && <span className="research-figure-caption__detail">{detail}</span>}
    </figcaption>
  );
}
