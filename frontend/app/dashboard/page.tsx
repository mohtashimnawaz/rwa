'use client';

import { useEffect, useState } from 'react';
import { useAnchor } from '@/providers/AnchorProvider';
import { useWallet } from '@solana/wallet-adapter-react';
import Navbar from '@/components/Navbar';
import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';
import * as token from '@solana/spl-token';

interface HoldingData {
  propertyAddress: string;
  fractionMint: string;
  balance: number;
  unclaimed: string;
  totalFractions: number;
  ownershipPercent: number;
}

export default function DashboardPage() {
  const { program } = useAnchor();
  const { publicKey } = useWallet();
  
  const [holdings, setHoldings] = useState<HoldingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (program && publicKey) {
      fetchHoldings();
    } else {
      setLoading(false);
    }
  }, [program, publicKey]);

  const fetchHoldings = async () => {
    try {
      setLoading(true);
      
      // Fetch all holder states for this user
      const allHolders = await program!.account.holderState.all([
        {
          memcmp: {
            offset: 8, // After discriminator
            bytes: publicKey!.toBase58(),
          },
        },
      ]);

      const holdingsData: HoldingData[] = [];

      for (const holder of allHolders) {
        const propertyAddress = holder.account.property.toString();
        
        try {
          const propertyAcc = await program!.account.propertyAccount.fetch(
            new PublicKey(propertyAddress)
          );

          holdingsData.push({
            propertyAddress,
            fractionMint: propertyAcc.fractionMint.toString(),
            balance: holder.account.balance.toNumber(),
            unclaimed: holder.account.unclaimed.toString(),
            totalFractions: propertyAcc.totalFractions.toNumber(),
            ownershipPercent: (holder.account.balance.toNumber() / propertyAcc.totalFractions.toNumber()) * 100,
          });
        } catch (e) {
          console.error(`Error fetching property ${propertyAddress}:`, e);
        }
      }

      setHoldings(holdingsData);
    } catch (error) {
      console.error('Error fetching holdings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (holding: HoldingData) => {
    if (!program || !publicKey) return;
    
    setClaiming(holding.propertyAddress);
    try {
      const propertyPubkey = new PublicKey(holding.propertyAddress);
      
      const [holderPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('holder'), publicKey.toBuffer(), propertyPubkey.toBuffer()],
        program.programId
      );

      const [rentVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('rent_vault'), new PublicKey(holding.fractionMint).toBuffer()],
        program.programId
      );

      const holderUsdcAccount = await token.getAssociatedTokenAddress(
        new PublicKey(holding.fractionMint),
        publicKey
      );

      await program.methods
        .claimRent()
        .accountsPartial({
          holderState: holderPda,
          propertyAccount: propertyPubkey,
          payer: publicKey,
          holderFractionAta: holderUsdcAccount,
          rentVaultAta: holderUsdcAccount,
          rentVault: rentVaultPda,
          receiverUsdc: holderUsdcAccount,
          tokenProgram: token.TOKEN_PROGRAM_ID,
        })
        .rpc();

      alert('Rent claimed successfully!');
      fetchHoldings();
    } catch (error: any) {
      console.error('Error claiming rent:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setClaiming(null);
    }
  };

  const SCALE = 1_000_000_000;
  const totalUnclaimed = holdings.reduce((sum, h) => sum + Number(h.unclaimed) / SCALE, 0);
  const totalHoldings = holdings.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">Investor Dashboard</h1>
          <p className="text-gray-400">Track your fractional real estate investments</p>
        </div>

        {!publicKey ? (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center shadow-2xl">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400">Please connect your wallet to view your dashboard</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-gray-400">Loading your holdings...</div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-900/10 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 shadow-xl">
                <p className="text-cyan-400 text-sm font-bold mb-2">TOTAL PROPERTIES</p>
                <p className="text-4xl font-black">{totalHoldings}</p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
                <p className="text-emerald-400 text-sm font-bold mb-2">TOTAL UNCLAIMED</p>
                <p className="text-4xl font-black">${totalUnclaimed.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">USDC</p>
              </div>
              
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl">
                <p className="text-gray-400 text-sm font-bold mb-2">PORTFOLIO VALUE</p>
                <p className="text-4xl font-black">-</p>
                <p className="text-xs text-gray-400 mt-1">Coming soon</p>
              </div>
            </div>

            {/* Holdings List */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold">Your Holdings</h2>
              </div>

              {holdings.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-bold mb-2">No Holdings Yet</h3>
                  <p className="text-gray-400 mb-6">Start investing in tokenized real estate</p>
                  <Link
                    href="/properties"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white font-bold rounded-xl transition"
                  >
                    Browse Properties
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {holdings.map((holding) => {
                    const unclaimedUSDC = Number(holding.unclaimed) / SCALE;
                    
                    return (
                      <div key={holding.propertyAddress} className="p-6 hover:bg-white/5 transition">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <Link 
                              href={`/property/${holding.propertyAddress}`}
                              className="text-lg font-bold hover:text-cyan-400 transition"
                            >
                              Property #{holding.propertyAddress.slice(0, 8)}...
                            </Link>
                            <p className="text-xs text-gray-500 font-mono mt-1">{holding.propertyAddress}</p>
                          </div>
                          <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400">
                            ACTIVE
                          </span>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Your Fractions</p>
                            <p className="text-xl font-bold">{holding.balance.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Ownership</p>
                            <p className="text-xl font-bold text-cyan-400">{holding.ownershipPercent.toFixed(4)}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Unclaimed Rent</p>
                            <p className="text-xl font-bold text-green-400">${unclaimedUSDC.toFixed(2)}</p>
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => handleClaim(holding)}
                              disabled={unclaimedUSDC === 0 || claiming === holding.propertyAddress}
                              className="w-full py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition"
                            >
                              {claiming === holding.propertyAddress ? 'Claiming...' : unclaimedUSDC === 0 ? 'No Rent' : 'Claim'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
