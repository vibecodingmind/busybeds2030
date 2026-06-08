"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BedDouble, Eye, EyeOff, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email address";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!termsAccepted)
      newErrors.terms = "You must accept the terms and conditions";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      setRegisteredEmail(form.email);
      setRegistrationSuccess(true);
      toast.success("Account created! Please check your email to verify.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      });
      const data = await res.json();
      toast.success(data.message || "Verification email sent!");
    } catch {
      toast.error("Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  if (registrationSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-white px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-[#222222]">Check Your Email</h1>
          <p className="mt-2 text-gray-500">
            We&apos;ve sent a verification link to <strong className="text-[#222222]">{registeredEmail}</strong>
          </p>
          <p className="mt-1 text-sm text-gray-400">Click the link in the email to verify your account, then log in.</p>
          <div className="mt-6 space-y-3">
            <Button
              className="w-full h-12 bg-[#C9A84C] hover:bg-[#b8963f] text-white font-semibold rounded-xl"
              onClick={() => router.push("/login?registered=true")}
            >
              Go to Login
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl border-gray-300"
              onClick={handleResendVerification}
              disabled={resendLoading}
            >
              {resendLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : "Resend Verification Email"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-80px)]">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/images/hotels/hotel-zanzibar.png"
          alt="Zanzibar Beach Resort"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12">
          <h2 className="text-3xl font-bold text-white mb-2">Start Saving Today</h2>
          <p className="text-white/90">Join BusyBeds and unlock exclusive hotel discounts across East Africa</p>
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
            <h1 className="text-2xl font-bold text-[#222222]">Create your account</h1>
            <p className="mt-1 text-gray-500">Start saving on luxury hotels across East Africa</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#222222]">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="h-12 rounded-xl border-gray-300 text-[#222222] placeholder:text-gray-400 focus:border-[#C9A84C] focus:ring-[#C9A84C]"
                disabled={loading}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#222222]">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="h-12 rounded-xl border-gray-300 text-[#222222] placeholder:text-gray-400 focus:border-[#C9A84C] focus:ring-[#C9A84C]"
                disabled={loading}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#222222]">Phone (Optional)</Label>
              <Input
                id="phone"
                placeholder="+255 123 456 789"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="h-12 rounded-xl border-gray-300 text-[#222222] placeholder:text-gray-400 focus:border-[#C9A84C] focus:ring-[#C9A84C]"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#222222]">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="h-12 rounded-xl border-gray-300 pr-10 text-[#222222] placeholder:text-gray-400 focus:border-[#C9A84C] focus:ring-[#C9A84C]"
                  disabled={loading}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#222222]">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  className="h-12 rounded-xl border-gray-300 pr-10 text-[#222222] placeholder:text-gray-400 focus:border-[#C9A84C] focus:ring-[#C9A84C]"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => {
                  setTermsAccepted(checked as boolean);
                  if (errors.terms) setErrors((prev) => { const next = { ...prev }; delete next.terms; return next; });
                }}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-500">
                I agree to the{" "}
                <Link href="/terms" className="text-[#C9A84C] hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-[#C9A84C] hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-[#C9A84C] hover:bg-[#b8963f] text-white font-semibold text-base"
              disabled={loading}
            >
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Account...</> : "Create Account"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-[#C9A84C] hover:text-[#b8963f]">Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
