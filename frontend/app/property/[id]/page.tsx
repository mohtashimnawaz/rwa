'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAnchor } from '@/providers/AnchorProvider';
import { useWallet } from '@solana/wallet-adapter-react';
import Navbar from '@/components/Navbar';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import * as token from '@solana/spl-token';

interface PropertyData {
  authority: PublicKey;
  nftMint: PublicKey;
  fractionMint: PublicKey;
  totalFractions: number;
  mintedFractions: number;
  cumRentPerShare: string;
  metadataUri: string;
}

interface HolderData {
  balance: number;
  rewardDebt: string;
  unclaimed: string;
}

export default function PropertyDetailsPage() {
  const params = useParams();
  const { program } = useAnchor();
  const { publicKey } = useWallet();
  
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [holder, setHolder] = useState<HolderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyAmount, setBuyAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const propertyAddress = new PublicKey(params.id as string);

  useEffect(() => {
    if (program) {
      fetchPropertyData();
    }
  }, [program, publicKey]);

  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      const propertyAcc = await program!.account.propertyAccount.fetch(propertyAddress);
      
      setProperty({
        authority: propertyAcc.authority,
        nftMint: propertyAcc.nftMint,
        fractionMint: propertyAcc.fractionMint,
        totalFractions: propertyAcc.totalFractions.toNumber(),
        mintedFractions: propertyAcc.mintedFractions.toNumber(),
        cumRentPerShare: propertyAcc.cumRentPerShare.toString(),
        metadataUri: Buffer.from(propertyAcc.metadataUri).toString('utf8').replace(/\0/g, ''),
      });

      if (publicKey) {
        try {
          const [holderPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('holder'), publicKey.toBuffer(), propertyAddress.toBuffer()],
            program!.programId
          );
          
          const holderAcc = await program!.account.holderState.fetch(holderPda);
          setHolder({
            balance: holderAcc.balance.toNumber(),
            rewardDebt: holderAcc.rewardDebt.toString(),
            unclaimed: holderAcc.unclaimed.toString(),
          });
        } catch (e) {
          setHolder(null);
        }
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRent = async () => {
    if (!program || !publicKey || !property) return;
    
    setProcessing(true);
    try {
      const [holderPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('holder'), publicKey.toBuffer(), propertyAddress.toBuffer()],
        program.programId
      );

      const [rentVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('rent_vault'), property.fractionMint.toBuffer()],
        program.programId
      );

      const holderUsdcAccount = await token.getAssociatedTokenAddress(
        property.fractionMint,
        publicKey
      );

      await program.methods
        .claimRent()
        .accountsPartial({
          propertyAccount: propertyAddress,
          holderState: holderPda,
          payer: publicKey,
          holderFractionAta: holderUsdcAccount,
          rentVaultAta: holderUsdcAccount,
          rentVault: rentVaultPda,
          receiverUsdc: holderUsdcAccount,
          tokenProgram: token.TOKEN_PROGRAM_ID,
        })
        .rpc();

      alert('Rent claimed successfully!');
      fetchPropertyData();
    } catch (error: any) {
      console.error('Error claiming rent:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="animate-pulse">Loading property details...</div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <p className="text-red-400">Property not found</p>
        </div>
      </div>
    );
  }

  const percentMinted = (property.mintedFractions / property.totalFractions) * 100;
  const available = property.totalFractions - property.mintedFractions;
  const SCALE = 1_000_000_000;
  const pendingRent = holder ? Number(holder.unclaimed) / SCALE : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">Property Details</h1>
          <p className="text-gray-400 font-mono text-sm">{propertyAddress.toString()}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Card */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Property #{propertyAddress.toString().slice(0, 8)}</h2>
                  <p className="text-gray-400 text-sm">{property.metadataUri || 'No metadata available'}</p>
                </div>
                <span className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400">
                  ACTIVE
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Supply</p>
                  <p className="text-2xl font-bold">{property.totalFractions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Minted</p>
                  <p className="text-2xl font-bold text-cyan-400">{property.mintedFractions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Available</p>
                  <p className="text-2xl font-bold text-emerald-400">{available.toLocaleString()}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Minting Progress</span>
                  <span className="font-bold">{percentMinted.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-600 to-emerald-600 h-3 rounded-full transition-all" 
                    style={{ width: `${percentMinted}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-6 border-t border-white/10">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Fraction Mint</p>
                  <p className="text-xs font-mono text-gray-300 break-all">{property.fractionMint.toString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">NFT Mint</p>
                  <p className="text-xs font-mono text-gray-300 break-all">{property.nftMint.toString()}</p>
                </div>
              </div>
            </div>

            {/* Your Holdings */}
            {holder && (
              <div className="bg-gradient-to-br from-cyan-900/20 to-emerald-900/20 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8 shadow-2xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span>💎</span> Your Holdings
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Your Fractions</p>
                    <p className="text-3xl font-bold text-cyan-400">{holder.balance.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {((holder.balance / property.totalFractions) * 100).toFixed(4)}% ownership
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Pending Rent</p>
                    <p className="text-3xl font-bold text-green-400">${pendingRent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    <p className="text-xs text-gray-500 mt-1">USDC rewards</p>
                  </div>
                </div>

                <button
                  onClick={handleClaimRent}
                  disabled={processing || pendingRent === 0}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg"
                >
                  {processing ? 'Claiming...' : pendingRent === 0 ? 'No Rent to Claim' : 'Claim Rent'}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Buy Fractions */}
            {available > 0 && publicKey && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-lg font-bold mb-4">Buy Fractions</h3>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <input
                    type="number"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    max={available}
                  />
                  <p className="text-xs text-gray-500 mt-1">Max: {available.toLocaleString()}</p>
                </div>

                <button
                  disabled={!buyAmount || Number(buyAmount) <= 0 || Number(buyAmount) > available}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg"
                >
                  Buy Fractions
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-4">Statistics</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Property Owner</span>
                  <span className="text-xs font-mono">{property.authority.toString().slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Holders</span>
                  <span className="font-bold">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Total Rent Paid</span>
                  <span className="font-bold text-green-400">-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
