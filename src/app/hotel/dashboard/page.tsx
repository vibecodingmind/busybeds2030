"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge, formatCurrency, formatDate } from "@/components/shared";
import { Users, CalendarCheck, CreditCard, CheckCircle, ScanSearch, CalendarDays, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Booking {
  id: string;
  code: string;
  status: string;
  checkInDate: string | null;
  checkOutDate: string | null;
  guestName: string | null;
  discountPercent: number | null;
  discountAmount: number | null;
  user: { name: string; email: string; phone: string | null };
  roomType: { name: string; rackRate: number; discountRate: number } | null;
}

export default function HotelDashboard() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch("/api/hotel/bookings");
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const todayArrivals = bookings.filter(
    (b) => b.checkInDate && b.checkInDate.startsWith(todayStr) && b.status === "CONFIRMED"
  );

  const next7Days = new Date(today);
  next7Days.setDate(next7Days.getDate() + 7);
  const upcomingBookings = bookings.filter(
    (b) =>
      b.checkInDate &&
      new Date(b.checkInDate) >= today &&
      new Date(b.checkInDate) <= next7Days &&
      ["RESERVED", "CONFIRMED"].includes(b.status)
  );

  const pendingPayment = bookings.filter((b) => b.status === "RESERVED");
  const totalRedeemed = bookings.filter((b) => b.status === "REDEEMED");

  const formattedDate = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Welcome Banner - glass-card-dark with gradient */}
      <div className="rounded-2xl glass-card-dark p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/10 via-transparent to-[#C9A84C]/5 pointer-events-none" />
        <div className="relative z-10">
          <h2
            className="text-2xl md:text-3xl font-bold text-white"
          >
            Welcome, {session?.user?.name || "Hotel Staff"}
          </h2>
          <p className="text-lg text-gray-300 mt-1">{formattedDate}</p>
        </div>
      </div>

      {/* Stats Cards - glass-card with gold accent borders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl border-l-4 border-l-green-500 p-4 md:p-5">
          <div className="flex items-center gap-2 mb-2">
            <CalendarCheck className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-gray-500">Today&apos;s Arrivals</span>
          </div>
          <p className="text-3xl font-bold text-[#0A1628]">{todayArrivals.length}</p>
        </div>

        <div className="glass-card rounded-2xl border-l-4 border-l-blue-500 p-4 md:p-5">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-gray-500">Upcoming (7 days)</span>
          </div>
          <p className="text-3xl font-bold text-[#0A1628]">{upcomingBookings.length}</p>
        </div>

        <div className="glass-card rounded-2xl border-l-4 border-l-orange-500 p-4 md:p-5">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-medium text-gray-500">Pending Payment</span>
          </div>
          <p className="text-3xl font-bold text-[#0A1628]">{pendingPayment.length}</p>
        </div>

        <div className="glass-card rounded-2xl border-l-4 border-l-[#C9A84C] p-4 md:p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-[#C9A84C]" />
            <span className="text-xs font-medium text-gray-500">Total Redeemed</span>
          </div>
          <p className="text-3xl font-bold text-[#0A1628]">{totalRedeemed.length}</p>
        </div>
      </div>

      {/* Today's Arrivals List */}
      {todayArrivals.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-[#0A1628] mb-3">Today&apos;s Arrivals</h3>
          <div className="space-y-3">
            {todayArrivals.map((booking) => (
              <div key={booking.id} className="glass-card rounded-2xl p-4 hover:shadow-lg transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-[#0A1628]">
                      {booking.guestName || booking.user?.name || "Guest"}
                    </p>
                    <p className="text-base text-gray-600">
                      {booking.roomType?.name || "Standard Room"}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-mono glass-white rounded-lg px-2 py-1 text-[#0A1628]">
                        {booking.code}
                      </span>
                      <StatusBadge status={booking.status} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">
                      Save {formatCurrency(booking.discountAmount)}
                    </p>
                    <Link href={`/hotel/verify?code=${booking.code}`}>
                      <Button
                        size="lg"
                        className="shimmer-gold rounded-xl min-h-[56px] text-lg"
                      >
                        <ScanSearch className="w-5 h-5 mr-2" />
                        Verify
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {todayArrivals.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-lg text-gray-500">No arrivals scheduled for today</p>
        </div>
      )}

      {/* Quick Actions - shimmer-gold effect, large and prominent */}
      <div>
        <h3 className="text-xl font-bold text-[#0A1628] mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/hotel/verify">
            <Button
              size="lg"
              className="w-full shimmer-gold rounded-2xl min-h-[64px] text-xl"
            >
              <ScanSearch className="w-6 h-6 mr-3" />
              Verify Coupon Code
            </Button>
          </Link>
          <Link href="/hotel/bookings">
            <Button
              size="lg"
              variant="outline"
              className="w-full font-bold min-h-[64px] text-xl rounded-2xl border-[#0A1628] text-[#0A1628] hover:bg-[#0A1628] hover:text-white"
            >
              <Users className="w-6 h-6 mr-3" />
              View All Bookings
            </Button>
          </Link>
        </div>
      </div>

      {/* Pending Payments Alert */}
      {pendingPayment.length > 0 && (
        <div className="glass-card rounded-2xl border-l-4 border-l-orange-400 p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-bold text-orange-800">
              Pending Payments ({pendingPayment.length})
            </h3>
          </div>
          <div className="space-y-2">
            {pendingPayment.slice(0, 3).map((booking) => (
              <div
                key={booking.id}
                className="glass-white flex items-center justify-between rounded-xl p-3"
              >
                <div>
                  <p className="font-semibold text-[#0A1628]">
                    {booking.guestName || booking.user?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Check-in: {formatDate(booking.checkInDate)}
                  </p>
                </div>
                <Link href={`/hotel/verify?code=${booking.code}`}>
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
                    Process
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
