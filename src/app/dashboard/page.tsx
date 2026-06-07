"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Ticket,
  Building2,
  Clock,
  ArrowRight,
  History,
  CreditCard,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SubscriptionData {
  id: string;
  package: string;
  creditsTotal: number;
  creditsUsed: number;
  creditsRemaining: number;
  startDate: string;
  renewalDate: string;
  status: string;
}

interface CouponData {
  id: string;
  code: string;
  status: string;
  hotelId: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  paymentDeadline: string | null;
  discountPercent: number | null;
  discountAmount: number | null;
  createdAt: string;
  updatedAt: string;
  hotel: { name: string; city: string } | null;
  roomType: { name: string; rackRate: number; discountRate: number } | null;
}

function formatTimeLeft(deadline: string): string {
  const now = new Date().getTime();
  const target = new Date(deadline).getTime();
  const diff = target - now;
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  if (hours < 1) return `${minutes}m ${seconds}s`;
  return `${hours}h ${minutes}m ${seconds}s`;
}

function CountdownTimer({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(deadline));
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);
  const isUrgent =
    new Date(deadline).getTime() - new Date().getTime() < 3600000 &&
    new Date(deadline).getTime() > new Date().getTime();
  return (
    <span
      className={cn(
        "text-sm font-mono font-bold px-3 py-1 rounded-lg",
        isUrgent
          ? "bg-red-500/20 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
          : "bg-white/5 text-[#0A1628]"
      )}
    >
      <Clock className="mr-1 inline h-3.5 w-3.5" />
      {timeLeft}
    </span>
  );
}

function getStatusBadge(status: string) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    AVAILABLE: {
      bg: "bg-blue-500/15 border-blue-500/20",
      text: "text-blue-400",
      label: "Available",
    },
    RESERVED: {
      bg: "bg-orange-500/15 border-orange-500/20",
      text: "text-orange-400",
      label: "Reserved",
    },
    CONFIRMED: {
      bg: "bg-green-500/15 border-green-500/20",
      text: "text-green-400",
      label: "Confirmed",
    },
    REDEEMED: {
      bg: "bg-gray-500/15 border-gray-500/20",
      text: "text-gray-400",
      label: "Redeemed",
    },
    EXPIRED: {
      bg: "bg-red-500/15 border-red-500/20",
      text: "text-red-400",
      label: "Expired",
    },
    NO_SHOW: {
      bg: "bg-red-600/15 border-red-600/20",
      text: "text-red-500",
      label: "No Show",
    },
    CANCELLED: {
      bg: "bg-slate-500/15 border-slate-500/20",
      text: "text-slate-400",
      label: "Cancelled",
    },
  };
  const c = config[status] || {
    bg: "bg-gray-500/15 border-gray-500/20",
    text: "text-gray-400",
    label: status,
  };
  return (
    <Badge
      className={`${c.bg} ${c.text} border backdrop-blur-sm font-medium`}
    >
      {c.label}
    </Badge>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [subRes, couponRes] = await Promise.all([
          fetch("/api/subscription"),
          fetch("/api/coupons"),
        ]);
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubscription(subData.subscription);
        }
        if (couponRes.ok) {
          const couponData = await couponRes.json();
          setCoupons(couponData.coupons || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const availableCoupons = coupons.filter((c) => c.status === "AVAILABLE");
  const activeBookings = coupons.filter(
    (c) => c.status === "RESERVED" || c.status === "CONFIRMED"
  );
  const recentActivity = coupons.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-glass-gradient p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#C9A84C]/10 blur-[60px]" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-[#C9A84C]" />
            <span className="text-xs text-white/40 uppercase tracking-wider font-medium">
              Welcome Back
            </span>
          </div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Hello, {session?.user?.name || "Guest"}!
          </h1>
          <p className="mt-2 text-white/50">
            You have{" "}
            <span className="font-bold text-[#C9A84C] drop-shadow-[0_0_8px_rgba(201,168,76,0.3)]">
              {subscription?.creditsRemaining ?? availableCoupons.length}
            </span>{" "}
            coupons remaining
          </p>
        </div>
      </div>

      {/* No Subscription CTA */}
      {!subscription && (
        <div className="glass-gold rounded-2xl p-6">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#C9A84C]/20">
              <CreditCard className="h-6 w-6 text-[#C9A84C]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#0A1628]">
                No Active Subscription
              </h3>
              <p className="text-sm text-[#0A1628]/60">
                Subscribe to start using discount coupons at partner hotels.
              </p>
            </div>
            <Link href="/subscription">
              <Button className="shimmer-gold rounded-xl font-semibold">
                Subscribe Now
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Subscription Status Card */}
      {subscription && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#0A1628]">
                {subscription.package} Plan
              </h3>
              <p className="text-sm text-muted-foreground">
                Your subscription status
              </p>
            </div>
            <Badge className="bg-green-500/15 text-green-600 border-green-500/20 border backdrop-blur-sm">
              Active
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-[#0A1628]/5 p-3">
              <p className="text-xs text-muted-foreground">Package</p>
              <p className="font-semibold text-[#0A1628]">
                {subscription.package}
              </p>
            </div>
            <div className="rounded-xl bg-[#0A1628]/5 p-3">
              <p className="text-xs text-muted-foreground">Renewal Date</p>
              <p className="font-semibold text-[#0A1628]">
                {new Date(subscription.renewalDate).toLocaleDateString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </p>
            </div>
            <div className="rounded-xl bg-[#0A1628]/5 p-3">
              <p className="text-xs text-muted-foreground">Credits Used</p>
              <p className="font-semibold text-[#0A1628]">
                {subscription.creditsUsed} /{" "}
                {subscription.creditsTotal === 999
                  ? "∞"
                  : subscription.creditsTotal}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Credits Usage</span>
              <span>
                {subscription.creditsTotal === 999
                  ? "Unlimited"
                  : `${Math.round(
                      (subscription.creditsUsed / subscription.creditsTotal) *
                        100
                    )}%`}
              </span>
            </div>
            <Progress
              value={
                subscription.creditsTotal === 999
                  ? 10
                  : (subscription.creditsUsed / subscription.creditsTotal) * 100
              }
              className="h-2"
            />
          </div>
        </div>
      )}

      {/* Active Bookings */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0A1628]">
            Active Bookings
          </h2>
          <Link
            href="/bookings"
            className="text-sm font-medium text-[#C9A84C] hover:underline"
          >
            View All
          </Link>
        </div>

        {activeBookings.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm text-muted-foreground">
              No active bookings yet
            </p>
            <Link href="/hotels">
              <Button
                variant="outline"
                className="mt-3 rounded-xl border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/10"
              >
                Browse Hotels
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeBookings.map((coupon) => (
              <div
                key={coupon.id}
                className="glass-card rounded-2xl p-4 transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[#0A1628]">
                        {coupon.hotel?.name || "Hotel"}
                      </p>
                      {getStatusBadge(coupon.status)}
                    </div>
                    {coupon.checkInDate && coupon.checkOutDate && (
                      <p className="text-sm text-muted-foreground">
                        {new Date(coupon.checkInDate).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short" }
                        )}{" "}
                        —{" "}
                        {new Date(coupon.checkOutDate).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    )}
                    <p className="font-mono text-xs text-muted-foreground">
                      {coupon.code}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {coupon.status === "RESERVED" &&
                      coupon.paymentDeadline && (
                        <CountdownTimer deadline={coupon.paymentDeadline} />
                      )}
                    <Link href="/coupons">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/10"
                      >
                        View
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-[#0A1628]">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/hotels">
            <div className="glass-card group flex cursor-pointer items-center gap-4 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A1628] shadow-md">
                <Building2 className="h-5 w-5 text-[#C9A84C]" />
              </div>
              <div>
                <p className="font-bold text-[#0A1628]">Browse Hotels</p>
                <p className="text-xs text-muted-foreground">
                  Find your next stay
                </p>
              </div>
            </div>
          </Link>
          <Link href="/coupons">
            <div className="glass-card group flex cursor-pointer items-center gap-4 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A1628] shadow-md">
                <Ticket className="h-5 w-5 text-[#C9A84C]" />
              </div>
              <div>
                <p className="font-bold text-[#0A1628]">My Coupons</p>
                <p className="text-xs text-muted-foreground">
                  View all your coupons
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0A1628]">
              Recent Activity
            </h2>
            <Link
              href="/coupons"
              className="text-sm font-medium text-[#C9A84C] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="glass-card rounded-2xl divide-y divide-gray-100/50">
            {recentActivity.map((coupon) => (
              <div
                key={coupon.id}
                className="flex items-center justify-between px-4 py-3 first:rounded-t-2xl last:rounded-b-2xl"
              >
                <div className="flex items-center gap-3">
                  <History className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-[#0A1628]">
                      {coupon.hotel?.name || "Coupon"}{" "}
                      <span className="font-mono text-xs text-muted-foreground">
                        ({coupon.code})
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(coupon.updatedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                {getStatusBadge(coupon.status)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
