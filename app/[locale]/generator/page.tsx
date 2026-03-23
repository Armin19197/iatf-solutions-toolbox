'use client'

import { useEffect } from 'react'
import { useAutosave } from '@/modules/eightd/hooks/useAutosave'
import { Step1Form } from '@/modules/eightd/components/steps/Step1Form'
import { Step2Form } from '@/modules/eightd/components/steps/Step2Form'
import { Step3Form } from '@/modules/eightd/components/steps/Step3Form'
import { Step4Form } from '@/modules/eightd/components/steps/Step4Form'
import { Step5Form } from '@/modules/eightd/components/steps/Step5Form'
import { PreviewScreen } from '@/modules/eightd/components/steps/PreviewScreen'
import { ExportScreen } from '@/modules/eightd/components/steps/ExportScreen'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { LanguageToggle } from '@/components/language-toggle'
import { useFormState } from '@/modules/eightd/hooks/useFormState'
import { useTranslations, useLocale } from 'next-intl'

export default function GeneratorPage() {
  const locale = useLocale()
  const {
    report,
    currentStep,
    stepIndex,
    totalSteps,
    updateReport,
    mergeReport,
    setLanguage,
    nextStep,
    prevStep,
    resetReport,
  } = useFormState()
  useAutosave(report)
  const t = useTranslations('step')
  const tApp = useTranslations('app')

  // Sync report.language with the active next-intl locale so AI prompts
  // and exports always use the language the user has selected in the UI.
  useEffect(() => {
    if (locale === 'de' || locale === 'en') {
      setLanguage(locale)
    }
  }, [locale, setLanguage])

  // Scroll to the top of the page whenever the user navigates to a new step
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep])

  const progressPct = Math.round(((stepIndex + 1) / totalSteps) * 100)

  function renderStep() {
    switch (currentStep) {
      case 'step1':
        return (
          <Step1Form
            metadata={report.metadata}
            d1={report.d1}
            onChangeMetadata={(m) => updateReport('metadata', m)}
            onChangeD1={(d) => updateReport('d1', d)}
            onNext={nextStep}
          />
        )
      case 'step2':
        return (
          <Step2Form
            data={report.d2}
            d1={report.d1}
            metadata={report.metadata}
            onChange={(d) => updateReport('d2', d)}
            onGenerate={(d3, d4, d5) => mergeReport({ d3, d4, d5 })}
            onNext={nextStep}
            onBack={prevStep}
            language={report.language}
          />
        )
      case 'step3':
        return (
          <Step3Form
            data={report.d3}
            complaintDate={report.metadata.complaintDate}
            onChange={(d) => updateReport('d3', d)}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 'step4':
        return (
          <Step4Form
            d4={report.d4}
            d5={report.d5}
            d3={report.d3}
            d2={report.d2}
            d1={report.d1}
            metadata={report.metadata}
            onChangeD4={(d) => updateReport('d4', d)}
            onChangeD5={(d) => updateReport('d5', d)}
            onNext={nextStep}
            onBack={prevStep}
            language={report.language}
          />
        )
      case 'step5':
        return (
          <Step5Form
            d6={report.d6}
            d7={report.d7}
            d8={report.d8}
            onChangeD6={(d) => updateReport('d6', d)}
            onChangeD7={(d) => updateReport('d7', d)}
            onChangeD8={(d) => updateReport('d8', d)}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 'preview':
        return (
          <PreviewScreen
            report={report}
            onBack={prevStep}
            onNext={nextStep}
          />
        )
      case 'export':
        return <ExportScreen report={report} onReset={resetReport} />
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        {/* Header */}
        <header className="border-b border-neutral-200">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:py-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">
                {tApp('brand')}
              </p>
              <h1 className="truncate text-base font-bold text-neutral-900 sm:text-lg">
                {tApp('title')}
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

        {/* Progress */}
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
      <div className="mx-auto max-w-4xl px-4 py-8">{renderStep()}</div>
    </main>
  )
}
