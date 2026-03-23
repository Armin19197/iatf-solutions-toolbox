'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  D4RootCause,
  D5Actions,
  D3Containment,
  D2Problem,
  D1Team,
  Metadata,
  FiveWhyChain,
  CorrectiveAction,
} from '@/modules/eightd/types/report'
import { EMPTY_FIVE_WHY, EMPTY_SYSTEMIC_CAUSE } from '@/modules/eightd/types/report'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sparkles, RotateCcw, Loader2 } from 'lucide-react'
import { useGeneration, useConsistencyCheck, useChainCompletion } from '@/modules/eightd/hooks/useAI'
import type { ConsistencyInput, ChainCompletionInput } from '@/modules/eightd/types/ai'
import { mapGenerationToFormData } from '@/modules/eightd/lib/mapGeneration'
import { buildGenerationInput } from '@/modules/eightd/lib/buildGenerationInput'
import { cn } from '@/lib/utils'
import { TemplateSection } from '@/modules/eightd/components/steps/TemplateSection'
import { FormField } from '@/modules/eightd/components/shared/FormField'
import { StepCardHeader } from '@/modules/eightd/components/shared/StepCardHeader'
import { StepNavigation } from '@/modules/eightd/components/shared/StepNavigation'
import { SystemicCauseCard } from '@/modules/eightd/components/shared/SystemicCauseCard'
import {
  ActionListManager,
  ActionItemHeader,
} from '@/modules/eightd/components/shared/ActionListManager'
import {
  AIErrorAlert,
  ConsistencyAlert,
} from '@/modules/eightd/components/shared/AIAlertFeedback'

/* ──────────────────────────────── Props ──────────────────────────────── */

interface Step4FormProps {
  d4: D4RootCause
  d5: D5Actions
  d3: D3Containment
  d2: D2Problem
  d1: D1Team
  metadata: Metadata
  onChangeD4: (d: D4RootCause) => void
  onChangeD5: (d: D5Actions) => void
  onNext: () => void
  onBack: () => void
  language: 'en' | 'de'
}

/* ──────────────────────────── FiveWhyCard ─────────────────────────────── */

function FiveWhyCard({
  label,
  description,
  chain,
  onChangeChain,
  rootCauseError,
  whyError,
  onRegenerateFrom,
  regenLoading,
}: {
  label: string
  description: string
  chain: FiveWhyChain
  onChangeChain: (c: FiveWhyChain) => void
  rootCauseError?: string
  /** Returns error string for a given why field (1-5) */
  whyError?: (n: number, value: string) => string | undefined
  /** Called when user clicks 'Regenerate from Why N' — AI will grammar-fix the edited text and regenerate subsequent Whys */
  onRegenerateFrom?: (whyNumber: number) => void
  /** Whether a partial regeneration is currently in progress */
  regenLoading?: boolean
}) {
  const t = useTranslations('s4')

  const update = (field: keyof FiveWhyChain, value: string) =>
    onChangeChain({ ...chain, [field]: value })

  return (
    <div className="rounded-xl border bg-muted/20 p-4 sm:p-5">
      <div className="space-y-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>{t('possibleCause')}</Label>
            <Textarea
              placeholder={t('possibleCausePh')}
              rows={2}
              value={chain.possibleCause}
              onChange={(e) => update('possibleCause', e.target.value)}
            />
          </div>

          {([1, 2, 3, 4, 5] as const).map((n) => {
            const val = chain[`why${n}` as keyof FiveWhyChain] as string
            const err = whyError?.(n, val)
            return (
              <div key={n} className="space-y-1">
                <div className="grid gap-2 rounded-lg border bg-background p-3 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-center">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t('why', { n })}
                  </Label>
                  <Input
                    value={val}
                    onChange={(e) =>
                      update(`why${n}` as keyof FiveWhyChain, e.target.value)
                    }
                    className={cn(err && 'border-red-500 focus-visible:ring-red-500')}
                  />
                  {onRegenerateFrom && val.trim() && n < 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs shrink-0"
                      onClick={() => onRegenerateFrom(n)}
                      disabled={regenLoading}
                    >
                      {regenLoading ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <RotateCcw className="mr-1 h-3 w-3" />
                      )}
                      {t('regenerate')}
                    </Button>
                  )}
                </div>
                {err && <p className="text-xs text-red-500 pl-1">{err}</p>}
              </div>
            )
          })}

          <div className="space-y-1.5">
            <Label>{t('rootCause')}</Label>
            <Textarea
              placeholder={t('rootCausePh')}
              rows={3}
              value={chain.rootCause}
              onChange={(e) => update('rootCause', e.target.value)}
              className={cn(rootCauseError && 'border-red-500 focus-visible:ring-red-500')}
            />
            {rootCauseError && (
              <p className="text-xs text-red-500">{rootCauseError}</p>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-lg border bg-background p-4">
          <FormField
            type="input"
            label={t('causeDomain')}
            placeholder={t('causeDomainPh')}
            value={chain.causeDomain}
            onChange={(v) => update('causeDomain', v)}
          />
          <FormField
            type="input"
            label={t('rootCauseCode')}
            placeholder={t('rootCauseCodePh')}
            value={chain.rootCauseCode}
            onChange={(v) => update('rootCauseCode', v)}
          />
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────── emptyAction ─────────────────────────────── */

function emptyCorrectiveAction(): CorrectiveAction {
  return {
    id: crypto.randomUUID(),
    action: '',
    relatedRootCause: '',
    linkedCauseType: 'TUA',
    linkedCauseCode: '',
    actionCategory: '',
    responsible: '',
    targetDate: '',
    verificationMethod: '',
    notes: '',
  }
}

/* ──────────────────────────── Step4Form ───────────────────────────────── */

export function Step4Form({
  d4,
  d5,
  d3,
  d2,
  d1,
  metadata,
  onChangeD4,
  onChangeD5,
  onNext,
  onBack,
  language,
}: Step4FormProps) {
  const t = useTranslations('s4')
  const tAi = useTranslations('ai')
  const tVal = useTranslations('validation')
  const [attempted, setAttempted] = useState(false)

  // AI hooks
  const {
    generate,
    loading: genLoading,
    error: genError,
    result: genResult,
    regenCount,
    canRegenerate,
    clearGeneration,
  } = useGeneration()

  const {
    debouncedCheck: debouncedConsistencyCheck,
    loading: consistencyLoading,
    result: consistencyResult,
    clear: clearConsistency,
  } = useConsistencyCheck()

  const hasGeneratedContent =
    genResult !== null ||
    d4.tua.rootCause.trim().length > 0 ||
    d4.tun.rootCause.trim().length > 0

  /* ── AI generation ── */
  const handleGenerate = useCallback(
    async (forceRegenerate = false) => {
      const input = buildGenerationInput(metadata, d1, d2)
      const result = await generate(input, language, forceRegenerate)

      if (result.success) {
        const { d4: mappedD4, d5: mappedD5 } = mapGenerationToFormData(result.data, {
          complaintDate: metadata.complaintDate,
        })
        onChangeD4(mappedD4)
        onChangeD5(mappedD5)
      }
    },
    [metadata, d1, d2, language, generate, onChangeD4, onChangeD5],
  )

  const handleRegenerate = () => {
    onChangeD4({
      tua: { ...EMPTY_FIVE_WHY },
      tun: { ...EMPTY_FIVE_WHY },
      sua: { ...EMPTY_SYSTEMIC_CAUSE },
      sun: { ...EMPTY_SYSTEMIC_CAUSE },
    })
    onChangeD5({ actions: [], plannedVerification: '' })
    clearGeneration()
    clearConsistency()
    handleGenerate(true)
  }

  /* ── Consistency check on D4/D5 edits ── */
  const triggerConsistencyCheck = useCallback(() => {
    if (!hasGeneratedContent) return

    const input: ConsistencyInput = {
      d2: {
        what: d2.what,
        where: d2.where,
        when: d2.when,
        howMany: d2.howMany,
        detectionMethod: d2.detectionMethod,
      },
      d3: {
        actions: d3.actions.map((a) => ({
          action: a.action,
          responsible: a.responsible,
        })),
      },
      d4: { tua: d4.tua, tun: d4.tun, sua: d4.sua, sun: d4.sun },
      d5: {
        actions: d5.actions.map((a) => ({
          action: a.action,
          linkedCauseType: a.linkedCauseType,
          linkedCauseText: a.relatedRootCause,
          responsible: a.responsible,
          verificationMethod: a.verificationMethod,
        })),
      },
    }

    debouncedConsistencyCheck(input, language)
  }, [d2, d4, d5, hasGeneratedContent, language, debouncedConsistencyCheck])

  useEffect(() => {
    if (hasGeneratedContent && genResult) {
      triggerConsistencyCheck()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d4, d5])

  /* ── D4 change handler ── */
  const handleD4Change = (newD4: D4RootCause) => onChangeD4(newD4)

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
    d4.tua.rootCause.trim().length >= 3 &&
    d4.tun.rootCause.trim().length >= 3 &&
    d4.tua.why1.trim() !== '' &&
    d4.tua.why2.trim() !== '' &&
    d4.tua.why3.trim() !== '' &&
    d4.tun.why1.trim() !== '' &&
    d4.tun.why2.trim() !== '' &&
    d4.tun.why3.trim() !== '' &&
    d5.actions.length > 0 &&
    d5.actions.every((a) => a.action.trim() !== '' && futureDateErr(a.targetDate) === undefined)

  const handleNext = () => {
    if (!canProceed) {
      setAttempted(true)
      return
    }
    onNext()
  }

  const rootCauseErr = (value: string) => {
    if (!attempted) return undefined
    if (value.trim() === '') return tVal('required')
    if (value.trim().length < 3) return tVal('minChars', { min: 3 })
    return undefined
  }

  /** Validate why1-3 (required), why4-5 (optional) */
  const whyErr = (n: number, value: string) => {
    if (!attempted) return undefined
    if (n <= 3 && value.trim() === '') return tVal('required')
    return undefined
  }

  const actionErr = (value: string) => {
    if (!attempted) return undefined
    if (value.trim() === '') return tVal('required')
    return undefined
  }


  /* ── Per-Why partial regeneration (FB4) ── */
  const {
    complete: completeChain,
    loading: chainLoading,
  } = useChainCompletion()

  /**
   * When user edits a Why field and clicks "Regenerate from here":
   * 1. Grammar-correct the edited Why text via AI chain completion
   * 2. Auto-generate subsequent Why fields (and root cause) sequentially
   */
  const handleRegenerateFromWhy = useCallback(
    async (chainType: 'tua' | 'tun', whyNumber: number) => {
      const chain = d4[chainType]
      const whyKey = `why${whyNumber}` as keyof FiveWhyChain
      const currentValue = chain[whyKey] as string

      if (!currentValue.trim()) return

      // 1. Prepare previous history for context
      const previousWhys: string[] = []
      for (let i = 1; i < whyNumber; i++) {
        const k = `why${i}` as keyof FiveWhyChain
        if (chain[k]) previousWhys.push(chain[k] as string)
      }

      const input: ChainCompletionInput = {
        chainType,
        whyNumber,
        currentWhy: currentValue,
        context: {
          d2: {
            what: d2.what,
            where: d2.where,
            when: d2.when,
          },
          previousWhys,
        },
      }

      const result = await completeChain(input, language)

      // 2. Build updated chain with grammar-corrected text and generated subsequent Whys
      const updatedChain = { ...chain }
      if (result.success && result.data) {
        updatedChain[whyKey] = result.data.improvedCurrentWhy as never
        let answerIndex = 0
        for (let i = whyNumber + 1; i <= 5; i++) {
          const k = `why${i}` as keyof FiveWhyChain
          updatedChain[k] = (result.data.subsequentWhys[answerIndex] || '') as never
          answerIndex++
        }
        updatedChain.rootCause = result.data.rootCause
      }

      handleD4Change({ ...d4, [chainType]: updatedChain })
    },
    [d4, d2, language, completeChain, handleD4Change],
  )

  return (
    <div className="space-y-6">
      {/* AI generation card */}
      {!hasGeneratedContent && (
        <Card>
          <StepCardHeader title={t('aiTitle')} description={t('aiDesc')} />
          <CardContent>
            <Button onClick={() => handleGenerate(false)} disabled={genLoading}>
              {genLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {genLoading ? t('generating') : t('generateBtn')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI generation error */}
      <AIErrorAlert
        error={genError}
        onRetry={() => handleGenerate(true)}
        onManual={() =>
          onChangeD4({
            tua: { ...EMPTY_FIVE_WHY },
            tun: { ...EMPTY_FIVE_WHY },
            sua: { ...EMPTY_SYSTEMIC_CAUSE },
            sun: { ...EMPTY_SYSTEMIC_CAUSE },
          })
        }
        retryDisabled={genLoading}
      />

      {/* D4 — Root Cause 5-Why */}
      <Card>
        <StepCardHeader
          title={t('d4Title')}
          description={t('d4Desc')}
          templateFlow={t('templateFlow')}
          actions={
            genResult ? (
              <>
                <Badge variant="secondary" className="text-xs">
                  {t('aiBadge')}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleRegenerate}
                  disabled={genLoading || !canRegenerate}
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  {t('regenerate')}
                </Button>
              </>
            ) : undefined
          }
          extra={
            genResult ? (
              <p className="text-xs text-muted-foreground">
                {tAi('gen.regenCount', { count: regenCount, max: 5 })}
              </p>
            ) : undefined
          }
        />
        <CardContent className="space-y-6">
          <TemplateSection
            title={t('occurrence')}
            description={t('occurrenceDesc')}
            className="border-none bg-transparent p-0"
            contentClassName="space-y-4"
          >
            <FiveWhyCard
              label={t('tua')}
              description={t('tuaDesc')}
              chain={d4.tua}
              onChangeChain={(c) => handleD4Change({ ...d4, tua: c })}
              rootCauseError={rootCauseErr(d4.tua.rootCause)}
              whyError={whyErr}
              onRegenerateFrom={(n) => handleRegenerateFromWhy('tua', n)}
              regenLoading={chainLoading}
            />
          </TemplateSection>

          <Separator />

          <TemplateSection
            title={t('detection')}
            description={t('detectionDesc')}
            className="border-none bg-transparent p-0"
            contentClassName="space-y-4"
          >
            <FiveWhyCard
              label={t('tun')}
              description={t('tunDesc')}
              chain={d4.tun}
              onChangeChain={(c) => handleD4Change({ ...d4, tun: c })}
              rootCauseError={rootCauseErr(d4.tun.rootCause)}
              whyError={whyErr}
              onRegenerateFrom={(n) => handleRegenerateFromWhy('tun', n)}
              regenLoading={chainLoading}
            />
          </TemplateSection>

          <Separator />

          <TemplateSection title={t('systemicSectionTitle')} description={t('systemicSectionDesc')}>
            <div className="grid gap-4 xl:grid-cols-2">
              <SystemicCauseCard
                label={t('sua')}
                description={t('suaDesc')}
                value={d4.sua}
                onChange={(v) => handleD4Change({ ...d4, sua: v })}
              />
              <SystemicCauseCard
                label={t('sun')}
                description={t('sunDesc')}
                value={d4.sun}
                onChange={(v) => handleD4Change({ ...d4, sun: v })}
              />
            </div>
          </TemplateSection>
        </CardContent>
      </Card>

      {/* Consistency check results */}
      <ConsistencyAlert result={consistencyResult} loading={consistencyLoading} />

      {/* D5 — Corrective Actions */}
      <Card>
        <StepCardHeader title={t('d5Title')} description={t('d5Desc')} />
        <CardContent className="space-y-5">
          <TemplateSection title={t('actionPlanningTitle')} description={t('actionPlanningDesc')}>
            <ActionListManager<CorrectiveAction>
              items={d5.actions}
              onChange={(actions) => onChangeD5({ ...d5, actions })}
              emptyFactory={emptyCorrectiveAction}
              addLabel={t('addAction')}
              renderItem={(action, _idx, helpers) => (
                <>
                  <ActionItemHeader
                    label={`${t('correctiveAction')} ${helpers.index}`}
                    onRemove={helpers.remove}
                  />

                  <FormField
                    type="textarea"
                    label={t('correctiveAction')}
                    placeholder={t('correctiveActionPh')}
                    rows={2}
                    value={action.action}
                    onChange={(v) => helpers.updateField('action', v)}
                    error={actionErr(action.action)}
                  />

                  <div className="grid gap-4 xl:grid-cols-2">
                    <FormField
                      type="input"
                      label={t('relatedCause')}
                      placeholder={t('relatedCausePh')}
                      value={action.relatedRootCause}
                      onChange={(v) => helpers.updateField('relatedRootCause', v)}
                    />
                    <FormField
                      type="select"
                      label={t('linkedCauseType')}
                      value={action.linkedCauseType}
                      onChange={(v) => helpers.updateField('linkedCauseType', v as CorrectiveAction['linkedCauseType'])}
                      placeholder={t('linkedCauseType')}
                      options={[
                        { value: 'TUA', label: 'TUA' },
                        { value: 'TUN', label: 'TUN' },
                        { value: 'SUA', label: 'SUA' },
                        { value: 'SUN', label: 'SUN' },
                      ]}
                    />
                  </div>

                  <div className="grid gap-4 xl:grid-cols-3">
                    <FormField
                      type="input"
                      label={t('linkedCauseCode')}
                      placeholder={t('linkedCauseCodePh')}
                      value={action.linkedCauseCode}
                      onChange={(v) => helpers.updateField('linkedCauseCode', v)}
                    />
                    <FormField
                      type="input"
                      label={t('responsible')}
                      placeholder={t('responsible')}
                      value={action.responsible}
                      onChange={(v) => helpers.updateField('responsible', v)}
                    />
                    <FormField
                      type="select"
                      label={t('actionCategory')}
                      value={action.actionCategory}
                      onChange={(v) => helpers.updateField('actionCategory', v)}
                      placeholder={t('actionCategory')}
                      options={[
                        { value: 'technical', label: t('actionCategoryTechnical') },
                        { value: 'systemic', label: t('actionCategorySystemic') },
                      ]}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      type="date"
                      label={t('targetDate')}
                      value={action.targetDate}
                      onChange={(v) => helpers.updateField('targetDate', v)}
                      placeholder={t('targetDate')}
                      error={futureDateErr(action.targetDate)}
                    />
                    <FormField
                      type="input"
                      label={t('verification')}
                      placeholder={t('verificationPh')}
                      value={action.verificationMethod}
                      onChange={(v) => helpers.updateField('verificationMethod', v)}
                    />
                  </div>

                  <FormField
                    type="textarea"
                    label={t('notes')}
                    rows={2}
                    value={action.notes}
                    onChange={(v) => helpers.updateField('notes', v)}
                  />
                </>
              )}
            />
          </TemplateSection>

          <TemplateSection title={t('verificationPlanningTitle')} description={t('verificationPlanningDesc')}>
            <FormField
              type="textarea"
              label={t('plannedVerification')}
              placeholder={t('plannedVerificationPh')}
              rows={3}
              value={d5.plannedVerification}
              onChange={(v) => onChangeD5({ ...d5, plannedVerification: v })}
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
