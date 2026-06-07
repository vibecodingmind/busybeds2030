"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Star,
  MapPin,
  ArrowRight,
  BedDouble,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [starRating, setStarRating] = useState("");
  const [sortBy, setSortBy] = useState("");

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

        // Client-side sort
        if (sortBy === "rating") {
          hotelList = [...hotelList].sort(
            (a, b) => b.starRating - a.starRating
          );
        } else if (sortBy === "discount") {
          hotelList = [...hotelList].sort((a, b) => {
            const maxA = Math.max(
              ...a.roomTypes.map((r) => r.discountPercent),
              0
            );
            const maxB = Math.max(
              ...b.roomTypes.map((r) => r.discountPercent),
              0
            );
            return maxB - maxA;
          });
        } else if (sortBy === "price_low") {
          hotelList = [...hotelList].sort((a, b) => {
            const minA =
              a.roomTypes.length > 0
                ? Math.min(...a.roomTypes.map((r) => r.discountRate))
                : 0;
            const minB =
              b.roomTypes.length > 0
                ? Math.min(...b.roomTypes.map((r) => r.discountRate))
                : 0;
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

  const getMaxDiscount = (hotel: Hotel) => {
    if (hotel.roomTypes.length === 0) return 0;
    return Math.max(...hotel.roomTypes.map((r) => r.discountPercent));
  };

  const getMinRate = (hotel: Hotel) => {
    if (hotel.roomTypes.length === 0) return 0;
    return Math.min(...hotel.roomTypes.map((r) => r.discountRate));
  };

  const getRackRate = (hotel: Hotel) => {
    if (hotel.roomTypes.length === 0) return 0;
    const minIdx = hotel.roomTypes.reduce(
      (minI, r, i, arr) =>
        r.discountRate < arr[minI].discountRate ? i : minI,
      0
    );
    return hotel.roomTypes[minIdx].rackRate;
  };

  return (
    <div className="min-h-screen bg-glass-gradient-light">
      {/* Header */}
      <div className="bg-glass-gradient pb-16 pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Browse Hotels
          </h1>
          <p className="mt-2 text-white/70">
            Discover exclusive member discounts across East Africa
          </p>

          {/* Search & Filters */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <Input
                placeholder="Search hotels, cities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 glass-white border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/50 focus:border-[#C9A84C]/50 focus:bg-white/15"
              />
            </div>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="h-11 w-full glass-white border-white/20 bg-white/10 text-white sm:w-44 focus:border-[#C9A84C]/50 focus:bg-white/15">
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
              <SelectTrigger className="h-11 w-full glass-white border-white/20 bg-white/10 text-white sm:w-40 focus:border-[#C9A84C]/50 focus:bg-white/15">
                <SelectValue placeholder="Stars" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-11 w-full glass-white border-white/20 bg-white/10 text-white sm:w-44 focus:border-[#C9A84C]/50 focus:bg-white/15">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="rating">Highest Rating</SelectItem>
                <SelectItem value="discount">Biggest Discount</SelectItem>
                <SelectItem value="price_low">Lowest Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Hotel Grid */}
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden glass-card rounded-2xl">
                <Skeleton className="h-48 w-full rounded-none" />
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/2" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-11 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="glass-card rounded-2xl flex flex-col items-center py-20 text-center">
            <BedDouble className="h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-[#0A1628]">
              No Hotels Found
            </h3>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your search or filters to find available hotels.
            </p>
            <Button
              className="mt-6 shimmer-gold text-[#0A1628] font-semibold"
              onClick={() => {
                setSearch("");
                setCity("");
                setStarRating("");
                setSortBy("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => {
              const discount = getMaxDiscount(hotel);
              const minRate = getMinRate(hotel);
              const rackRate = getRackRate(hotel);

              return (
                <Card
                  key={hotel.id}
                  className="overflow-hidden glass-card rounded-2xl transition-shadow hover:shadow-xl"
                >
                  {/* Photo placeholder */}
                  <div className="relative h-48 glass-card-dark">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BedDouble className="h-12 w-12 text-white/20" />
                    </div>
                    {discount > 0 && (
                      <Badge className="absolute top-3 right-3 bg-[#C9A84C] font-bold text-[#0A1628]">
                        -{Math.round(discount)}%
                      </Badge>
                    )}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1">
                      {Array.from({ length: hotel.starRating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-[#C9A84C] text-[#C9A84C]"
                        />
                      ))}
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-[#0A1628] line-clamp-1">
                      {hotel.name}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {hotel.city}, {hotel.country}
                    </div>
                  </CardHeader>

                  <CardContent>
                    {minRate > 0 ? (
                      <div className="flex items-end gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Rack Rate
                          </p>
                          <p className="text-lg font-semibold text-muted-foreground line-through">
                            ${rackRate}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[#C9A84C]">
                            BusyBeds Rate
                          </p>
                          <p className="text-2xl font-bold text-[#0A1628]">
                            ${minRate}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Contact for rates
                      </p>
                    )}
                  </CardContent>

                  <CardFooter>
                    <Link href={`/hotels/${hotel.id}`} className="w-full">
                      <Button className="h-11 w-full shimmer-gold text-[#0A1628] font-semibold">
                        View Deal
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
