"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Star,
  MapPin,
  BedDouble,
  SlidersHorizontal,
  Heart,
  Waves,
  TreePine,
  Mountain,
  Building2,
  Sun,
  Sparkles,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoomType {
  id: string;
  name: string;
  rackRate: number;
  discountRate: number;
  discountPercent: number;
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
  roomTypes: RoomType[];
}

const categories = [
  { icon: Waves, label: "Beachfront" },
  { icon: TreePine, label: "Safari Lodge" },
  { icon: Mountain, label: "Mountain View" },
  { icon: Building2, label: "City Hotels" },
  { icon: Sun, label: "Tropical" },
  { icon: Sparkles, label: "Luxury" },
  { icon: BedDouble, label: "Budget" },
  { icon: Shield, label: "Verified" },
];

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

function HotelCard({ hotel, idx }: { hotel: Hotel; idx: number }) {
  const [liked, setLiked] = useState(false);
  const [imgError, setImgError] = useState(false);

  const discount = hotel.roomTypes.length > 0
    ? Math.max(...hotel.roomTypes.map((r) => r.discountPercent))
    : 0;
  const minRate = hotel.roomTypes.length > 0
    ? Math.min(...hotel.roomTypes.map((r) => r.discountRate))
    : 0;
  const rackRate = hotel.roomTypes.length > 0
    ? hotel.roomTypes.reduce(
        (minI, r, i, arr) => (r.discountRate < arr[minI].discountRate ? i : minI),
        0
      )
    : -1;
  const rackRateValue = rackRate >= 0 ? hotel.roomTypes[rackRate].rackRate : 0;

  return (
    <Link href={`/hotels/${hotel.id}`} className="group block">
      <div className="hotel-card flex flex-col gap-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
          {!imgError ? (
            <Image
              src={`/images/hotels/${hotelImages[idx % hotelImages.length]}`}
              alt={hotel.name}
              fill
              className="hotel-card-img object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
              <BedDouble className="h-12 w-12 text-amber-400" />
            </div>
          )}

          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-white rounded-full px-2.5 py-0.5 text-xs font-bold text-[#C9A84C] shadow-md">
              {Math.round(discount)}% OFF
            </div>
          )}

          <button
            onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500 heart-animate" : "text-gray-700"}`} />
          </button>

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-xl" />
        </div>

        <div className="flex flex-col gap-0.5 px-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#222222] text-[15px] truncate group-hover:text-[#C9A84C] transition-colors">
              {hotel.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <Star className="h-3.5 w-3.5 fill-[#222222] text-[#222222]" />
              <span className="text-sm text-[#222222]">{hotel.starRating}.0</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            <MapPin className="h-3 w-3 inline mr-1" />
            {hotel.city}, {hotel.country}
          </p>
          {minRate > 0 ? (
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-bold text-[#222222]">${minRate}</span>
              <span className="text-sm text-gray-400 line-through">${rackRateValue}</span>
              <span className="text-sm text-gray-500">/ night</span>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-1">Contact for rates</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [starRating, setStarRating] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [activeCategory, setActiveCategory] = useState("Beachfront");

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (city && city !== "all") params.set("city", city);
      if (starRating && starRating !== "all") params.set("starRating", starRating);

      const res = await fetch(`/api/hotels?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        let hotelList: Hotel[] = data.hotels;

        if (sortBy === "rating") {
          hotelList = [...hotelList].sort((a, b) => b.starRating - a.starRating);
        } else if (sortBy === "discount") {
          hotelList = [...hotelList].sort((a, b) => {
            const maxA = Math.max(...a.roomTypes.map((r) => r.discountPercent), 0);
            const maxB = Math.max(...b.roomTypes.map((r) => r.discountPercent), 0);
            return maxB - maxA;
          });
        } else if (sortBy === "price_low") {
          hotelList = [...hotelList].sort((a, b) => {
            const minA = a.roomTypes.length > 0 ? Math.min(...a.roomTypes.map((r) => r.discountRate)) : 0;
            const minB = b.roomTypes.length > 0 ? Math.min(...b.roomTypes.map((r) => r.discountRate)) : 0;
            return minA - minB;
          });
        }

        setHotels(hotelList);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [search, city, starRating, sortBy]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  return (
    <div className="min-h-screen bg-white">
      {/* Category Bar */}
      <section className="sticky top-20 z-40 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="category-scroll flex items-center gap-8 overflow-x-auto py-4">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`flex flex-col items-center gap-1.5 shrink-0 pb-2 border-b-2 transition-all ${
                  activeCategory === cat.label
                    ? "border-[#222222] text-[#222222]"
                    : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
                }`}
              >
                <cat.icon className="h-5 w-5" />
                <span className="text-xs font-medium whitespace-nowrap">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-[#222222]">
              {hotels.length > 0 ? `${hotels.length} hotels available` : "Browse Hotels"}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search hotels, cities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-full border-gray-300 bg-gray-50 pl-10 text-sm sm:w-64 focus:border-[#C9A84C] focus:ring-[#C9A84C]"
                />
              </div>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="h-10 w-32 rounded-full border-gray-300 bg-gray-50 text-sm">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="Dar es Salaam">Dar es Salaam</SelectItem>
                  <SelectItem value="Arusha">Arusha</SelectItem>
                  <SelectItem value="Zanzibar">Zanzibar</SelectItem>
                  <SelectItem value="Mwanza">Mwanza</SelectItem>
                  <SelectItem value="Dodoma">Dodoma</SelectItem>
                  <SelectItem value="Nairobi">Nairobi</SelectItem>
                  <SelectItem value="Kampala">Kampala</SelectItem>
                </SelectContent>
              </Select>
              <Select value={starRating} onValueChange={setStarRating}>
                <SelectTrigger className="h-10 w-28 rounded-full border-gray-300 bg-gray-50 text-sm">
                  <SelectValue placeholder="Stars" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-10 w-36 rounded-full border-gray-300 bg-gray-50 text-sm">
                  <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="discount">Biggest Discount</SelectItem>
                  <SelectItem value="price_low">Lowest Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Grid */}
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-10" />
                </div>
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <BedDouble className="h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-[#222222]">No Hotels Found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search or filters to find available hotels.</p>
            <Button
              className="mt-6 bg-[#C9A84C] hover:bg-[#b8963f] text-white rounded-full font-semibold"
              onClick={() => { setSearch(""); setCity(""); setStarRating(""); setSortBy(""); }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {hotels.map((hotel, idx) => (
              <HotelCard key={hotel.id} hotel={hotel} idx={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
