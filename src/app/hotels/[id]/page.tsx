"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
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
  Heart,
  Share2,
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

const hotelImages = [
  "hotel-serengeti.png",
  "hotel-zanzibar.png",
  "hotel-victoria.png",
  "hotel-dar.png",
  "hotel-arusha.png",
  "hotel-nairobi.png",
  "hotel-kampala.png",
  "hotel-dodoma.png",
];

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingCoupon, setUsingCoupon] = useState(false);
  const [liked, setLiked] = useState(false);
  const [imgError, setImgError] = useState(false);

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
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <Skeleton className="mb-8 h-8 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-96">
            <Skeleton className="rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="rounded-xl" />
              <Skeleton className="rounded-xl" />
              <Skeleton className="rounded-xl" />
              <Skeleton className="rounded-xl" />
            </div>
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white">
        <BedDouble className="h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-xl font-semibold text-[#222222]">Hotel Not Found</h2>
        <p className="mt-2 text-gray-500">The hotel you are looking for does not exist or has been removed.</p>
        <Link href="/hotels">
          <Button className="mt-6 bg-[#C9A84C] hover:bg-[#b8963f] text-white rounded-xl font-semibold">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hotels
          </Button>
        </Link>
      </div>
    );
  }

  const isSubscribed = !!(hotel.contactEmail || hotel.contactPhone);
  const hotelImage = `/images/hotels/${hotelImages[Math.abs(hotel.name.charCodeAt(0) + hotel.name.charCodeAt(1)) % hotelImages.length]}`;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        {/* Back */}
        <Link href="/hotels">
          <Button variant="ghost" className="mb-4 text-[#222222] hover:text-[#C9A84C] -ml-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hotels
          </Button>
        </Link>

        {/* Image Gallery - Airbnb style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden h-[400px] sm:h-[450px]">
          <div className="relative h-full overflow-hidden">
            {!imgError ? (
              <Image
                src={hotelImage}
                alt={hotel.name}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                priority
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
                <BedDouble className="h-16 w-16 text-amber-400" />
              </div>
            )}
          </div>
          <div className="hidden md:grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => {
              const imgIdx = (Math.abs(hotel.name.charCodeAt(0)) + i) % hotelImages.length;
              return (
                <div key={i} className="relative h-full overflow-hidden">
                  <Image
                    src={`/images/hotels/${hotelImages[imgIdx]}`}
                    alt={`${hotel.name} ${i + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="25vw"
                    onError={() => {}}
                  />
                </div>
              );
            })}
          </div>

          {/* Heart & Share overlay */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              onClick={() => setLiked(!liked)}
              className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md transition-colors"
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500 heart-animate" : "text-[#222222]"}`} />
            </button>
            <button className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md transition-colors">
              <Share2 className="h-5 w-5 text-[#222222]" />
            </button>
          </div>
        </div>

        {/* Title Section */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">{hotel.name}</h1>
            <div className="mt-2 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#C9A84C] text-[#C9A84C]" />
                ))}
                <span className="ml-1 text-sm font-medium text-[#222222]">{hotel.starRating}.0</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{hotel.city}, {hotel.country}</span>
              </div>
            </div>
          </div>
          {hotel.roomTypes.length > 0 && (
            <div className="text-right shrink-0">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#222222]">
                  ${Math.min(...hotel.roomTypes.map((r) => r.discountRate))}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ${Math.min(...hotel.roomTypes.map((r) => r.rackRate))}
                </span>
              </div>
              <p className="text-sm text-gray-500">per night</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 my-8" />

        {/* Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-[#222222] mb-4">About This Hotel</h2>
              <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
            </div>

            <div className="h-px bg-gray-200" />

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-bold text-[#222222] mb-4">What This Place Offers</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {hotel.amenities.map((amenity) => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <div key={amenity} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <Icon className="h-5 w-5 shrink-0 text-[#C9A84C]" />
                      <span className="text-sm text-[#222222]">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-gray-200" />

            {/* Room Types Table */}
            {hotel.roomTypes.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-[#222222] mb-4">Room Types & Rates</h2>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Room Type</TableHead>
                        <TableHead className="text-right">Rack Rate</TableHead>
                        <TableHead className="text-right">Member Rate</TableHead>
                        <TableHead className="text-right">You Save</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hotel.roomTypes.map((room) => (
                        <TableRow key={room.id}>
                          <TableCell className="font-medium text-[#222222]">{room.name}</TableCell>
                          <TableCell className="text-right text-gray-400 line-through">${room.rackRate}</TableCell>
                          <TableCell className="text-right font-semibold text-[#222222]">${room.discountRate}</TableCell>
                          <TableCell className="text-right">
                            <Badge className="bg-[#C9A84C]/10 text-[#C9A84C] font-semibold border-0">
                              {Math.round(room.discountPercent)}% off
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 flex items-center gap-2 p-4 rounded-xl bg-gray-50">
                  <Shield className="h-5 w-5 text-[#C9A84C] shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-[#222222]">Deposit Policy: </span>
                    <span className="text-sm text-gray-500">{formatDepositPolicy(hotel.depositPolicy)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Use Coupon CTA */}
            <div className="sticky top-28">
              <Card className="rounded-2xl border border-gray-200 shadow-lg">
                <CardContent className="p-6 space-y-5">
                  {hotel.roomTypes.length > 0 && (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-[#222222]">
                          ${Math.min(...hotel.roomTypes.map((r) => r.discountRate))}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          ${Math.min(...hotel.roomTypes.map((r) => r.rackRate))}
                        </span>
                        <span className="text-sm text-gray-500">/ night</span>
                      </div>
                      <Badge className="mt-1 bg-green-50 text-green-700 border-0 font-medium">
                        Save {Math.round(Math.max(...hotel.roomTypes.map((r) => r.discountPercent)))}%
                      </Badge>
                    </div>
                  )}

                  <Button
                    className="h-12 w-full bg-[#C9A84C] hover:bg-[#b8963f] text-white text-base font-semibold rounded-xl"
                    onClick={handleUseCoupon}
                    disabled={usingCoupon}
                  >
                    {usingCoupon ? "Applying..." : "Use a Coupon for This Hotel"}
                    {!usingCoupon && <Tag className="ml-2 h-4 w-4" />}
                  </Button>

                  <p className="text-center text-xs text-gray-500">
                    {!session?.user
                      ? "You'll need to log in first"
                      : "One coupon credit will be used"}
                  </p>

                  {/* Contact Details */}
                  <div className="h-px bg-gray-200" />

                  <h3 className="font-semibold text-[#222222]">Contact Details</h3>
                  {isSubscribed ? (
                    <div className="space-y-3">
                      {hotel.contactEmail && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50">
                          <Mail className="h-5 w-5 text-[#C9A84C]" />
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm font-medium text-[#222222]">{hotel.contactEmail}</p>
                          </div>
                        </div>
                      )}
                      {hotel.contactPhone && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50">
                          <Phone className="h-5 w-5 text-[#C9A84C]" />
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-sm font-medium text-[#222222]">{hotel.contactPhone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center rounded-2xl py-6 text-center bg-gray-50">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="mt-3 font-medium text-[#222222] text-sm">Contact details locked</p>
                      <p className="mt-1 text-xs text-gray-500">Subscribe to unlock</p>
                      <Link href="/register" className="mt-3 w-full">
                        <Button className="h-10 w-full bg-[#222222] hover:bg-[#444] text-white text-sm font-semibold rounded-xl">
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
    </div>
  );
}
