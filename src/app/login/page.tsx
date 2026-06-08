"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import {
  BedDouble,
  Eye,
  EyeOff,
  Shield,
  Building2,
  User,
  Loader2,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const demoAccounts = [
  {
    label: "Admin",
    email: "admin@busybeds.com",
    password: "password123",
    icon: Shield,
    color: "bg-red-50 border-red-200 hover:bg-red-100",
    iconColor: "text-red-500",
  },
  {
    label: "Hotel Staff",
    email: "serengeti@busybeds.com",
    password: "password123",
    icon: Building2,
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    iconColor: "text-blue-500",
  },
  {
    label: "Guest",
    email: "john@busybeds.com",
    password: "password123",
    icon: User,
    color: "bg-green-50 border-green-200 hover:bg-green-100",
    iconColor: "text-green-500",
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotDialogOpen, setForgotDialogOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      toast.success("Account created successfully! Please check your email to verify your account before logging in.");
    }
    if (searchParams.get("verified") === "true") {
      toast.success("Email verified successfully! You can now log in.");
    }
    const error = searchParams.get("error");
    if (error === "missing-token") {
      toast.error("Verification link is invalid. Please request a new one.");
    } else if (error === "invalid-or-expired-token") {
      toast.error("Verification link has expired. Please request a new one.");
    } else if (error === "verification-failed") {
      toast.error("Email verification failed. Please try again.");
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
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        toast.error(result.error || "Invalid email or password. Please try again.");
        return;
      }
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      toast.success("Welcome back!");
      const role = session?.user?.role;
      if (role === "ADMIN") router.push("/admin");
      else if (role === "HOTEL_STAFF") router.push("/hotel/dashboard");
      else router.push("/dashboard");
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

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setForgotSent(true);
      toast.success(data.message || "If that email exists, we've sent a reset link.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-80px)]">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/images/hotels/hero-banner.png"
          alt="East Africa Luxury Travel"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12">
          <h2 className="text-3xl font-bold text-white mb-2">Discover East Africa</h2>
          <p className="text-white/90">Unlock exclusive hotel discounts across Tanzania, Kenya & Uganda</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 bg-white lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-8">
              <BedDouble className="h-8 w-8 text-[#C9A84C]" />
              <span className="text-2xl font-bold text-[#222222]">BusyBeds</span>
            </Link>
            <h1 className="text-2xl font-bold text-[#222222]">Welcome back</h1>
            <p className="mt-1 text-gray-500">Log in to access your member discounts</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#222222]">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="h-12 rounded-xl border-gray-300 text-[#222222] placeholder:text-gray-400 focus:border-[#C9A84C] focus:ring-[#C9A84C]"
                disabled={loading || !!demoLoading}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#222222]">Password</Label>
                <button
                  type="button"
                  onClick={() => { setForgotDialogOpen(true); setForgotSent(false); setForgotEmail(form.email || ""); }}
                  className="text-sm text-[#C9A84C] hover:text-[#b8963f] font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="h-12 rounded-xl border-gray-300 pr-10 text-[#222222] placeholder:text-gray-400 focus:border-[#C9A84C] focus:ring-[#C9A84C]"
                  disabled={loading || !!demoLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-[#C9A84C] hover:bg-[#b8963f] text-white font-semibold text-base"
              disabled={loading || !!demoLoading}
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Logging In...</>
              ) : "Log In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400">Quick Demo Access</span>
            </div>
          </div>

          {/* Demo Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {demoAccounts.map((account) => (
              <button
                key={account.label}
                onClick={() => handleDemoLogin(account)}
                disabled={loading || !!demoLoading}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all duration-200 disabled:opacity-50 ${account.color}`}
              >
                {demoLoading === account.label ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                ) : (
                  <account.icon className={`h-5 w-5 ${account.iconColor}`} />
                )}
                <span className="text-[11px] font-semibold text-[#222222]">{account.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-[#C9A84C] hover:text-[#b8963f]">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotDialogOpen} onOpenChange={setForgotDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#222222]">
              <KeyRound className="h-5 w-5 text-[#C9A84C]" /> Reset Password
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              {forgotSent
                ? "Check your email for a password reset link."
                : "Enter your email address and we'll send you a link to reset your password."}
            </DialogDescription>
          </DialogHeader>
          {!forgotSent ? (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-[#222222]">Email Address</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="john@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="h-11 rounded-xl border-gray-300 focus:border-[#C9A84C] focus:ring-[#C9A84C]"
                  disabled={forgotLoading}
                />
              </div>
              <Button
                className="w-full h-11 bg-[#C9A84C] hover:bg-[#b8963f] text-white font-semibold rounded-xl"
                onClick={handleForgotPassword}
                disabled={forgotLoading}
              >
                {forgotLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : "Send Reset Link"}
              </Button>
            </div>
          ) : (
            <div className="py-2">
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                <p className="text-sm text-green-700">If an account with that email exists, we&apos;ve sent a password reset link.</p>
                <p className="mt-2 text-xs text-gray-500">Check your inbox and spam folder.</p>
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full rounded-xl border-gray-300"
                onClick={() => setForgotDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="text-center">
            <BedDouble className="mx-auto h-8 w-8 animate-pulse text-[#C9A84C]" />
            <p className="mt-2 text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
