"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Hotel, ScanSearch, CalendarDays, LogOut, Menu, X, BedDouble } from "lucide-react";

export default function HotelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (
      status === "authenticated" &&
      session?.user?.role !== "HOTEL_STAFF" &&
      session?.user?.role !== "ADMIN"
    ) {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-glass-gradient">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A84C]" />
      </div>
    );
  }

  if (!session) return null;

  const navItems = [
    {
      href: "/hotel/dashboard",
      label: "Dashboard",
      icon: Hotel,
    },
    {
      href: "/hotel/verify",
      label: "Verify",
      icon: ScanSearch,
    },
    {
      href: "/hotel/bookings",
      label: "Bookings",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-glass-gradient-light">
      {/* Desktop Layout */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-glass-gradient glass-card-dark min-h-screen relative">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#C9A84C]/5 via-transparent to-[#C9A84C]/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full">
            {/* Logo Area */}
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl glass-gold flex items-center justify-center glow-gold">
                  <BedDouble className="w-6 h-6 text-[#C9A84C]" />
                </div>
                <div>
                  <h1
                    className="text-lg font-bold text-[#C9A84C]"
                    style={{ textShadow: "0 0 16px rgba(201,168,76,0.3)" }}
                  >
                    BusyBeds
                  </h1>
                  <p className="text-xs text-gray-400">Hotel Portal</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-white/5 mx-4" />

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium transition-all duration-200 ${
                      isActive
                        ? "glass-gold text-[#C9A84C] glow-gold"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4">
              <div className="h-px bg-white/5 mb-4" />
              <div className="mb-3 px-4">
                <p className="text-sm text-gray-300">{session.user?.name}</p>
                <p className="text-xs text-gray-500">{session.user?.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-white/5 transition-all duration-200 w-full"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 lg:p-0 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl glass-gold flex items-center justify-center">
              <BedDouble className="w-5 h-5 text-[#C9A84C]" />
            </div>
            <div>
              <h1
                className="text-base font-bold text-[#C9A84C]"
                style={{ textShadow: "0 0 12px rgba(201,168,76,0.3)" }}
              >
                BusyBeds
              </h1>
              <p className="text-[10px] text-gray-400 leading-none">Hotel Portal</p>
            </div>
          </div>
          <button
            className={`p-2 rounded-xl transition-colors duration-200 ${menuOpen ? "text-[#C9A84C]" : "text-white"}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="glass-card-dark border-t-0 px-4 pb-4">
            <nav className="flex flex-col gap-1 pt-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-lg font-medium transition-all duration-200 ${
                      isActive
                        ? "glass-gold text-[#C9A84C]"
                        : "text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-lg font-medium text-red-400 hover:bg-white/5 transition-all duration-200 w-full"
              >
                <LogOut className="w-6 h-6" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="glass-card-dark border-t border-white/5">
          <div className="flex items-center justify-around py-2 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl min-w-[72px] transition-all duration-200 ${
                    isActive
                      ? "glass-gold text-[#C9A84C]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Spacer for mobile top bar */}
      <div className="lg:hidden h-14" />
    </div>
  );
}
