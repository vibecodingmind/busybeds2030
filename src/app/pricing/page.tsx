import Link from "next/link";

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "29,000",
      period: "/month",
      coupons: 5,
      features: [
        "5 discount coupons per month",
        "Up to 30% off hotel stays",
        "Access to all partner hotels",
        "Digital coupon with QR code",
        "Email support",
      ],
      popular: false,
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Standard",
      price: "59,000",
      period: "/month",
      coupons: 15,
      features: [
        "15 discount coupons per month",
        "Up to 40% off hotel stays",
        "Priority hotel access",
        "Digital coupon with QR code",
        "SMS & WhatsApp notifications",
        "Priority support",
      ],
      popular: true,
      color: "from-indigo-500 to-purple-600",
    },
    {
      name: "Premium",
      price: "99,000",
      period: "/month",
      coupons: 999,
      features: [
        "Unlimited discount coupons",
        "Up to 50% off hotel stays",
        "VIP hotel access",
        "Digital coupon with QR code",
        "SMS & WhatsApp notifications",
        "Dedicated support line",
        "Early access to new hotels",
      ],
      popular: false,
      color: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Unlock exclusive hotel discounts across East Africa with a BusyBeds membership
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 bg-white/5 backdrop-blur-xl border ${
                plan.popular
                  ? "border-indigo-400/50 shadow-lg shadow-indigo-500/20"
                  : "border-white/10"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">TSh {plan.price}</span>
                <span className="text-blue-300">{plan.period}</span>
              </div>
              <p className="text-blue-200 mb-6">
                {plan.coupons === 999 ? "Unlimited" : plan.coupons} discount coupons per month
              </p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-blue-100">
                    <svg className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`block text-center py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r ${plan.color} hover:opacity-90 transition-opacity`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center text-blue-300">
          <p>All prices in Tanzanian Shillings (TSh). Cancel anytime.</p>
          <p className="mt-2">Questions? Contact us at support@busybeds.com</p>
        </div>
      </div>
    </div>
  );
}

