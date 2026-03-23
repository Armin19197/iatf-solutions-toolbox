'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useLocale } from 'next-intl'

interface Props {
  planId: string
  label: string
  className?: string
}

export function RequestQuoteButton({ planId, label, className }: Props) {
  const [loading, setLoading] = useState(false)
  const locale = useLocale()

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setLoading(false)
      }
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/contact/request-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          locale,
        }),
      })

      const payload = await res.json()
      if (!res.ok) {
        throw new Error(payload?.error || 'Failed to send request')
      }

      toast.success('Message has been sent to the provider. They will communicate shortly.')
    } catch (err: unknown) {
      console.error(err)
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      toast.error(message)
    } finally {
      // Typically, keep loading true if navigating away, but here we don't navigate
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleClick} 
      disabled={loading} 
      variant={className ? "default" : "outline"}
      className={cn("w-full transition-all", className || "mt-2 border-dashed border-2 bg-neutral-50 hover:bg-neutral-100")}
    >
      {loading ? (
        <>
           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
           Sending Request...
        </>
      ) : label}
    </Button>
  )
}
