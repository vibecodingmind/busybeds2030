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
  Search,
  Globe,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLoggedIn = !!session?.user;

  const hideNavbar =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/hotel/") || pathname === "/hotel";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (hideNavbar) return null;

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-nav scrolled"
          : "glass-nav"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <BedDouble className="h-8 w-8 text-[#C9A84C]" />
          <span className="text-2xl font-bold text-[#222222] tracking-tight">
            BusyBeds
          </span>
        </Link>

        {/* Center - Search bar (desktop) */}
        <div className="hidden md:flex items-center">
          <Link href="/hotels" className="flex items-center border border-gray-300 rounded-full py-2 px-4 shadow-sm hover:shadow-md transition-shadow gap-3">
            <span className="text-sm font-semibold text-[#222222]">Anywhere</span>
            <span className="h-6 w-px bg-gray-300" />
            <span className="text-sm font-semibold text-[#222222]">Any week</span>
            <span className="h-6 w-px bg-gray-300" />
            <span className="text-sm text-gray-500">Add guests</span>
            <div className="bg-[#C9A84C] rounded-full p-2 ml-1">
              <Search className="h-3 w-3 text-white" />
            </div>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/hotels">
            <Button
              variant="ghost"
              className="text-[#222222] hover:bg-gray-100 rounded-full font-medium text-sm"
            >
              Browse Hotels
            </Button>
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="text-[#222222] hover:bg-gray-100 rounded-full font-medium text-sm"
                >
                  <LayoutDashboard className="mr-1 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/coupons">
                <Button
                  variant="ghost"
                  className="text-[#222222] hover:bg-gray-100 rounded-full font-medium text-sm"
                >
                  <Ticket className="mr-1 h-4 w-4" />
                  Coupons
                </Button>
              </Link>
              <div className="flex items-center border border-gray-300 rounded-full py-1.5 px-3 ml-2 gap-2 hover:shadow-md transition-shadow cursor-pointer" onClick={() => signOut({ callbackUrl: "/" })}>
                <Menu className="h-4 w-4 text-gray-600" />
                <UserCircle className="h-7 w-7 text-gray-600" />
              </div>
            </>
          ) : (
            <div className="flex items-center border border-gray-300 rounded-full py-1.5 px-3 ml-2 gap-2 hover:shadow-md transition-shadow">
              <Menu className="h-4 w-4 text-gray-600" />
              <Link href="/login">
                <UserCircle className="h-7 w-7 text-gray-600 cursor-pointer" />
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="text-[#222222] md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            <Link href="/hotels" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-[#222222] hover:bg-gray-100 rounded-xl font-medium">
                Browse Hotels
              </Button>
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-[#222222] hover:bg-gray-100 rounded-xl font-medium">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </Button>
                </Link>
                <Link href="/coupons" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-[#222222] hover:bg-gray-100 rounded-xl font-medium">
                    <Ticket className="mr-2 h-4 w-4" /> Coupons
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:bg-red-50 rounded-xl font-medium"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-[#222222] hover:bg-gray-100 rounded-xl font-medium">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-[#C9A84C] hover:bg-[#b8963f] text-white rounded-xl font-semibold">
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
