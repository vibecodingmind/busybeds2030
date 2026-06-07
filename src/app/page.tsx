"use client";

import Link from "next/link";
import {
  BedDouble,
  Star,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  MessageSquare,
  Sparkles,
  Shield,
  Clock,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    gradient: "from-amber-900/40 to-orange-900/30",
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
    gradient: "from-cyan-900/40 to-blue-900/30",
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
    gradient: "from-emerald-900/40 to-teal-900/30",
  },
];

const packages = [
  {
    name: "Starter",
    coupons: 5,
    price: "TZS 20,000",
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

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-glass-gradient min-h-[90vh] flex items-center">
        {/* Animated orbs */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-[#C9A84C]/8 blur-[120px] float" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-[#C9A84C]/6 blur-[100px] float" style={{ animationDelay: "3s" }} />
        <div className="pointer-events-none absolute top-1/3 right-1/3 h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-[80px] float" style={{ animationDelay: "5s" }} />

        {/* Grid pattern overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <Badge className="mb-6 border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] hover:bg-[#C9A84C]/20 backdrop-blur-sm">
              <Sparkles className="mr-1 h-3 w-3" />
              Exclusive Member Discounts
            </Badge>

            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl">
              Luxury Hotels at{" "}
              <span className="bg-gradient-to-r from-[#C9A84C] via-[#e8d08a] to-[#C9A84C] bg-clip-text text-transparent">
                Members-Only
              </span>{" "}
              Prices
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-white/60 sm:text-xl">
              Subscribe to BusyBeds and unlock exclusive hotel discounts across
              East Africa. Save up to 40% on luxury stays with member-only
              rates.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/hotels">
                <Button
                  size="lg"
                  className="h-13 shimmer-gold rounded-xl px-8 text-base"
                >
                  Browse Hotels
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 rounded-xl border-white/20 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
                >
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
              {[
                { value: "150+", label: "Partner Hotels" },
                { value: "3", label: "Countries" },
                { value: "40%", label: "Max Discount" },
                { value: "5K+", label: "Happy Members" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="glass-card-dark flex flex-col items-center rounded-2xl px-6 py-5"
                >
                  <span className="text-2xl font-bold text-[#C9A84C] sm:text-3xl drop-shadow-[0_0_12px_rgba(201,168,76,0.3)]">
                    {stat.value}
                  </span>
                  <span className="mt-1 text-xs text-white/50 sm:text-sm">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f0f4f8] to-transparent" />
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="bg-glass-gradient-light py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 border-[#C9A84C]/20 bg-[#C9A84C]/10 text-[#b8963f]">
              Simple Process
            </Badge>
            <h2 className="text-3xl font-bold text-[#0A1628] sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Three simple steps to unlock luxury hotel savings across East
              Africa
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: CreditCard,
                step: "1",
                title: "Subscribe",
                desc: "Choose your plan and get coupon credits to unlock exclusive hotel deals.",
              },
              {
                icon: MessageSquare,
                step: "2",
                title: "Contact Hotel",
                desc: "Use your coupon to get hotel contact details and negotiate directly with partner hotels.",
              },
              {
                icon: Sparkles,
                step: "3",
                title: "Save Big",
                desc: "Enjoy luxury stays at unbeatable member rates — up to 40% off rack rates.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="glass-card group rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A1628] shadow-lg">
                      <item.icon className="h-8 w-8 text-[#C9A84C]" />
                    </div>
                    <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#C9A84C] text-xs font-bold text-[#0A1628] shadow-md">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#0A1628]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED HOTELS ═══ */}
      <section className="relative overflow-hidden bg-glass-gradient py-20 sm:py-28">
        {/* Background decorations */}
        <div className="pointer-events-none absolute top-0 left-0 h-[400px] w-[400px] rounded-full bg-[#C9A84C]/5 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-[80px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C]">
              Top Deals
            </Badge>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Featured Hotels
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/50">
              Discover our most popular partner hotels with incredible member
              discounts
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="glass-card-dark group overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Photo area */}
                <div className={`relative h-48 bg-gradient-to-br ${hotel.gradient}`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BedDouble className="h-12 w-12 text-white/20" />
                  </div>
                  <Badge className="absolute top-4 right-4 rounded-lg bg-[#C9A84C] px-3 py-1 text-sm font-bold text-[#0A1628] shadow-lg">
                    -{hotel.discount}%
                  </Badge>
                  <div className="absolute bottom-4 left-4 flex items-center gap-1">
                    {Array.from({ length: hotel.starRating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-[#C9A84C] text-[#C9A84C] drop-shadow"
                      />
                    ))}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-white">
                    {hotel.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1 text-sm text-white/40">
                    <MapPin className="h-3.5 w-3.5" />
                    {hotel.city}, {hotel.country}
                  </div>

                  <div className="mt-4 flex items-end gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/30">
                        Rack Rate
                      </p>
                      <p className="text-lg font-semibold text-white/40 line-through">
                        ${hotel.rackRate}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#C9A84C]">
                        BusyBeds Rate
                      </p>
                      <p className="text-2xl font-bold text-white">
                        ${hotel.busyBedsRate}
                      </p>
                    </div>
                  </div>

                  <Link href={`/hotels/${hotel.id}`} className="mt-4 block">
                    <Button className="h-11 w-full rounded-xl bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 border border-white/10">
                      View Deal
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/hotels">
              <Button
                size="lg"
                className="h-13 shimmer-gold rounded-xl px-8 text-base"
              >
                View All Hotels
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ SUBSCRIPTION PACKAGES ═══ */}
      <section className="bg-glass-gradient-light py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 border-[#C9A84C]/20 bg-[#C9A84C]/10 text-[#b8963f]">
              Pricing
            </Badge>
            <h2 className="text-3xl font-bold text-[#0A1628] sm:text-4xl">
              Choose Your Plan
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Select the subscription that fits your travel style and start
              saving today
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                  pkg.popular
                    ? "glass-gold shadow-xl ring-1 ring-[#C9A84C]/30"
                    : "glass-card shadow-lg"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="shimmer-gold rounded-full px-4 py-1 text-xs font-bold">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <div
                    className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${
                      pkg.popular ? "bg-[#C9A84C]" : "bg-[#0A1628]"
                    } shadow-lg`}
                  >
                    <CreditCard
                      className={`h-7 w-7 ${
                        pkg.popular ? "text-[#0A1628]" : "text-[#C9A84C]"
                      }`}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-[#0A1628]">
                    {pkg.name}
                  </h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-[#0A1628]">
                      {pkg.price}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {pkg.coupons === 999
                      ? "Unlimited coupons"
                      : `${pkg.coupons} coupon credits`}
                  </p>
                </div>

                <ul className="mt-6 space-y-3">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A84C]" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register" className="mt-6 block">
                  <Button
                    className={`h-11 w-full rounded-xl font-semibold ${
                      pkg.popular
                        ? "shimmer-gold"
                        : "bg-[#0A1628] text-white hover:bg-[#132240]"
                    }`}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 border-[#C9A84C]/20 bg-[#C9A84C]/10 text-[#b8963f]">
              FAQ
            </Badge>
            <h2 className="text-3xl font-bold text-[#0A1628] sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-12">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="glass-card mb-3 rounded-xl border-0 px-4"
                >
                  <AccordionTrigger className="text-left text-[#0A1628] hover:no-underline py-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative overflow-hidden bg-glass-gradient py-20 sm:py-28">
        <div className="pointer-events-none absolute top-0 left-1/4 h-[300px] w-[300px] rounded-full bg-[#C9A84C]/8 blur-[80px] float" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-[200px] w-[200px] rounded-full bg-[#C9A84C]/6 blur-[60px] float" style={{ animationDelay: "2s" }} />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Save on Your Next Stay?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/50">
            Join thousands of travellers who enjoy luxury hotel stays at
            members-only prices across East Africa.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="h-13 shimmer-gold rounded-xl px-8 text-base"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/hotels">
              <Button
                size="lg"
                variant="outline"
                className="h-13 rounded-xl border-white/20 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
              >
                Browse Hotels
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/5 bg-[#0A1628] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <BedDouble className="h-6 w-6 text-[#C9A84C]" />
                <span className="text-lg font-bold text-[#C9A84C]">
                  BusyBeds
                </span>
              </Link>
              <p className="mt-3 text-sm text-white/40">
                Luxury hotel discounts for members across East Africa.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white">Quick Links</h4>
              <ul className="mt-3 space-y-2 text-sm text-white/40">
                <li>
                  <Link
                    href="/hotels"
                    className="hover:text-[#C9A84C] transition-colors"
                  >
                    Browse Hotels
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#how-it-works"
                    className="hover:text-[#C9A84C] transition-colors"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="hover:text-[#C9A84C] transition-colors"
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white">Contact</h4>
              <ul className="mt-3 space-y-2 text-sm text-white/40">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#C9A84C]" />
                  support@busybeds.co.tz
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#C9A84C]" />
                  +255 123 456 789
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white">Trust & Safety</h4>
              <ul className="mt-3 space-y-2 text-sm text-white/40">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#C9A84C]" />
                  Verified Hotels
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#C9A84C]" />
                  24/7 Support
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#C9A84C]" />
                  5,000+ Members
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/5 pt-6 text-center text-sm text-white/30">
            &copy; {new Date().getFullYear()} BusyBeds. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
