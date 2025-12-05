'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-lg shadow-cyan-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-emerald-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition">
              <span className="text-2xl">🏠</span>
            </div>
            <span className="text-2xl font-black text-white">RWA</span>
          </Link>
          
          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/properties" active={isActive('/properties')}>
              Properties
            </NavLink>
            <NavLink href="/dashboard" active={isActive('/dashboard')}>
              Dashboard
            </NavLink>
            <NavLink href="/create" active={isActive('/create')}>
              Create
            </NavLink>
          </div>

          {/* Wallet Button */}
          <div className="flex items-center">
            <WalletMultiButton className="!bg-gradient-to-r !from-cyan-600 !to-emerald-600 hover:!from-cyan-700 hover:!to-emerald-700 !rounded-xl !font-bold" />
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link 
      href={href}
      className={`px-4 py-2 rounded-lg font-medium transition ${
        active 
          ? 'bg-white/10 text-white' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {children}
    </Link>
  );
}
