'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { ReportData, FormStep, Language } from '../types/report'
import { EMPTY_REPORT } from '../types/report'
import { STORAGE_KEY, STEP_KEY } from '../lib/constants'

const STEP_ORDER: FormStep[] = [
  'step1',   // Metadata + D1 Team
  'step2',   // D2 Problem
  'step3',   // D3 Containment
  'step4',   // D4/D5 (AI)
  'step5',   // D6–D8
  'preview',
  'export',
]

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

export function obfuscate(obj: unknown): string {
  try {
    return btoa(encodeURIComponent(JSON.stringify(obj)))
  } catch {
    return ''
  }
}

export function deobfuscate(str: string): unknown {
  if (!str) return null
  try {
    // Try to decode obfuscated base64 string
    return JSON.parse(decodeURIComponent(atob(str)))
  } catch {
    try {
      // Fallback for existing un-obfuscated plain JSON
      return JSON.parse(str)
    } catch {
      return null
    }
  }
}

function normalizeSavedReport(value: unknown): ReportData {
  const saved = asRecord(value)

  const metadata = asRecord(saved.metadata)
  const d1 = asRecord(saved.d1)
  const d2 = asRecord(saved.d2)
  const d2IsAnalysis = asRecord(d2.isAnalysis)
  const d2IsNotAnalysis = asRecord(d2.isNotAnalysis)
  const d3 = asRecord(saved.d3)
  const d4 = asRecord(saved.d4)
  const d5 = asRecord(saved.d5)
  const d6 = asRecord(saved.d6)
  const d7 = asRecord(saved.d7)
  const d8 = asRecord(saved.d8)

  const language = saved.language === 'en' || saved.language === 'de'
    ? saved.language
    : EMPTY_REPORT.language

  return {
    ...EMPTY_REPORT,
    language,
    metadata: { ...EMPTY_REPORT.metadata, ...metadata },
    d1: { ...EMPTY_REPORT.d1, ...d1 },
    d2: {
      ...EMPTY_REPORT.d2,
      ...d2,
      isAnalysis: {
        ...EMPTY_REPORT.d2.isAnalysis,
        ...d2IsAnalysis,
        what: { ...EMPTY_REPORT.d2.isAnalysis.what, ...asRecord(d2IsAnalysis.what) },
        where: { ...EMPTY_REPORT.d2.isAnalysis.where, ...asRecord(d2IsAnalysis.where) },
        when: { ...EMPTY_REPORT.d2.isAnalysis.when, ...asRecord(d2IsAnalysis.when) },
        howMany: { ...EMPTY_REPORT.d2.isAnalysis.howMany, ...asRecord(d2IsAnalysis.howMany) },
      },
      isNotAnalysis: {
        ...EMPTY_REPORT.d2.isNotAnalysis,
        ...d2IsNotAnalysis,
        what: { ...EMPTY_REPORT.d2.isNotAnalysis.what, ...asRecord(d2IsNotAnalysis.what) },
        where: { ...EMPTY_REPORT.d2.isNotAnalysis.where, ...asRecord(d2IsNotAnalysis.where) },
        when: { ...EMPTY_REPORT.d2.isNotAnalysis.when, ...asRecord(d2IsNotAnalysis.when) },
        howMany: { ...EMPTY_REPORT.d2.isNotAnalysis.howMany, ...asRecord(d2IsNotAnalysis.howMany) },
      },
    },
    d3: {
      ...EMPTY_REPORT.d3,
      ...d3,
      actions: Array.isArray(d3.actions) ? (d3.actions as ReportData['d3']['actions']) : EMPTY_REPORT.d3.actions,
    },
    d4: {
      ...EMPTY_REPORT.d4,
      ...d4,
      tua: { ...EMPTY_REPORT.d4.tua, ...asRecord(d4.tua) },
      tun: { ...EMPTY_REPORT.d4.tun, ...asRecord(d4.tun) },
      sua: { ...EMPTY_REPORT.d4.sua, ...asRecord(d4.sua) },
      sun: { ...EMPTY_REPORT.d4.sun, ...asRecord(d4.sun) },
    },
    d5: {
      ...EMPTY_REPORT.d5,
      ...d5,
      actions: Array.isArray(d5.actions) ? (d5.actions as ReportData['d5']['actions']) : EMPTY_REPORT.d5.actions,
    },
    d6: { ...EMPTY_REPORT.d6, ...d6 },
    d7: {
      ...EMPTY_REPORT.d7,
      ...d7,
      fmea: { ...EMPTY_REPORT.d7.fmea, ...asRecord(d7.fmea) },
      controlPlan: { ...EMPTY_REPORT.d7.controlPlan, ...asRecord(d7.controlPlan) },
      workInstructions: { ...EMPTY_REPORT.d7.workInstructions, ...asRecord(d7.workInstructions) },
      testInspectionPlan: { ...EMPTY_REPORT.d7.testInspectionPlan, ...asRecord(d7.testInspectionPlan) },
      otherDocuments: { ...EMPTY_REPORT.d7.otherDocuments, ...asRecord(d7.otherDocuments) },
    },
    d8: { ...EMPTY_REPORT.d8, ...d8 },
  }
}

export function useFormState() {
  // Start with deterministic defaults (same on server AND client) to avoid
  // hydration mismatches.  localStorage is read inside a one-time useEffect.
  const [report, setReport] = useState<ReportData>(EMPTY_REPORT)
  const [currentStep, setCurrentStep] = useState<FormStep>('step1')
  const hydrated = useRef(false)

  // Hydrate from localStorage AFTER the first client render so the server-
  // rendered HTML always matches the initial client HTML.
  useEffect(() => {
    if (hydrated.current) return
    hydrated.current = true

    try {
      const savedReport = localStorage.getItem(STORAGE_KEY)
      if (savedReport) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        const parsed = deobfuscate(savedReport)
        if (parsed) setReport(normalizeSavedReport(parsed))
      }
    } catch { /* localStorage unavailable */ }

    try {
      const savedStep = localStorage.getItem(STEP_KEY)
      if (savedStep) {
        let stepStr = ''
        try {
          stepStr = atob(savedStep)
        } catch {
          stepStr = savedStep
        }
        if (STEP_ORDER.includes(stepStr as FormStep)) {
          setCurrentStep(stepStr as FormStep)
        }
      }
    } catch { /* localStorage unavailable */ }
  }, [])

  const persist = useCallback((data: ReportData) => {
    try {
      localStorage.setItem(STORAGE_KEY, obfuscate(data))
    } catch {
      // localStorage might be unavailable
    }
  }, [])

  const updateReport = useCallback(
    <K extends keyof ReportData>(key: K, value: ReportData[K]) => {
      setReport((prev) => {
        const next = { ...prev, [key]: value }
        persist(next)
        return next
      })
    },
    [persist],
  )

  /** Atomically apply multiple field updates in a single setState call. */
  const mergeReport = useCallback(
    (partial: Partial<ReportData>) => {
      setReport((prev) => {
        const next = { ...prev, ...partial }
        persist(next)
        return next
      })
    },
    [persist],
  )

  const setLanguage = useCallback(
    (lang: Language) => updateReport('language', lang),
    [updateReport],
  )

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const idx = STEP_ORDER.indexOf(prev)
      const next = idx < STEP_ORDER.length - 1 ? STEP_ORDER[idx + 1] : prev
      try { localStorage.setItem(STEP_KEY, btoa(next)) } catch { /* ignore */ }
      return next
    })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => {
      const idx = STEP_ORDER.indexOf(prev)
      const next = idx > 0 ? STEP_ORDER[idx - 1] : prev
      try { localStorage.setItem(STEP_KEY, btoa(next)) } catch { /* ignore */ }
      return next
    })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const goToStep = useCallback((step: FormStep) => {
    try { localStorage.setItem(STEP_KEY, btoa(step)) } catch { /* ignore */ }
    setCurrentStep(step)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const resetReport = useCallback(() => {
    setReport(EMPTY_REPORT)
    setCurrentStep('step1')
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STEP_KEY)
    } catch {
      // ignore
    }
  }, [])

  const stepIndex = STEP_ORDER.indexOf(currentStep)
  const totalSteps = STEP_ORDER.length

  return {
    report,
    currentStep,
    stepIndex,
    totalSteps,
    updateReport,
    mergeReport,
    setLanguage,
    nextStep,
    prevStep,
    goToStep,
    resetReport,
  }
}
