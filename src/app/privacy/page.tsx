export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-blue-100">
          <p className="text-sm text-blue-300">Last updated: June 2026</p>
          
          <h2 className="text-2xl font-semibold text-white">1. Information We Collect</h2>
          <p>We collect personal information you provide when registering (name, email, phone number), subscription and payment data, coupon usage data, and hotel interaction records. We do not collect payment card details directly; these are handled by PesaPal.</p>

          <h2 className="text-2xl font-semibold text-white">2. How We Use Your Information</h2>
          <p>Your information is used to provide and improve our services, process subscriptions and payments, generate and verify discount coupons, communicate important updates about your account, and comply with legal obligations.</p>

          <h2 className="text-2xl font-semibold text-white">3. Data Sharing</h2>
          <p>We share limited information with partner hotels (your name and coupon details) for verification purposes only. We use PesaPal for payment processing and Africa&apos;s Talking for SMS notifications. We never sell your personal data to third parties.</p>

          <h2 className="text-2xl font-semibold text-white">4. Data Security</h2>
          <p>We implement industry-standard security measures including encryption (SSL/TLS), hashed passwords, secure API endpoints, and regular security audits. However, no system is completely secure, and we cannot guarantee absolute security.</p>

          <h2 className="text-2xl font-semibold text-white">5. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. You can manage your account settings or contact us at privacy@busybeds.com to exercise these rights.</p>

          <h2 className="text-2xl font-semibold text-white">6. Cookies</h2>
          <p>We use essential cookies for authentication and session management. We do not use tracking cookies or sell browsing data to advertisers.</p>

          <h2 className="text-2xl font-semibold text-white">7. Contact</h2>
          <p>For privacy concerns, contact us at privacy@busybeds.com.</p>
        </div>
      </div>
    </div>
  );
}

