'use client';

import { useState } from 'react';
import { useAnchor } from '@/providers/AnchorProvider';
import { useWallet } from '@solana/wallet-adapter-react';
import Navbar from '@/components/Navbar';
import { PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import * as token from '@solana/spl-token';
import { useRouter } from 'next/navigation';

export default function CreatePropertyPage() {
  const { program } = useAnchor();
  const { publicKey } = useWallet();
  const router = useRouter();
  
  const [nftMint, setNftMint] = useState('');
  const [totalFractions, setTotalFractions] = useState('');
  const [metadataUri, setMetadataUri] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!program || !publicKey) {
      alert('Please connect your wallet');
      return;
    }

    setProcessing(true);
    try {
      const nftMintPubkey = new PublicKey(nftMint);
      const fractions = new BN(totalFractions);
      
      // Generate new keypair for property account
      const propertyKeypair = Keypair.generate();
      
      // Create fraction mint (SPL token)
      const fractionMint = Keypair.generate();
      
      // Derive PDA for property state
      const [propertyStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('property_state'), propertyKeypair.publicKey.toBuffer()],
        program.programId
      );

      // Get authority's token account for NFT
      const authorityNftAccount = await token.getAssociatedTokenAddress(
        nftMintPubkey,
        publicKey
      );

      // Derive PDA for vault that will hold the NFT
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), propertyKeypair.publicKey.toBuffer()],
        program.programId
      );

      // Derive PDA for rent vault
      const [rentVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('rent_vault'), fractionMint.publicKey.toBuffer()],
        program.programId
      );

      // Create USDC mint for testing (in production, use actual USDC mint)
      const usdcMintKeypair = Keypair.generate();

      console.log('Creating property with:');
      console.log('Property account:', propertyKeypair.publicKey.toString());
      console.log('NFT Mint:', nftMintPubkey.toString());
      console.log('Fraction Mint:', fractionMint.publicKey.toString());

      // Convert metadata URI to 200-byte array
      const metadataBytes = new Array(200).fill(0);
      const encoder = new TextEncoder();
      const encoded = encoder.encode(metadataUri);
      for (let i = 0; i < Math.min(encoded.length, 200); i++) {
        metadataBytes[i] = encoded[i];
      }

      // Derive mint authority PDA
      const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('fraction_authority'), propertyKeypair.publicKey.toBuffer()],
        program.programId
      );

      // Get or create associated token accounts
      const rentVaultAta = await token.getAssociatedTokenAddress(
        usdcMintKeypair.publicKey,
        rentVaultPda,
        true
      );

      const nftVaultAta = await token.getAssociatedTokenAddress(
        nftMintPubkey,
        vaultPda,
        true
      );

      await program.methods
        .initializeProperty(metadataBytes, fractions, 0) // metadata_uri, total_fractions, fraction_decimal
        .accountsPartial({
          propertyAccount: propertyKeypair.publicKey,
          authority: publicKey,
          nftMint: nftMintPubkey,
          fractionMint: fractionMint.publicKey,
          mintAuthority: mintAuthorityPda,
          rentVault: rentVaultPda,
          nftVault: vaultPda,
          rentVaultAta,
          nftVaultAta,
          usdcMint: usdcMintKeypair.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: token.ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .signers([propertyKeypair, fractionMint, usdcMintKeypair])
        .rpc();

      alert('Property created successfully!');
      router.push(`/property/${propertyKeypair.publicKey.toString()}`);
    } catch (error: any) {
      console.error('Error creating property:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">Create Property</h1>
          <p className="text-gray-400">Tokenize your real estate NFT into fractional shares</p>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {!publicKey ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Wallet Required</h3>
              <p className="text-gray-400 mb-6">Connect your wallet to create a property</p>
            </div>
          ) : (
            <form onSubmit={handleCreateProperty} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  NFT Mint Address *
                </label>
                <input
                  type="text"
                  value={nftMint}
                  onChange={(e) => setNftMint(e.target.value)}
                  placeholder="Enter NFT mint public key"
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">The SPL token mint address of your property NFT</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Total Fractions *
                </label>
                <input
                  type="number"
                  value={totalFractions}
                  onChange={(e) => setTotalFractions(e.target.value)}
                  placeholder="1000"
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  required
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Number of fractional tokens to create (e.g., 1000)</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Metadata URI
                </label>
                <input
                  type="text"
                  value={metadataUri}
                  onChange={(e) => setMetadataUri(e.target.value)}
                  placeholder="https://arweave.net/..."
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Link to property metadata (IPFS, Arweave, etc.)</p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <span>ℹ️</span> What happens next?
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Your NFT will be transferred to a program vault</li>
                    <li>• A new SPL token will be created for fractions</li>
                    <li>• You can mint fractions to sell to investors</li>
                    <li>• Rent deposits will be distributed proportionally</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-4 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg text-lg"
                >
                  {processing ? 'Creating Property...' : 'Create Property'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-6">
            <div className="text-3xl mb-3">🏠</div>
            <h3 className="font-bold mb-2">Property NFT</h3>
            <p className="text-sm text-gray-400">Your real estate must be represented as an NFT on Solana before fractionalizing</p>
          </div>
          
          <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-6">
            <div className="text-3xl mb-3">💎</div>
            <h3 className="font-bold mb-2">Fractionalization</h3>
            <p className="text-sm text-gray-400">Split ownership into tradeable tokens that can be bought and sold on secondary markets</p>
          </div>
        </div>
      </main>
    </div>
  );
}
