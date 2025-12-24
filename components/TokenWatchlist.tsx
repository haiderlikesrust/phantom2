'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'

interface WatchlistToken {
  mint: string
  symbol: string
  name: string
  price: number
  change24h: number
  targetPrice?: number
}

export default function TokenWatchlist() {
  const { publicKey } = useWallet()
  const [watchlist, setWatchlist] = useState<WatchlistToken[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [tokenAddress, setTokenAddress] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (publicKey) {
      loadWatchlist()
    }
  }, [publicKey])

  const loadWatchlist = () => {
    const saved = localStorage.getItem(`watchlist_${publicKey?.toBase58()}`)
    if (saved) {
      setWatchlist(JSON.parse(saved))
    }
  }

  const saveWatchlist = (newWatchlist: WatchlistToken[]) => {
    if (publicKey) {
      localStorage.setItem(`watchlist_${publicKey?.toBase58()}`, JSON.stringify(newWatchlist))
      setWatchlist(newWatchlist)
    }
  }

  const addToWatchlist = async () => {
    if (!tokenAddress.trim()) return

    setLoading(true)
    try {
      // Fetch token info (simplified - in production, use proper token metadata)
      const tokenInfo: WatchlistToken = {
        mint: tokenAddress,
        symbol: tokenAddress.slice(0, 8).toUpperCase(),
        name: `Token ${tokenAddress.slice(0, 8)}`,
        price: 0,
        change24h: 0,
        targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
      }

      // Fetch price from Jupiter or other API
      // For now, just add to watchlist
      const newWatchlist = [...watchlist, tokenInfo]
      saveWatchlist(newWatchlist)
      setTokenAddress('')
      setTargetPrice('')
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding token to watchlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWatchlist = (mint: string) => {
    const newWatchlist = watchlist.filter(t => t.mint !== mint)
    saveWatchlist(newWatchlist)
  }

  return (
    <div className="bg-pump-card rounded-xl p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Watchlist</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-pump-green hover:bg-pump-green/90 rounded-lg text-black text-sm font-bold transition-colors"
        >
          + Add
        </button>
      </div>

      {watchlist.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">No tokens in watchlist</p>
      ) : (
        <div className="space-y-2">
          {watchlist.map((token) => (
            <div key={token.mint} className="flex items-center justify-between p-3 bg-pump-dark rounded-lg">
              <div className="flex-1">
                <div className="text-white font-medium">{token.symbol}</div>
                <div className="text-gray-400 text-xs">{token.mint.slice(0, 8)}...</div>
                {token.targetPrice && (
                  <div className="text-pump-green text-xs mt-1">Target: ${token.targetPrice}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">${token.price.toFixed(4)}</div>
                <div className={`text-xs ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                </div>
              </div>
              <button
                onClick={() => removeFromWatchlist(token.mint)}
                className="ml-3 text-red-400 hover:text-red-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-pump-card rounded-xl p-6 max-w-md w-full border border-gray-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">Add Token to Watchlist</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Token Address</label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="Enter token contract address"
                  className="w-full px-4 py-3 bg-pump-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pump-green"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Target Price (Optional)</label>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="Set price alert"
                  className="w-full px-4 py-3 bg-pump-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pump-green"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-pump-dark hover:bg-gray-800 border border-gray-700 rounded-lg text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addToWatchlist}
                disabled={loading || !tokenAddress.trim()}
                className="flex-1 py-3 bg-pump-green hover:bg-pump-green rounded-lg text-black font-bold font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}





