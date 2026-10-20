import type { NavSection } from '../../../types/thesis.ts';

const NAV: NavSection[] = [
  { id: 'title', label: 'Title Page', level: 'chapter' },
  { id: 'abstract', label: 'Abstract', level: 'chapter' },
  {
    id: 'introduction',
    label: '1. Introduction',
    level: 'chapter',
    children: [
      { id: 'introduction-motivation', label: '1.1 Operating Conditions', level: 'section' },
      { id: 'introduction-pressure-notation', label: '1.2 Pressure and Measurement Notation', level: 'section' },
      { id: 'introduction-thermodynamic', label: '1.3 Vapor-Pressure Potential', level: 'section' },
    ],
  },
  {
    id: 'literature',
    label: '2. Physical Evidence',
    level: 'chapter',
    children: [
      { id: 'literature-pikal', label: '2.1 Gas Conduction', level: 'section' },
      { id: 'literature-nail', label: '2.2 Pressure Experiments', level: 'section' },
      { id: 'literature-ganguly', label: '2.3 Experimental Geometry', level: 'section' },
      { id: 'literature-patents', label: '2.4 Heater Control', level: 'section' },
      { id: 'literature-instrumentation', label: '2.5 Vacuum Gauge', level: 'section' },
      { id: 'literature-tray-material', label: '2.6 Tray Contact', level: 'section' },
    ],
  },
  {
    id: 'methodology',
    label: '3. Physical Relations',
    level: 'chapter',
    children: [
      { id: 'methodology-coupled-model', label: '3.1 Energy and Water', level: 'section' },
      { id: 'methodology-optimal-pressure', label: '3.2 Conditional Optima', level: 'section' },
      { id: 'methodology-radiative-gap', label: '3.3 Thermal Contact and Gaps', level: 'section' },
      { id: 'methodology-vapor-removal', label: '3.4 Cold-Wall Capture', level: 'section' },
      { id: 'methodology-assumptions', label: '3.5 Model Limits', level: 'section' },
    ],
  },
  {
    id: 'results',
    label: '4. Field Interpretation',
    level: 'chapter',
    children: [
      { id: 'results-thesis1', label: '4.1 Heater Control', level: 'section' },
      { id: 'results-thesis2', label: '4.2 Deeper Vacuum', level: 'section' },
      { id: 'results-thesis3', label: '4.3 Gas Composition', level: 'section' },
      { id: 'results-coupled-model', label: '4.4 Cold-Wall Constraint', level: 'section' },
      { id: 'results-hardware', label: '4.5 Tray Contact', level: 'section' },
      { id: 'results-tables', label: '4.6 Model Illustrations', level: 'section' },
      { id: 'results-estimator', label: '4.7 Sensitivity', level: 'section' },
    ],
  },
  {
    id: 'discussion',
    label: '5. Interpreting Measurements',
    level: 'chapter',
    children: [
      { id: 'discussion-synthesis', label: '5.1 Pressure and Heat', level: 'section' },
      { id: 'discussion-spatial', label: '5.2 Spatial Endpoint', level: 'section' },
      { id: 'discussion-experiments', label: '5.3 Field Measurements', level: 'section' },
    ],
  },
  { id: 'conclusion', label: '6. Conclusions', level: 'chapter' },
  { id: 'references', label: 'References', level: 'chapter' },
];

function flattenSectionIds(sections: NavSection[]): string[] {
  const ids: string[] = [];
  for (const section of sections) {
    ids.push(section.id);
    if (section.children?.length) {
      ids.push(...flattenSectionIds(section.children));
    }
  }
  return ids;
}

export const sublimationNavSections = NAV;
export const sublimationSectionIds = flattenSectionIds(NAV);
