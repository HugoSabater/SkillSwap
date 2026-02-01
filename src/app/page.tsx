import Link from "next/link";
import { ArrowRightLeft, FileText, Handshake, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-blue-600">

      {/* Navigation */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ArrowRightLeft className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">SkillSwap</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-sm font-medium hover:text-blue-400 transition-colors">Sign In</Link>
          <Link href="/signup" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-full text-sm font-bold transition-all">Get Started</Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-8 bg-gradient-to-b from-zinc-950 to-zinc-900">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Live Community
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">
            Trade Skills. <br />
            Build Reputation.
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
            Connect with developers, designers, and marketers. Swap expertise instantly. No money involved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md pt-4">
            <Link href="/signup" className="flex-1 flex items-center justify-center h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95">
              Start Swapping
            </Link>
            <Link href="/login" className="flex-1 flex items-center justify-center h-14 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-lg border border-zinc-700 transition-all">
              Existing User
            </Link>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="py-12 bg-zinc-900/50 border-y border-zinc-800">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center text-center">
              <div className="text-4xl font-bold text-white mb-2">5,000+</div>
              <div className="text-zinc-500 font-medium uppercase text-sm tracking-wide">Active Members</div>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center text-center">
              <div className="text-4xl font-bold text-blue-500 mb-2">12.4k</div>
              <div className="text-zinc-500 font-medium uppercase text-sm tracking-wide">Swaps Completed</div>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">99%</div>
              <div className="text-zinc-500 font-medium uppercase text-sm tracking-wide">Satisfaction Rate</div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">How it Works</h2>
              <p className="text-zinc-400">Three simple steps to supercharge your career.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: FileText, title: "List Skills", desc: "Select what you offer and what you need in under 2 minutes." },
                { icon: Handshake, title: "Match & Swap", desc: "Our algorithm connects you with the perfect learning partner." },
                { icon: ShieldCheck, title: "Verify & Grow", desc: "Complete swaps to earn credits and build your trusted profile." }
              ].map((feature, i) => (
                <div key={i} className="group p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 mb-6 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-zinc-800 text-center text-zinc-500 text-sm">
        <p>&copy; 2026 SkillSwap. The barter economy for pros.</p>
      </footer>
    </div>
  );
}
