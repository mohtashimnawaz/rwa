'use client';

import { FC, ReactNode, useMemo } from 'react';
import { AnchorProvider, Program, setProvider } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Rwa } from '../types/rwa';
import IDL from '../idl/rwa.json';

// Program ID from your deployment
const PROGRAM_ID = new PublicKey('DYMKJAp7o44QC7ZwB6JFbJY4mkDDtoAMbrwsTCrZqcj3');

interface AnchorContextState {
  program: Program<Rwa> | null;
  provider: AnchorProvider | null;
}

export const AnchorContext = React.createContext<AnchorContextState>({
  program: null,
  provider: null,
});

import React from 'react';

export const AnchorContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey) return null;
    
    const provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'confirmed' }
    );
    
    setProvider(provider);
    return provider;
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(IDL as any as Rwa, provider) as Program<Rwa>;
  }, [provider]);

  return (
    <AnchorContext.Provider value={{ program, provider }}>
      {children}
    </AnchorContext.Provider>
  );
};

export const useAnchor = () => {
  const context = React.useContext(AnchorContext);
  if (!context) {
    throw new Error('useAnchor must be used within AnchorContextProvider');
  }
  return context;
};
