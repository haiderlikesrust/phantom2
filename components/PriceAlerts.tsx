'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'

interface PriceAlert {
  id: string
  tokenSymbol: string
  tokenMint: string
  targetPrice: number
  direction: 'above' | 'below'
  active: boolean
}

export default function PriceAlerts() {
  const { publicKey } = useWallet()
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenMint, setTokenMint] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [direction, setDirection] = useState<'above' | 'below'>('above')

  useEffect(() => {
    if (publicKey) {
      loadAlerts()
      checkAlerts()
      const interval = setInterval(checkAlerts, 60000) // Check every minute
      return () => clearInterval(interval)
    }
  }, [publicKey])

  const loadAlerts = () => {
    if (!publicKey) return
    const saved = localStorage.getItem(`price_alerts_${publicKey.toBase58()}`)
    if (saved) {
      setAlerts(JSON.parse(saved))
    }
  }

  const saveAlerts = (newAlerts: PriceAlert[]) => {
    if (publicKey) {
      localStorage.setItem(`price_alerts_${publicKey.toBase58()}`, JSON.stringify(newAlerts))
      setAlerts(newAlerts)
    }
  }

  const addAlert = () => {
    if (!tokenSymbol || !tokenMint || !targetPrice) return

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      tokenSymbol,
      tokenMint,
      targetPrice: parseFloat(targetPrice),
      direction,
      active: true,
    }

    const newAlerts = [...alerts, newAlert]
    saveAlerts(newAlerts)
    setTokenSymbol('')
    setTokenMint('')
    setTargetPrice('')
    setShowAddModal(false)
  }

  const removeAlert = (id: string) => {
    const newAlerts = alerts.filter(a => a.id !== id)
    saveAlerts(newAlerts)
  }

  const toggleAlert = (id: string) => {
    const newAlerts = alerts.map(a => 
      a.id === id ? { ...a, active: !a.active } : a
    )
    saveAlerts(newAlerts)
  }

  const checkAlerts = async () => {
    // In production, fetch actual prices from API
    // For now, this is a placeholder
    alerts.forEach(alert => {
      if (!alert.active) return
      
      // Simulate price check
      // In production, fetch real price and compare
      console.log(`Checking alert for ${alert.tokenSymbol} at ${alert.targetPrice}`)
    })
  }

  return (
    <div className="bg-pump-card rounded-xl p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Price Alerts</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-pump-green hover:bg-pump-green/90 rounded-lg text-black text-sm font-bold transition-colors"
        >
          + Add Alert
        </button>
      </div>

      {alerts.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">No price alerts set</p>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-pump-dark rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div className="text-white font-medium">{alert.tokenSymbol}</div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    alert.direction === 'above' 
                      ? 'bg-green-900/30 text-green-400' 
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {alert.direction === 'above' ? '↑' : '↓'} ${alert.targetPrice}
                  </div>
                  {alert.active && (
                    <span className="text-xs text-green-400">● Active</span>
                  )}
                </div>
                <div className="text-gray-400 text-xs mt-1">{alert.tokenMint.slice(0, 16)}...</div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className={`px-3 py-1 rounded text-xs ${
                    alert.active
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {alert.active ? 'On' : 'Off'}
                </button>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="text-red-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-pump-card rounded-xl p-6 max-w-md w-full border border-gray-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">Add Price Alert</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Token Symbol</label>
                <input
                  type="text"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                  placeholder="SOL"
                  className="w-full px-4 py-3 bg-pump-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pump-green"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Token Address</label>
                <input
                  type="text"
                  value={tokenMint}
                  onChange={(e) => setTokenMint(e.target.value)}
                  placeholder="Enter token contract address"
                  className="w-full px-4 py-3 bg-pump-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pump-green"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Target Price (USD)</label>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-3 bg-pump-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pump-green"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Alert When Price</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setDirection('above')}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      direction === 'above'
                        ? 'bg-pump-green text-black font-bold'
                        : 'bg-pump-dark text-gray-400 border border-gray-700'
                    }`}
                  >
                    Above
                  </button>
                  <button
                    onClick={() => setDirection('below')}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      direction === 'below'
                        ? 'bg-pump-green text-black font-bold'
                        : 'bg-pump-dark text-gray-400 border border-gray-700'
                    }`}
                  >
                    Below
                  </button>
                </div>
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
                onClick={addAlert}
                disabled={!tokenSymbol || !tokenMint || !targetPrice}
                className="flex-1 py-3 bg-pump-green hover:bg-pump-green rounded-lg text-black font-bold font-semibold transition-colors disabled:opacity-50"
              >
                Add Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}





