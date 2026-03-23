'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { redeemSchema } from '@/modules/eightd/schemas/formSchemas'
import type { z } from 'zod'
import { useTranslations, useLocale } from 'next-intl'
import { LanguageToggle } from '@/components/language-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type RedeemFormData = z.infer<typeof redeemSchema>

export default function UnlockPage() {
  const router = useRouter()
  const locale = useLocale()
  const [loading, setLoading] = useState(false)
  const t = useTranslations('unlock')
  const tApp = useTranslations('app')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RedeemFormData>({
    resolver: zodResolver(redeemSchema),
  })

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/status')
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated) {
            router.replace(`/${locale}/generator`)
            return
          }
        }
      } catch {
        // Ignore errors, user is not authenticated
      }
    }
    checkAuth()
  }, [router])

  async function onSubmit(data: RedeemFormData) {
    setLoading(true)
    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: data.code }),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        toast.error(json.error ?? t('errorInvalid'))
        return
      }

      toast.success(t('success'))
      router.push(`/${locale}/generator`)
    } catch {
      toast.error(t('errorGeneric'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="absolute right-4 top-4">
        <LanguageToggle />
      </div>

      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-neutral-400">
          {tApp('brand')}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">
          {t('heading')}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {t('subtitle')}
        </p>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('cardTitle')}</CardTitle>
          <CardDescription>
            {t('cardDesc')}{' '}
            <a
              href="https://iatf-solutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              iatf-solutions.com
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="code">{t('label')}</Label>
              <Input
                id="code"
                placeholder="XXXX-XXXX-XXXX"
                autoComplete="off"
                autoFocus
                {...register('code')}
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && (
                <p className="text-xs text-red-500">{errors.code.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('loading')}
                </>
              ) : (
                t('button')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
