'use client'

import { useState } from 'react'

import type { D3Containment, ContainmentAction } from '@/modules/eightd/types/report'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FormField } from '@/modules/eightd/components/shared/FormField'
import { StepCardHeader } from '@/modules/eightd/components/shared/StepCardHeader'
import { StepNavigation } from '@/modules/eightd/components/shared/StepNavigation'
import {
  ActionListManager,
  ActionItemHeader,
} from '@/modules/eightd/components/shared/ActionListManager'
import { TemplateSection } from '@/modules/eightd/components/steps/TemplateSection'

interface Step3FormProps {
  data: D3Containment
  complaintDate: string
  onChange: (d: D3Containment) => void
  onNext: () => void
  onBack: () => void
}

export function Step3Form({ data, complaintDate, onChange, onNext, onBack }: Step3FormProps) {
  const t = useTranslations('s3')
  const tVal = useTranslations('validation')
  const [attempted, setAttempted] = useState(false)

  /** Compute complaint date + 1 day as default due date */
  const defaultDueDate = (() => {
    if (!complaintDate) return ''
    try {
      const d = new Date(complaintDate)
      if (isNaN(d.getTime())) return ''
      d.setDate(d.getDate() + 1)
      return d.toISOString().split('T')[0]
    } catch {
      return ''
    }
  })()

  function emptyAction(): ContainmentAction {
    return {
      id: crypto.randomUUID(),
      action: '',
      responsible: '',
      dueDate: defaultDueDate,
      effectiveness: '',
      scope: 'all',
      riskAssessment: '',
      notes: '',
    }
  }

  /** Validate that a date is not in the past */
  const futureDateErr = (value: string) => {
    if (!value) return tVal('required')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const d = new Date(value)
    if (d < today) return tVal('futureDate')
    return undefined
  }

  const canProceed =
    data.actions.length > 0 &&
    data.actions.every(
      (a) => 
        a.action.trim().length >= 3 && 
        a.responsible.trim().length >= 2 &&
        futureDateErr(a.dueDate) === undefined
    )

  const handleNext = () => {
    if (!canProceed) {
      setAttempted(true)
      return
    }
    onNext()
  }

  const actionErr = (value: string, minLen: number) => {
    if (!attempted) return undefined
    if (value.trim() === '') return tVal('required')
    if (value.trim().length < minLen) return tVal('minChars', { min: minLen })
    return undefined
  }


  return (
    <div className="space-y-6">
      <Card>
        <StepCardHeader
          title={t('title')}
          description={t('desc')}
          templateFlow={t('templateFlow')}
        />
        <CardContent className="space-y-5">
          <TemplateSection title={t('actionPlanTitle')} description={t('actionPlanDesc')}>
            <ActionListManager<ContainmentAction>
              items={data.actions}
              onChange={(actions) => onChange({ ...data, actions })}
              emptyFactory={emptyAction}
              addLabel={t('addAction')}
              emptyMessage={t('empty')}
              renderItem={(action, _idx, helpers) => (
                <>
                  <ActionItemHeader
                    label={`${t('action')} ${helpers.index}`}
                    onRemove={helpers.remove}
                  />

                  <FormField
                    type="textarea"
                    label={t('actionDesc')}
                    placeholder={t('actionPh')}
                    rows={2}
                    value={action.action}
                    onChange={(v) => helpers.updateField('action', v)}
                    error={actionErr(action.action, 3)}
                  />

                  <div className="grid gap-4 lg:grid-cols-3">
                    <FormField
                      type="input"
                      label={t('responsible')}
                      placeholder={t('responsible')}
                      value={action.responsible}
                      onChange={(v) => helpers.updateField('responsible', v)}
                      error={actionErr(action.responsible, 2)}
                    />
                    <FormField
                      type="date"
                      label={t('dueDate')}
                      value={action.dueDate}
                      onChange={(v) => helpers.updateField('dueDate', v)}
                      placeholder={t('dueDate')}
                      error={futureDateErr(action.dueDate)}
                    />
                    <FormField
                      type="select"
                      label={t('scope')}
                      value={action.scope}
                      onChange={(v) => helpers.updateField('scope', v as ContainmentAction['scope'])}
                      placeholder={t('scope')}
                      options={[
                        { value: 'all', label: t('scopeAll') },
                        { value: 'finished_goods', label: t('scopeFinishedGoods') },
                        { value: 'wip', label: t('scopeWip') },
                        { value: 'in_transit', label: t('scopeInTransit') },
                        { value: 'customer_stock', label: t('scopeCustomerStock') },
                      ]}
                    />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <FormField
                      type="input"
                      label={t('effectiveness')}
                      placeholder={t('effectivenessPh')}
                      value={action.effectiveness}
                      onChange={(v) => helpers.updateField('effectiveness', v)}
                    />
                    <FormField
                      type="input"
                      label={t('riskAssessment')}
                      placeholder={t('riskAssessmentPh')}
                      value={action.riskAssessment}
                      onChange={(v) => helpers.updateField('riskAssessment', v)}
                    />
                  </div>

                  <FormField
                    type="textarea"
                    label={t('notes')}
                    placeholder={t('notesPh')}
                    rows={2}
                    value={action.notes}
                    onChange={(v) => helpers.updateField('notes', v)}
                  />
                </>
              )}
            />
          </TemplateSection>

          <Separator className="my-4" />

          <TemplateSection title={t('verificationTitle')} description={t('verificationDesc')}>
            <FormField
              type="textarea"
              label={t('effectivenessVerification')}
              placeholder={t('effectivenessVerificationPh')}
              rows={4}
              value={data.effectivenessVerification}
              onChange={(v) => onChange({ ...data, effectivenessVerification: v })}
            />
          </TemplateSection>
        </CardContent>
      </Card>

      <StepNavigation
        onBack={onBack}
        onNext={handleNext}
        nextDisabled={false}
        nextLabel={t('nextBtn')}
      />
    </div>
  )
}
