"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Plus,
  Loader2,
  Star,
  Building2,
  Trash2,
} from "lucide-react";

interface HotelData {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  starRating: number;
  amenities: string[];
  photos: string[];
  depositPolicy: string;
  commissionPercent: number;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
  roomTypes: RoomTypeData[];
}

interface RoomTypeData {
  id: string;
  name: string;
  rackRate: number;
  discountRate: number;
  discountPercent: number;
  description: string | null;
}

const amenitiesList = [
  "WiFi",
  "Pool",
  "Restaurant",
  "Spa",
  "Parking",
  "Gym",
  "Bar",
  "Room Service",
  "Airport Shuttle",
  "Conference Room",
];

const depositPolicies = [
  { value: "FIFTY_PERCENT", label: "50% Deposit" },
  { value: "FULL", label: "Full Payment" },
  { value: "NONE", label: "No Deposit" },
  { value: "CARD_HOLD", label: "Card Hold" },
];

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Tanzania");
  const [description, setDescription] = useState("");
  const [starRating, setStarRating] = useState("3");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [depositPolicy, setDepositPolicy] = useState("FIFTY_PERCENT");
  const [commissionPercent, setCommissionPercent] = useState("15");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [roomTypes, setRoomTypes] = useState<
    { name: string; rackRate: string; discountRate: string; discountPercent: string }[]
  >([{ name: "", rackRate: "", discountRate: "", discountPercent: "" }]);

  useEffect(() => {
    fetchHotels();
  }, []);

  async function fetchHotels() {
    try {
      const res = await fetch("/api/hotels");
      if (res.ok) {
        const data = await res.json();
        setHotels(data.hotels || []);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }

  function toggleAmenity(amenity: string) {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  }

  function addRoomType() {
    setRoomTypes((prev) => [
      ...prev,
      { name: "", rackRate: "", discountRate: "", discountPercent: "" },
    ]);
  }

  function removeRoomType(index: number) {
    setRoomTypes((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRoomType(
    index: number,
    field: string,
    value: string
  ) {
    setRoomTypes((prev) =>
      prev.map((rt, i) => (i === index ? { ...rt, [field]: value } : rt))
    );
  }

  function resetForm() {
    setName("");
    setCity("");
    setCountry("Tanzania");
    setDescription("");
    setStarRating("3");
    setSelectedAmenities([]);
    setDepositPolicy("FIFTY_PERCENT");
    setCommissionPercent("15");
    setContactEmail("");
    setContactPhone("");
    setRoomTypes([{ name: "", rackRate: "", discountRate: "", discountPercent: "" }]);
  }

  async function handleSubmit() {
    if (!name || !city || !description) {
      toast.error("Name, city, and description are required");
      return;
    }

    const validRoomTypes = roomTypes.filter(
      (rt) => rt.name && rt.rackRate && rt.discountRate
    );

    if (validRoomTypes.length === 0) {
      toast.error("At least one room type is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          city,
          country,
          description,
          starRating: parseInt(starRating),
          amenities: selectedAmenities,
          depositPolicy,
          commissionPercent: parseFloat(commissionPercent),
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          roomTypes: validRoomTypes.map((rt) => ({
            name: rt.name,
            rackRate: parseFloat(rt.rackRate),
            discountRate: parseFloat(rt.discountRate),
            discountPercent: parseFloat(rt.discountPercent || "0"),
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create hotel");
        return;
      }

      toast.success("Hotel created successfully!");
      resetForm();
      setDialogOpen(false);
      fetchHotels();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0A1628]">
            Hotels Management
          </h2>
          <p className="text-base text-gray-500 mt-1">
            {hotels.length} hotels registered
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shimmer-gold text-[#0A1628] font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Add Hotel
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card-dark max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Add New Hotel
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Hotel Name *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Serena Hotel"
                    className="glass-white focus:border-[#C9A84C]/50 focus:bg-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">City *</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Dar es Salaam"
                    className="glass-white focus:border-[#C9A84C]/50 focus:bg-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Country</Label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="glass-white focus:border-[#C9A84C]/50 focus:bg-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Star Rating</Label>
                  <Select value={starRating} onValueChange={setStarRating}>
                    <SelectTrigger className="glass-white focus:border-[#C9A84C]/50 focus:bg-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={String(rating)}>
                          {Array.from({ length: rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 inline text-[#C9A84C] fill-[#C9A84C]"
                            />
                          ))}{" "}
                          ({rating} Star{rating > 1 ? "s" : ""})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/80">Description *</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Hotel description..."
                  rows={3}
                  className="glass-white focus:border-[#C9A84C]/50 focus:bg-white/10"
                />
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <Label className="text-white/80">Amenities</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {amenitiesList.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <Checkbox
                        id={amenity}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <label htmlFor={amenity} className="text-sm text-white/70 cursor-pointer">
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Policy & Commission */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Deposit Policy</Label>
                  <Select value={depositPolicy} onValueChange={setDepositPolicy}>
                    <SelectTrigger className="glass-white focus:border-[#C9A84C]/50 focus:bg-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {depositPolicies.map((policy) => (
                        <SelectItem key={policy.value} value={policy.value}>
                          {policy.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Commission %</Label>
                  <Input
                    type="number"
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(e.target.value)}
                    min="0"
                    max="50"
                    step="0.5"
                    className="glass-white focus:border-[#C9A84C]/50 focus:bg-white/10"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Contact Email</Label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="hotel@example.com"
                    className="glass-white focus:border-[#C9A84C]/50 focus:bg-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Contact Phone</Label>
                  <Input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+255 XXX XXX XXX"
                    className="glass-white focus:border-[#C9A84C]/50 focus:bg-white/10"
                  />
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Room Types */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-white/80">Room Types</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addRoomType}
                    className="text-[#C9A84C] border-[#C9A84C]"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Room Type
                  </Button>
                </div>

                {roomTypes.map((rt, index) => (
                  <Card key={index} className="glass-white p-4 rounded-xl">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
                      <div className="col-span-2 sm:col-span-1 space-y-1">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={rt.name}
                          onChange={(e) =>
                            updateRoomType(index, "name", e.target.value)
                          }
                          placeholder="e.g. Deluxe Suite"
                          className="h-9 focus:border-[#C9A84C]/50 focus:bg-white/10"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Rack Rate</Label>
                        <Input
                          type="number"
                          value={rt.rackRate}
                          onChange={(e) =>
                            updateRoomType(index, "rackRate", e.target.value)
                          }
                          placeholder="0"
                          className="h-9 focus:border-[#C9A84C]/50 focus:bg-white/10"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Discount Rate</Label>
                        <Input
                          type="number"
                          value={rt.discountRate}
                          onChange={(e) =>
                            updateRoomType(index, "discountRate", e.target.value)
                          }
                          placeholder="0"
                          className="h-9 focus:border-[#C9A84C]/50 focus:bg-white/10"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Discount %</Label>
                        <Input
                          type="number"
                          value={rt.discountPercent}
                          onChange={(e) =>
                            updateRoomType(index, "discountPercent", e.target.value)
                          }
                          placeholder="0"
                          className="h-9 focus:border-[#C9A84C]/50 focus:bg-white/10"
                        />
                      </div>
                      <div>
                        {roomTypes.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRoomType(index)}
                            className="text-red-500 hover:text-red-700 h-9 w-9"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full shimmer-gold text-[#0A1628] font-bold h-12 text-base"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Create Hotel"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hotels Table */}
      <Card className="glass-card rounded-2xl">
        <CardContent className="p-0">
          {hotels.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-lg text-gray-500">No hotels registered yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Stars</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Room Types</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hotels.map((hotel) => (
                    <TableRow key={hotel.id} className="hover:bg-white/5">
                      <TableCell className="font-medium text-[#0A1628]">
                        {hotel.name}
                      </TableCell>
                      <TableCell>
                        {hotel.city}, {hotel.country}
                      </TableCell>
                      <TableCell>
                        <div className="flex">
                          {Array.from({ length: hotel.starRating }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-3.5 h-3.5 text-[#C9A84C] fill-[#C9A84C]"
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{hotel.commissionPercent}%</TableCell>
                      <TableCell>{hotel.roomTypes?.length || 0}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            hotel.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-100 backdrop-blur-sm"
                              : "bg-red-100 text-red-800 hover:bg-red-100 backdrop-blur-sm"
                          }
                          variant="secondary"
                        >
                          {hotel.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
