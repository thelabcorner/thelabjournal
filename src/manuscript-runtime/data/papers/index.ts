import { lazy } from 'react';
import type { PaperDefinition } from '../../types/thesis.ts';
import { sublimationEntry } from './sublimation/entry';
import { sublimationNavSections, sublimationSectionIds } from './sublimation/nav';
import { gravimetricDecarboxylationEntry } from './gravimetric-decarboxylation/entry';
import { gravimetricDecarboxylationNavSections, gravimetricDecarboxylationSectionIds } from './gravimetric-decarboxylation/nav';

const SublimationPaperBody = lazy(() =>
  import('./sublimation/index').then((module) => ({ default: module.PaperBody }))
);

const GravimetricDecarboxylationBody = lazy(() =>
  import('./gravimetric-decarboxylation/index').then((module) => ({ default: module.PaperBody }))
);

export const PAPER_DEFINITIONS: PaperDefinition[] = [
  {
    entry: gravimetricDecarboxylationEntry,
    navSections: gravimetricDecarboxylationNavSections,
    sectionIds: gravimetricDecarboxylationSectionIds,
    PaperBody: GravimetricDecarboxylationBody,
  },
  {
    entry: sublimationEntry,
    navSections: sublimationNavSections,
    sectionIds: sublimationSectionIds,
    PaperBody: SublimationPaperBody,
  },
];

export const PAPERS = PAPER_DEFINITIONS.map((paper) => paper.entry);

const PAPER_BY_ID = new Map(PAPER_DEFINITIONS.map((paper) => [paper.entry.id, paper]));

export function getPaperById(id: string): PaperDefinition | undefined {
  return PAPER_BY_ID.get(id);
}
