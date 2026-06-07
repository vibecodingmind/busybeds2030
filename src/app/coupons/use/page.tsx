'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Phone,
  Mail,
  QrCode,
  CheckCircle2,
  Copy,
  MessageSquare,
  Shield,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface HotelData {
  id: string
  name: string
  city: string
  country: string
  description: string
  starRating: number
  contactEmail: string | null
  contactPhone: string | null
  depositPolicy: string
  roomTypes: Array<{
    id: string
    name: string
    rackRate: number
    discountRate: number
    discountPercent: number
    description: string | null
  }>
}

interface CouponData {
  id: string
  code: string
  status: string
  hotelId: string | null
  discountPercent: number | null
  discountAmount: number | null
  hotel: { name: string; city: string } | null
  roomType: { name: string; rackRate: number; discountRate: number } | null
}

function UseCouponContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const hotelId = searchParams.get('hotelId')

  const [hotel, setHotel] = useState<HotelData | null>(null)
  const [coupon, setCoupon] = useState<CouponData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingCoupon, setUsingCoupon] = useState(false)

  useEffect(() => {
    if (!hotelId) {
      setError('No hotel specified. Please go back and select a hotel.')
      setLoading(false)
      return
    }

    async function fetchData() {
      try {
        // Fetch hotel details
        const hotelRes = await fetch(`/api/hotels/${hotelId}`)
        if (!hotelRes.ok) {
          setError('Hotel not found')
          setLoading(false)
          return
        }
        const hotelData = await hotelRes.json()
        setHotel(hotelData.hotel)

        // Use coupon for this hotel
        setUsingCoupon(true)
        const couponRes = await fetch('/api/coupons/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hotelId,
            roomTypeId: hotelData.hotel.roomTypes?.[0]?.id || null,
          }),
        })

        if (!couponRes.ok) {
          const errData = await couponRes.json()
          setError(errData.error || 'Failed to assign coupon')
          setLoading(false)
          return
        }

        const couponData = await couponRes.json()
        setCoupon(couponData.coupon)
      } catch {
        setError('Something went wrong')
      } finally {
        setLoading(false)
        setUsingCoupon(false)
      }
    }

    fetchData()
  }, [hotelId])

  function handleCopyCode() {
    if (coupon?.code) {
      navigator.clipboard.writeText(coupon.code)
      toast.success('Coupon code copied!')
    }
  }

  const depositPolicyLabels: Record<string, string> = {
    FIFTY_PERCENT: '50% deposit required',
    FULL: 'Full payment required upfront',
    NONE: 'No deposit required',
    CARD_HOLD: 'Card hold for deposit',
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="glass-card rounded-2xl border-red-200">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
            <h2 className="mt-4 text-lg font-semibold text-[#0A1628]">
              {error}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Please make sure you have an active subscription with remaining
              coupons.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button
                variant="outline"
                className="glass-pill"
                onClick={() => router.push('/coupons')}
              >
                View My Coupons
              </Button>
              <Button
                className="shimmer-gold text-[#0A1628] hover:bg-[#C9A84C]/90"
                onClick={() => router.push('/subscription')}
              >
                Get Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const rackRate = coupon?.roomType?.rackRate || hotel?.roomTypes?.[0]?.rackRate || 0
  const discountRate = coupon?.roomType?.discountRate || hotel?.roomTypes?.[0]?.discountRate || 0
  const savings = rackRate - discountRate
  const discountPercent = coupon?.discountPercent || hotel?.roomTypes?.[0]?.discountPercent || 0
  const roomName = coupon?.roomType?.name || hotel?.roomTypes?.[0]?.name || 'Standard Room'

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1628]">Your Coupon</h1>
        <p className="mt-1 text-sm text-gray-500">
          Use this coupon when contacting the hotel
        </p>
      </div>

      {/* Hotel Summary */}
      {hotel && (
        <Card className="glass-card rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#0A1628]">{hotel.name}</CardTitle>
                <CardDescription>
                  {hotel.city}, {hotel.country} · {'★'.repeat(hotel.starRating)}
                </CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200 backdrop-blur-sm">
                Coupon Assigned
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{hotel.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Coupon Code Card */}
      {coupon && (
        <Card className="glass-card rounded-2xl">
          <CardContent className="space-y-4 py-6">
            {/* Coupon Code */}
            <div className="glass-card-dark rounded-xl p-6 text-center">
              <p className="text-xs text-white/50">Your Coupon Code</p>
              <p className="glow-gold mt-2 font-mono text-3xl font-bold tracking-widest text-[#C9A84C]">
                {coupon.code}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-white/60 hover:text-white hover:bg-white/10"
                onClick={handleCopyCode}
              >
                <Copy className="mr-1 h-3.5 w-3.5" />
                Copy Code
              </Button>
            </div>

            {/* QR Placeholder */}
            <div className="flex items-center justify-center">
              <div className="glass-gold flex h-32 w-32 items-center justify-center rounded-xl">
                <div className="text-center">
                  <QrCode className="mx-auto h-10 w-10 text-[#0A1628]/40" />
                  <p className="mt-1 text-xs text-[#0A1628]/60">QR Code</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hotel Contact Details */}
      {hotel && (hotel.contactPhone || hotel.contactEmail) && (
        <Card className="glass-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-[#0A1628]">
              Hotel Contact Details
            </CardTitle>
            <CardDescription>
              Contact the hotel directly to make your booking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hotel.contactPhone && (
              <div className="glass-gold flex items-center gap-3 rounded-lg p-3">
                <Phone className="h-5 w-5 text-[#0A1628]" />
                <div>
                  <p className="text-xs text-[#0A1628]/70">Phone</p>
                  <a
                    href={`tel:${hotel.contactPhone}`}
                    className="font-semibold text-[#0A1628] hover:text-[#C9A84C]"
                  >
                    {hotel.contactPhone}
                  </a>
                </div>
              </div>
            )}
            {hotel.contactEmail && (
              <div className="glass-gold flex items-center gap-3 rounded-lg p-3">
                <Mail className="h-5 w-5 text-[#0A1628]" />
                <div>
                  <p className="text-xs text-[#0A1628]/70">Email</p>
                  <a
                    href={`mailto:${hotel.contactEmail}`}
                    className="font-semibold text-[#0A1628] hover:text-[#C9A84C]"
                  >
                    {hotel.contactEmail}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Discount Details */}
      <Card className="glass-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg text-[#0A1628]">
            Discount Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Room Type</span>
              <span className="font-medium text-[#0A1628]">{roomName}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Rack Rate</span>
              <span className="text-gray-400 line-through">
                TZS {rackRate.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Your Rate</span>
              <span className="text-lg font-bold text-[#0A1628]">
                TZS {discountRate.toLocaleString()}
              </span>
            </div>
            <Separator />
            <div className="glass-gold flex items-center justify-between rounded-lg p-3">
              <span className="text-sm font-medium text-[#0A1628]">
                You Save
              </span>
              <span className="text-lg font-bold text-[#0A1628]">
                TZS {savings.toLocaleString()} ({discountPercent}%)
              </span>
            </div>
          </div>

          {/* Deposit Policy */}
          <div className="glass-white mt-4 flex items-center gap-2 rounded-lg border border-amber-200 p-3">
            <Shield className="h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700">
              <span className="font-semibold">Deposit Policy:</span>{' '}
              {hotel
                ? depositPolicyLabels[hotel.depositPolicy] || hotel.depositPolicy
                : 'Contact hotel for details'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Script Suggestion */}
      <Card className="glass-card rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-[#0A1628]">
            <MessageSquare className="h-5 w-5 text-[#C9A84C]" />
            What to Say
          </CardTitle>
          <CardDescription>
            Use this script when contacting the hotel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="glass-white rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
            &quot;Hello, I was referred by BusyBeds. I have a{' '}
            <span className="font-semibold text-[#C9A84C]">
              {discountPercent}% discount coupon
            </span>
            . Do you have availability for my dates? My discounted rate would be{' '}
            <span className="font-semibold text-[#C9A84C]">
              TZS {discountRate.toLocaleString()}
            </span>
            .&quot;
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Instructions */}
      <Card className="glass-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg text-[#0A1628]">
            How to Use Your Coupon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {[
              {
                step: 1,
                text: 'Contact the hotel using the details above',
                icon: Phone,
              },
              {
                step: 2,
                text: 'Provide your coupon code when asked',
                icon: Copy,
              },
              {
                step: 3,
                text: 'The hotel will reserve your booking',
                icon: CheckCircle2,
              },
              {
                step: 4,
                text: 'Pay your deposit within the time limit',
                icon: Shield,
              },
              {
                step: 5,
                text: 'Show your coupon at check-in',
                icon: QrCode,
              },
            ].map((item) => (
              <li key={item.step} className="glass-card flex items-start gap-3 rounded-lg p-3">
                <div className="glow-gold flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A1628] text-sm font-bold text-[#C9A84C]">
                  {item.step}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <item.icon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{item.text}</span>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pb-6">
        <Button
          variant="outline"
          className="glass-pill flex-1"
          onClick={() => router.push('/coupons')}
        >
          View All Coupons
        </Button>
        <Button
          className="flex-1 bg-[#0A1628] text-white hover:bg-[#0A1628]/90"
          onClick={() => router.push('/dashboard')}
        >
          Go to Dashboard
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function UseCouponPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl space-y-6"><div className="h-10 w-48 bg-gray-200 animate-pulse rounded" /><div className="h-64 w-full bg-gray-200 animate-pulse rounded" /></div>}>
      <UseCouponContent />
    </Suspense>
  )
}
