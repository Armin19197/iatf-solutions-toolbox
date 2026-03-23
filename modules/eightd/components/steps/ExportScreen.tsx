'use client'

import { useState } from 'react'
import type { ReportData } from '@/modules/eightd/types/report'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Sheet, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ExportScreenProps {
  report: ReportData
  onReset: () => void
}

type DownloadState = 'idle' | 'generating' | 'done' | 'error'

async function triggerDownload(
  endpoint: string,
  report: ReportData,
  filename: string,
  mimeType: string,
): Promise<void> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report, language: report.language }),
  })

  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`)
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(new Blob([blob], { type: mimeType }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function ExportScreen({ report, onReset }: ExportScreenProps) {
  const t = useTranslations('export')
  const router = useRouter()
  const [pdfState, setPdfState] = useState<DownloadState>('idle')
  const [xlsxState, setXlsxState] = useState<DownloadState>('idle')
  const [pdfError, setPdfError] = useState('')
  const [xlsxError, setXlsxError] = useState('')

  const handleDashboard = () => {
    onReset()
    router.push('/')
  }

  const reportLabel = report.metadata.reportId || t('noReportId')
  const fileBase = `8D-Report-${report.metadata.reportId || 'draft'}`

  const handlePdf = async () => {
    setPdfState('generating')
    setPdfError('')
    try {
      await triggerDownload(
        '/api/export/pdf',
        report,
        `${fileBase}.pdf`,
        'application/pdf',
      )
      setPdfState('done')
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Unknown error')
      setPdfState('error')
    }
  }

  const handleXlsx = async () => {
    setXlsxState('generating')
    setXlsxError('')
    try {
      await triggerDownload(
        '/api/export/xlsx',
        report,
        `${fileBase}.xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      )
      setXlsxState('done')
    } catch (err) {
      setXlsxError(err instanceof Error ? err.message : 'Unknown error')
      setXlsxState('error')
    }
  }

  function btnLabel(state: DownloadState, dlKey: string): string {
    if (state === 'generating') return t('generating')
    if (state === 'done') return t('downloaded')
    if (state === 'error') return t(dlKey as Parameters<typeof t>[0])
    return t(dlKey as Parameters<typeof t>[0])
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('desc')}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('reportLabel')}: <strong>{reportLabel}</strong>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* PDF Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-500" />
              <CardTitle className="text-base font-semibold">
                {t('pdfTitle')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t('pdfDesc')}
            </p>
            {pdfError && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{pdfError}</span>
              </div>
            )}
            <Button
              className="w-full"
              onClick={handlePdf}
              disabled={pdfState === 'generating'}
              variant={pdfState === 'error' ? 'destructive' : 'default'}
            >
              {btnLabel(pdfState, 'downloadPdf')}
            </Button>
          </CardContent>
        </Card>

        {/* XLSX Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sheet className="h-5 w-5 text-green-600" />
              <CardTitle className="text-base font-semibold">
                {t('xlsxTitle')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t('xlsxDesc')}
            </p>
            {xlsxError && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{xlsxError}</span>
              </div>
            )}
            <Button
              className="w-full"
              variant={xlsxState === 'error' ? 'destructive' : 'outline'}
              onClick={handleXlsx}
              disabled={xlsxState === 'generating'}
            >
              {btnLabel(xlsxState, 'downloadXlsx')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end items-center">
        <Button 
          onClick={handleDashboard}
          disabled={pdfState !== 'done' && xlsxState !== 'done'}
          variant="default"
        >
          {t('goToDashboard')}
        </Button>
      </div>
    </div>
  )
}
