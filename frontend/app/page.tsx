'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import Navbar from '@/components/Navbar';

export default function Home() {
  const { publicKey } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-cyan-400/3 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
        
        {/* Floating 3D Cubes */}
        <div className="absolute top-1/4 right-1/3 w-20 h-20 border border-cyan-500/20 rotate-45 animate-float">
          <div className="absolute inset-2 border border-cyan-400/30 rotate-12"></div>
        </div>
        <div className="absolute bottom-1/3 left-1/4 w-16 h-16 border border-emerald-500/20 rotate-12 animate-float" style={{animationDelay: '1.5s'}}>
          <div className="absolute inset-2 border border-emerald-400/30 -rotate-12"></div>
        </div>
        
        {/* Ambient Light Effects */}
        <div className="absolute top-0 left-1/2 w-full h-full bg-gradient-radial from-cyan-500/5 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-radial from-emerald-500/5 via-transparent to-transparent"></div>
      </div>
      
      <Navbar />
      
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-slate-800 to-emerald-900/30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-600/20 via-transparent to-transparent"></div>
        
        {/* Smooth Light Rays */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-cyan-500/20 via-cyan-500/5 to-transparent transform -skew-x-12"></div>
          <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-emerald-500/20 via-emerald-500/5 to-transparent transform skew-x-12"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                <span className="text-cyan-400 text-sm font-medium">Built on Solana</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
                Own Real Estate
                <span className="block bg-gradient-to-r from-cyan-400 to-emerald-400 text-transparent bg-clip-text">
                  One Fraction at a Time
                </span>
              </h1>
              
              <p className="text-xl text-gray-400 mb-8 max-w-xl">
                Invest in tokenized real estate with as little as $100. Earn monthly rental income in USDC, automatically distributed to your wallet.
              </p>
              
              {publicKey ? (
                <div className="flex gap-4">
                  <Link 
                    href="/properties"
                    className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition transform hover:scale-105 shadow-lg shadow-cyan-500/50"
                  >
                    Explore Properties
                  </Link>
                  <Link 
                    href="/dashboard"
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition"
                  >
                    Dashboard
                  </Link>
                </div>
              ) : (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 max-w-md backdrop-blur-sm">
                  <p className="text-yellow-400 font-medium flex items-center gap-2">
                    <span className="text-2xl">🔐</span>
                    Connect your wallet to start investing
                  </p>
                </div>
              )}
            </div>

            {/* Right Visual Element */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 to-emerald-600 rounded-3xl blur-3xl opacity-20"></div>
              
              {/* 3D Card Container */}
              <div className="relative perspective-1000">
                <div className="relative bg-gradient-to-br from-cyan-900/50 to-emerald-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transform-gpu transition-transform hover:rotate-y-2">
                  {/* Inner Shadow for Depth */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent"></div>
                  <div className="space-y-4 relative z-10">
                    <div className="bg-black/50 rounded-xl p-6 border border-cyan-500/20 shadow-lg shadow-cyan-500/10 transform transition hover:scale-105">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Total Value Locked</span>
                      <span className="text-green-400 text-xs">+12.5%</span>
                    </div>
                    <div className="text-3xl font-bold">$2.4M</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/50 rounded-xl p-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/10 transform transition hover:scale-105">
                      <div className="text-gray-400 text-xs mb-1">Properties</div>
                      <div className="text-2xl font-bold">12</div>
                    </div>
                    <div className="bg-black/50 rounded-xl p-6 border border-cyan-500/20 shadow-lg shadow-cyan-500/10 transform transition hover:scale-105">
                      <div className="text-gray-400 text-xs mb-1">Investors</div>
                      <div className="text-2xl font-bold">384</div>
                    </div>
                  </div>
                  
                  <div className="bg-black/50 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/10 transform transition hover:scale-105">
                    <div className="text-gray-400 text-sm mb-2">Monthly Rent Distributed</div>
                    <div className="text-3xl font-bold text-green-400">$37.5K</div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800/50 to-slate-900/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-gray-400 text-lg">Revolutionary real estate investment on the blockchain</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🏠"
              title="Fractional Ownership"
              description="Own a piece of premium real estate without millions. Start with any amount."
              gradient="from-cyan-500/10 to-cyan-900/10"
              border="border-cyan-500/20"
            />
            <FeatureCard 
              icon="💎"
              title="Instant Liquidity"
              description="Trade your fractions anytime on-chain. No waiting, no middlemen, pure DeFi."
              gradient="from-emerald-500/10 to-emerald-900/10"
              border="border-emerald-500/20"
            />
            <FeatureCard 
              icon="⚡"
              title="Auto Distributions"
              description="Rent deposited by owners is automatically split. Claim your USDC anytime."
              gradient="from-green-500/10 to-green-900/10"
              border="border-green-500/20"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-20">Simple Process, Powerful Results</h2>
          
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-green-500/20"></div>
            
            <div className="grid md:grid-cols-4 gap-8 relative">
              <ProcessStep 
                number="1"
                title="Connect Wallet"
                description="Use Phantom, Solflare, or any Solana wallet"
                color="bg-cyan-600"
              />
              <ProcessStep 
                number="2"
                title="Browse Properties"
                description="Explore tokenized real estate opportunities"
                color="bg-emerald-600"
              />
              <ProcessStep 
                number="3"
                title="Buy Fractions"
                description="Purchase any amount with USDC"
                color="bg-teal-600"
              />
              <ProcessStep 
                number="4"
                title="Earn Rewards"
                description="Claim monthly rent automatically"
                color="bg-green-600"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-emerald-600 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative bg-gradient-to-r from-cyan-900/40 to-emerald-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
              <h2 className="text-4xl font-bold mb-4">Ready to Start?</h2>
              <p className="text-gray-400 text-lg mb-8">
                Join hundreds of investors earning passive income from real estate
              </p>
              <Link 
                href="/properties"
                className="inline-block px-10 py-4 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white font-bold rounded-xl transition transform hover:scale-105 shadow-lg shadow-cyan-500/50"
              >
                View All Properties
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live on Solana Devnet</span>
          </div>
          <p className="text-gray-600 text-sm">Built with Anchor Framework • Open Source</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient, border }: { 
  icon: string; 
  title: string; 
  description: string;
  gradient: string;
  border: string;
}) {
  return (
    <div className={`relative bg-gradient-to-br ${gradient} backdrop-blur-sm border ${border} p-8 rounded-2xl hover:scale-105 transition transform shadow-2xl`}>
      {/* 3D Inner Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
      <div className="relative z-10">
        <div className="text-5xl mb-6 transform transition-transform hover:scale-110 hover:rotate-12">{icon}</div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function ProcessStep({ number, title, description, color }: { 
  number: string; 
  title: string; 
  description: string;
  color: string;
}) {
  return (
    <div className="relative">
      <div className={`${color} w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-2xl transform hover:scale-110 transition relative`}>
        {/* 3D Effect Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
        <span className="relative z-10">{number}</span>
      </div>
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/15 transition shadow-xl">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}
