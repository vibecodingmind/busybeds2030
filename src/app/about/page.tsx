export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">About BusyBeds</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-lg text-blue-100">
            BusyBeds is East Africa&apos;s first hotel discount membership platform, designed to make luxury hotel stays accessible to everyone. 
            We partner with premium hotels across Tanzania, Kenya, and Uganda to bring our members exclusive discounts of up to 50% off regular rates.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-10">Our Mission</h2>
          <p className="text-blue-100">
            We believe everyone deserves to experience the beauty of East Africa&apos;s finest hotels. By leveraging the power of group buying, 
            we negotiate exclusive rates that are only available to BusyBeds members. Our mission is to democratize luxury travel across the region.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-10">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-3">1</div>
              <h3 className="text-lg font-semibold text-white mb-2">Subscribe</h3>
              <p className="text-blue-200 text-sm">Choose a monthly plan that fits your travel needs. Starter, Standard, or Premium.</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-3">2</div>
              <h3 className="text-lg font-semibold text-white mb-2">Get Coupons</h3>
              <p className="text-blue-200 text-sm">Receive digital discount coupons with QR codes that you can use at partner hotels.</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-3">3</div>
              <h3 className="text-lg font-semibold text-white mb-2">Save Big</h3>
              <p className="text-blue-200 text-sm">Contact hotels directly, show your coupon, and enjoy exclusive member-only rates.</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-white mt-10">Why Choose BusyBeds?</h2>
          <ul className="space-y-3 text-blue-100">
            <li className="flex items-start">
              <span className="text-green-400 mr-2 mt-1">&#10003;</span>
              <span><strong className="text-white">Verified Hotels Only</strong> - Every partner hotel is vetted for quality and service standards</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2 mt-1">&#10003;</span>
              <span><strong className="text-white">Real Discounts</strong> - Save 30-50% off rack rates at premium hotels</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2 mt-1">&#10003;</span>
              <span><strong className="text-white">No Hidden Fees</strong> - Pay your subscription, get coupons, that&apos;s it</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2 mt-1">&#10003;</span>
              <span><strong className="text-white">Secure Digital Coupons</strong> - QR-verified coupons that hotels can easily validate</span>
            </li>
          </ul>

          <div className="bg-white/5 backdrop-blur rounded-xl p-8 border border-white/10 mt-10">
            <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
            <p className="text-blue-100">Email: support@busybeds.com</p>
            <p className="text-blue-100">Phone: +255 700 000 000</p>
            <p className="text-blue-100">Location: Dar es Salaam, Tanzania</p>
          </div>
        </div>
      </div>
    </div>
  );
}

