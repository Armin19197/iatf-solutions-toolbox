import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function CheckoutSuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4">
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-4">
            <span className="text-4xl text-green-600">✓</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Payment Successful</CardTitle>
          <CardDescription className="text-base text-gray-600 mt-2">
            Your credit code(s) are being delivered to your email. This usually takes less than 60 seconds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Didn't receive an email? Check your spam folder or contact support.
            </p>
            <div className="pt-4">
              <Link 
                href="/en/unlock" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2"
              >
                Return to Login / Redeem
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
