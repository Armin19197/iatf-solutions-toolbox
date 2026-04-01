/* ------------------------------------------------------------------ */
/*  CSR-to-Process Mapping Logic                                      */
/*                                                                    */
/*  Maps IATF chapter ranges to standard process IDs.                 */
/*  This is the "x logic" from the briefing: each CSR requirement     */
/*  can affect multiple processes.                                    */
/* ------------------------------------------------------------------ */

import type { CsrRequirement, ProcessEntry, MatrixRow } from '../types'

/**
 * Default mapping rules: IATF chapter prefix → process IDs that are affected.
 * This acts as an initial mapping. Users can refine it in the UI.
 */
const CHAPTER_TO_PROCESS: Record<string, string[]> = {
  // Chapter 4 – Context / Scope
  '4.3': ['P-SUP-01', 'P-SUP-08'],
  '4.4.1.1': ['P-SUP-01', 'P-COP-05'],
  '4.4.1.2': ['P-SUP-01', 'P-COP-02', 'P-COP-05'],

  // Chapter 5 – Leadership
  '5.1': ['P-SUP-08'],
  '5.3': ['P-SUP-01', 'P-SUP-08'],

  // Chapter 6 – Planning
  '6.1': ['P-SUP-01', 'P-SUP-07', 'P-SUP-08'],
  '6.2': ['P-SUP-01', 'P-SUP-08'],

  // Chapter 7 – Support
  '7.1.3': ['P-SUP-04', 'P-SUP-09'],
  '7.1.5': ['P-SUP-05', 'P-SUP-04'],
  '7.2': ['P-SUP-03'],
  '7.5': ['P-SUP-02'],

  // Chapter 8 – Operation
  '8.1': ['P-COP-04', 'P-COP-05'],
  '8.2': ['P-COP-01', 'P-COP-02'],
  '8.3': ['P-COP-02'],
  '8.4': ['P-COP-03'],
  '8.5.1': ['P-COP-05', 'P-SUP-01'],
  '8.5.2': ['P-COP-05', 'P-COP-06'],
  '8.5.4': ['P-COP-06'],
  '8.5.6': ['P-COP-02', 'P-COP-05', 'P-SUP-01'],
  '8.6': ['P-SUP-05', 'P-COP-05'],
  '8.7': ['P-SUP-01', 'P-COP-05', 'P-SUP-07'],

  // Chapter 9 – Performance Evaluation
  '9.1.1': ['P-SUP-05', 'P-COP-05'],
  '9.1.2': ['P-COP-01', 'P-COP-07'],
  '9.2': ['P-SUP-06'],
  '9.3': ['P-SUP-08'],

  // Chapter 10 – Improvement
  '10.2': ['P-SUP-07', 'P-SUP-01'],
  '10.3': ['P-SUP-01', 'P-SUP-08'],
}

/**
 * Determine which processes are affected by a CSR requirement
 * based on its IATF chapter number.
 *
 * Uses longest-prefix matching: "8.5.1.1" matches "8.5.1" before "8.5".
 */
export function mapCsrToProcesses(
  csrChapter: string,
  availableProcessIds: string[],
): string[] {
  const availableSet = new Set(availableProcessIds)

  // Find best matching prefix (longest match wins)
  let bestMatch = ''
  for (const prefix of Object.keys(CHAPTER_TO_PROCESS)) {
    if (csrChapter.startsWith(prefix) && prefix.length > bestMatch.length) {
      bestMatch = prefix
    }
  }

  if (!bestMatch) return []

  // Filter to only include processes the user actually has
  return (CHAPTER_TO_PROCESS[bestMatch] ?? []).filter((pid) =>
    availableSet.has(pid),
  )
}

/**
 * Build the full CSR matrix by merging requirements with process mapping.
 */
export function buildMatrix(
  csrRows: CsrRequirement[],
  processes: ProcessEntry[],
): MatrixRow[] {
  const processIds = processes.map((p) => p.id)

  return csrRows.map((csr) => ({
    csrId: csr.id,
    iatfChapter: csr.iatfChapter,
    title: csr.title,
    oem: csr.oem ?? 'IATF 16949',
    text: csr.text,
    version: csr.version,
    changeStatus: csr.changeStatus,
    risk: csr.risk,
    affectedProcessIds: mapCsrToProcesses(csr.iatfChapter, processIds),
  }))
}
