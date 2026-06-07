'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { BedDouble, CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function PaymentCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'completed' | 'failed' | 'pending'>('checking')
  const [pollCount, setPollCount] = useState(0)

  const orderTrackingId = searchParams.get('OrderTrackingId')
  const merchantReference = searchParams.get('OrderMerchantReference')

  useEffect(() => {
    if (!orderTrackingId) {
      setStatus('failed')
      return
    }

    pollPaymentStatus()
  }, [orderTrackingId])

  async function pollPaymentStatus() {
    if (!orderTrackingId) return

    try {
      const res = await fetch(`/api/payment/status/${orderTrackingId}`)
      const data = await res.json()

      if (data.status === 'COMPLETED') {
        setStatus('completed')
        return
      }

      if (data.status === 'FAILED') {
        setStatus('failed')
        return
      }

      // Still pending - poll again if under 10 attempts
      setPollCount((prev) => {
        const newCount = prev + 1
        if (newCount < 10) {
          setTimeout(pollPaymentStatus, 3000)
        } else {
          setStatus('pending')
        }
        return newCount
      })
    } catch {
      setPollCount((prev) => {
        const newCount = prev + 1
        if (newCount < 10) {
          setTimeout(pollPaymentStatus, 3000)
        } else {
          setStatus('pending')
        }
        return newCount
      })
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden bg-glass-gradient px-4 py-8">
      <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-[#C9A84C]/10 blur-[100px] float" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-[#C9A84C]/8 blur-[80px] float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2.5">
            <BedDouble className="h-7 w-7 text-[#C9A84C] drop-shadow-[0_0_12px_rgba(201,168,76,0.4)]" />
            <span className="text-xl font-bold text-[#C9A84C]">BusyBeds</span>
          </span>
        </div>

        <Card className="glass-card-dark rounded-2xl border-white/10">
          <CardHeader className="text-center">
            {status === 'checking' && (
              <>
                <Loader2 className="mx-auto h-16 w-16 animate-spin text-[#C9A84C]" />
                <CardTitle className="mt-4 text-xl text-white">
                  Verifying Payment
                </CardTitle>
              </>
            )}
            {status === 'completed' && (
              <>
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-400" />
                <CardTitle className="mt-4 text-xl text-white">
                  Payment Successful!
                </CardTitle>
              </>
            )}
            {status === 'failed' && (
              <>
                <XCircle className="mx-auto h-16 w-16 text-red-400" />
                <CardTitle className="mt-4 text-xl text-white">
                  Payment Failed
                </CardTitle>
              </>
            )}
            {status === 'pending' && (
              <>
                <Clock className="mx-auto h-16 w-16 text-amber-400" />
                <CardTitle className="mt-4 text-xl text-white">
                  Payment Processing
                </CardTitle>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            {status === 'checking' && (
              <p className="text-sm text-white/50">
                Please wait while we confirm your payment with PesaPal...
              </p>
            )}
            {status === 'completed' && (
              <>
                <p className="text-sm text-white/70">
                  Your subscription is now active! Your discount coupons are ready to use.
                </p>
                <Button
                  className="shimmer-gold text-[#0A1628] hover:bg-[#C9A84C]/90 h-11 w-full font-semibold rounded-xl"
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </>
            )}
            {status === 'failed' && (
              <>
                <p className="text-sm text-white/70">
                  Your payment could not be processed. Please try again.
                </p>
                <Button
                  className="shimmer-gold text-[#0A1628] hover:bg-[#C9A84C]/90 h-11 w-full font-semibold rounded-xl"
                  onClick={() => router.push('/subscription')}
                >
                  Try Again
                </Button>
              </>
            )}
            {status === 'pending' && (
              <>
                <p className="text-sm text-white/70">
                  Your payment is still being processed. We&apos;ll notify you once it&apos;s confirmed.
                  You can check your subscription status from the dashboard.
                </p>
                <Button
                  className="shimmer-gold text-[#0A1628] hover:bg-[#C9A84C]/90 h-11 w-full font-semibold rounded-xl"
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </>
            )}
            {merchantReference && (
              <p className="text-xs text-white/30 mt-4">
                Reference: {merchantReference}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-glass-gradient">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#C9A84C]" />
            <p className="mt-2 text-white/50">Loading...</p>
          </div>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  )
}
