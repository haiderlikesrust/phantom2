'use client'

import { useWallet } from '@/contexts/WalletContext'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import TransactionHistory from '@/components/TransactionHistory'

export default function HistoryPage() {
  const { connected } = useWallet()

  if (!connected) {
    return (
      <main className="min-h-screen bg-pump-dark pb-20">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">Please connect your wallet</div>
        </div>
        <BottomNav />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-pump-dark pb-20">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Transaction History</h1>
        <TransactionHistory />
      </div>
      <BottomNav />
    </main>
  )
}





