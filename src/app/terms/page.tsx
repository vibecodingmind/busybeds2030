export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-blue-100">
          <p className="text-sm text-blue-300">Last updated: June 2026</p>
          
          <h2 className="text-2xl font-semibold text-white">1. Acceptance of Terms</h2>
          <p>By accessing or using BusyBeds, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>

          <h2 className="text-2xl font-semibold text-white">2. Membership & Subscriptions</h2>
          <p>BusyBeds operates on a monthly subscription model. Members receive digital discount coupons that can be used at partner hotels. Subscriptions auto-renew monthly unless cancelled. Coupon credits do not roll over between billing periods.</p>

          <h2 className="text-2xl font-semibold text-white">3. Coupon Usage</h2>
          <p>Coupons are digital vouchers that provide verified discounts at partner hotels. Each coupon is assigned to a specific hotel and is valid for the stated discount percentage. Coupons must be presented to hotel staff for verification via the QR code. Hotels verify coupons through our secure portal.</p>

          <h2 className="text-2xl font-semibold text-white">4. Payment & Refunds</h2>
          <p>Subscription payments are processed through PesaPal. All payments are non-refundable once the subscription period begins. Hotel deposits are paid directly to the hotel and are subject to the hotel&apos;s own cancellation and refund policies.</p>

          <h2 className="text-2xl font-semibold text-white">5. No-Show Policy</h2>
          <p>If a member fails to check in at a hotel after a coupon has been confirmed, the hotel may retain the deposit as per their policy. The coupon credit will still be deducted from the member&apos;s account.</p>

          <h2 className="text-2xl font-semibold text-white">6. User Conduct</h2>
          <p>Users must not attempt to duplicate, resell, or transfer coupons to non-members. Fraudulent use of coupons may result in immediate account termination without refund.</p>

          <h2 className="text-2xl font-semibold text-white">7. Limitation of Liability</h2>
          <p>BusyBeds acts as a discount facilitator and does not guarantee hotel availability, quality of service, or specific room types. Disputes with hotels should be resolved directly with the hotel.</p>

          <h2 className="text-2xl font-semibold text-white">8. Contact</h2>
          <p>For questions about these terms, contact us at legal@busybeds.com.</p>
        </div>
      </div>
    </div>
  );
}

