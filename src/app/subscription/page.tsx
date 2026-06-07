'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Check,
  Crown,
  Zap,
  Star,
  Phone,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface SubscriptionData {
  id: string
  package: string
  creditsTotal: number
  creditsUsed: number
  creditsRemaining: number
  startDate: string
  renewalDate: string
  status: string
}

const plans = [
  {
    name: 'STARTER',
    price: 'TZS 20,000',
    priceNum: 20000,
    period: '/month',
    coupons: 5,
    icon: Zap,
    features: [
      'Access to all partner hotels',
      'Verified discount coupons',
      'WhatsApp support',
    ],
    buttonText: 'Choose Starter',
    popular: false,
  },
  {
    name: 'STANDARD',
    price: 'TZS 50,000',
    priceNum: 50000,
    period: '/month',
    coupons: 15,
    icon: Star,
    features: [
      'Everything in Starter',
      'Priority hotel access',
      'SMS + WhatsApp notifications',
      'Booking history',
    ],
    buttonText: 'Choose Standard',
    popular: true,
  },
  {
    name: 'PREMIUM',
    price: 'TZS 120,000',
    priceNum: 120000,
    period: '/month',
    coupons: 999,
    couponsLabel: 'Unlimited',
    icon: Crown,
    features: [
      'Everything in Standard',
      'Unlimited bookings',
      'Dedicated support',
      'Early access to new hotels',
    ],
    buttonText: 'Choose Premium',
    popular: false,
  },
]

export default function SubscriptionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchSubscription()
  }, [])

  async function fetchSubscription() {
    try {
      const res = await fetch('/api/subscription')
      if (res.ok) {
        const data = await res.json()
        setSubscription(data.subscription)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  function handleSelectPlan(planName: string) {
    setSelectedPlan(planName)
    setPhoneNumber('')
    setDrawerOpen(true)
  }

  async function handlePayment() {
    if (!phoneNumber || phoneNumber.length < 9) {
      toast.error('Please enter a valid phone number')
      return
    }

    setProcessing(true)
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package: selectedPlan,
          paymentRef: `MPESA-${phoneNumber}-${Date.now()}`,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to create subscription')
        return
      }

      toast.success('Subscription created successfully!')
      setDrawerOpen(false)
      router.push('/dashboard')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    )
  }

  // If user has active subscription, show current plan
  if (subscription) {
    const plan = plans.find((p) => p.name === subscription.package)
    const usedPercent =
      subscription.creditsTotal > 0
        ? (subscription.creditsUsed / subscription.creditsTotal) * 100
        : 0

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628] md:text-3xl">
            My Subscription
          </h1>
          <p className="mt-1 text-gray-500">
            Manage your BusyBeds membership
          </p>
        </div>

        <Card className="glass-card rounded-2xl border-[#C9A84C]/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-[#0A1628]">
                  {plan?.icon && <plan.icon className="mr-2 inline h-5 w-5 text-[#C9A84C]" />}
                  {subscription.package} Plan
                </CardTitle>
                <CardDescription className="mt-1">
                  Active subscription
                </CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200 backdrop-blur-sm">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="glass-white rounded-lg p-4">
                <p className="text-sm text-gray-500">Monthly Price</p>
                <p className="text-lg font-semibold text-[#0A1628]">
                  {plan?.price || 'N/A'}
                </p>
              </div>
              <div className="glass-white rounded-lg p-4">
                <p className="text-sm text-gray-500">Renewal Date</p>
                <p className="text-lg font-semibold text-[#0A1628]">
                  {new Date(subscription.renewalDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Coupons Used</span>
                <span className="font-medium text-[#0A1628]">
                  {subscription.creditsUsed} / {subscription.creditsTotal === 999 ? '∞' : subscription.creditsTotal}
                </span>
              </div>
              <Progress value={subscription.creditsTotal === 999 ? 10 : usedPercent} className="h-3" />
              <p className="text-xs text-gray-400">
                {subscription.creditsRemaining === 999
                  ? 'Unlimited coupons remaining'
                  : `${subscription.creditsRemaining} coupons remaining this month`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Plan Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan?.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#C9A84C]" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show subscription plans
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#0A1628] md:text-3xl">
          Choose Your Plan
        </h1>
        <p className="mt-2 text-gray-500">
          Unlock exclusive hotel discounts across East Africa
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const PlanIcon = plan.icon
          return (
            <Card
              key={plan.name}
              className={`glass-card relative flex flex-col rounded-2xl ${
                plan.popular
                  ? 'glass-gold border-2 border-[#C9A84C]/50 shadow-lg shadow-[#C9A84C]/10'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="shimmer-gold text-[#0A1628] border-0 px-3 font-semibold">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className="glow-gold mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#0A1628]">
                  <PlanIcon className="h-6 w-6 text-[#C9A84C]" />
                </div>
                <CardTitle className="text-lg text-[#0A1628]">
                  {plan.name}
                </CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold text-[#0A1628]">
                    {plan.price}
                  </span>
                  <span className="text-gray-400">{plan.period}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="glass-gold rounded-lg p-3 text-center">
                  <span className="text-2xl font-bold text-[#0A1628]">
                    {plan.couponsLabel || plan.coupons}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    coupons/month
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A84C]" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full h-11 text-sm font-semibold rounded-xl ${
                    plan.popular
                      ? 'shimmer-gold text-[#0A1628] hover:bg-[#C9A84C]/90'
                      : 'bg-[#0A1628] text-white hover:bg-[#0A1628]/90'
                  }`}
                  onClick={() => handleSelectPlan(plan.name)}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Payment Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md">
            <DrawerHeader>
              <DrawerTitle className="text-[#0A1628]">
                Complete Payment
              </DrawerTitle>
              <DrawerDescription>
                Pay via M-Pesa for your {selectedPlan} subscription
              </DrawerDescription>
            </DrawerHeader>

            <div className="glass-card-dark space-y-4 px-4 py-4">
              <div className="glass-white rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-2xl font-bold text-[#0A1628]">
                  {plans.find((p) => p.name === selectedPlan)?.price}
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="text-sm font-medium text-[#0A1628]"
                >
                  M-Pesa Phone Number
                </label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. 0712 345 678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 focus:border-[#C9A84C]/50 focus:bg-white/10"
                  />
                </div>
                <p className="text-xs text-gray-400">
                  You will receive an M-Pesa prompt on this number
                </p>
              </div>

              <div className="glass-white rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                <p className="text-xs text-amber-700">
                  This is a simulated payment. In production, you would receive an
                  M-Pesa STK push notification.
                </p>
              </div>
            </div>

            <DrawerFooter>
              <Button
                className="shimmer-gold text-[#0A1628] hover:bg-[#C9A84C]/90 h-11 font-semibold"
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Pay Now'
                )}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
