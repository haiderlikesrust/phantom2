'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

interface PortfolioData {
  totalValue: number
  totalChange24h: number
  totalChangePercent: number
  tokens: Array<{
    symbol: string
    balance: number
    value: number
    change24h: number
    changePercent: number
  }>
}

export default function PortfolioPage() {
  const { publicKey, balance, tokens } = useWallet()
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'1D' | '7D' | '30D' | 'ALL'>('1D')

  useEffect(() => {
    if (publicKey) {
      fetchPortfolioData()
    }
  }, [publicKey, balance, tokens])

  const fetchPortfolioData = async () => {
    setLoading(true)
    try {
      // Fetch SOL price
      const solResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true')
      const solData = await solResponse.json()
      const solPrice = solData.solana?.usd || 0
      const solChange = solData.solana?.usd_24h_change || 0

      // Calculate portfolio value
      const solValue = balance * solPrice
      const tokenValues = tokens.map(token => ({
        symbol: token.symbol || 'UNKNOWN',
        balance: token.balance,
        value: (token.balance * 0), // Price not available in TokenBalance
        change24h: 0, // Would need to fetch from API
        changePercent: 0,
      }))

      const totalTokenValue = tokenValues.reduce((sum, t) => sum + t.value, 0)
      const totalValue = solValue + totalTokenValue

      setPortfolio({
        totalValue,
        totalChange24h: (solValue * solChange) / 100,
        totalChangePercent: solChange,
        tokens: [
          {
            symbol: 'SOL',
            balance,
            value: solValue,
            change24h: (solValue * solChange) / 100,
            changePercent: solChange,
          },
          ...tokenValues,
        ],
      })
    } catch (error) {
      console.error('Error fetching portfolio data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pump-dark pb-20">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pump-green mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading portfolio...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pump-dark pb-20">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6">Portfolio</h1>

        {/* Total Value Card */}
        <div className="bg-pump-card rounded-xl p-6 mb-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">Total Portfolio Value</span>
            <div className="flex space-x-2">
              {['1D', '7D', '30D', 'ALL'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    timeframe === tf
                      ? 'bg-pump-green text-black font-bold'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            ${portfolio?.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </div>
          <div className={`flex items-center space-x-2 ${portfolio && portfolio.totalChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <span>{portfolio && portfolio.totalChange24h >= 0 ? '↑' : '↓'}</span>
            <span>${Math.abs(portfolio?.totalChange24h || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span>({portfolio?.totalChangePercent.toFixed(2) || '0.00'}%)</span>
          </div>
        </div>

        {/* Holdings List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white mb-3">Holdings</h2>
          {portfolio?.tokens.map((token, index) => (
            <div key={index} className="bg-pump-card rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-pump-green rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{token.symbol[0]}</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">{token.symbol}</div>
                      <div className="text-gray-400 text-sm">{token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">${token.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className={`text-sm ${token.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {token.changePercent >= 0 ? '+' : ''}{token.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Chart Placeholder */}
        <div className="mt-6 bg-pump-card rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">Performance</h2>
          <div className="h-48 bg-gray-900 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart coming soon</p>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}





