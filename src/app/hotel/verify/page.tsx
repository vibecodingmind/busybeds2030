"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge, formatCurrency, formatDateTime } from "@/components/shared";
import { toast } from "sonner";
import {
  ScanSearch,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Tag,
  Hotel,
  ArrowLeft,
} from "lucide-react";

interface CouponData {
  id: string;
  code: string;
  status: string;
  checkInDate: string | null;
  checkOutDate: string | null;
  discountPercent: number | null;
  discountAmount: number | null;
  paymentDeadline: string | null;
  reservedAt: string | null;
  confirmedAt: string | null;
  redeemedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  guestName: string | null;
  user: { name: string; email: string; phone: string | null };
  hotel: { name: string; city: string } | null;
  roomType: { name: string; rackRate: number; discountRate: number } | null;
  subscription: { package: string } | null;
}

interface RoomType {
  id: string;
  name: string;
  rackRate: number;
  discountRate: number;
  discountPercent: number;
}

function VerifyContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<CouponData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Reservation form state
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  // No-show confirm dialog
  const [showNoShowDialog, setShowNoShowDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Countdown timer for RESERVED status
  const [countdown, setCountdown] = useState("");

  // Pre-fill code from URL params
  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setCode(codeParam);
      verifyCoupon(codeParam);
    }
  }, []);

  // Fetch hotel room types
  useEffect(() => {
    async function fetchRoomTypes() {
      if (!session?.user?.hotelId) return;
      try {
        const res = await fetch("/api/hotels");
        if (res.ok) {
          const data = await res.json();
          const hotel = (data.hotels || []).find(
            (h: { id: string }) => h.id === session.user?.hotelId
          );
          if (hotel) {
            setRoomTypes(hotel.roomTypes || []);
          }
        }
      } catch {
        // silently handle
      }
    }
    fetchRoomTypes();
  }, [session]);

  // Countdown timer effect
  useEffect(() => {
    if (!coupon || coupon.status !== "RESERVED" || !coupon.paymentDeadline) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const deadline = new Date(coupon.paymentDeadline!).getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setCountdown("Payment deadline passed");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${hours}h ${minutes}m ${seconds}s remaining`);
    }, 1000);

    return () => clearInterval(interval);
  }, [coupon]);

  const verifyCoupon = useCallback(async (codeToVerify?: string) => {
    const codeValue = codeToVerify || code;
    if (!codeValue.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setLoading(true);
    setError("");
    setCoupon(null);

    try {
      const res = await fetch("/api/hotel/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeValue.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to verify coupon");
        return;
      }

      setCoupon(data.coupon);
      toast.success("Coupon found!");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [code]);

  const handleReserve = async () => {
    if (!checkInDate || !checkOutDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/hotel/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: coupon!.code,
          checkInDate,
          checkOutDate,
          roomTypeId: selectedRoomType || undefined,
          guestName: coupon!.guestName || coupon!.user?.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to reserve");
        return;
      }

      toast.success("Coupon reserved successfully!");
      verifyCoupon(coupon!.code);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/hotel/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId: coupon!.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to confirm payment");
        return;
      }

      toast.success("Payment confirmed!");
      verifyCoupon(coupon!.code);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/hotel/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId: coupon!.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to check in guest");
        return;
      }

      toast.success("Guest checked in successfully!");
      verifyCoupon(coupon!.code);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleNoShow = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/hotel/no-show", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId: coupon!.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to mark no-show");
        return;
      }

      toast.success("Marked as no-show");
      verifyCoupon(coupon!.code);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setActionLoading(false);
      setShowNoShowDialog(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/hotel/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponId: coupon!.id,
          cancelledBy: "HOTEL",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to cancel");
        return;
      }

      toast.success("Booking cancelled");
      verifyCoupon(coupon!.code);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setActionLoading(false);
      setShowCancelDialog(false);
    }
  };

  const resetForm = () => {
    setCode("");
    setCoupon(null);
    setError("");
    setCheckInDate("");
    setCheckOutDate("");
    setSelectedRoomType("");
    router.push("/hotel/verify");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Back button if coming from code param */}
      {searchParams.get("code") && (
        <Button
          variant="ghost"
          onClick={resetForm}
          className="text-muted-foreground hover:text-[#0A1628] -ml-2"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          New Search
        </Button>
      )}

      {/* Input Section */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-[#0A1628] mb-4 text-center">
          Enter Guest Coupon Code
        </h2>
        <div className="flex gap-3">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. BB-XXXX-XXXX"
            className="text-xl font-mono h-16 text-center tracking-widest rounded-xl border-[#C9A84C]/20 bg-white/50 focus:border-[#C9A84C]/50 focus:bg-white/80"
            onKeyDown={(e) => {
              if (e.key === "Enter") verifyCoupon();
            }}
          />
          <Button
            onClick={() => verifyCoupon()}
            disabled={loading || !code.trim()}
            className="shimmer-gold rounded-xl font-bold min-h-[64px] px-8 text-lg shrink-0"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <ScanSearch className="w-6 h-6 mr-2" />
            )}
            {loading ? "" : "Verify"}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="glass-red rounded-2xl p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <p className="text-lg font-semibold text-red-700">{error}</p>
        </div>
      )}

      {/* Coupon Detail Card */}
      {coupon && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
              <span className="text-xl font-bold text-[#0A1628]">Coupon Details</span>
              <StatusBadge status={coupon.status} />
          </div>
          <div className="px-5 pb-5 space-y-4">
            {/* Guest Info */}
            <div className="rounded-xl bg-[#0A1628]/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#C9A84C]" />
                <span className="text-xl font-bold text-[#0A1628]">
                  {coupon.guestName || coupon.user?.name || "Guest"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="text-lg font-mono font-semibold">{coupon.code}</span>
              </div>
              {coupon.hotel && (
                <div className="flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-gray-500" />
                  <span className="text-base text-gray-600">
                    {coupon.hotel.name} - {coupon.hotel.city}
                  </span>
                </div>
              )}
              {coupon.discountPercent && (
                <div className="mt-2 glass-gold rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-[#0A1628]">
                    {coupon.discountPercent}% OFF
                  </p>
                  <p className="text-base text-[#0A1628]/60">
                    Save {formatCurrency(coupon.discountAmount)}
                  </p>
                </div>
              )}
              {coupon.roomType && (
                <p className="text-base text-gray-600">
                  Room: {coupon.roomType.name} —{" "}
                  <span className="line-through text-gray-400">
                    {formatCurrency(coupon.roomType.rackRate)}
                  </span>{" "}
                  <span className="font-semibold text-green-700">
                    {formatCurrency(coupon.roomType.discountRate)}
                  </span>
                </p>
              )}
              {coupon.checkInDate && (
                <p className="text-base text-gray-600">
                  Check-in: {formatDateTime(coupon.checkInDate)} → Check-out:{" "}
                  {formatDateTime(coupon.checkOutDate)}
                </p>
              )}
              {coupon.subscription && (
                <p className="text-sm text-gray-500">
                  Package: {coupon.subscription.package}
                </p>
              )}
            </div>

            {/* Status-specific actions */}

            {/* AVAILABLE - Reserve form */}
            {coupon.status === "AVAILABLE" && (
              <div className="space-y-4 border-t border-gray-100/50 pt-4">
                <h3 className="text-lg font-bold text-[#0A1628]">Set Booking Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkIn" className="text-base font-medium">
                      Check-in Date
                    </Label>
                    <Input
                      id="checkIn"
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="h-14 text-lg"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkOut" className="text-base font-medium">
                      Check-out Date
                    </Label>
                    <Input
                      id="checkOut"
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="h-14 text-lg"
                      min={checkInDate || new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                {roomTypes.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Room Type</Label>
                    <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                      <SelectTrigger className="h-14 text-lg">
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypes.map((rt) => (
                          <SelectItem key={rt.id} value={rt.id}>
                            {rt.name} — {formatCurrency(rt.discountRate)}/night
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button
                  onClick={handleReserve}
                  disabled={actionLoading || !checkInDate || !checkOutDate}
                  className="w-full glass-gold text-[#0A1628] font-bold min-h-[56px] text-xl rounded-xl hover:bg-[#C9A84C]/25"
                >
                  {actionLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    "RESERVE"
                  )}
                </Button>
              </div>
            )}

            {/* RESERVED - Confirm payment or cancel */}
            {coupon.status === "RESERVED" && (
              <div className="space-y-4 border-t border-gray-100/50 pt-4">
                {coupon.paymentDeadline && (
                  <div className="flex items-center gap-2 glass-gold p-3 rounded-xl">
                    <Clock className="w-5 h-5 text-[#0A1628]/70" />
                    <span className="text-base font-semibold text-[#0A1628]">
                      {countdown || "Calculating..."}
                    </span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleConfirmPayment}
                    disabled={actionLoading}
                    className="flex-1 glass-green font-bold min-h-[56px] text-xl rounded-xl border-green-500/30 bg-green-500/15 text-green-600 hover:bg-green-500/25"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6 mr-2" />
                        PAYMENT CONFIRMED
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowCancelDialog(true)}
                    className="glass-red min-h-[56px] text-lg px-6 rounded-xl border-red-500/25 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  >
                    <XCircle className="w-5 h-5 mr-1" />
                    CANCEL
                  </Button>
                </div>
              </div>
            )}

            {/* CONFIRMED - Check-in or No-show */}
            {coupon.status === "CONFIRMED" && (
              <div className="space-y-4 border-t border-gray-100/50 pt-4">
                <Button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  className="w-full glass-green font-bold min-h-[56px] text-xl rounded-xl border-green-500/30 bg-green-500/15 text-green-600 hover:bg-green-500/25"
                >
                  {actionLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6 mr-2" />
                      CHECK-IN / REDEEM
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowNoShowDialog(true)}
                  className="w-full glass-red min-h-[48px] text-lg rounded-xl border-red-500/25 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                >
                  <XCircle className="w-5 h-5 mr-1" />
                  NO-SHOW
                </Button>
              </div>
            )}

            {/* Terminal statuses - no actions */}
            {["REDEEMED", "NO_SHOW", "EXPIRED", "CANCELLED"].includes(coupon.status) && (
              <div className="border-t border-gray-100/50 pt-4">
                <div className="rounded-xl bg-[#0A1628]/5 p-4 text-center">
                  <p className="text-lg font-semibold text-gray-600">
                    {coupon.status === "REDEEMED" && "This coupon has been redeemed."}
                    {coupon.status === "NO_SHOW" && "Guest was marked as no-show."}
                    {coupon.status === "EXPIRED" && "This coupon has expired."}
                    {coupon.status === "CANCELLED" && "This booking was cancelled."}
                  </p>
                  {coupon.cancelledAt && (
                    <p className="text-sm text-gray-500 mt-1">
                      Cancelled: {formatDateTime(coupon.cancelledAt)}
                      {coupon.cancelReason && ` — ${coupon.cancelReason}`}
                    </p>
                  )}
                  {coupon.redeemedAt && (
                    <p className="text-sm text-gray-500 mt-1">
                      {coupon.status === "REDEEMED"
                        ? `Redeemed: ${formatDateTime(coupon.redeemedAt)}`
                        : `Marked no-show: ${formatDateTime(coupon.redeemedAt)}`}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No-show confirm dialog */}
      <AlertDialog open={showNoShowDialog} onOpenChange={setShowNoShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as No-Show?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the guest as no-show. One credit will be deducted from their
              subscription. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleNoShow}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm No-Show
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel confirm dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the reservation. If cancelled more than 48 hours before
              check-in, the guest will receive their credit back plus a bonus credit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function HotelVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
