'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  CsrFormState,
  CsrFormStep,
  OemId,
  ProcessEntry,
  MatrixRow,
  Language,
} from '../types'
import { EMPTY_CSR_FORM, CSR_STEP_ORDER } from '../types'
import { CSR_STORAGE_KEY, CSR_STEP_KEY } from '../lib/constants'

/* ------------------------------------------------------------------ */
/*  Obfuscation helpers (matches 8D pattern)                          */
/* ------------------------------------------------------------------ */

function obfuscate(data: unknown): string {
  try {
    return btoa(encodeURIComponent(JSON.stringify(data)))
  } catch {
    return ''
  }
}

function deobfuscate(encoded: string): unknown {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)))
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/*  Hook                                                              */
/* ------------------------------------------------------------------ */

export function useCsrFormState() {
  const [form, setForm] = useState<CsrFormState>(EMPTY_CSR_FORM)
  const [hydrated, setHydrated] = useState(false)

  /* ---------- Hydrate from localStorage on mount ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CSR_STORAGE_KEY)
      const stepRaw = localStorage.getItem(CSR_STEP_KEY)

      if (raw) {
        const saved = deobfuscate(raw) as Partial<CsrFormState> | null
        if (saved && typeof saved === 'object') {
          setForm({ ...EMPTY_CSR_FORM, ...saved })
        }
      }

      if (stepRaw) {
        const step = stepRaw as CsrFormStep
        if (CSR_STEP_ORDER.includes(step)) {
          setForm((prev) => ({ ...prev, currentStep: step }))
        }
      }
    } catch {
      // Ignore corrupt data
    }
    setHydrated(true)
  }, [])

  /* ---------- Persist to localStorage on change ---------- */
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(CSR_STORAGE_KEY, obfuscate(form))
      localStorage.setItem(CSR_STEP_KEY, form.currentStep)
    } catch {
      // Quota exceeded – silently ignore
    }
  }, [form, hydrated])

  /* ---------- Step navigation ---------- */
  const stepIndex = CSR_STEP_ORDER.indexOf(form.currentStep)
  const totalSteps = CSR_STEP_ORDER.length

  const nextStep = useCallback(() => {
    setForm((prev) => {
      const idx = CSR_STEP_ORDER.indexOf(prev.currentStep)
      if (idx < CSR_STEP_ORDER.length - 1) {
        return { ...prev, currentStep: CSR_STEP_ORDER[idx + 1] }
      }
      return prev
    })
  }, [])

  const prevStep = useCallback(() => {
    setForm((prev) => {
      const idx = CSR_STEP_ORDER.indexOf(prev.currentStep)
      if (idx > 0) {
        return { ...prev, currentStep: CSR_STEP_ORDER[idx - 1] }
      }
      return prev
    })
  }, [])

  const goToStep = useCallback((step: CsrFormStep) => {
    setForm((prev) => ({ ...prev, currentStep: step }))
  }, [])

  /* ---------- Field updaters ---------- */
  const setSelectedOems = useCallback((oems: OemId[]) => {
    setForm((prev) => ({ ...prev, selectedOems: oems }))
  }, [])

  const setProcesses = useCallback((processes: ProcessEntry[]) => {
    setForm((prev) => ({ ...prev, processes }))
  }, [])

  const setCompanyName = useCallback((companyName: string) => {
    setForm((prev) => ({ ...prev, companyName }))
  }, [])

  const setCompanyLocation = useCallback((companyLocation: string) => {
    setForm((prev) => ({ ...prev, companyLocation }))
  }, [])

  const setLanguage = useCallback((language: Language) => {
    setForm((prev) => ({ ...prev, language }))
  }, [])

  const setMatrixRows = useCallback((matrixRows: MatrixRow[]) => {
    setForm((prev) => ({ ...prev, matrixRows }))
  }, [])

  const resetForm = useCallback(() => {
    setForm(EMPTY_CSR_FORM)
    try {
      localStorage.removeItem(CSR_STORAGE_KEY)
      localStorage.removeItem(CSR_STEP_KEY)
    } catch {
      // ignore
    }
  }, [])

  return {
    form,
    hydrated,
    stepIndex,
    totalSteps,
    currentStep: form.currentStep,
    nextStep,
    prevStep,
    goToStep,
    setSelectedOems,
    setProcesses,
    setCompanyName,
    setCompanyLocation,
    setLanguage,
    setMatrixRows,
    resetForm,
  }
}
