'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { PublicKey } from '@solana/web3.js'
import TransactionDetailsModal from './TransactionDetailsModal'

interface TransactionHistoryProps {
  showTitle?: boolean
}

export default function TransactionHistory({ showTitle = true }: TransactionHistoryProps) {
  const { transactions, publicKey, connection } = useWallet()
  const [blockchainTxs, setBlockchainTxs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTx, setSelectedTx] = useState<string | null>(null)

  useEffect(() => {
    if (publicKey && connection) {
      fetchBlockchainTransactions()
    }
  }, [publicKey, connection])

  const fetchBlockchainTransactions = async () => {
    if (!publicKey || !connection) return
    
    setLoading(true)
    try {
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 20 })
      const txDetails = await Promise.all(
        signatures.map(async (sig) => {
          try {
            const tx = await connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0
            })
            return {
              signature: sig.signature,
              timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
              slot: sig.slot,
              tx
            }
          } catch {
            return null
          }
        })
      )
      setBlockchainTxs(txDetails.filter(Boolean))
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const allTransactions = [
    ...transactions,
    ...blockchainTxs.map(tx => ({
      signature: tx.signature,
      type: 'sent' as const,
      amount: 0,
      timestamp: tx.timestamp,
      to: undefined,
      from: undefined,
    }))
  ].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="bg-phantom-card rounded-2xl p-6 border border-gray-800">
      {showTitle && <h2 className="text-2xl font-bold text-white mb-4">Transaction History</h2>}
      {loading && (
        <p className="text-gray-400 text-center py-4">Loading transactions...</p>
      )}
      {!loading && allTransactions.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No transactions yet</p>
      ) : (
        <div className="space-y-3">
          {allTransactions.map((tx) => (
            <div
              key={tx.signature}
              className="bg-phantom-dark rounded-lg p-4 border border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => setSelectedTx(tx.signature)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'sent' ? 'bg-red-900/30' : 'bg-green-900/30'
                    }`}
                  >
                    {tx.type === 'sent' ? '↓' : '↑'}
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {tx.type === 'sent' ? 'Sent' : 'Received'} {tx.amount > 0 ? `${tx.amount} SOL` : 'Transaction'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {tx.to && `To: ${tx.to.slice(0, 8)}...${tx.to.slice(-8)}`}
                      {tx.from && `From: ${tx.from.slice(0, 8)}...${tx.from.slice(-8)}`}
                      {!tx.to && !tx.from && tx.signature.slice(0, 8) + '...' + tx.signature.slice(-8)}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">{formatDate(tx.timestamp)}</p>
                  </div>
                </div>
                <a
                  href={`https://solscan.io/tx/${tx.signature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  View →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTx && (
        <TransactionDetailsModal
          signature={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  )
}

