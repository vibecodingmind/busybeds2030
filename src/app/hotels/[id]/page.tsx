"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Star,
  MapPin,
  BedDouble,
  Lock,
  Phone,
  Mail,
  ArrowLeft,
  Wifi,
  Car,
  UtensilsCrossed,
  Waves,
  Dumbbell,
  Briefcase,
  Coffee,
  Shield,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import Link from "next/link";

interface RoomType {
  id: string;
  name: string;
  rackRate: number;
  discountRate: number;
  discountPercent: number;
  description: string | null;
}

interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  starRating: number;
  photos: string[];
  amenities: string[];
  depositPolicy: string;
  roomTypes: RoomType[];
  contactEmail: string | null;
  contactPhone: string | null;
}

const amenityIcons: Record<string, React.ElementType> = {
  wifi: Wifi,
  parking: Car,
  restaurant: UtensilsCrossed,
  pool: Waves,
  gym: Dumbbell,
  "business center": Briefcase,
  "room service": Coffee,
  spa: Waves,
  security: Shield,
};

function getAmenityIcon(amenity: string) {
  const lower = amenity.toLowerCase();
  for (const [key, Icon] of Object.entries(amenityIcons)) {
    if (lower.includes(key)) return Icon;
  }
  return CheckCircle2;
}

function formatDepositPolicy(policy: string) {
  const map: Record<string, string> = {
    FIFTY_PERCENT: "50% Deposit Required",
    FULL: "Full Payment Required",
    NONE: "No Deposit Required",
    CARD_HOLD: "Card Hold on Check-in",
  };
  return map[policy] || policy;
}

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingCoupon, setUsingCoupon] = useState(false);

  useEffect(() => {
    async function fetchHotel() {
      try {
        const res = await fetch(`/api/hotels/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setHotel(data.hotel);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchHotel();
  }, [params.id]);

  const handleUseCoupon = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    // Check if user has subscription (this is handled server-side in coupon/use)
    setUsingCoupon(true);
    try {
      const res = await fetch("/api/coupons/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelId: hotel?.id }),
      });

      const data = await res.json();

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (res.status === 400 && data.error?.includes("subscription")) {
        router.push("/subscription");
        return;
      }

      if (!res.ok) {
        toast.error(data.error || "Failed to use coupon");
        return;
      }

      toast.success("Coupon applied! Contact the hotel to book your stay.");
      router.push("/coupons");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setUsingCoupon(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-glass-gradient-light">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="mb-8 h-8 w-32" />
          <Skeleton className="h-72 w-full rounded-2xl" />
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-glass-gradient-light">
        <BedDouble className="h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-xl font-semibold text-[#0A1628]">
          Hotel Not Found
        </h2>
        <p className="mt-2 text-muted-foreground">
          The hotel you are looking for does not exist or has been removed.
        </p>
        <Link href="/hotels">
          <Button className="mt-6 shimmer-gold text-[#0A1628] font-semibold">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hotels
          </Button>
        </Link>
      </div>
    );
  }

  const isSubscribed = !!(hotel.contactEmail || hotel.contactPhone);

  return (
    <div className="min-h-screen bg-glass-gradient-light">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back */}
        <Link href="/hotels">
          <Button
            variant="ghost"
            className="mb-6 text-[#0A1628] hover:text-[#C9A84C]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hotels
          </Button>
        </Link>

        {/* Photo gallery placeholder */}
        <div className="relative h-64 overflow-hidden rounded-2xl bg-glass-gradient sm:h-80 lg:h-96">
          <div className="absolute inset-0 flex items-center justify-center">
            <BedDouble className="h-20 w-20 text-white/15" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent backdrop-blur-[2px]" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-1">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-[#C9A84C] text-[#C9A84C]"
                />
              ))}
            </div>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              {hotel.name}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-white/80">
              <MapPin className="h-4 w-4" />
              {hotel.city}, {hotel.country}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Description */}
            <Card className="glass-card rounded-2xl border-none">
              <CardHeader>
                <CardTitle className="text-[#0A1628]">About This Hotel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {hotel.description}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="glass-card rounded-2xl border-none">
              <CardHeader>
                <CardTitle className="text-[#0A1628]">Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {hotel.amenities.map((amenity) => {
                    const Icon = getAmenityIcon(amenity);
                    return (
                      <div
                        key={amenity}
                        className="glass-white flex items-center gap-2 rounded-lg p-3"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-[#C9A84C]" />
                        <span className="text-sm text-[#0A1628]">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Room Types Table */}
            {hotel.roomTypes.length > 0 && (
              <Card className="glass-card rounded-2xl border-none">
                <CardHeader>
                  <CardTitle className="text-[#0A1628]">
                    Room Types & Rates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Room Type</TableHead>
                          <TableHead className="text-right">
                            Rack Rate
                          </TableHead>
                          <TableHead className="text-right">
                            BusyBeds Rate
                          </TableHead>
                          <TableHead className="text-right">You Save</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hotel.roomTypes.map((room) => (
                          <TableRow key={room.id}>
                            <TableCell className="font-medium text-[#0A1628]">
                              {room.name}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground line-through">
                              ${room.rackRate}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-[#0A1628]">
                              ${room.discountRate}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge className="bg-[#C9A84C]/10 text-[#b8963f] font-semibold backdrop-blur-sm">
                                <Tag className="mr-1 h-3 w-3" />
                                {Math.round(room.discountPercent)}% off
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Deposit Policy */}
                  <div className="mt-4 glass-white flex items-center gap-2 rounded-lg p-3">
                    <Shield className="h-4 w-4 text-[#C9A84C]" />
                    <span className="text-sm font-medium text-[#0A1628]">
                      Deposit Policy:
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDepositPolicy(hotel.depositPolicy)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Use Coupon CTA */}
            <Card className="glass-card-dark rounded-2xl border-none">
              <CardHeader>
                <CardTitle className="text-[#C9A84C]">
                  Unlock This Deal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hotel.roomTypes.length > 0 && (
                  <div>
                    <p className="text-sm text-white/60">Starting from</p>
                    <p className="text-3xl font-bold text-white">
                      $
                      {Math.min(
                        ...hotel.roomTypes.map((r) => r.discountRate)
                      )}
                      <span className="text-base font-normal text-white/60">
                        {" "}
                        / night
                      </span>
                    </p>
                    <p className="text-sm text-white/40 line-through">
                      $
                      {Math.min(
                        ...hotel.roomTypes.map((r) => r.rackRate)
                      )}{" "}
                      rack rate
                    </p>
                  </div>
                )}
                <Button
                  className="h-12 w-full shimmer-gold text-[#0A1628] text-base font-semibold"
                  onClick={handleUseCoupon}
                  disabled={usingCoupon}
                >
                  {usingCoupon
                    ? "Applying Coupon..."
                    : "Use a Coupon for This Hotel"}
                  {!usingCoupon && <Tag className="ml-2 h-4 w-4" />}
                </Button>
                <p className="text-center text-xs text-white/50">
                  {!session?.user
                    ? "You'll need to log in first"
                    : "One coupon credit will be used"}
                </p>
              </CardContent>
            </Card>

            {/* Contact Details */}
            <Card className="glass-card rounded-2xl border-none">
              <CardHeader>
                <CardTitle className="text-[#0A1628]">
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSubscribed ? (
                  <div className="space-y-3">
                    {hotel.contactEmail && (
                      <div className="glass-gold flex items-center gap-3 rounded-lg p-3">
                        <Mail className="h-5 w-5 text-[#0A1628]" />
                        <div>
                          <p className="text-xs text-[#0A1628]/70">Email</p>
                          <p className="text-sm font-medium text-[#0A1628]">
                            {hotel.contactEmail}
                          </p>
                        </div>
                      </div>
                    )}
                    {hotel.contactPhone && (
                      <div className="glass-gold flex items-center gap-3 rounded-lg p-3">
                        <Phone className="h-5 w-5 text-[#0A1628]" />
                        <div>
                          <p className="text-xs text-[#0A1628]/70">Phone</p>
                          <p className="text-sm font-medium text-[#0A1628]">
                            {hotel.contactPhone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="glass-card flex flex-col items-center rounded-2xl py-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                      <Lock className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="mt-3 font-medium text-[#0A1628]">
                      Contact details locked
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Subscribe to unlock contact details for this hotel
                    </p>
                    <Link href="/register" className="mt-4 w-full">
                      <Button className="h-11 w-full shimmer-gold text-[#0A1628] font-semibold">
                        Subscribe Now
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
