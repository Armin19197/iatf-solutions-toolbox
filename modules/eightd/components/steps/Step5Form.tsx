'use client'

import { useState } from 'react'

import type {
  D6Implementation,
  D7Prevention,
  D8Closure,
  SystemicMeasureItem,
} from '@/modules/eightd/types/report'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FormField } from '@/modules/eightd/components/shared/FormField'
import { StepCardHeader } from '@/modules/eightd/components/shared/StepCardHeader'
import { StepNavigation } from '@/modules/eightd/components/shared/StepNavigation'
import { TemplateSection } from '@/modules/eightd/components/steps/TemplateSection'

interface Step5FormProps {
  d6: D6Implementation
  d7: D7Prevention
  d8: D8Closure
  onChangeD6: (d: D6Implementation) => void
  onChangeD7: (d: D7Prevention) => void
  onChangeD8: (d: D8Closure) => void
  onNext: () => void
  onBack: () => void
}

/* ─── D7 document keys — data-driven instead of copy-pasted ──────────── */
const D7_DOC_KEYS = [
  'fmea',
  'controlPlan',
  'workInstructions',
  'testInspectionPlan',
  'otherDocuments',
] as const

export function Step5Form({
  d6,
  d7,
  d8,
  onChangeD6,
  onChangeD7,
  onChangeD8,
  onNext,
  onBack,
}: Step5FormProps) {
  const t = useTranslations('s5')
  const tVal = useTranslations('validation')
  const [attempted, setAttempted] = useState(false)

  const updateD6 = (field: keyof D6Implementation, value: string) =>
    onChangeD6({ ...d6, [field]: value })

  const updateD7 = (
    key: keyof D7Prevention,
    updated: SystemicMeasureItem,
  ) => onChangeD7({ ...d7, [key]: updated })

  const updateD8 = (field: keyof D8Closure, value: string) =>
    onChangeD8({ ...d8, [field]: value })

  /* Mapping from D7 doc key → i18n label key */
  const d7Labels: Record<(typeof D7_DOC_KEYS)[number], string> = {
    fmea: t('docFmea'),
    controlPlan: t('docControlPlan'),
    workInstructions: t('docWorkInstructions'),
    testInspectionPlan: t('docTestInspectionPlan'),
    otherDocuments: t('docOtherDocuments'),
  }

  // All D6/D7/D8 fields are optional per schema — no required validation currently
  // The attempted pattern is in place for consistency with other steps
  const handleNext = () => {
    onNext()
  }

  return (
    <div className="space-y-6">
      {/* D6 — Implementation */}
      <Card>
        <StepCardHeader
          title={t('d6Title')}
          description={t('d6Desc')}
          templateFlow={t('templateFlow')}
        />
        <CardContent className="space-y-5">
          <TemplateSection title={t('d6ExecutionTitle')} description={t('d6ExecutionDesc')}>
            <div className="grid gap-4 lg:grid-cols-3">
              <FormField
                type="select"
                label={t('implStatus')}
                value={d6.implementationStatus}
                onChange={(v) => updateD6('implementationStatus', v)}
                placeholder={t('implStatusPh')}
                options={[
                  { value: 'not-started', label: t('statusNotStarted') },
                  { value: 'in-progress', label: t('statusInProgress') },
                  { value: 'completed', label: t('statusCompleted') },
                  { value: 'verified', label: t('statusVerified') },
                ]}
              />
              <FormField
                type="date"
                label={t('implDate')}
                value={d6.implementationDate}
                onChange={(v) => updateD6('implementationDate', v)}
                placeholder={t('implDate')}
              />
              <FormField
                type="input"
                label={t('responsible')}
                placeholder={t('responsiblePh')}
                value={d6.responsible}
                onChange={(v) => updateD6('responsible', v)}
              />
            </div>
          </TemplateSection>

          <TemplateSection title={t('d6VerificationTitle')} description={t('d6VerificationDesc')}>
            <FormField
              type="textarea"
              label={t('verificationResults')}
              placeholder={t('verificationResultsPh')}
              rows={4}
              value={d6.verificationResults}
              onChange={(v) => updateD6('verificationResults', v)}
            />
            <FormField
              type="textarea"
              label={t('containmentRemoved')}
              placeholder={t('containmentRemovedPh')}
              rows={3}
              value={d6.containmentRemoved}
              onChange={(v) => updateD6('containmentRemoved', v)}
            />
          </TemplateSection>
        </CardContent>
      </Card>

      <Separator />

      {/* D7 — Prevention */}
      <Card>
        <StepCardHeader title={t('d7Title')} description={t('d7Desc')} />
        <CardContent className="space-y-4">
          <TemplateSection title={t('d7DocsTitle')} description={t('d7DocsDesc')}>
            {D7_DOC_KEYS.map((key) => {
              const item = d7[key]
              return (
                <Card key={key} className="border-dashed">
                  <CardContent className="pt-4 space-y-3">
                    <p className="text-sm font-medium">{d7Labels[key]}</p>
                    <FormField
                      type="textarea"
                      label={t('actionUpdate')}
                      placeholder={t('actionUpdatePh')}
                      rows={2}
                      value={item.actionRequired}
                      onChange={(v) =>
                        updateD7(key, { ...item, actionRequired: v })
                      }
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        type="input"
                        label={t('transfer')}
                        placeholder={t('transferPh')}
                        value={item.transfer}
                        onChange={(v) =>
                          updateD7(key, { ...item, transfer: v })
                        }
                      />
                      <FormField
                        type="input"
                        label={t('responsible')}
                        placeholder={t('responsiblePh')}
                        value={item.responsible}
                        onChange={(v) =>
                          updateD7(key, { ...item, responsible: v })
                        }
                      />
                    </div>
                    <FormField
                      type="date"
                      label={t('dueDate')}
                      value={item.dueDate}
                      onChange={(v) => updateD7(key, { ...item, dueDate: v })}
                      placeholder={t('dueDate')}
                    />
                  </CardContent>
                </Card>
              )
            })}
          </TemplateSection>
        </CardContent>
      </Card>

      <Separator />

      {/* D8 — Closure */}
      <Card>
        <StepCardHeader title={t('d8Title')} description={t('d8Desc')} />
        <CardContent className="space-y-5">
          <TemplateSection title={t('d8ApprovalTitle')} description={t('d8ApprovalDesc')}>
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
              <FormField
                type="select"
                label={t('customerApproval')}
                value={d8.customerApproval}
                onChange={(v) => updateD8('customerApproval', v)}
                placeholder={t('selectPh')}
                className="space-y-1.5 xl:col-span-1"
                options={[
                  { value: 'pending', label: t('pending') },
                  { value: 'approved', label: t('approved') },
                  { value: 'rejected', label: t('rejected') },
                ]}
              />
              <FormField
                type="date"
                label={t('closureDate')}
                value={d8.closureDate}
                onChange={(v) => updateD8('closureDate', v)}
                placeholder={t('closureDate')}
                className="space-y-1.5 xl:col-span-1"
              />
              <FormField
                type="input"
                label={t('approvedBy')}
                placeholder={t('approvedByPh')}
                value={d8.approvedBy}
                onChange={(v) => updateD8('approvedBy', v)}
                className="space-y-1.5 xl:col-span-1"
              />
              <FormField
                type="select"
                label={t('customerSignOff')}
                value={d8.customerSignOff}
                onChange={(v) => updateD8('customerSignOff', v)}
                placeholder={t('selectPh')}
                className="space-y-1.5 xl:col-span-1"
                options={[
                  { value: 'pending', label: t('pending') },
                  { value: 'approved', label: t('approved') },
                  { value: 'rejected', label: t('rejected') },
                ]}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <FormField
                type="date"
                label={t('signOffDate')}
                value={d8.signOffDate}
                onChange={(v) => updateD8('signOffDate', v)}
                placeholder={t('signOffDate')}
              />
            </div>
          </TemplateSection>

          <TemplateSection title={t('d8LearningTitle')} description={t('d8LearningDesc')}>
            <FormField
              type="textarea"
              label={t('lessons')}
              placeholder={t('lessonsPh')}
              rows={4}
              value={d8.lessonsLearned}
              onChange={(v) => updateD8('lessonsLearned', v)}
            />
            <FormField
              type="textarea"
              label={t('teamRecognition')}
              placeholder={t('teamRecognitionPh')}
              rows={3}
              value={d8.teamRecognition}
              onChange={(v) => updateD8('teamRecognition', v)}
            />
          </TemplateSection>
        </CardContent>
      </Card>

      <StepNavigation
        onBack={onBack}
        onNext={handleNext}
        nextLabel={t('nextBtn')}
      />
    </div>
  )
}
