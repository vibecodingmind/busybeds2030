"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Building2,
  Users,
  Ticket,
  LogOut,
  Menu,
  X,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/hotels", label: "Hotels", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
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

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-glass-gradient border-r border-white/5">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A84C] flex items-center justify-center glow-gold shadow-lg">
              <Crown className="w-6 h-6 text-[#0A1628]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#C9A84C]" style={{ textShadow: "0 0 16px rgba(201,168,76,0.3)" }}>
                BusyBeds
              </h1>
              <p className="text-xs text-white/40">Admin Panel</p>
            </div>
          </div>
        </div>

        <Separator className="bg-white/5" />

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200",
                isActive(item.href)
                  ? "glass-gold text-[#C9A84C] glow-gold"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive(item.href) && "drop-shadow-[0_0_8px_rgba(201,168,76,0.4)]")} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="mb-3 px-4">
            <p className="text-sm text-white/60">{session.user?.name}</p>
            <p className="text-xs text-white/30">{session.user?.email}</p>
          </div>
          <button
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-white/5 transition-all duration-200 w-full"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C9A84C] flex items-center justify-center">
              <Crown className="w-5 h-5 text-[#0A1628]" />
            </div>
            <span className="text-lg font-bold text-[#C9A84C]" style={{ textShadow: "0 0 12px rgba(201,168,76,0.3)" }}>
              BusyBeds Admin
            </span>
          </div>
          <button
            className={cn("text-white/60 hover:text-[#C9A84C] p-2 transition-colors", sidebarOpen && "text-[#C9A84C]")}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {sidebarOpen && (
          <div className="glass-card-dark border-t border-white/5 px-4 pb-4">
            <nav className="flex flex-col gap-1 pt-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200",
                    isActive(item.href)
                      ? "glass-gold text-[#C9A84C]"
                      : "text-white/50 hover:bg-white/5"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:bg-white/5 transition-all duration-200 w-full"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-glass-gradient-light overflow-auto">
        <div className="lg:p-0 pt-16 lg:pt-0">{children}</div>
      </main>
    </div>
  );
}
