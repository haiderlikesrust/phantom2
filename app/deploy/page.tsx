'use client'

import DeployInterface from '@/components/DeployInterface'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

export default function DeployPage() {
  return (
    <main className="min-h-screen bg-pump-dark pb-20">
      <Header />
      <DeployInterface />
      <BottomNav />
    </main>
  )
}




