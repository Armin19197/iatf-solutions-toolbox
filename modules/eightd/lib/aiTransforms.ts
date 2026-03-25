import type { D2Problem, FiveWhyChain } from '../types/report'
import type { ComplaintExtractionResult } from '../types/ai'

function splitAfterLastQuestion(text: string): string {
  const qIndex = text.lastIndexOf('?')
  if (qIndex === -1 || qIndex >= text.length - 1) return text

  const trailing = text.slice(qIndex + 1).trim().replace(/^[-–—:\s]+/, '')
  return trailing || text
}

export function normalizeWhyAnswer(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const withoutLabel = trimmed.replace(/^(why|warum)\s*\d+\s*[:\-]\s*/i, '')
  return splitAfterLastQuestion(withoutLabel).trim()
}

export function normalizeFiveWhyChain<T extends FiveWhyChain>(chain: T): T {
  return {
    ...chain,
    why1: normalizeWhyAnswer(chain.why1),
    why2: normalizeWhyAnswer(chain.why2),
    why3: normalizeWhyAnswer(chain.why3),
    why4: normalizeWhyAnswer(chain.why4),
    why5: normalizeWhyAnswer(chain.why5),
  }
}

export function applyComplaintExtraction(
  current: D2Problem,
  extracted: ComplaintExtractionResult,
): D2Problem {
  return {
    ...current,
    what: extracted.what || current.what,
    where: extracted.where || current.where,
    when: extracted.when || current.when,
    howMany: extracted.howMany || current.howMany,
    detectionMethod: extracted.detectionMethod || current.detectionMethod,
    how: extracted.how || current.how,
    whyProblem: extracted.whyProblem || current.whyProblem,
    quantitativeDeviation:
      extracted.quantitativeDeviation || current.quantitativeDeviation,
    qualitativeDescription:
      extracted.qualitativeDescription || current.qualitativeDescription,
    customerImpact: extracted.customerImpact || current.customerImpact,
    isAnalysis: {
      what: {
        ...current.isAnalysis.what,
        is: extracted.isAnalysis.what || current.isAnalysis.what.is,
      },
      where: {
        ...current.isAnalysis.where,
        is: extracted.isAnalysis.where || current.isAnalysis.where.is,
      },
      when: {
        ...current.isAnalysis.when,
        is: extracted.isAnalysis.when || current.isAnalysis.when.is,
      },
      howMany: {
        ...current.isAnalysis.howMany,
        is: extracted.isAnalysis.howMany || current.isAnalysis.howMany.is,
      },
    },
    isNotAnalysis: {
      what: {
        ...current.isNotAnalysis.what,
        isNot: extracted.isNotAnalysis.what || current.isNotAnalysis.what.isNot,
      },
      where: {
        ...current.isNotAnalysis.where,
        isNot: extracted.isNotAnalysis.where || current.isNotAnalysis.where.isNot,
      },
      when: {
        ...current.isNotAnalysis.when,
        isNot: extracted.isNotAnalysis.when || current.isNotAnalysis.when.isNot,
      },
      howMany: {
        ...current.isNotAnalysis.howMany,
        isNot:
          extracted.isNotAnalysis.howMany || current.isNotAnalysis.howMany.isNot,
      },
    },
  }
}
