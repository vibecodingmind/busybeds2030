"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  BedDouble,
  LogOut,
  Ticket,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLoggedIn = !!session?.user;

  // Hide navbar on pages that have their own navigation
  const hideNavbar =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/hotel") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/coupons") ||
    pathname.startsWith("/bookings") ||
    pathname.startsWith("/subscription") ||
    pathname === "/login" ||
    pathname === "/register";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change (handled in link clicks)

  if (hideNavbar) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-nav scrolled"
          : "glass-nav"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <BedDouble className="h-7 w-7 text-[#C9A84C] drop-shadow-[0_0_10px_rgba(201,168,76,0.3)]" />
          <span className="text-xl font-bold text-[#C9A84C] drop-shadow-[0_0_16px_rgba(201,168,76,0.2)]">
            BusyBeds
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/hotels">
            <Button
              variant="ghost"
              className="text-white/70 hover:text-[#C9A84C] hover:bg-white/5"
            >
              Browse Hotels
            </Button>
          </Link>
          <Link href="/#how-it-works">
            <Button
              variant="ghost"
              className="text-white/70 hover:text-[#C9A84C] hover:bg-white/5"
            >
              How It Works
            </Button>
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="text-white/70 hover:text-[#C9A84C] hover:bg-white/5"
                >
                  <LayoutDashboard className="mr-1 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/coupons">
                <Button
                  variant="ghost"
                  className="text-white/70 hover:text-[#C9A84C] hover:bg-white/5"
                >
                  <Ticket className="mr-1 h-4 w-4" />
                  Coupons
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="text-white/70 hover:text-red-400 hover:bg-white/5"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="mr-1 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-white/70 hover:text-[#C9A84C] hover:bg-white/5"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="shimmer-gold rounded-xl font-semibold">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="text-white/70 hover:text-[#C9A84C] md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="glass-card-dark border-t border-white/5 md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            <Link href="/hotels" onClick={() => setMobileOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-white/70 hover:text-[#C9A84C] hover:bg-white/5"
              >
                Browse Hotels
              </Button>
            </Link>
            <Link href="/#how-it-works" onClick={() => setMobileOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-white/70 hover:text-[#C9A84C] hover:bg-white/5"
              >
                How It Works
              </Button>
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white/70 hover:text-[#C9A84C] hover:bg-white/5"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/coupons" onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white/70 hover:text-[#C9A84C] hover:bg-white/5"
                  >
                    <Ticket className="mr-2 h-4 w-4" />
                    My Coupons
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white/70 hover:text-red-400 hover:bg-white/5"
                  onClick={() => {
                    setMobileOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white/70 hover:text-[#C9A84C] hover:bg-white/5"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full shimmer-gold rounded-xl font-semibold">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
