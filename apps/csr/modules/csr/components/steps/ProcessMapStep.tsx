'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProcessEntry, Language } from '../../types'
import { ALL_DEFAULT_PROCESSES, DEFAULT_PROCESSES_DE } from '../../data'
import { MAX_PROCESSES } from '../../lib/constants'

interface Props {
  processes: ProcessEntry[]
  language: Language
  onChange: (processes: ProcessEntry[]) => void
  onNext: () => void
  onBack: () => void
}

let nextId = 100

export function ProcessMapStep({ processes, language, onChange, onNext, onBack }: Props) {
  const t = useTranslations('csr')
  const [showDefaults, setShowDefaults] = useState(false)

  function addProcess() {
    if (processes.length >= MAX_PROCESSES) return
    const id = `P-USR-${String(++nextId).padStart(3, '0')}`
    onChange([...processes, { id, name: '', owner: '' }])
  }

  function removeProcess(id: string) {
    onChange(processes.filter((p) => p.id !== id))
  }

  function updateProcess(id: string, field: keyof ProcessEntry, value: string) {
    onChange(
      processes.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    )
  }

  function loadDefaults() {
    const mapped = ALL_DEFAULT_PROCESSES.map((p) => ({
      ...p,
      name: language === 'de' ? (DEFAULT_PROCESSES_DE[p.id] ?? p.name) : p.name,
    }))
    onChange(mapped)
    setShowDefaults(false)
  }

  const canProceed = processes.length > 0 && processes.every((p) => p.name.trim().length > 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{t('step2Title')}</CardTitle>
              <CardDescription>{t('step2Desc')}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDefaults(!showDefaults)}
            >
              {showDefaults ? <ChevronUp className="mr-1.5 h-3 w-3" /> : <ChevronDown className="mr-1.5 h-3 w-3" />}
              {t('templateProcesses')}
            </Button>
          </div>
        </CardHeader>

        {showDefaults && (
          <CardContent className="border-b border-neutral-100 bg-blue-50/50 pb-4">
            <p className="mb-3 text-sm text-neutral-600">{t('templateProcessesDesc')}</p>
            <Button variant="secondary" size="sm" onClick={loadDefaults}>
              {t('loadDefaultProcesses')}
            </Button>
          </CardContent>
        )}

        <CardContent className="space-y-3 pt-4">
          {processes.map((process, idx) => (
            <div key={process.id} className="flex items-end gap-2">
              <span className="mb-2 w-6 shrink-0 text-center text-xs text-neutral-400">
                {idx + 1}
              </span>
              <div className="flex-1 space-y-1">
                {idx === 0 && <Label className="text-xs">{t('processName')}</Label>}
                <Input
                  value={process.name}
                  onChange={(e) => updateProcess(process.id, 'name', e.target.value)}
                  placeholder={t('processNamePh')}
                />
              </div>
              <div className="w-40 space-y-1">
                {idx === 0 && <Label className="text-xs">{t('processOwner')}</Label>}
                <Input
                  value={process.owner ?? ''}
                  onChange={(e) => updateProcess(process.id, 'owner', e.target.value)}
                  placeholder={t('processOwnerPh')}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="mb-0.5 shrink-0 text-neutral-400 hover:text-red-500"
                onClick={() => removeProcess(process.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={addProcess}
            disabled={processes.length >= MAX_PROCESSES}
            className="mt-2"
          >
            <Plus className="mr-1.5 h-3 w-3" />
            {t('addProcess')}
          </Button>
        </CardContent>
      </Card>

      {!canProceed && processes.length > 0 && (
        <p className="text-center text-sm text-red-500">{t('allProcessesNeedName')}</p>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          {t('backOemSelection')}
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          {t('nextGenerateMatrix')}
        </Button>
      </div>
    </div>
  )
}
