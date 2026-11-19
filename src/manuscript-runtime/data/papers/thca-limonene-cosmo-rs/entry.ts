import type { PaperEntry } from '../../../types/thesis'

/** Active research-edition reader integrates the six-lane Oct. 21–22 campaign.
 * The older TeX/PDF is deliberately retained as an archived v0.1 draft. */
export const thcaLimoneneEntry: PaperEntry = {
  id: 'thca-limonene-cosmo-rs',
  field: 'Computational Chemistry',
  available: true,
  indexable: false,
  tagline: 'Phase-specific cannabinoid–solvent thermodynamics, independently checked THCA-A/limonene calculations, and unresolved experimental gates.',
  dateAdded: '2026-10-21',
  lastModified: '2026-11-18',
  readTime: 28,
  wordCount: 4300,
  abstract: 'A phase-specific computational framework is developed for crystalline cannabinoids and phytoterpenes in botanical liquids and liquefied hydrocarbon solvents. The THCA-A/(R)-(+)-limonene case recovers 462 composition-dependent openCOSMO-RS activity evaluations and 41 independently verified conditional solid–liquid equilibrium roots. Under a patent-derived, unverified solid-reference scenario, the computed 298.15 K composition is x = 0.110695, equivalent to 275.42 mg per milliliter of initially charged limonene—not final mixture volume. Independent liquid-mixing stability tests find positive local curvature over the sampled composition and temperature grid, distinguishing a miscible modeled liquid pair from saturation against a named crystalline phase. A 112-case research matrix, hydrocarbon phase-state restrictions and a published CBD/n-pentane benchmark define the next computational and experimental questions. Numerical agreement does not resolve polymorph identity, reversible fusion thermodynamics, neglected association, solvent enantiomeric composition or measured equilibrium solubility.',
  metadata: {
    title: 'Phase-Specific Equilibria of Cannabinoids and Phytoterpenes in Botanical and Hydrocarbon Solvents',
    subtitle: 'A reconstructed THCA-A/limonene case study, thermodynamic sensitivity analysis, and computational validation framework',
    authors: [{ name: 'Jackson Cummings', role: 'Independent process engineer', email: 'jackson@thedabcorner.site' }],
    researchArea: 'Computational thermodynamics, crystallization and extraction solvents',
    year: '2026', publicationYear: '2026',
    keywords: ['THCA-A', 'limonene', 'cannabinoids', 'phytoterpenes', 'openCOSMO-RS',
      'solid–liquid equilibrium', 'liquid–liquid stability', 'vapor–liquid equilibrium',
      'fusion thermodynamics', 'crystallography', 'stereochemistry', 'validation'],
    version: 'v0.2', status: 'draft'
  }
}