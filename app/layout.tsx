import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '@/contexts/WalletContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PumpPocket - Solana Wallet with Token Deployment & Live Market Data',
  description: 'PumpPocket is the ultimate Solana wallet featuring built-in token deployment, live pump.fun activity feed, portfolio analytics, price alerts, batch send, NFT gallery, and more. Deploy tokens directly from your wallet and never miss a new launch.',
  keywords: 'Solana wallet, token deployment, pump.fun, SPL tokens, NFT wallet, crypto wallet, DeFi, Solana blockchain',
  authors: [{ name: 'PumpPocket' }],
  openGraph: {
    title: 'PumpPocket - Solana Wallet with Token Deployment',
    description: 'The only Solana wallet that lets you deploy tokens directly from your wallet. Watch live pump.fun activity, track your portfolio, and manage all your Solana assets in one place.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PumpPocket - Solana Wallet with Token Deployment',
    description: 'Deploy tokens, watch live market activity, and manage your Solana portfolio all in one wallet.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}





