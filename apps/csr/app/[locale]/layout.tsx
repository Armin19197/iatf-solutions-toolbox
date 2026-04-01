import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/lib/i18n/routing'
import '../globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CSR Matrix — IATF Solutions',
  description: 'Customer Specific Requirements Matrix for automotive quality management.',
}

// Generate static params for supported locales
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  // Await the params as required in Next.js 16+
  const { locale } = await params
  
  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster richColors position="top-center" />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}