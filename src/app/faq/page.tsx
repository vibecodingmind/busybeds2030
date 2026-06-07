export default function FAQPage() {
  const faqs = [
    { q: "What is BusyBeds?", a: "BusyBeds is a hotel discount membership platform for East Africa. Pay a monthly subscription and receive digital coupons that give you 30-50% off at premium partner hotels." },
    { q: "How do I use a coupon?", a: "After subscribing, browse our partner hotels, select one, and generate a coupon. Contact the hotel directly to book, then show your digital coupon with QR code at check-in. The hotel verifies it instantly." },
    { q: "Do I book through BusyBeds?", a: "No. BusyBeds provides verified discount coupons. You contact the hotel directly to negotiate and book your stay. The coupon serves as proof of your discount eligibility." },
    { q: "What happens if I don't show up?", a: "If you confirm a coupon but don't check in (no-show), the hotel keeps any deposit you paid directly to them, and the coupon credit is still deducted from your account." },
    { q: "Can I cancel my subscription?", a: "Yes, you can cancel anytime. Your subscription remains active until the end of the current billing period. Unused coupons do not roll over." },
    { q: "How do hotels verify my coupon?", a: "Each coupon has a unique QR code and code. Hotel staff scan or enter the code in our verification portal, which instantly confirms the coupon's validity and discount details." },
    { q: "Is my payment information secure?", a: "Yes. Payments are processed through PesaPal, a trusted East African payment gateway. We never store your card details." },
    { q: "Which hotels are on BusyBeds?", a: "We partner with premium hotels across Tanzania, Kenya, and Uganda. Browse our full list on the Hotels page." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Frequently Asked Questions</h1>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">{faq.q}</h3>
              <p className="text-blue-100">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

