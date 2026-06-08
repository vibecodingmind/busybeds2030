"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  MapPin,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  MessageSquare,
  Sparkles,
  Shield,
  Clock,
  Users,
  Heart,
  BedDouble,
  TreePine,
  Waves,
  Mountain,
  Sun,
  Building2,
  Palmtree,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

const featuredHotels = [
  {
    id: "1",
    name: "Serengeti Serena Safari Lodge",
    city: "Arusha",
    country: "Tanzania",
    starRating: 5,
    rackRate: 450,
    busyBedsRate: 280,
    discount: 38,
    image: "/images/hotels/hotel-serengeti.png",
  },
  {
    id: "2",
    name: "Zanzibar White Sand Luxury Resort",
    city: "Zanzibar",
    country: "Tanzania",
    starRating: 5,
    rackRate: 380,
    busyBedsRate: 220,
    discount: 42,
    image: "/images/hotels/hotel-zanzibar.png",
  },
  {
    id: "3",
    name: "Lake Victoria Grand Hotel",
    city: "Mwanza",
    country: "Tanzania",
    starRating: 4,
    rackRate: 220,
    busyBedsRate: 130,
    discount: 41,
    image: "/images/hotels/hotel-victoria.png",
  },
  {
    id: "4",
    name: "Dar es Salaam Luxury Suites",
    city: "Dar es Salaam",
    country: "Tanzania",
    starRating: 5,
    rackRate: 350,
    busyBedsRate: 210,
    discount: 40,
    image: "/images/hotels/hotel-dar.png",
  },
  {
    id: "5",
    name: "Kilimanjaro View Lodge",
    city: "Arusha",
    country: "Tanzania",
    starRating: 4,
    rackRate: 280,
    busyBedsRate: 165,
    discount: 41,
    image: "/images/hotels/hotel-arusha.png",
  },
  {
    id: "6",
    name: "Nairobi Skyline Hotel",
    city: "Nairobi",
    country: "Kenya",
    starRating: 5,
    rackRate: 400,
    busyBedsRate: 240,
    discount: 40,
    image: "/images/hotels/hotel-nairobi.png",
  },
  {
    id: "7",
    name: "Kampala Hilltop Resort",
    city: "Kampala",
    country: "Uganda",
    starRating: 4,
    rackRate: 250,
    busyBedsRate: 150,
    discount: 40,
    image: "/images/hotels/hotel-kampala.png",
  },
  {
    id: "8",
    name: "Dodoma Executive Hotel",
    city: "Dodoma",
    country: "Tanzania",
    starRating: 4,
    rackRate: 200,
    busyBedsRate: 120,
    discount: 40,
    image: "/images/hotels/hotel-dodoma.png",
  },
];

const packages = [
  {
    name: "Starter",
    coupons: 5,
    price: "TZS 20,000",
    priceNum: 20000,
    features: [
      "5 coupon credits",
      "Access to all partner hotels",
      "Valid for 30 days",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Standard",
    coupons: 15,
    price: "TZS 50,000",
    priceNum: 50000,
    features: [
      "15 coupon credits",
      "Access to all partner hotels",
      "Valid for 60 days",
      "Priority email support",
      "Hotel contact details",
    ],
    popular: true,
  },
  {
    name: "Premium",
    coupons: 999,
    price: "TZS 120,000",
    priceNum: 120000,
    features: [
      "Unlimited coupons",
      "Access to all partner hotels",
      "Valid for 90 days",
      "24/7 WhatsApp support",
      "Hotel contact details",
      "Exclusive deals",
    ],
    popular: false,
  },
];

const faqs = [
  {
    q: "How does BusyBeds work?",
    a: "BusyBeds is a membership platform. You subscribe to a plan, receive coupon credits, and use those coupons to unlock exclusive discounts at partner hotels across East Africa. You then contact the hotel directly to negotiate your stay.",
  },
  {
    q: "What is a coupon credit?",
    a: "A coupon credit allows you to view contact details and discount rates for a specific hotel. Each time you use a coupon for a hotel, one credit is deducted from your subscription.",
  },
  {
    q: "Can I get a refund on my subscription?",
    a: "Subscription payments are non-refundable. However, your coupon credits remain valid for the duration of your subscription period.",
  },
  {
    q: "Which countries does BusyBeds cover?",
    a: "We currently partner with hotels in Tanzania, Kenya, and Uganda. We are continuously expanding our network across East Africa.",
  },
  {
    q: "How do I contact a hotel after using a coupon?",
    a: "Once you use a coupon for a hotel, the hotel's contact email and phone number are revealed. You can then reach out directly to book your stay at the discounted rate.",
  },
  {
    q: "Is there a limit on how many times I can use coupons?",
    a: "It depends on your subscription plan. Starter gives you 5 coupons, Standard gives 15, and Premium offers unlimited coupons during your subscription period.",
  },
];

function HotelCard({ hotel }: { hotel: typeof featuredHotels[0] }) {
  const [liked, setLiked] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/hotels/${hotel.id}`} className="group block">
      <div className="hotel-card flex flex-col gap-2">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
          {!imgError ? (
            <Image
              src={hotel.image}
              alt={hotel.name}
              fill
              className="hotel-card-img object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImgError(true)}
              priority={hotel.id <= "2"}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
              <BedDouble className="h-12 w-12 text-amber-400" />
            </div>
          )}

          {/* Discount badge */}
          <div className="absolute top-3 left-3 bg-white rounded-full px-2.5 py-0.5 text-xs font-bold text-[#C9A84C] shadow-md">
            {hotel.discount}% OFF
          </div>

          {/* Heart button */}
          <button
            onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500 heart-animate" : "text-gray-700"}`} />
          </button>

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-xl" />
        </div>

        {/* Info */}
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
            {hotel.city}, {hotel.country}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-bold text-[#222222]">${hotel.busyBedsRate}</span>
            <span className="text-sm text-gray-400 line-through">${hotel.rackRate}</span>
            <span className="text-sm text-gray-500">/ night</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function LandingPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [activeCategory, setActiveCategory] = useState("Beachfront");

  useEffect(() => {
    async function fetchHotels() {
      try {
        const res = await fetch("/api/hotels");
        if (res.ok) {
          const data = await res.json();
          setHotels(data.hotels || []);
        }
      } catch {}
    }
    fetchHotels();
  }, []);

  const displayHotels = hotels.length > 0
    ? hotels.slice(0, 8).map((h, idx) => ({
        id: h.id,
        name: h.name,
        city: h.city,
        country: h.country,
        starRating: h.starRating,
        rackRate: h.roomTypes?.length > 0 ? Math.max(...h.roomTypes.map(r => r.rackRate)) : 200,
        busyBedsRate: h.roomTypes?.length > 0 ? Math.min(...h.roomTypes.map(r => r.discountRate)) : 120,
        discount: h.roomTypes?.length > 0 ? Math.max(...h.roomTypes.map(r => Math.round(r.discountPercent))) : 40,
        image: `/images/hotels/hotel-${["serengeti","zanzibar","victoria","dar","arusha","nairobi","kampala","dodoma"][idx % 8]}.png`,
      }))
    : featuredHotels;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative overflow-hidden bg-white">
        {/* Hero Image Background */}
        <div className="relative h-[600px] sm:h-[650px] lg:h-[700px]">
          <Image
            src="/images/hotels/hero-banner.png"
            alt="East Africa Luxury Travel"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />

          {/* Hero Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white max-w-4xl leading-tight">
              Find Your Perfect
              <span className="block mt-1">East African Stay</span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-white/90 max-w-2xl">
              Unlock exclusive hotel discounts across Tanzania, Kenya & Uganda. Save up to 40% on luxury stays.
            </p>

            {/* Search Bar */}
            <div className="mt-8 w-full max-w-2xl">
              <Link href="/hotels" className="flex items-center bg-white rounded-full shadow-2xl p-2 hover:shadow-xl transition-shadow">
                <div className="flex-1 flex items-center gap-4 px-4">
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-800">Where</p>
                    <p className="text-sm text-gray-500">Search destinations</p>
                  </div>
                  <div className="h-8 w-px bg-gray-200" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-800">Check in</p>
                    <p className="text-sm text-gray-500">Add dates</p>
                  </div>
                  <div className="h-8 w-px bg-gray-200" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-800">Guests</p>
                    <p className="text-sm text-gray-500">Add guests</p>
                  </div>
                </div>
                <div className="bg-[#C9A84C] rounded-full p-3 shrink-0 hover:bg-[#b8963f] transition-colors">
                  <Search className="h-5 w-5 text-white" />
                </div>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 flex items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Verified Hotels</span>
              </div>
              <div className="w-px h-4 bg-white/30" />
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium">Up to 40% Off</span>
              </div>
              <div className="w-px h-4 bg-white/30 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">5K+ Members</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CATEGORY BAR ═══ */}
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

      {/* ═══ FEATURED HOTELS ═══ */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#222222]">
                Explore Hotels in East Africa
              </h2>
              <p className="mt-1 text-gray-500">
                Discover exclusive member discounts at top-rated hotels
              </p>
            </div>
            <Link href="/hotels">
              <Button variant="outline" className="rounded-full border-gray-300 text-[#222222] hover:border-[#222222] hidden sm:flex">
                Show all
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {displayHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Link href="/hotels">
              <Button className="bg-[#222222] hover:bg-[#444] text-white rounded-full px-8 h-12 font-semibold">
                Show all hotels
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#222222]">
              How BusyBeds Works
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Three simple steps to unlock luxury hotel savings across East Africa
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: CreditCard,
                step: "01",
                title: "Subscribe",
                desc: "Choose your membership plan and get coupon credits to unlock exclusive hotel deals across the region.",
              },
              {
                icon: MessageSquare,
                step: "02",
                title: "Contact Hotel",
                desc: "Use your coupon to reveal hotel contact details and negotiate directly with partner hotels for the best rates.",
              },
              {
                icon: Sparkles,
                step: "03",
                title: "Save Big",
                desc: "Enjoy luxury stays at unbeatable member rates — save up to 40% off standard rack rates at premium hotels.",
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C9A84C]/10">
                    <item.icon className="h-6 w-6 text-[#C9A84C]" />
                  </div>
                  <span className="text-4xl font-bold text-gray-200">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-[#222222]">{item.title}</h3>
                <p className="mt-2 text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SUBSCRIPTION PACKAGES ═══ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#222222]">
              Choose Your Plan
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Select the subscription that fits your travel style and start saving today
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                  pkg.popular
                    ? "bg-[#222222] text-white shadow-2xl ring-2 ring-[#C9A84C]"
                    : "bg-white text-[#222222] shadow-lg border border-gray-200"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-[#C9A84C] text-white rounded-full px-4 py-1 text-xs font-bold shadow-md">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className={`text-xl font-bold ${pkg.popular ? "text-white" : "text-[#222222]"}`}>
                    {pkg.name}
                  </h3>
                  <div className="mt-4">
                    <span className={`text-4xl font-extrabold ${pkg.popular ? "text-white" : "text-[#222222]"}`}>
                      {pkg.price}
                    </span>
                  </div>
                  <p className={`mt-2 text-sm ${pkg.popular ? "text-white/70" : "text-gray-500"}`}>
                    {pkg.coupons === 999 ? "Unlimited coupons" : `${pkg.coupons} coupon credits`}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${pkg.popular ? "text-[#C9A84C]" : "text-[#C9A84C]"}`} />
                      <span className={pkg.popular ? "text-white/80" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register" className="block">
                  <Button
                    className={`h-12 w-full rounded-xl font-semibold text-base ${
                      pkg.popular
                        ? "bg-[#C9A84C] hover:bg-[#b8963f] text-white"
                        : "bg-[#222222] hover:bg-[#444] text-white"
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#222222]">
              Frequently Asked Questions
            </h2>
          </div>

          <div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="bg-white rounded-xl mb-3 px-6 shadow-sm border-0"
                >
                  <AccordionTrigger className="text-left text-[#222222] hover:no-underline py-5 text-base font-semibold">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-500 pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative overflow-hidden bg-[#222222] py-20 sm:py-28">
        <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to Save on Your Next Stay?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            Join thousands of travellers who enjoy luxury hotel stays at members-only prices across East Africa.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button className="h-14 bg-[#C9A84C] hover:bg-[#b8963f] text-white rounded-full px-8 text-base font-semibold shadow-lg">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/hotels">
              <Button
                variant="outline"
                className="h-14 rounded-full border-white/30 text-white px-8 text-base font-semibold hover:bg-white/10"
              >
                Browse Hotels
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#f7f7f7] border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <BedDouble className="h-6 w-6 text-[#C9A84C]" />
                <span className="text-lg font-bold text-[#222222]">BusyBeds</span>
              </Link>
              <p className="mt-3 text-sm text-gray-500">
                Luxury hotel discounts for members across East Africa.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#222222]">Quick Links</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-500">
                <li><Link href="/hotels" className="hover:text-[#C9A84C] transition-colors">Browse Hotels</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-[#C9A84C] transition-colors">How It Works</Link></li>
                <li><Link href="/pricing" className="hover:text-[#C9A84C] transition-colors">Pricing</Link></li>
                <li><Link href="/register" className="hover:text-[#C9A84C] transition-colors">Sign Up</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#222222]">Support</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-500">
                <li><Link href="/contact" className="hover:text-[#C9A84C] transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-[#C9A84C] transition-colors">FAQ</Link></li>
                <li><Link href="/privacy" className="hover:text-[#C9A84C] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[#C9A84C] transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#222222]">Contact</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">support@busybeds.co.tz</li>
                <li className="flex items-center gap-2">+255 123 456 789</li>
                <li className="flex items-center gap-2 mt-3">
                  <Shield className="h-4 w-4 text-[#C9A84C]" /> Verified Hotels
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#C9A84C]" /> 24/7 Support
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} BusyBeds. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-[#C9A84C]">Privacy</Link>
              <Link href="/terms" className="hover:text-[#C9A84C]">Terms</Link>
              <Link href="/sitemap" className="hover:text-[#C9A84C]">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
