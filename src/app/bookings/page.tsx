'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  History,
  Clock,
  CalendarDays,
  Filter,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  return `${hours}h ${minutes}m`
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
    <span
      className={`font-mono text-xs font-bold ${
        isUrgent ? 'text-red-600' : 'text-orange-600'
      }`}
    >
      <Clock className="mr-1 inline h-3 w-3" />
      {timeLeft}
    </span>
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
    <Badge className={`${c.bg} ${c.text} border-0 text-xs font-medium backdrop-blur-sm`}>
      {c.label}
    </Badge>
  )
}

export default function BookingsPage() {
  const router = useRouter()
  const [coupons, setCoupons] = useState<CouponData[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    async function fetchCoupons() {
      try {
        const res = await fetch('/api/coupons')
        if (res.ok) {
          const data = await res.json()
          // Only show bookings (coupons with hotel assigned)
          const bookings = (data.coupons || []).filter(
            (c: CouponData) => c.hotelId !== null
          )
          setCoupons(bookings)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchCoupons()
  }, [])

  const filteredBookings =
    statusFilter === 'ALL'
      ? coupons
      : coupons.filter((c) => c.status === statusFilter)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-40" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">
            Booking History
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {coupons.length} booking{coupons.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="glass-pill w-40 focus:border-[#C9A84C]/50">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="RESERVED">Reserved</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="REDEEMED">Redeemed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="NO_SHOW">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <Card className="glass-card rounded-2xl">
          <CardContent className="py-12 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-[#0A1628]">
              No bookings found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter !== 'ALL'
                ? 'No bookings match this filter. Try another status.'
                : 'You haven\'t made any bookings yet. Browse hotels to get started!'}
            </p>
            {statusFilter === 'ALL' && (
              <Button
                className="mt-4 shimmer-gold text-[#0A1628] hover:bg-[#C9A84C]/90"
                onClick={() => router.push('/hotels')}
              >
                Browse Hotels
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Desktop table header */}
          <div className="hidden glass-card-dark rounded-lg px-4 py-3 text-xs font-medium text-white/70 md:grid md:grid-cols-5 md:gap-4">
            <span>Hotel</span>
            <span>Check-in</span>
            <span>Check-out</span>
            <span>Status</span>
            <span>Coupon Code</span>
          </div>

          {/* Booking rows */}
          {filteredBookings.map((booking) => (
            <Card
              key={booking.id}
              className="glass-card cursor-pointer rounded-2xl transition-shadow hover:shadow-md"
              onClick={() => router.push('/coupons')}
            >
              <CardContent className="p-0">
                {/* Mobile layout */}
                <div className="p-4 space-y-2 md:hidden">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#0A1628]">
                      {booking.hotel?.name || 'Unknown Hotel'}
                    </p>
                    {getStatusBadge(booking.status)}
                  </div>
                  {booking.checkInDate && booking.checkOutDate && (
                    <p className="text-sm text-gray-500">
                      {new Date(booking.checkInDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      —{' '}
                      {new Date(booking.checkOutDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs text-gray-400">
                      {booking.code}
                    </p>
                    {booking.status === 'RESERVED' && booking.paymentDeadline && (
                      <CountdownTimer deadline={booking.paymentDeadline} />
                    )}
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden items-center px-4 py-3 md:grid md:grid-cols-5 md:gap-4">
                  <span className="font-medium text-[#0A1628]">
                    {booking.hotel?.name || 'Unknown'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {booking.checkInDate
                      ? new Date(booking.checkInDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {booking.checkOutDate
                      ? new Date(booking.checkOutDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </span>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(booking.status)}
                    {booking.status === 'RESERVED' &&
                      booking.paymentDeadline && (
                        <CountdownTimer deadline={booking.paymentDeadline} />
                      )}
                  </div>
                  <span className="font-mono text-xs text-gray-500">
                    {booking.code}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
