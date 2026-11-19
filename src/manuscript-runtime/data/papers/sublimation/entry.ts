import type { PaperEntry } from '../../../types/thesis';

export const sublimationEntry: PaperEntry = {
  id: 'low-temp-lyophilization-three-theses',
  field: 'Process Engineering',
  available: true,
  tagline: 'An applied scientific examination of assumptions about vacuum, heat delivery, pressure readings, and drying completion.',
  dateAdded: '2026-03-18',
  lastModified: '2026-10-20',
  readTime: 45,
  wordCount: 8300,
  abstract:
    'Common operating assumptions in single-chamber freeze drying are examined against published transport experiments, thermodynamic relations, manufacturer documentation, and archived controller observations. Deep vacuum, pressure stability, and a regulated shelf temperature do not independently establish efficient sublimation or a completed batch. The proposed late-primary failure couples declining vapor replenishment, pump-down, gas-mediated heat transfer, and product resistance. The analysis distinguishes supported physics from unmeasured machine-specific effects.',
  metadata: {
    title: 'Common Misconceptions in Single-Chamber Freeze Drying: An Applied Thermodynamic Analysis',
    subtitle: 'Vacuum, vapor pressure, heat transfer, controller behavior, and primary-drying endpoints',
    authors: [
      {
        name: 'Jackson Cummings',
        role: 'Independent process engineer',
        email: 'jackson@thedabcorner.site',
      },
    ],
    researchArea: 'Independent applied research in thermodynamics and process controls',
    year: '2026',
    keywords: [
      'single-chamber freeze drying', 'lyophilization', 'pressure-dependent heat transfer',
      'water-vapor partial pressure', 'gas conduction', 'cold-wall deposition',
      'sublimative cooling', 'heater control', 'drying endpoint', 'applied thermodynamics',
    ],
    doi: undefined,
    version: 'v1.2.1',
    status: 'draft',
  },
};
