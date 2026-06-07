"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge, formatCurrency, formatDate } from "@/components/shared";
import { Loader2, Eye } from "lucide-react";

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

const statusFilters = [
  { value: "all", label: "All" },
  { value: "RESERVED", label: "Reserved" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "REDEEMED", label: "Checked In" },
  { value: "NO_SHOW", label: "No-show" },
];

export default function HotelBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

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

  const filteredBookings =
    activeTab === "all"
      ? bookings
      : bookings.filter((b) => b.status === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#0A1628]">
          All Bookings
        </h2>
        <p className="text-lg text-gray-500 mt-1">
          {bookings.length} total bookings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-gray-100/50 backdrop-blur-sm p-1 rounded-lg">
          {statusFilters.map((filter) => (
            <TabsTrigger
              key={filter.value}
              value={filter.value}
              className="glass-pill text-base data-[state=active]:bg-[#0A1628] data-[state=active]:text-white px-4 py-2 rounded-md"
            >
              {filter.label}
              <span className="ml-1.5 text-xs bg-gray-200 data-[state=active]:bg-white/20 rounded-full px-1.5 py-0.5">
                {filter.value === "all"
                  ? bookings.length
                  : bookings.filter((b) => b.status === filter.value).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredBookings.length === 0 ? (
            <Card className="glass-card rounded-2xl">
              <CardContent className="p-8 text-center">
                <p className="text-lg text-gray-500">No bookings found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="glass-card rounded-2xl hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg font-semibold text-[#0A1628]">
                            {booking.guestName || booking.user?.name || "Guest"}
                          </span>
                          <StatusBadge status={booking.status} />
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span>
                            Check-in: {formatDate(booking.checkInDate)}
                          </span>
                          <span>
                            Check-out: {formatDate(booking.checkOutDate)}
                          </span>
                          {booking.roomType && (
                            <span>Room: {booking.roomType.name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-mono glass-white px-2 py-0.5 rounded text-[#0A1628]">
                            {booking.code}
                          </span>
                          {booking.discountAmount != null && (
                            <span className="text-green-700 font-medium">
                              Save {formatCurrency(booking.discountAmount)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link href={`/hotel/verify?code=${booking.code}`}>
                        <Button
                          size="lg"
                          className="bg-[#0A1628] hover:bg-[#0A1628]/90 text-white min-h-[48px] rounded-xl"
                        >
                          <Eye className="w-5 h-5 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
