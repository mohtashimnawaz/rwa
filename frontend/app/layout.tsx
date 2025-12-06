import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/providers/WalletProvider";
import { AnchorContextProvider } from "@/providers/AnchorProvider";
import { Toaster } from 'react-hot-toast';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space-grotesk',
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

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
      <body className={`${spaceGrotesk.variable} ${inter.variable} font-sans`}>
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
            <a 
              href="https://portfolio-main-sooty-mu.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="signature-watermark"
            >
              by nwz
            </a>
          </AnchorContextProvider>
        </WalletContextProvider>
      </body>
    </html>
  );
}
