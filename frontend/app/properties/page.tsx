'use client';

import { useState, useEffect } from 'react';
import { useAnchor } from '@/providers/AnchorProvider';
import { useWallet } from '@solana/wallet-adapter-react';
import Navbar from '@/components/Navbar';
import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';

interface PropertyData {
  address: PublicKey;
  authority: PublicKey;
  nftMint: PublicKey;
  fractionMint: PublicKey;
  totalFractions: number;
  mintedFractions: number;
  cumRentPerShare: string;
  metadataUri: string;
}

export default function PropertiesPage() {
  const { program } = useAnchor();
  const { publicKey } = useWallet();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (program) {
      fetchProperties();
    }
  }, [program]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const accounts = await program!.account.propertyAccount.all();
      
      const propertiesData = accounts.map((acc: any) => ({
        address: acc.publicKey,
        authority: acc.account.authority,
        nftMint: acc.account.nftMint,
        fractionMint: acc.account.fractionMint,
        totalFractions: acc.account.totalFractions.toNumber(),
        mintedFractions: acc.account.mintedFractions.toNumber(),
        cumRentPerShare: acc.account.cumRentPerShare.toString(),
        metadataUri: Buffer.from(acc.account.metadataUri).toString('utf8').replace(/\0/g, ''),
      }));

      setProperties(propertiesData);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Ambient Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        </div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-24 text-center relative z-10">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 max-w-md mx-auto shadow-2xl">
            <span className="text-6xl mb-6 block animate-bounce">🔐</span>
            <h2 className="text-2xl font-bold mb-4">Wallet Required</h2>
            <p className="text-gray-400">Please connect your wallet to view properties</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Organic Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-500/3 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2">Live Properties</h1>
            <p className="text-gray-400">Invest in fractional real estate on Solana</p>
          </div>
          <Link 
            href="/create"
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white font-bold rounded-xl transition shadow-lg shadow-cyan-500/50"
          >
            + Create Property
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-white/10 rounded mb-4"></div>
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-gradient-to-br from-cyan-900/20 to-emerald-900/20 backdrop-blur-sm border border-white/10 rounded-2xl p-16 text-center">
            <span className="text-6xl mb-6 block">🏗️</span>
            <h2 className="text-2xl font-bold mb-4">No Properties Yet</h2>
            <p className="text-gray-400 mb-6">Be the first to tokenize real estate on the platform!</p>
            <Link 
              href="/create"
              className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white font-bold rounded-xl transition shadow-lg shadow-cyan-500/50"
            >
              Create First Property
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.address.toString()} property={property} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function PropertyCard({ property }: { property: PropertyData }) {
  const percentMinted = (property.mintedFractions / property.totalFractions) * 100;

  return (
    <Link href={`/property/${property.address.toString()}`}>
      <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 hover:border-cyan-500/50 rounded-2xl p-6 cursor-pointer h-full transition-all hover:transform hover:scale-105 shadow-2xl hover:shadow-cyan-500/20">
        {/* 3D Inner Highlight */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
        
        <div className="relative z-10">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400">
              LIVE
            </span>
            <span className="text-xs text-gray-500">#{property.address.toString().slice(0, 6)}</span>
          </div>
          
          <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition">
            Property {property.address.toString().slice(0, 8)}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {property.metadataUri || 'No metadata available'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Total Supply</span>
            <span className="font-bold text-white">{property.totalFractions.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Minted</span>
            <span className="font-bold text-cyan-400">
              {property.mintedFractions.toLocaleString()}
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Progress</span>
              <span className="font-bold">{percentMinted.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-600 to-emerald-600 h-2 rounded-full transition-all" 
                style={{ width: `${percentMinted}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <p className="text-xs text-gray-500 mb-1">Fraction Mint</p>
            <p className="text-xs font-mono text-gray-400 truncate">
              {property.fractionMint.toString()}
            </p>
          </div>
        </div>

        <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 hover:border-cyan-500/50 transition group-hover:bg-gradient-to-r group-hover:from-cyan-600/20 group-hover:to-emerald-600/20 shadow-lg">
          View Details →
        </button>
        </div>
      </div>
    </Link>
  );
}
