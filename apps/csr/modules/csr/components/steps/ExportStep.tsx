'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Download, Loader2, RotateCcw, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { CsrFormState } from '../../types'

interface Props {
  form: CsrFormState
  onReset: () => void
}

export function ExportStep({ form, onReset }: Props) {
  const t = useTranslations('csr')
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      const res = await fetch('/api/csr/export-xlsx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matrixRows: form.matrixRows,
          processes: form.processes,
          selectedOems: form.selectedOems,
          companyName: form.companyName,
          companyLocation: form.companyLocation,
          language: form.language,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Export failed' }))
        toast.error(err.error ?? t('exportError'))
        return
      }

      const blob = await res.blob()
      const datePart = new Date().toISOString().slice(0, 10)
      const namePart = form.companyName
        ? form.companyName.replace(/[^a-zA-Z0-9_-]/g, '_')
        : 'Matrix'
      const filename = `CSR_Matrix_${namePart}_${datePart}.xlsx`

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      setDownloaded(true)
      toast.success(t('exportSuccess'))
    } catch {
      toast.error(t('exportError'))
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('exportTitle')}</CardTitle>
          <CardDescription>{t('exportDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="rounded-md bg-neutral-50 p-4 text-sm text-neutral-600">
            <p>
              <strong>{t('totalRequirements')}:</strong> {form.matrixRows.length}
            </p>
            <p>
              <strong>{t('oemsSelected')}:</strong> {form.selectedOems.join(', ')}
            </p>
            <p>
              <strong>{t('processCount')}:</strong> {form.processes.length}
            </p>
            <p>
              <strong>{t('outputLanguage')}:</strong> {form.language === 'de' ? 'Deutsch' : 'English'}
            </p>
          </div>

          {/* Download button */}
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full"
            size="lg"
          >
            {downloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('generating')}
              </>
            ) : downloaded ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('downloadAgain')}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {t('downloadXlsx')}
              </>
            )}
          </Button>

          {/* Expiry notice */}
          <Alert>
            <AlertDescription className="text-xs text-neutral-500">
              {t('expiryNotice')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          {t('startOver')}
        </Button>
      </div>
    </div>
  )
}
