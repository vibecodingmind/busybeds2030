export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Contact Us</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
              <p className="text-blue-200">support@busybeds.com</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">Phone</h3>
              <p className="text-blue-200">+255 700 000 000</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">Location</h3>
              <p className="text-blue-200">Dar es Salaam, Tanzania</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">Business Hours</h3>
              <p className="text-blue-200">Monday - Friday: 8:00 AM - 6:00 PM EAT</p>
              <p className="text-blue-200">Saturday: 9:00 AM - 1:00 PM EAT</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Send us a message</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-blue-200 mb-1">Name</label>
                <input type="text" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-blue-300/50" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm text-blue-200 mb-1">Email</label>
                <input type="email" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-blue-300/50" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm text-blue-200 mb-1">Message</label>
                <textarea rows={4} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-blue-300/50" placeholder="How can we help?" />
              </div>
              <button type="button" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

