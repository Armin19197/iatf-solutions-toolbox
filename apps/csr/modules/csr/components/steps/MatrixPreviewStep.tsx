'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { MatrixRow, ProcessEntry, OemId } from '../../types'
import { getCsrForOems, buildMatrix, getOemName } from '../../data'

interface Props {
  selectedOems: OemId[]
  processes: ProcessEntry[]
  matrixRows: MatrixRow[]
  onMatrixGenerated: (rows: MatrixRow[]) => void
  onNext: () => void
  onBack: () => void
}

export function MatrixPreviewStep({
  selectedOems,
  processes,
  matrixRows,
  onMatrixGenerated,
  onNext,
  onBack,
}: Props) {
  const t = useTranslations('csr')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(matrixRows.length > 0)

  const generate = useCallback(() => {
    setGenerating(true)
    // Simulate small delay for UX (actual data merge is synchronous)
    setTimeout(() => {
      const csrRows = getCsrForOems(selectedOems)
      const matrix = buildMatrix(csrRows, processes)
      onMatrixGenerated(matrix)
      setGenerating(false)
      setGenerated(true)
    }, 500)
  }, [selectedOems, processes, onMatrixGenerated])

  useEffect(() => {
    if (!generated && !generating) {
      generate()
    }
  }, [generated, generating, generate])

  // Stats
  const totalRows = matrixRows.length
  const byOem = new Map<string, number>()
  const byRisk = { low: 0, medium: 0, high: 0, critical: 0 }
  const unmapped: MatrixRow[] = []

  for (const row of matrixRows) {
    byOem.set(row.oem, (byOem.get(row.oem) ?? 0) + 1)
    byRisk[row.risk]++
    if (row.affectedProcessIds.length === 0) {
      unmapped.push(row)
    }
  }

  if (generating) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t('generatingMatrix')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {t('matrixGenerated')}
          </CardTitle>
          <CardDescription>
            {t('matrixSummary', { rows: totalRows, oems: selectedOems.length, processes: processes.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* OEM breakdown */}
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-neutral-700">{t('byOem')}</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(byOem.entries()).map(([oem, count]) => (
                <Badge key={oem} variant="outline">
                  {oem === 'IATF 16949' ? oem : getOemName(oem)} — {count}
                </Badge>
              ))}
            </div>
          </div>

          {/* Risk breakdown */}
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-neutral-700">{t('byRisk')}</p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-red-100 text-red-700">{t('critical')}: {byRisk.critical}</Badge>
              <Badge className="bg-orange-100 text-orange-700">{t('high')}: {byRisk.high}</Badge>
              <Badge className="bg-yellow-100 text-yellow-700">{t('medium')}: {byRisk.medium}</Badge>
              <Badge className="bg-green-100 text-green-700">{t('low')}: {byRisk.low}</Badge>
            </div>
          </div>

          {/* Unmapped warning */}
          {unmapped.length > 0 && (
            <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-800">{t('unmappedWarning', { count: unmapped.length })}</p>
                <p className="text-xs text-amber-600">{t('unmappedHint')}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matrix preview table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('matrixPreview')}</CardTitle>
          <CardDescription>{t('matrixPreviewDesc', { showing: Math.min(20, totalRows), total: totalRows })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="px-2 py-2 text-left font-medium text-neutral-600">{t('colChapter')}</th>
                  <th className="px-2 py-2 text-left font-medium text-neutral-600">{t('colTitle')}</th>
                  <th className="px-2 py-2 text-left font-medium text-neutral-600">{t('colOem')}</th>
                  <th className="px-2 py-2 text-left font-medium text-neutral-600">{t('colRisk')}</th>
                  <th className="px-2 py-2 text-left font-medium text-neutral-600">{t('colProcesses')}</th>
                </tr>
              </thead>
              <tbody>
                {matrixRows.slice(0, 20).map((row) => (
                  <tr key={row.csrId} className="border-b border-neutral-100">
                    <td className="px-2 py-1.5 font-mono text-neutral-700">{row.iatfChapter}</td>
                    <td className="max-w-[200px] truncate px-2 py-1.5 text-neutral-600">{row.title}</td>
                    <td className="px-2 py-1.5 text-neutral-500">{row.oem}</td>
                    <td className="px-2 py-1.5">
                      <Badge
                        variant="outline"
                        className={
                          row.risk === 'critical'
                            ? 'border-red-300 text-red-700'
                            : row.risk === 'high'
                              ? 'border-orange-300 text-orange-700'
                              : row.risk === 'medium'
                                ? 'border-yellow-300 text-yellow-700'
                                : 'border-green-300 text-green-700'
                        }
                      >
                        {row.risk}
                      </Badge>
                    </td>
                    <td className="px-2 py-1.5 text-neutral-500">
                      {row.affectedProcessIds.length > 0
                        ? row.affectedProcessIds
                            .map((pid) => {
                              const p = processes?.find((pr) => pr.id === pid)
                              return p?.name ?? pid
                            })
                            .join(', ')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalRows > 20 && (
            <p className="mt-2 text-center text-xs text-neutral-400">
              {t('showingXofY', { x: 20, y: totalRows })}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          {t('backProcessMap')}
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={generate}>
            {t('regenerate')}
          </Button>
          <Button onClick={onNext} disabled={matrixRows.length === 0}>
            {t('nextExport')}
          </Button>
        </div>
      </div>
    </div>
  )
}
