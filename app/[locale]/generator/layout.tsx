import { redirect } from 'next/navigation'
import { requireSession } from '@/lib/session/session'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function GeneratorLayout({ children, params }: Props) {
  const { locale } = await params
  
  try {
    await requireSession()
  } catch {
    redirect(`/${locale}/unlock`)
  }

  return <>{children}</>
}
