import type React from 'react';

export interface NavSection {
  id: string;
  label: string;
  level: 'chapter' | 'section' | 'subsection';
  children?: NavSection[];
}

export interface Author {
  name: string;
  /** Professional role or self-description, not an institutional affiliation. */
  role?: string;
  email: string;
  orcid?: string;
}

export interface ThesisMetadata {
  title: string;
  subtitle?: string;           // Optional — omit if not needed
  authors: Author[];
  /** Technical research focus, not an institutional department or academic credential. */
  researchArea?: string;
  year: string;
  /** Publication year, independent of the project's historical development span. */
  publicationYear?: string;
  keywords: string[];
  doi?: string;
  version: string;
  status: 'draft' | 'under-review' | 'published';
}

export interface ReferenceEntry {
  id: string;
  authors: string;
  year: string;
  title: string;
  venue: string;
  url?: string;
  citationLabel?: string;
}

export type ActiveSection = string;

// ─── Paper Library Registry ──────────────────────────────────────────────────

// PaperField is an open string type — use any academic discipline label.
// The homepage will auto-assign a colour to any field string you provide.
// Examples: 'Process Engineering' | 'Chemistry' | 'Physics' | 'Mathematics'
// | 'Computer Science' | 'Biology' | 'Other'
export type PaperField = string;

export interface PaperEntry {
  id: string;
  metadata: ThesisMetadata;
  field: PaperField;
  abstract: string;
  /** ISO 8601 date string (YYYY-MM-DD) */
  dateAdded: string;
  /** ISO 8601 date string (YYYY-MM-DD) */
  lastModified: string;
  /** Estimated read time in minutes */
  readTime: number;
  /** Approximate word count */
  wordCount: number;
  /** Set to true once paper content is populated and ready to read */
  available: boolean;
  /** Short tagline (≤ 120 chars) shown on the library card */
  tagline: string;
}

export interface PaperBodyProps {
  isDark: boolean;
}

export interface PaperDefinition {
  entry: PaperEntry;
  navSections: NavSection[];
  sectionIds: string[];
  PaperBody: React.ComponentType<PaperBodyProps>;
}
