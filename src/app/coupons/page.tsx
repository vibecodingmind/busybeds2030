'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Ticket,
  Clock,
  QrCode,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

interface CouponData {
  id: string
  code: string
  status: string
  hotelId: string | null
  checkInDate: string | null
  checkOutDate: string | null
  paymentDeadline: string | null
  discountPercent: number | null
  discountAmount: number | null
  createdAt: string
  updatedAt: string
  hotel: { name: string; city: string } | null
  roomType: { name: string; rackRate: number; discountRate: number } | null
}

function formatTimeLeft(deadline: string): string {
  const now = new Date().getTime()
  const target = new Date(deadline).getTime()
  const diff = target - now

  if (diff <= 0) return 'Expired'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  if (hours < 1) return `${minutes}m ${seconds}s`
  return `${hours}h ${minutes}m ${seconds}s`
}

function CountdownTimer({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(deadline))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(deadline))
    }, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  const isUrgent =
    new Date(deadline).getTime() - new Date().getTime() < 3600000 &&
    new Date(deadline).getTime() > new Date().getTime()

  return (
    <div
      className={`rounded-lg p-2 text-center backdrop-blur-sm ${
        isUrgent ? 'glass-red' : 'glass-gold'
      }`}
    >
      <Clock
        className={`mx-auto h-4 w-4 ${isUrgent ? 'text-red-500' : 'text-orange-500'}`}
      />
      <p
        className={`mt-1 font-mono text-sm font-bold ${
          isUrgent ? 'text-red-600' : 'text-orange-600'
        }`}
      >
        {timeLeft}
      </p>
      <p className="text-xs text-gray-500">to pay deposit</p>
    </div>
  )
}

function getStatusBadge(status: string) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    AVAILABLE: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Available' },
    RESERVED: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Reserved' },
    CONFIRMED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed' },
    REDEEMED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Redeemed' },
    EXPIRED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expired' },
    NO_SHOW: { bg: 'bg-red-200', text: 'text-red-800', label: 'No Show' },
    CANCELLED: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Cancelled' },
  }
  const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status }
  return (
    <Badge className={`${c.bg} ${c.text} border-0 font-medium backdrop-blur-sm`}>
      {c.label}
    </Badge>
  )
}

function CouponCard({
  coupon,
  onUseCoupon,
}: {
  coupon: CouponData
  onUseCoupon: (coupon: CouponData) => void
}) {
  return (
    <Card className="glass-card overflow-hidden rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {getStatusBadge(coupon.status)}
            </div>

            {/* Coupon Code */}
            <div className="glass-card-dark rounded-lg p-3">
              <p className="glow-gold font-mono text-lg font-bold tracking-wider text-[#C9A84C]">
                {coupon.code}
              </p>
            </div>

            {/* QR Placeholder */}
            <div className="flex items-center gap-3">
              <div className="glass-gold flex h-16 w-16 items-center justify-center rounded-lg">
                <QrCode className="h-8 w-8 text-[#0A1628]/50" />
              </div>
              <div className="flex-1 space-y-1">
                {coupon.hotel && (
                  <p className="text-sm font-medium text-[#0A1628]">
                    {coupon.hotel.name}
                  </p>
                )}
                {coupon.checkInDate && coupon.checkOutDate && (
                  <p className="text-xs text-gray-500">
                    {new Date(coupon.checkInDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    —{' '}
                    {new Date(coupon.checkOutDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                )}
                {coupon.discountPercent && (
                  <p className="text-xs font-medium text-[#C9A84C]">
                    {coupon.discountPercent}% discount
                  </p>
                )}
                {coupon.roomType && (
                  <p className="text-xs text-gray-400">
                    {coupon.roomType.name}: TZS {coupon.roomType.discountRate.toLocaleString()} /night
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Countdown timer for RESERVED */}
          {coupon.status === 'RESERVED' && coupon.paymentDeadline && (
            <CountdownTimer deadline={coupon.paymentDeadline} />
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4">
          {coupon.status === 'AVAILABLE' && (
            <Button
              className="w-full shimmer-gold text-[#0A1628] hover:bg-[#C9A84C]/90 font-semibold"
              onClick={() => onUseCoupon(coupon)}
            >
              <Ticket className="mr-2 h-4 w-4" />
              Use This Coupon
            </Button>
          )}
          {coupon.status === 'RESERVED' && (
            <Button
              variant="outline"
              className="w-full glass-pill border-orange-200 text-orange-700 hover:bg-orange-50/50"
            >
              View Details
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          )}
          {coupon.status === 'CONFIRMED' && (
            <Button
              variant="outline"
              className="w-full glass-pill border-green-200 text-green-700 hover:bg-green-50/50"
            >
              View Coupon
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          )}
          {['REDEEMED', 'EXPIRED', 'NO_SHOW', 'CANCELLED'].includes(
            coupon.status
          ) && (
            <div className="text-center">
              <p className="text-xs text-gray-400">
                This coupon is no longer active
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function CouponsPage() {
  const router = useRouter()
  const [coupons, setCoupons] = useState<CouponData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    async function fetchCoupons() {
      try {
        const res = await fetch('/api/coupons')
        if (res.ok) {
          const data = await res.json()
          setCoupons(data.coupons || [])
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchCoupons()
  }, [])

  function handleUseCoupon(coupon: CouponData) {
    if (coupon.hotelId) {
      router.push(`/coupons/use?hotelId=${coupon.hotelId}`)
    } else {
      router.push('/hotels')
    }
  }

  const filteredCoupons = coupons.filter((c) => {
    switch (activeTab) {
      case 'available':
        return c.status === 'AVAILABLE'
      case 'active':
        return c.status === 'RESERVED' || c.status === 'CONFIRMED'
      case 'used':
        return c.status === 'REDEEMED'
      case 'expired':
        return (
          c.status === 'EXPIRED' ||
          c.status === 'NO_SHOW' ||
          c.status === 'CANCELLED'
        )
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1628]">My Coupons</h1>
        <p className="mt-1 text-sm text-gray-500">
          {coupons.length} total coupon{coupons.length !== 1 ? 's' : ''}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="all" className="glass-pill">All</TabsTrigger>
          <TabsTrigger value="available" className="glass-pill">Available</TabsTrigger>
          <TabsTrigger value="active" className="glass-pill">Active</TabsTrigger>
          <TabsTrigger value="used" className="glass-pill">Used</TabsTrigger>
          <TabsTrigger value="expired" className="glass-pill">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredCoupons.length === 0 ? (
            <Card className="glass-card rounded-2xl">
              <CardContent className="py-12 text-center">
                <Ticket className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-3 text-gray-500">
                  No coupons found in this category
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCoupons.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  onUseCoupon={handleUseCoupon}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
