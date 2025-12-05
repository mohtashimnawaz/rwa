'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import Navbar from '@/components/Navbar';

export default function Home() {
  const { publicKey } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-black to-slate-950 text-white relative overflow-hidden">
      {/* Animated Grid Background - Subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 183, 215, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 183, 215, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}></div>
      </div>
      
      {/* Gradient Overlays - More Subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px]"></div>
      </div>
      
      <Navbar />
      
      {/* Hero Section - Asymmetric Layout */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Side - Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-cyan-400 text-xs font-bold tracking-wider">POWERED BY SOLANA</span>
              </div>
              
              {/* Main Heading */}
              <div>
                <h1 className="text-6xl md:text-7xl font-black mb-6 leading-[1.1]">
                  Tokenize Real Estate.
                  <span className="block mt-2 bg-gradient-to-r from-cyan-400 to-emerald-400 text-transparent bg-clip-text">
                    Earn Passive Income.
                  </span>
                </h1>
                
                <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                  Fractionalize property ownership into tradeable tokens. Buy shares starting at $100. Receive automated USDC rent distributions every month.
                </p>
              </div>
              
              {/* CTA Buttons */}
              {publicKey ? (
                <div className="flex flex-wrap gap-4">
                  <Link 
                    href="/properties"
                    className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-xl transition shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40"
                  >
                    Explore Properties
                  </Link>
                  <Link 
                    href="/dashboard"
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/20 transition"
                  >
                    View Dashboard
                  </Link>
                </div>
              ) : (
                <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-xl">
                  <span className="text-2xl">👉</span>
                  <p className="text-yellow-400 font-semibold">
                    Connect wallet to get started
                  </p>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
                <div>
                  <div className="text-3xl font-black text-cyan-400 mb-1">$2.4M</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Total Value</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-emerald-400 mb-1">12</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Properties</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-green-400 mb-1">384</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Investors</div>
                </div>
              </div>
            </div>

            {/* Right Side - Visual Card */}
            <div className="relative lg:mt-12">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-br from-cyan-600/20 to-emerald-600/20 rounded-3xl blur-3xl"></div>
              
              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-slate-900 to-black border border-white/10 rounded-2xl p-8 space-y-6">
                {/* Featured Property Header */}
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Featured Property</div>
                    <div className="text-xl font-bold">Miami Beach Penthouse</div>
                  </div>
                  <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <span className="text-xs font-bold text-green-400">ACTIVE</span>
                  </div>
                </div>

                {/* Property Image Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-cyan-900/30 to-emerald-900/30 rounded-xl border border-white/10 flex items-center justify-center">
                  <div className="text-6xl opacity-50">🏢</div>
                </div>

                {/* Property Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/50 rounded-xl p-4 border border-cyan-500/20">
                    <div className="text-xs text-gray-500 mb-1">Price per Fraction</div>
                    <div className="text-2xl font-bold text-cyan-400">$250</div>
                  </div>
                  <div className="bg-black/50 rounded-xl p-4 border border-emerald-500/20">
                    <div className="text-xs text-gray-500 mb-1">Annual Yield</div>
                    <div className="text-2xl font-bold text-emerald-400">8.5%</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Fractions Sold</span>
                    <span className="font-bold">7,340 / 10,000</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[73.4%] bg-gradient-to-r from-cyan-600 to-emerald-600 rounded-full"></div>
                  </div>
                </div>

                {/* CTA */}
                <button className="w-full py-4 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-xl transition shadow-lg">
                  View Property Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="py-12 border-y border-white/5 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="inline-block mx-8 text-gray-600 font-bold text-lg">FRACTIONAL OWNERSHIP</span>
          <span className="inline-block mx-8 text-gray-600 font-bold text-lg">•</span>
          <span className="inline-block mx-8 text-gray-600 font-bold text-lg">INSTANT LIQUIDITY</span>
          <span className="inline-block mx-8 text-gray-600 font-bold text-lg">•</span>
          <span className="inline-block mx-8 text-gray-600 font-bold text-lg">AUTO RENT DISTRIBUTION</span>
          <span className="inline-block mx-8 text-gray-600 font-bold text-lg">•</span>
          <span className="inline-block mx-8 text-gray-600 font-bold text-lg">ZERO MIDDLEMEN</span>
          <span className="inline-block mx-8 text-gray-600 font-bold text-lg">•</span>
          <span className="inline-block mx-8 text-gray-600 font-bold text-lg">FRACTIONAL OWNERSHIP</span>
          <span className="inline-block mx-8 text-gray-600 font-bold text-lg">•</span>
          <span className="inline-block mx-8 text-gray-600 font-bold text-lg">INSTANT LIQUIDITY</span>
          <span className="inline-block mx-8 text-gray-600 font-bold text-lg">•</span>
        </div>
      </section>

      {/* Features - Horizontal Scroll on Mobile, Grid on Desktop */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">How it works</h2>
            <p className="text-gray-400 text-xl max-w-2xl">Four steps to start earning passive income from tokenized real estate</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <FlowCard 
              step="01"
              title="Property Owner Tokenizes"
              description="Property owners deposit their real estate NFT into the protocol, set total fractions, and mint tradeable tokens representing ownership shares."
              icon="🏛️"
              color="cyan"
            />
            <FlowCard 
              step="02"
              title="Investors Buy Fractions"
              description="Browse available properties and purchase fractional tokens with any amount. Your ownership is recorded on-chain instantly."
              icon="💳"
              color="emerald"
            />
            <FlowCard 
              step="03"
              title="Monthly Rent Deposits"
              description="Property owners deposit rental income in USDC. The protocol automatically calculates each holder's share based on their fraction balance."
              icon="💰"
              color="green"
            />
            <FlowCard 
              step="04"
              title="Claim & Trade Anytime"
              description="Claim your accumulated rent rewards whenever you want. Trade your fractions P2P or hold for long-term passive income."
              icon="⚡"
              color="teal"
            />
          </div>
        </div>
      </section>

      {/* Split Layout Section */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Text Content */}
            <div>
              <h3 className="text-sm font-bold text-cyan-400 tracking-wider mb-4">FOR INVESTORS</h3>
              <h2 className="text-5xl font-black mb-6">Start small.<br/>Dream big.</h2>
              <p className="text-gray-400 text-lg mb-8">
                No more waiting for $500k downpayments. Buy into premium real estate with $100. Earn proportional rent every month. Exit anytime with instant on-chain trading.
              </p>
              <ul className="space-y-4 mb-8">
                <BenefitItem text="Low barrier to entry - invest any amount" />
                <BenefitItem text="Fully transparent on-chain ownership" />
                <BenefitItem text="Automated USDC rent distributions" />
                <BenefitItem text="Trade fractions 24/7 with zero fees" />
              </ul>
              <Link 
                href="/properties"
                className="inline-flex items-center gap-2 text-cyan-400 font-bold hover:gap-4 transition-all group"
              >
                View all properties 
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {/* Right - Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-emerald-600/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-3xl p-8 space-y-4">
                <div className="bg-black/60 rounded-2xl p-6 border border-cyan-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 text-sm">Your Portfolio Value</span>
                    <span className="text-green-400 text-sm font-bold">+18.2%</span>
                  </div>
                  <div className="text-4xl font-black mb-2">$24,850</div>
                  <div className="text-sm text-gray-500">Across 8 properties</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/60 rounded-2xl p-6 border border-white/10">
                    <div className="text-gray-400 text-xs mb-2">Unclaimed</div>
                    <div className="text-2xl font-bold text-emerald-400">$482</div>
                  </div>
                  <div className="bg-black/60 rounded-2xl p-6 border border-white/10">
                    <div className="text-gray-400 text-xs mb-2">Fractions</div>
                    <div className="text-2xl font-bold">1,247</div>
                  </div>
                </div>

                <div className="bg-black/60 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold">Top Holding</span>
                    <span className="text-xs text-gray-500">42.5% ownership</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-2">Downtown Miami Condo</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[42.5%] bg-gradient-to-r from-cyan-600 to-emerald-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Split Layout Section - Flipped */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Visual */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-cyan-600/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-3xl p-8 space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Property</div>
                    <div className="font-bold">Luxury Villa #4821</div>
                  </div>
                  <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs font-bold text-green-400">
                    ACTIVE
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-black/60 rounded-xl p-4 border border-white/10 text-center">
                    <div className="text-gray-400 text-xs mb-1">Supply</div>
                    <div className="text-lg font-bold">10,000</div>
                  </div>
                  <div className="bg-black/60 rounded-xl p-4 border border-white/10 text-center">
                    <div className="text-gray-400 text-xs mb-1">Minted</div>
                    <div className="text-lg font-bold text-cyan-400">7,340</div>
                  </div>
                  <div className="bg-black/60 rounded-xl p-4 border border-white/10 text-center">
                    <div className="text-gray-400 text-xs mb-1">APY</div>
                    <div className="text-lg font-bold text-green-400">8.2%</div>
                  </div>
                </div>

                <div className="bg-black/60 rounded-2xl p-6 border border-emerald-500/30">
                  <div className="text-sm text-gray-400 mb-2">This Month's Rent</div>
                  <div className="text-3xl font-black text-emerald-400">$4,250</div>
                  <div className="text-xs text-gray-500 mt-1">Distributed to 127 holders</div>
                </div>
              </div>
            </div>

            {/* Right - Text Content */}
            <div className="order-1 lg:order-2">
              <h3 className="text-sm font-bold text-emerald-400 tracking-wider mb-4">FOR PROPERTY OWNERS</h3>
              <h2 className="text-5xl font-black mb-6">Unlock liquidity<br/>from your assets.</h2>
              <p className="text-gray-400 text-lg mb-8">
                Tokenize your real estate NFT and raise capital by selling fractions. Keep ownership control while accessing liquid markets. Deposit rent once, distribute to all holders automatically.
              </p>
              <ul className="space-y-4 mb-8">
                <BenefitItem text="Raise capital without selling entire property" />
                <BenefitItem text="Automated rent distribution via smart contracts" />
                <BenefitItem text="Maintain authority and management rights" />
                <BenefitItem text="Access to global investor pool" />
              </ul>
              <Link 
                href="/create"
                className="inline-flex items-center gap-2 text-emerald-400 font-bold hover:gap-4 transition-all group"
              >
                Tokenize your property
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-6">Ready to start?</h2>
          <p className="text-gray-400 text-xl mb-12">Connect your Solana wallet and explore tokenized real estate</p>
          <Link 
            href="/properties"
            className="inline-block px-12 py-6 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-2xl transition shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transform hover:scale-105 text-lg"
          >
            View All Properties
          </Link>
        </div>
      </section>


      {/* Footer */}
      <footer className="border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-black">RWA</div>
                  <div className="text-[10px] font-bold text-cyan-400 tracking-widest">PROTOCOL</div>
                </div>
              </div>
              <p className="text-gray-500 text-sm max-w-xs">Fractional real estate ownership on Solana. Built with Anchor. Open source.</p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold mb-4 text-sm">Platform</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/properties" className="hover:text-white transition">Properties</Link></li>
                <li><Link href="/create" className="hover:text-white transition">Create Property</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm">Resources</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">Smart Contract</a></li>
                <li><a href="#" className="hover:text-white transition">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live on Solana Devnet</span>
            </div>
            <p className="text-gray-600 text-sm">© 2025 RWA Protocol. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FlowCard({ step, title, description, icon, color }: { 
  step: string; 
  title: string; 
  description: string;
  icon: string;
  color: 'cyan' | 'emerald' | 'green' | 'teal';
}) {
  const colorClasses = {
    cyan: 'from-cyan-600/20 to-cyan-600/5 border-cyan-500/30',
    emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/30',
    green: 'from-green-600/20 to-green-600/5 border-green-500/30',
    teal: 'from-teal-600/20 to-teal-600/5 border-teal-500/30',
  };

  return (
    <div className={`relative bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm border rounded-2xl p-8 hover:scale-[1.02] transition-transform`}>
      <div className="flex items-start gap-4 mb-4">
        <div className="text-5xl">{icon}</div>
        <div className="text-sm font-black text-gray-600">{step}</div>
      </div>
      <h3 className="text-2xl font-black mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 w-5 h-5 rounded-full bg-gradient-to-br from-cyan-600 to-emerald-600 flex items-center justify-center flex-shrink-0">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-gray-300">{text}</span>
    </div>
  );
}
