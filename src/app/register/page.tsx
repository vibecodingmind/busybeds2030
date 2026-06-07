"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BedDouble, Eye, EyeOff, Loader2 } from "lucide-react";
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
      toast.success("Account created! Please log in.");
      router.push("/login?registered=true");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-[#C9A84C]/10 blur-[100px] float" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-[#C9A84C]/8 blur-[80px] float" style={{ animationDelay: "2s" }} />

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
            <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
            <p className="mt-1 text-sm text-white/50">
              Join BusyBeds and start saving on luxury hotels
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/70">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#C9A84C]/50 focus:bg-white/10"
                disabled={loading}
              />
              {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/70">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#C9A84C]/50 focus:bg-white/10"
                disabled={loading}
              />
              {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white/70">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+255 123 456 789"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#C9A84C]/50 focus:bg-white/10"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/70">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="h-11 rounded-xl border-white/10 bg-white/5 pr-10 text-white placeholder:text-white/30 focus:border-[#C9A84C]/50 focus:bg-white/10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-white/40 hover:text-white/70"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/70">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  className="h-11 rounded-xl border-white/10 bg-white/5 pr-10 text-white placeholder:text-white/30 focus:border-[#C9A84C]/50 focus:bg-white/10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-white/40 hover:text-white/70"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-400">{errors.confirmPassword}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => {
                    setTermsAccepted(checked === true);
                    if (errors.terms) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.terms;
                        return next;
                      });
                    }
                  }}
                  className="mt-1 border-white/20"
                  disabled={loading}
                />
                <Label htmlFor="terms" className="text-sm leading-snug text-white/50">
                  I agree to the{" "}
                  <span className="text-[#C9A84C] underline cursor-pointer">Terms of Service</span>{" "}
                  and{" "}
                  <span className="text-[#C9A84C] underline cursor-pointer">Privacy Policy</span>
                </Label>
              </div>
              {errors.terms && <p className="text-sm text-red-400">{errors.terms}</p>}
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl shimmer-gold text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/40">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-[#C9A84C] hover:text-[#d4b96a] transition-colors">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
