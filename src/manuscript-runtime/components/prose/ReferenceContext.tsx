import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ReferenceEntry } from '../../types/thesis';

interface ReferenceMeta {
  number: number;
  label: string;
}

const ReferenceContext = createContext<ReadonlyMap<string, ReferenceMeta> | null>(null);

export function ReferenceProvider({ references, children }: { references: ReferenceEntry[]; children: ReactNode }) {
  const referenceMap = useMemo(() => {
    return new Map(
      references.map((reference, index) => [
        reference.id,
        {
          number: index + 1,
          label: reference.citationLabel ?? `${reference.authors} (${reference.year})`,
        },
      ])
    );
  }, [references]);

  return <ReferenceContext.Provider value={referenceMap}>{children}</ReferenceContext.Provider>;
}

export function useReferenceMeta(id: string): ReferenceMeta | undefined {
  return useContext(ReferenceContext)?.get(id);
}
