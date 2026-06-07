'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BedDouble, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.newPassword) newErrors.newPassword = 'New password is required'
    else if (form.newPassword.length < 8)
      newErrors.newPassword = 'Password must be at least 8 characters'
    if (form.newPassword !== form.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      toast.error('Invalid or missing reset token')
      return
    }
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: form.newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to reset password')
        return
      }

      setResetSuccess(true)
      toast.success('Password reset successfully!')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  // No token - show error
  if (!token) {
    return (
      <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden bg-glass-gradient px-4 py-8">
        <div className="relative z-10 w-full max-w-md">
          <div className="glass-card-dark rounded-2xl p-8 text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-400" />
            <h1 className="mt-4 text-2xl font-bold text-white">Invalid Link</h1>
            <p className="mt-2 text-sm text-white/50">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Button
              className="mt-6 shimmer-gold text-[#0A1628] hover:bg-[#C9A84C]/90"
              onClick={() => router.push('/login')}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (resetSuccess) {
    return (
      <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden bg-glass-gradient px-4 py-8">
        <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-[#C9A84C]/10 blur-[100px] float" />
        <div className="relative z-10 w-full max-w-md">
          <div className="glass-card-dark rounded-2xl p-8 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-400" />
            <h1 className="mt-4 text-2xl font-bold text-white">Password Reset!</h1>
            <p className="mt-2 text-sm text-white/50">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <Button
              className="mt-6 shimmer-gold text-[#0A1628] hover:bg-[#C9A84C]/90"
              onClick={() => router.push('/login')}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden bg-glass-gradient px-4 py-8">
      <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-[#C9A84C]/10 blur-[100px] float" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-[#C9A84C]/8 blur-[80px] float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2.5">
            <BedDouble className="h-7 w-7 text-[#C9A84C] drop-shadow-[0_0_12px_rgba(201,168,76,0.4)]" />
            <span className="text-xl font-bold text-[#C9A84C] drop-shadow-[0_0_20px_rgba(201,168,76,0.3)]">
              BusyBeds
            </span>
          </span>
        </div>

        <div className="glass-card-dark rounded-2xl p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <p className="mt-1 text-sm text-white/50">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-white/70">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={form.newPassword}
                  onChange={(e) => updateField('newPassword', e.target.value)}
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
              {errors.newPassword && <p className="text-sm text-red-400">{errors.newPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/70">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your new password"
                  value={form.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
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

            <Button
              type="submit"
              className="h-12 w-full rounded-xl shimmer-gold text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-[#C9A84C] hover:text-[#d4b96a] transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
    </Suspense>
  )
}
