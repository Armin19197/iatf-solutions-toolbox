import type { ReportTranslationInput, ReportTranslationResult } from '../types/ai'
import type { CauseType, ContainmentScope, ReportData } from '../types/report'
import { reportDataSchema } from '../schemas/reportValidation'
import { callAIWithRetry } from './aiService'
import {
  AI_GENERATION_MAX_RETRIES,
  AI_GENERATION_MAX_TOKENS,
  AI_GENERATION_TIMEOUT_MS,
} from './constants'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

const CONTAINMENT_SCOPES: ContainmentScope[] = [
  'finished_goods',
  'wip',
  'in_transit',
  'customer_stock',
  'all',
]

const CAUSE_TYPES: CauseType[] = ['TUA', 'TUN', 'SUA', 'SUN']

function normalizeContainmentScope(value: string, fallback: ContainmentScope): ContainmentScope {
  return CONTAINMENT_SCOPES.includes(value as ContainmentScope)
    ? (value as ContainmentScope)
    : fallback
}

function normalizeCauseType(value: string, fallback: CauseType): CauseType {
  return CAUSE_TYPES.includes(value as CauseType)
    ? (value as CauseType)
    : fallback
}

function buildReportTranslationSystemPrompt(targetLanguage: 'en' | 'de') {
  const lang = targetLanguage === 'de' ? 'German' : 'English'

  return `You are translating a structured 8D report between German and English.

Return the SAME report object structure, translated into ${lang}.

Rules:
1. Translate all descriptive free-text content into ${lang}.
2. Preserve IDs, dates, UUIDs, part numbers, batch numbers, internal references, codes, and enum values exactly.
3. Preserve names of people, companies, products, and locations unless they are already common translated terms.
4. Preserve object keys and array structure exactly.
5. Set the top-level "language" field to "${targetLanguage}".
6. Keep all enum-style values exactly as provided, including:
   - reportStatus
   - priority
   - customerApproval
   - customerSignOff
   - actionCategory
   - linkedCauseType
   - scope
7. Do not drop any content. If a field is empty, keep it empty.

CRITICAL: Respond with ONLY valid JSON.`
}

function buildReportTranslationUserPrompt(input: ReportTranslationInput) {
  return `Translate this full 8D report to ${input.targetLanguage === 'de' ? 'German' : 'English'} and return the full translated JSON object:

${JSON.stringify(input.report)}`
}

export async function translateReport(
  input: ReportTranslationInput,
): Promise<{ success: true; data: ReportTranslationResult } | { success: false; error: string }> {
  const result = await callAIWithRetry({
    systemPrompt: buildReportTranslationSystemPrompt(input.targetLanguage),
    userPrompt: buildReportTranslationUserPrompt(input),
    schema: reportDataSchema,
    maxTokens: AI_GENERATION_MAX_TOKENS,
    temperature: 0.1,
    maxRetries: AI_GENERATION_MAX_RETRIES,
    timeoutMs: AI_GENERATION_TIMEOUT_MS,
  })

  if (!result.success) {
    return result
  }

  const translated = result.data
  const translatedD2 = asRecord(translated.d2)
  const translatedD2Is = asRecord(translatedD2.isAnalysis)
  const translatedD2IsNot = asRecord(translatedD2.isNotAnalysis)
  const translatedD4 = asRecord(translated.d4)
  const translatedD7 = asRecord(translated.d7)
  const translatedD3Actions = Array.isArray(translated.d3.actions)
    ? translated.d3.actions.map((action, index) => ({
      ...input.report.d3.actions[index],
      ...action,
      scope: normalizeContainmentScope(
        action.scope,
        input.report.d3.actions[index]?.scope ?? 'all',
      ),
    }))
    : input.report.d3.actions
  const translatedD5Actions = Array.isArray(translated.d5.actions)
    ? translated.d5.actions.map((action, index) => ({
      ...input.report.d5.actions[index],
      ...action,
      linkedCauseType: normalizeCauseType(
        action.linkedCauseType,
        input.report.d5.actions[index]?.linkedCauseType ?? 'TUA',
      ),
    }))
    : input.report.d5.actions

  return {
    success: true,
    data: {
      ...input.report,
      ...translated,
      language: input.targetLanguage,
      metadata: { ...input.report.metadata, ...translated.metadata },
      d1: { ...input.report.d1, ...translated.d1 },
      d2: {
        ...input.report.d2,
        ...translatedD2,
        isAnalysis: {
          ...input.report.d2.isAnalysis,
          ...translatedD2Is,
          what: { ...input.report.d2.isAnalysis.what, ...asRecord(translatedD2Is.what) },
          where: { ...input.report.d2.isAnalysis.where, ...asRecord(translatedD2Is.where) },
          when: { ...input.report.d2.isAnalysis.when, ...asRecord(translatedD2Is.when) },
          howMany: { ...input.report.d2.isAnalysis.howMany, ...asRecord(translatedD2Is.howMany) },
        },
        isNotAnalysis: {
          ...input.report.d2.isNotAnalysis,
          ...translatedD2IsNot,
          what: { ...input.report.d2.isNotAnalysis.what, ...asRecord(translatedD2IsNot.what) },
          where: { ...input.report.d2.isNotAnalysis.where, ...asRecord(translatedD2IsNot.where) },
          when: { ...input.report.d2.isNotAnalysis.when, ...asRecord(translatedD2IsNot.when) },
          howMany: { ...input.report.d2.isNotAnalysis.howMany, ...asRecord(translatedD2IsNot.howMany) },
        },
      },
      d3: {
        ...input.report.d3,
        ...translated.d3,
        actions: translatedD3Actions,
      },
      d4: {
        ...input.report.d4,
        ...translatedD4,
        tua: { ...input.report.d4.tua, ...asRecord(translatedD4.tua) },
        tun: { ...input.report.d4.tun, ...asRecord(translatedD4.tun) },
        sua: { ...input.report.d4.sua, ...asRecord(translatedD4.sua) },
        sun: { ...input.report.d4.sun, ...asRecord(translatedD4.sun) },
      },
      d5: {
        ...input.report.d5,
        ...translated.d5,
        actions: translatedD5Actions,
      },
      d6: { ...input.report.d6, ...translated.d6 },
      d7: {
        ...input.report.d7,
        ...translatedD7,
        fmea: { ...input.report.d7.fmea, ...asRecord(translatedD7.fmea) },
        controlPlan: { ...input.report.d7.controlPlan, ...asRecord(translatedD7.controlPlan) },
        workInstructions: { ...input.report.d7.workInstructions, ...asRecord(translatedD7.workInstructions) },
        testInspectionPlan: { ...input.report.d7.testInspectionPlan, ...asRecord(translatedD7.testInspectionPlan) },
        otherDocuments: { ...input.report.d7.otherDocuments, ...asRecord(translatedD7.otherDocuments) },
      },
      d8: { ...input.report.d8, ...translated.d8 },
    } satisfies ReportData,
  }
}
