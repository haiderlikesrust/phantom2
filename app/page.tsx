'use client'

import { useWallet } from '@/contexts/WalletContext'
import WalletDashboard from '@/components/WalletDashboard'
import ConnectWallet from '@/components/ConnectWallet'
import Header from '@/components/Header'
import SolanaLogo from '@/components/SolanaLogo'

export default function Home() {
  const { connected, publicKey, isInitializing } = useWallet()

  // Show loading state while checking for existing wallet
  if (isInitializing) {
    return (
      <main className="min-h-screen bg-phantom-dark flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mx-auto mb-4 animate-pulse">
            <SolanaLogo size={64} />
          </div>
          <p className="text-gray-400">Loading wallet...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-phantom-dark">
      <Header />
      {connected && publicKey ? (
        <WalletDashboard />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <ConnectWallet />
        </div>
      )}
    </main>
  )
}

