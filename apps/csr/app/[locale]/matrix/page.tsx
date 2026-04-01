'use client'

import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { LanguageToggle } from '@/components/language-toggle'
import { useTranslations, useLocale } from 'next-intl'

import { useCsrFormState } from '@/modules/csr/hooks/useCsrFormState'
import { OemSelectionStep } from '@/modules/csr/components/steps/OemSelectionStep'
import { ProcessMapStep } from '@/modules/csr/components/steps/ProcessMapStep'
import { MatrixPreviewStep } from '@/modules/csr/components/steps/MatrixPreviewStep'
import { ExportStep } from '@/modules/csr/components/steps/ExportStep'
import type { Language } from '@/modules/csr/types'

function isSupportedLocale(locale: string): locale is Language {
  return locale === 'de' || locale === 'en'
}

export default function CsrMatrixPage() {
  const locale = useLocale()
  const t = useTranslations('csrStep')
  const tApp = useTranslations('app')

  const {
    form,
    hydrated,
    stepIndex,
    totalSteps,
    currentStep,
    nextStep,
    prevStep,
    setSelectedOems,
    setProcesses,
    setCompanyName,
    setCompanyLocation,
    setLanguage,
    setMatrixRows,
    resetForm,
  } = useCsrFormState()

  // Sync locale → form language
  useEffect(() => {
    if (!hydrated || !isSupportedLocale(locale) || form.language === locale) return
    setLanguage(locale)
  }, [hydrated, locale, form.language, setLanguage])

  // Scroll to top on step change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep])

  const progressPct = Math.round(((stepIndex + 1) / totalSteps) * 100)

  function renderStep() {
    switch (currentStep) {
      case 'oem-selection':
        return (
          <OemSelectionStep
            selectedOems={form.selectedOems}
            language={form.language}
            onChangeOems={setSelectedOems}
            onChangeLanguage={setLanguage}
            companyName={form.companyName}
            companyLocation={form.companyLocation}
            onChangeCompanyName={setCompanyName}
            onChangeCompanyLocation={setCompanyLocation}
            onNext={nextStep}
          />
        )
      case 'process-map':
        return (
          <ProcessMapStep
            processes={form.processes}
            language={form.language}
            onChange={setProcesses}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 'matrix-preview':
        return (
          <MatrixPreviewStep
            selectedOems={form.selectedOems}
            processes={form.processes}
            matrixRows={form.matrixRows}
            onMatrixGenerated={setMatrixRows}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 'export':
        return <ExportStep form={form} onReset={resetForm} />
      default:
        return null
    }
  }

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4">
          <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600 shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{tApp('restoringDraft')}</span>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <header className="border-b border-neutral-200">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:py-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">
                {tApp('brand')}
              </p>
              <h1 className="truncate text-base font-bold text-neutral-900 sm:text-lg">
                {t('title')}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <LanguageToggle />
              <Badge variant="outline" className="hidden text-xs sm:inline-flex">
                {t(currentStep)}
              </Badge>
            </div>
          </div>
        </header>

        <div className="border-b border-neutral-100 px-4 py-2">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-3">
              <Progress value={progressPct} className="h-1.5 flex-1" />
              <p className="shrink-0 text-xs text-neutral-400">
                {stepIndex + 1}/{totalSteps}
              </p>
            </div>
            <p className="mt-1 text-xs text-neutral-500 sm:hidden">
              {t(currentStep)}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-8">
        {renderStep()}
      </div>
    </main>
  )
}
