import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/providers/WalletProvider";
import { AnchorContextProvider } from "@/providers/AnchorProvider";

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
          </AnchorContextProvider>
        </WalletContextProvider>
      </body>
    </html>
  );
}
