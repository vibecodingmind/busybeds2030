"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Ticket,
  Building2,
  History,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/coupons", label: "Coupons", icon: Ticket },
  { href: "/hotels", label: "Hotels", icon: Building2 },
  { href: "/bookings", label: "Bookings", icon: History },
  { href: "/subscription", label: "Plan", icon: CreditCard },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0A1628]/95 backdrop-blur-xl lg:hidden safe-bottom">
      <div className="flex items-center justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all duration-200 min-w-[52px]",
                isActive
                  ? "text-[#C9A84C]"
                  : "text-white/40 hover:text-white/60"
              )}
            >
              {isActive && (
                <div className="absolute -top-2 h-0.5 w-8 rounded-full bg-[#C9A84C] shadow-[0_0_8px_rgba(201,168,76,0.5)]" />
              )}
              <item.icon
                className={cn(
                  "h-5 w-5 transition-all",
                  isActive &&
                    "drop-shadow-[0_0_8px_rgba(201,168,76,0.5)]"
                )}
              />
              <span
                className={cn(
                  "text-[10px]",
                  isActive ? "font-bold" : "font-medium"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
