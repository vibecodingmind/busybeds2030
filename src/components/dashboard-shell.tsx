"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  Ticket,
  Building2,
  History,
  CreditCard,
  LogOut,
  ChevronLeft,
  BedDouble,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/coupons", label: "My Coupons", icon: Ticket },
  { href: "/hotels", label: "Browse Hotels", icon: Building2 },
  { href: "/bookings", label: "Booking History", icon: History },
  { href: "/subscription", label: "Subscription", icon: CreditCard },
];

function SidebarContent({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex h-full flex-col bg-glass-gradient">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C9A84C] font-bold text-[#0A1628] shadow-lg glow-gold">
          BB
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-[#C9A84C] drop-shadow-[0_0_10px_rgba(201,168,76,0.3)]">
            BusyBeds
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="ml-auto text-white/40 hover:text-white/70 hover:bg-white/5 hidden lg:flex"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      <Separator className="bg-white/5" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "glass-gold text-[#C9A84C] shadow-sm"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive &&
                      "drop-shadow-[0_0_8px_rgba(201,168,76,0.4)]"
                  )}
                />
                {!collapsed && <span>{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-white/5" />

      {/* User info */}
      <div className="px-2 py-4">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2",
            collapsed && "justify-center"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C9A84C] text-xs font-bold text-[#0A1628] shadow-md">
            {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white/80">
                {session?.user?.name || "User"}
              </p>
              <p className="truncate text-xs text-white/30">
                {session?.user?.email || ""}
              </p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className={cn(
            "mt-2 w-full text-white/40 hover:bg-white/5 hover:text-red-400",
            collapsed && "justify-center px-2"
          )}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-white/5 transition-all duration-300",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-14 items-center gap-3 border-b border-white/5 bg-glass-gradient px-4 lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#C9A84C] text-xs font-bold text-[#0A1628]">
              BB
            </div>
            <span className="font-semibold text-[#C9A84C]">BusyBeds</span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-glass-gradient-light p-4 pb-24 md:p-6 lg:p-8 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}
