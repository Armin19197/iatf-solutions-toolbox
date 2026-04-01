'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { OemId, Language } from '../../types'
import { OEM_CATALOG } from '../../data'

interface Props {
  selectedOems: OemId[]
  language: Language
  onChangeOems: (oems: OemId[]) => void
  onChangeLanguage: (lang: Language) => void
  companyName: string
  companyLocation: string
  onChangeCompanyName: (v: string) => void
  onChangeCompanyLocation: (v: string) => void
  onNext: () => void
}

export function OemSelectionStep({
  selectedOems,
  language,
  onChangeOems,
  onChangeLanguage,
  companyName,
  companyLocation,
  onChangeCompanyName,
  onChangeCompanyLocation,
  onNext,
}: Props) {
  const t = useTranslations('csr')

  function toggleOem(oemId: OemId) {
    if (selectedOems.includes(oemId)) {
      onChangeOems(selectedOems.filter((id) => id !== oemId))
    } else {
      onChangeOems([...selectedOems, oemId])
    }
  }

  const canProceed = selectedOems.length > 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('step1Title')}</CardTitle>
          <CardDescription>{t('step1Desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {OEM_CATALOG.map((oem) => {
              const checked = selectedOems.includes(oem.id)
              return (
                <label
                  key={oem.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                    checked
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleOem(oem.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900">
                      {oem.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {oem.csrCount} {t('requirements')}
                      </Badge>
                      <span className="text-[10px] text-neutral-400">
                        {t('lastUpdate')}: {oem.lastUpdate}
                      </span>
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('optionalInfo')}</CardTitle>
          <CardDescription>{t('optionalInfoDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="companyName">{t('companyName')}</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => onChangeCompanyName(e.target.value)}
                placeholder={t('companyNamePh')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyLocation">{t('companyLocation')}</Label>
              <Input
                id="companyLocation"
                value={companyLocation}
                onChange={(e) => onChangeCompanyLocation(e.target.value)}
                placeholder={t('companyLocationPh')}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t('outputLanguage')}</Label>
            <Select value={language} onValueChange={(v) => onChangeLanguage(v as Language)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!canProceed && (
        <p className="text-center text-sm text-red-500">{t('selectAtLeastOneOem')}</p>
      )}

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!canProceed}>
          {t('nextProcessMap')}
        </Button>
      </div>
    </div>
  )
}
