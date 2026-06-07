"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  BedDouble,
  Eye,
  EyeOff,
  Shield,
  Building2,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const demoAccounts = [
  {
    label: "Admin",
    email: "admin@busybeds.com",
    password: "password123",
    icon: Shield,
    color: "from-red-500/20 to-orange-500/20 border-red-500/30 hover:border-red-400/50",
  },
  {
    label: "Hotel Staff",
    email: "serengeti@busybeds.com",
    password: "password123",
    icon: Building2,
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-400/50",
  },
  {
    label: "Guest",
    email: "john@busybeds.com",
    password: "password123",
    icon: User,
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30 hover:border-green-400/50",
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      toast.success("Account created successfully! Please log in.");
    }
  }, [searchParams]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email address";
    if (!form.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password. Please try again.");
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      toast.success("Welcome back!");

      const role = session?.user?.role;
      if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "HOTEL_STAFF") {
        router.push("/hotel/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await handleLogin(form.email, form.password);
    setLoading(false);
  };

  const handleDemoLogin = async (account: (typeof demoAccounts)[0]) => {
    setDemoLoading(account.label);
    await handleLogin(account.email, account.password);
    setDemoLoading(null);
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-glass-gradient px-4 py-8">
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-[#C9A84C]/10 blur-[100px] float" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-[#C9A84C]/8 blur-[80px] float" style={{ animationDelay: "2s" }} />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9A84C]/5 blur-[60px] float" style={{ animationDelay: "4s" }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <BedDouble className="h-9 w-9 text-[#C9A84C] drop-shadow-[0_0_12px_rgba(201,168,76,0.4)]" />
            <span className="text-2xl font-bold text-[#C9A84C] drop-shadow-[0_0_20px_rgba(201,168,76,0.3)]">
              BusyBeds
            </span>
          </Link>
        </div>

        {/* Glass Card */}
        <div className="glass-card-dark rounded-2xl p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="mt-1 text-sm text-white/50">
              Log in to access your member discounts
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/70">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#C9A84C]/50 focus:bg-white/10"
                disabled={loading || !!demoLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/70">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="h-11 rounded-xl border-white/10 bg-white/5 pr-10 text-white placeholder:text-white/30 focus:border-[#C9A84C]/50 focus:bg-white/10"
                  disabled={loading || !!demoLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-white/40 hover:text-white/70"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="h-12 w-full rounded-xl shimmer-gold text-base"
              disabled={loading || !!demoLoading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging In...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-transparent px-3 text-white/40">
                Quick Demo Access
              </span>
            </div>
          </div>

          {/* Demo Account Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {demoAccounts.map((account) => (
              <button
                key={account.label}
                onClick={() => handleDemoLogin(account)}
                disabled={loading || !!demoLoading}
                className={`flex flex-col items-center gap-1.5 rounded-xl bg-gradient-to-b ${account.color} px-3 py-3 transition-all duration-200 disabled:opacity-50`}
              >
                {demoLoading === account.label ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white/80" />
                ) : (
                  <account.icon className="h-5 w-5 text-white/80" />
                )}
                <span className="text-[11px] font-semibold text-white/80">
                  {account.label}
                </span>
              </button>
            ))}
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-white/40">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-[#C9A84C] hover:text-[#d4b96a] transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-glass-gradient">
          <div className="text-center">
            <BedDouble className="mx-auto h-8 w-8 animate-pulse text-[#C9A84C]" />
            <p className="mt-2 text-white/50">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
