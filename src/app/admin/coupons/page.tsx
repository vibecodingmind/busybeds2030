"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StatusBadge, formatCurrency, formatDate, formatDateTime } from "@/components/shared";
import { toast } from "sonner";
import { Loader2, Ticket, Eye, Filter } from "lucide-react";

interface CouponData {
  id: string;
  code: string;
  status: string;
  checkInDate: string | null;
  checkOutDate: string | null;
  discountPercent: number | null;
  discountAmount: number | null;
  createdAt: string;
  updatedAt: string;
  user: { name: string; email: string };
  hotel: { name: string; city: string } | null;
  roomType: { name: string } | null;
  subscription: { package: string } | null;
}

interface HotelOption {
  id: string;
  name: string;
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "AVAILABLE", label: "Available" },
  { value: "RESERVED", label: "Reserved" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "REDEEMED", label: "Redeemed" },
  { value: "EXPIRED", label: "Expired" },
  { value: "NO_SHOW", label: "No-Show" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [hotels, setHotels] = useState<HotelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [hotelFilter, setHotelFilter] = useState("all");
  const [selectedCoupon, setSelectedCoupon] = useState<CouponData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchCoupons();
    fetchHotels();
  }, []);

  async function fetchCoupons(status?: string, hotelId?: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status && status !== "all") params.set("status", status);
      if (hotelId && hotelId !== "all") params.set("hotelId", hotelId);

      const res = await fetch(`/api/admin/coupons?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }

  async function fetchHotels() {
    try {
      const res = await fetch("/api/hotels");
      if (res.ok) {
        const data = await res.json();
        setHotels(
          (data.hotels || []).map((h: { id: string; name: string }) => ({
            id: h.id,
            name: h.name,
          }))
        );
      }
    } catch {
      // silently handle
    }
  }

  function applyFilters() {
    fetchCoupons(statusFilter, hotelFilter);
  }

  useEffect(() => {
    applyFilters();
  }, [statusFilter, hotelFilter]);

  if (loading && coupons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#0A1628]">
          Coupons Management
        </h2>
        <p className="text-base text-gray-500 mt-1">
          {coupons.length} coupons found
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500 whitespace-nowrap">Filters:</span>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="glass-pill w-full sm:w-48 focus:border-[#C9A84C]/50">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={hotelFilter} onValueChange={setHotelFilter}>
          <SelectTrigger className="glass-pill w-full sm:w-56 focus:border-[#C9A84C]/50">
            <SelectValue placeholder="Filter by hotel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hotels</SelectItem>
            {hotels.map((hotel) => (
              <SelectItem key={hotel.id} value={hotel.id}>
                {hotel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setStatusFilter("all");
            setHotelFilter("all");
          }}
          className="glass-pill whitespace-nowrap"
        >
          Clear Filters
        </Button>
      </div>

      {/* Coupons Table */}
      <Card className="glass-card rounded-2xl">
        <CardContent className="p-0">
          {coupons.length === 0 ? (
            <div className="p-8 text-center">
              <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-lg text-gray-500">No coupons found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Hotel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Check-in</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id} className="hover:bg-white/5">
                      <TableCell>
                        <span className="font-mono font-semibold text-[#0A1628]">
                          {coupon.code}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{coupon.user?.name}</p>
                          <p className="text-xs text-gray-500">{coupon.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {coupon.hotel?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={coupon.status} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {formatDate(coupon.checkInDate)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {formatDate(coupon.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCoupon(coupon);
                            setDetailsOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coupon Detail Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="glass-card-dark max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Coupon Details
            </DialogTitle>
          </DialogHeader>

          {selectedCoupon && (
            <div className="space-y-4 mt-4">
              <div className="glass-white rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-bold text-[#0A1628]">
                    {selectedCoupon.code}
                  </span>
                  <StatusBadge status={selectedCoupon.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <Label className="text-xs text-gray-500">Guest</Label>
                    <p className="font-medium">{selectedCoupon.user?.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Email</Label>
                    <p className="font-medium text-sm">{selectedCoupon.user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Hotel</Label>
                    <p className="font-medium">
                      {selectedCoupon.hotel?.name || "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Room Type</Label>
                    <p className="font-medium">
                      {selectedCoupon.roomType?.name || "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Check-in</Label>
                    <p className="font-medium">
                      {formatDate(selectedCoupon.checkInDate)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Check-out</Label>
                    <p className="font-medium">
                      {formatDate(selectedCoupon.checkOutDate)}
                    </p>
                  </div>
                </div>

                {selectedCoupon.discountPercent != null && (
                  <div className="glass-gold rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#0A1628]">
                      {selectedCoupon.discountPercent}% OFF
                    </p>
                    <p className="text-sm text-gray-600">
                      Save {formatCurrency(selectedCoupon.discountAmount)}
                    </p>
                  </div>
                )}

                {selectedCoupon.subscription && (
                  <p className="text-xs text-gray-500">
                    Package: {selectedCoupon.subscription.package}
                  </p>
                )}

                <div className="text-xs text-gray-400">
                  Created: {formatDateTime(selectedCoupon.createdAt)} · Updated:{" "}
                  {formatDateTime(selectedCoupon.updatedAt)}
                </div>
              </div>

              <div className="flex gap-2">
                {selectedCoupon.status === "AVAILABLE" && (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      toast.success("Coupon invalidated (demo)");
                      setDetailsOpen(false);
                    }}
                  >
                    Invalidate Coupon
                  </Button>
                )}
                {selectedCoupon.status !== "REDEEMED" &&
                  selectedCoupon.status !== "CANCELLED" &&
                  selectedCoupon.status !== "EXPIRED" && (
                    <Button
                      variant="outline"
                      className="glass-pill flex-1"
                      onClick={() => {
                        toast.success("Expiry extended (demo)");
                        setDetailsOpen(false);
                      }}
                    >
                      Extend Expiry
                    </Button>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
