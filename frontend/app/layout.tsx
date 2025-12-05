import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/providers/WalletProvider";
import { AnchorContextProvider } from "@/providers/AnchorProvider";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RWA Fractionalization Platform",
  description: "Tokenize real estate and distribute rental income on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletContextProvider>
          <AnchorContextProvider>
            {children}
            <Toaster 
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1e293b',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                },
                success: {
                  iconTheme: {
                    primary: '#00bb7f',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ff6568',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AnchorContextProvider>
        </WalletContextProvider>
      </body>
    </html>
  );
}
