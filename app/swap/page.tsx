'use client'

import SwapInterface from '@/components/SwapInterface'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

export default function SwapPage() {
  return (
    <main className="min-h-screen bg-phantom-dark pb-20">
      <Header />
      <SwapInterface />
      <BottomNav />
    </main>
  )
}

