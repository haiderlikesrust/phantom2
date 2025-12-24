'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useWallet } from '@/contexts/WalletContext'
import SendModal from './SendModal'
import SolanaLogo from './SolanaLogo'
import ReceiveModal from './ReceiveModal'
import BottomNav from './BottomNav'

export default function WalletDashboard() {
  const { publicKey, balance, refreshBalance, tokens, connection } = useWallet()
  
  // Debug logging
  useEffect(() => {
    console.log('WalletDashboard - Balance:', balance, 'PublicKey:', publicKey?.toBase58(), 'Connection:', !!connection)
  }, [balance, publicKey, connection])
  const [showSend, setShowSend] = useState(false)
  const [showReceive, setShowReceive] = useState(false)
  const [usdValue, setUsdValue] = useState(0)
  const [priceChange, setPriceChange] = useState({ value: 0, percent: 0 })

  // Fetch real SOL price from CoinGecko API
  useEffect(() => {
    const fetchSOLPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true')
        if (response.ok) {
          const data = await response.json()
          const price = data.solana.usd
          const change24h = data.solana.usd_24h_change || 0
          setUsdValue(balance * price)
          setPriceChange({ 
            value: (balance * price * change24h) / 100, 
            percent: change24h 
          })
        } else {
          // Fallback to mock data if API fails
          const mockPrice = 125
          setUsdValue(balance * mockPrice)
          setPriceChange({ value: -0.12, percent: -1.87 })
        }
      } catch (error) {
        console.error('Error fetching SOL price:', error)
        // Fallback to mock data
        const mockPrice = 125
        setUsdValue(balance * mockPrice)
        setPriceChange({ value: -0.12, percent: -1.87 })
      }
    }

    // Always fetch price, even if balance is 0
    fetchSOLPrice()
    const interval = setInterval(fetchSOLPrice, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [balance])

  // Refresh balance on mount and when publicKey changes
  useEffect(() => {
    if (publicKey) {
      refreshBalance()
    }
  }, [publicKey, refreshBalance])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-phantom-dark pb-20">
      {/* Solana Address Bar */}
      <div className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            {/* Solana Logo */}
            <div className="flex items-center space-x-2">
              <SolanaLogo size={24} />
              <span className="text-white font-medium">Solana</span>
            </div>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">{formatAddress(publicKey?.toBase58() || '')}</span>
              <button
                onClick={() => navigator.clipboard.writeText(publicKey?.toBase58() || '')}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Balance Display */}
        <div className="mb-6">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-2">
              ${usdValue.toFixed(2)}
            </h1>
            <p className="text-gray-400 text-lg mb-2">
              {balance.toFixed(4)} SOL
              {balance === 0 && (
                <span className="text-yellow-500 text-xs ml-2">(Checking...)</span>
              )}
            </p>
            <div className="flex items-center justify-center space-x-2 text-red-500">
              <span className="text-sm">${priceChange.value.toFixed(2)}</span>
              <span className="text-sm">({priceChange.percent.toFixed(2)}%)</span>
            </div>
            <div className="mt-3 space-x-2">
              <button
                onClick={async () => {
                  console.log('Manual refresh clicked')
                  await refreshBalance()
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition-colors"
              >
                Refresh Balance
              </button>
              <button
                onClick={() => {
                  console.log('Current state:', { balance, publicKey: publicKey?.toBase58(), connection: !!connection })
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-medium transition-colors"
              >
                Debug Info
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => setShowReceive(true)}
            className="bg-phantom-card hover:bg-gray-800 rounded-xl p-4 flex flex-col items-center space-y-2 transition-colors border border-gray-800"
          >
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <span className="text-white text-sm font-medium">Receive</span>
          </button>
          <button
            onClick={() => setShowSend(true)}
            className="bg-phantom-card hover:bg-gray-800 rounded-xl p-4 flex flex-col items-center space-y-2 transition-colors border border-gray-800"
          >
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <span className="text-white text-sm font-medium">Send</span>
          </button>
          <Link
            href="/swap"
            className="bg-phantom-card hover:bg-gray-800 rounded-xl p-4 flex flex-col items-center space-y-2 transition-colors border border-gray-800"
          >
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="text-white text-sm font-medium">Swap</span>
          </Link>
          <button className="bg-phantom-card hover:bg-gray-800 rounded-xl p-4 flex flex-col items-center space-y-2 transition-colors border border-gray-800">
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-white text-sm font-medium">Buy</span>
          </button>
        </div>

        {/* Tokens Section */}
        <div className="bg-phantom-card rounded-xl border border-gray-800">
          <div className="flex border-b border-gray-800">
            <button className="flex-1 py-4 px-4 text-white font-medium border-b-2 border-purple-500">
              Tokens
            </button>
            <button className="flex-1 py-4 px-4 text-gray-400 font-medium hover:text-white transition-colors">
              Collectibles
            </button>
          </div>
          <div className="p-4 space-y-3">
            {/* SOL Token */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <SolanaLogo size={40} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">Solana</span>
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">{balance.toFixed(5)} SOL</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">${usdValue.toFixed(2)}</p>
                <p className="text-red-500 text-sm">-${Math.abs(priceChange.value).toFixed(2)}</p>
              </div>
            </div>
            
            {/* SPL Tokens */}
            {tokens.length > 0 && tokens.map((token) => (
              <div key={token.mint} className="flex items-center justify-between py-3 border-t border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {token.symbol[0] || '?'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">{token.name}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{token.uiAmount.toFixed(4)} {token.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">-</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSend && <SendModal onClose={() => setShowSend(false)} />}
      {showReceive && <ReceiveModal onClose={() => setShowReceive(false)} />}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
