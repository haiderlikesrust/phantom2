'use client'

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'

interface TokenCreation {
  mint: string
  name?: string
  symbol?: string
  timestamp: number
  creator?: string
  image?: string
  website?: string
  twitter?: string
  telegram?: string
  isMayhemMode?: boolean
  marketCapSol?: number
  solAmount?: number
  initialBuy?: number
  uri?: string
}

interface TokenTrade {
  mint: string
  type: 'buy' | 'sell'
  amount: number
  price?: number
  trader: string
  timestamp: number
  image?: string
  name?: string
  symbol?: string
}

interface MigrationEvent {
  mint: string
  timestamp: number
}

export default function LivePage() {
  const [newTokens, setNewTokens] = useState<TokenCreation[]>([])
  const [trades, setTrades] = useState<TokenTrade[]>([])
  const [migrations, setMigrations] = useState<MigrationEvent[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState('')
  const wsRef = useRef<WebSocket | null>(null)
  const [activeTab, setActiveTab] = useState<'tokens' | 'trades' | 'migrations'>('tokens')
  const [subscribedTokens, setSubscribedTokens] = useState<string[]>([])
  const [rawMessages, setRawMessages] = useState<any[]>([])
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('wss://pumpportal.fun/api/data')
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected to PumpPortal')
        setConnected(true)
        setError('')
        
        // Subscribe to new token creations
        ws.send(JSON.stringify({
          method: 'subscribeNewToken'
        }))

        // Subscribe to migration events
        ws.send(JSON.stringify({
          method: 'subscribeMigration'
        }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('WebSocket message received:', data)
          // Store raw message for debugging
          setRawMessages(prev => [data, ...prev].slice(0, 20)) // Keep last 20 messages
          handleWebSocketMessage(data)
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setError('Connection error. Reconnecting...')
        setConnected(false)
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setConnected(false)
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            connectWebSocket()
          }
        }, 3000)
      }
    } catch (err: any) {
      console.error('Failed to connect WebSocket:', err)
      setError(err.message || 'Failed to connect')
    }
  }

  const fetchTokenMetadata = async (mint: string): Promise<{ image?: string; website?: string; twitter?: string; telegram?: string }> => {
    try {
      const response = await fetch(`https://frontend-api.pump.fun/coins/${mint}`)
      if (response.ok) {
        const tokenData = await response.json()
        return {
          image: tokenData.imageUri || tokenData.image,
          website: tokenData.website || tokenData.websiteUrl,
          twitter: tokenData.twitter || tokenData.twitterUrl,
          telegram: tokenData.telegram || tokenData.telegramUrl,
        }
      }
    } catch (error) {
      console.error('Error fetching token metadata:', error)
    }
    return {}
  }

  const handleWebSocketMessage = (data: any) => {
    // Check transaction type from WebSocket data
    const txType = data.txType || data.type || data.method
    
    // Handle new token creation
    if (txType === 'create' || txType === 'cre' || (data.mint && !data.type && !data.tradeType)) {
      const tokenCreation: TokenCreation = {
        mint: data.mint,
        name: data.name || data.tokenName,
        symbol: data.symbol || data.tokenSymbol,
        timestamp: data.timestamp ? data.timestamp * 1000 : Date.now(), // Convert from seconds if needed
        creator: data.creator || data.user || data.account || data.traderPublicKey,
        image: data.image || data.imageUri,
        website: data.website || data.websiteUrl,
        twitter: data.twitter || data.twitterUrl,
        telegram: data.telegram || data.telegramUrl,
        isMayhemMode: data.is_mayhem_mode !== undefined ? data.is_mayhem_mode : (data.isMayhemMode !== undefined ? data.isMayhemMode : false),
        marketCapSol: data.marketCapSol || data.market_cap_sol,
        solAmount: data.solAmount || data.sol_amount || data.initialBuy || data.initial_buy,
        initialBuy: data.initialBuy || data.initial_buy,
        uri: data.uri,
      }
      setNewTokens(prev => [tokenCreation, ...prev].slice(0, 100)) // Keep last 100
      
      // Fetch token metadata from pump.fun API in background
      fetchTokenMetadata(data.mint).then(metadata => {
        if (metadata.image || metadata.website || metadata.twitter || metadata.telegram) {
          setNewTokens(prev => prev.map(t => 
            t.mint === data.mint ? { 
              ...t, 
              image: t.image || metadata.image,
              website: t.website || metadata.website,
              twitter: t.twitter || metadata.twitter,
              telegram: t.telegram || metadata.telegram,
            } : t
          ))
        }
      })
    }

    // Handle trades (buy/sell)
    if (txType === 'buy' || txType === 'sell' || data.type === 'buy' || data.type === 'sell' || data.tradeType) {
      const mint = data.mint || data.token
      // Fetch token image in background
      fetchTokenMetadata(mint).then(metadata => {
        setTrades(prev => prev.map(t => 
          t.mint === mint && !t.image ? { 
            ...t, 
            image: metadata.image,
            name: t.name || undefined,
            symbol: t.symbol || undefined,
          } : t
        ))
      })
      
      const trade: TokenTrade = {
        mint,
        type: txType === 'sell' || data.type === 'sell' || data.tradeType === 'sell' ? 'sell' : 'buy',
        amount: data.tokenAmount || data.amount || 0,
        price: data.price || (data.solAmount && data.tokenAmount ? data.solAmount / data.tokenAmount : undefined),
        trader: data.trader || data.user || data.account || data.traderPublicKey,
        timestamp: data.timestamp ? data.timestamp * 1000 : Date.now(),
        name: data.name || data.tokenName,
        symbol: data.symbol || data.tokenSymbol,
      }
      setTrades(prev => [trade, ...prev].slice(0, 100)) // Keep last 100
    }

    // Handle migrations
    if (txType === 'migrate' || data.migration || data.method === 'migration') {
      const migration: MigrationEvent = {
        mint: data.mint || data.token,
        timestamp: data.timestamp ? data.timestamp * 1000 : Date.now(),
      }
      setMigrations(prev => [migration, ...prev].slice(0, 50)) // Keep last 50
    }
  }

  const subscribeToToken = (mint: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket not connected')
      return
    }

    if (subscribedTokens.includes(mint)) {
      return // Already subscribed
    }

    wsRef.current.send(JSON.stringify({
      method: 'subscribeTokenTrade',
      keys: [mint]
    }))

    setSubscribedTokens(prev => [...prev, mint])
  }

  const unsubscribeFromToken = (mint: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return
    }

    wsRef.current.send(JSON.stringify({
      method: 'unsubscribeTokenTrade',
      keys: [mint]
    }))

    setSubscribedTokens(prev => prev.filter(t => t !== mint))
  }

  const formatAddress = (address: string) => {
    if (!address) return 'Unknown'
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <div className="min-h-screen bg-pump-dark pb-20">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Live Pump.fun Activity</h1>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-pump-green' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-400">{connected ? 'Live' : 'Connecting...'}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'tokens'
                ? 'text-pump-green border-b-2 border-pump-green'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            New Tokens ({newTokens.length})
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'trades'
                ? 'text-pump-green border-b-2 border-pump-green'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Trades ({trades.length})
          </button>
          <button
            onClick={() => setActiveTab('migrations')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'migrations'
                ? 'text-pump-green border-b-2 border-pump-green'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Migrations ({migrations.length})
          </button>
        </div>

        {/* New Tokens Tab */}
        {activeTab === 'tokens' && (
          <div className="space-y-3">
            {newTokens.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>Waiting for new token creations...</p>
                <p className="text-sm mt-2">New tokens will appear here in real-time</p>
              </div>
            ) : (
              newTokens.map((token, index) => (
                <div
                  key={`${token.mint}-${index}`}
                  className="bg-pump-card rounded-xl p-4 border border-gray-800 hover:border-pump-green transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {token.image ? (
                          <img
                            src={token.image}
                            alt={token.name || token.symbol || 'Token'}
                            className="w-10 h-10 rounded-full object-cover border-2 border-pump-green"
                            onError={(e) => {
                              // Fallback to letter icon if image fails to load
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const parent = target.parentElement
                              if (parent) {
                                const fallback = parent.querySelector('.token-fallback') as HTMLElement
                                if (fallback) fallback.style.display = 'flex'
                              }
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-10 h-10 bg-pump-green rounded-full flex items-center justify-center token-fallback ${token.image ? 'hidden' : ''}`}
                        >
                          <span className="text-black font-bold text-xs">
                            {token.symbol?.[0] || token.name?.[0] || token.mint[0] || '?'}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-semibold">
                            {token.name || token.symbol || 'Unknown Token'}
                          </div>
                          <div className="text-gray-400 text-xs font-mono">
                            {formatAddress(token.mint)}
                          </div>
                        </div>
                      </div>
                      {token.creator && (
                        <div className="text-gray-500 text-xs">
                          Creator: {formatAddress(token.creator)}
                        </div>
                      )}
                      {/* Token Stats */}
                      <div className="flex items-center space-x-4 mt-2 flex-wrap gap-2">
                        {token.isMayhemMode !== undefined && (
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            token.isMayhemMode 
                              ? 'bg-red-900/30 text-red-400 border border-red-500/30' 
                              : 'bg-gray-800 text-gray-400'
                          }`}>
                            {token.isMayhemMode ? '⚡ Mayhem' : 'Normal'}
                          </div>
                        )}
                        {token.marketCapSol !== undefined && (
                          <div className="text-gray-400 text-xs">
                            <span className="text-gray-500">MCap:</span> {token.marketCapSol.toFixed(2)} SOL
                          </div>
                        )}
                        {token.solAmount !== undefined && (
                          <div className="text-pump-green text-xs font-medium">
                            <span className="text-gray-500">Dev Buy:</span> {token.solAmount.toFixed(4)} SOL
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 text-xs mb-1">{formatTime(token.timestamp)}</div>
                      <button
                        onClick={() => subscribeToToken(token.mint)}
                        className="px-3 py-1 bg-pump-green hover:bg-pump-green/90 rounded-lg text-black text-xs font-bold transition-colors"
                      >
                        Watch
                      </button>
                    </div>
                  </div>
                  
                  {/* Social Links */}
                  {(token.website || token.twitter || token.telegram) && (
                    <div className="mt-3 pt-3 border-t border-gray-800 flex items-center space-x-4 flex-wrap gap-2">
                      {token.website && (
                        <a
                          href={token.website.startsWith('http') ? token.website : `https://${token.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pump-green hover:text-pump-green/80 text-xs flex items-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          <span>Website</span>
                        </a>
                      )}
                      {token.twitter && (
                        <a
                          href={token.twitter.startsWith('http') ? token.twitter : `https://${token.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pump-green hover:text-pump-green/80 text-xs flex items-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                          </svg>
                          <span>Twitter</span>
                        </a>
                      )}
                      {token.telegram && (
                        <a
                          href={token.telegram.startsWith('http') ? token.telegram : `https://${token.telegram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pump-green hover:text-pump-green/80 text-xs flex items-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.686z" />
                          </svg>
                          <span>Telegram</span>
                        </a>
                      )}
                    </div>
                  )}
                  
                  <div className={`mt-3 pt-3 border-t border-gray-800`}>
                    <Link
                      href={`https://pump.fun/${token.mint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pump-green hover:text-pump-green/80 text-xs"
                    >
                      View on pump.fun →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Trades Tab */}
        {activeTab === 'trades' && (
          <div className="space-y-3">
            {trades.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No trades yet. Subscribe to tokens to see their trades.</p>
              </div>
            ) : (
              trades.map((trade, index) => (
                <div
                  key={`${trade.mint}-${trade.timestamp}-${index}`}
                  className="bg-pump-card rounded-xl p-4 border border-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {trade.image ? (
                        <img
                          src={trade.image}
                          alt={trade.name || trade.symbol || 'Token'}
                          className="w-10 h-10 rounded-full object-cover border-2 border-pump-green"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              const fallback = parent.querySelector('.trade-fallback') as HTMLElement
                              if (fallback) fallback.style.display = 'flex'
                            }
                          }}
                        />
                      ) : null}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center trade-fallback ${
                        trade.type === 'buy' ? 'bg-green-900/30' : 'bg-red-900/30'
                      } ${trade.image ? 'hidden' : ''}`}>
                        <span className={`text-lg ${trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.type === 'buy' ? '↑' : '↓'}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          {trade.type === 'buy' ? 'Buy' : 'Sell'}
                        </div>
                        <div className="text-gray-400 text-xs font-mono">
                          {formatAddress(trade.mint)}
                        </div>
                        {trade.trader && (
                          <div className="text-gray-500 text-xs mt-1">
                            Trader: {formatAddress(trade.trader)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {trade.amount > 0 ? trade.amount.toLocaleString() : '-'}
                      </div>
                      {trade.price && (
                        <div className="text-gray-400 text-xs">
                          ${trade.price.toFixed(6)}
                        </div>
                      )}
                      <div className="text-gray-500 text-xs mt-1">
                        {formatTime(trade.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Migrations Tab */}
        {activeTab === 'migrations' && (
          <div className="space-y-3">
            {migrations.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No migrations yet. Migrations will appear here in real-time.</p>
              </div>
            ) : (
              migrations.map((migration, index) => (
                <div
                  key={`${migration.mint}-${migration.timestamp}-${index}`}
                  className="bg-pump-card rounded-xl p-4 border border-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 text-lg">🚀</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">Token Migrated</div>
                        <div className="text-gray-400 text-xs font-mono">
                          {formatAddress(migration.mint)}
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {formatTime(migration.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Subscribed Tokens */}
        {subscribedTokens.length > 0 && (
          <div className="mt-6 bg-pump-card rounded-xl p-4 border border-gray-800">
            <h3 className="text-white font-semibold mb-3">Watching Tokens ({subscribedTokens.length})</h3>
            <div className="flex flex-wrap gap-2">
              {subscribedTokens.map((mint) => (
                <div
                  key={mint}
                  className="flex items-center space-x-2 bg-pump-dark rounded-lg px-3 py-2"
                >
                  <span className="text-gray-400 text-xs font-mono">{formatAddress(mint)}</span>
                  <button
                    onClick={() => unsubscribeFromToken(mint)}
                    className="text-red-400 hover:text-red-500 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Panel */}
        {showDebug && (
          <div className="mt-6 bg-pump-card rounded-xl p-6 border border-gray-800">
            <h3 className="text-white font-semibold mb-4">WebSocket Debug (Last {rawMessages.length} messages)</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {rawMessages.length === 0 ? (
                <p className="text-gray-400 text-sm">No messages received yet</p>
              ) : (
                rawMessages.map((msg, index) => (
                  <div key={index} className="bg-pump-dark rounded-lg p-4 border border-gray-700">
                    <div className="text-gray-400 text-xs mb-2">Message #{rawMessages.length - index}</div>
                    <pre className="text-xs text-gray-300 overflow-x-auto">
                      {JSON.stringify(msg, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}

