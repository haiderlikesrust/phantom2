'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { PublicKey } from '@solana/web3.js'

interface TransactionDetailsModalProps {
  signature: string
  onClose: () => void
}

export default function TransactionDetailsModal({ signature, onClose }: TransactionDetailsModalProps) {
  const { connection } = useWallet()
  const [txDetails, setTxDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDetails = async () => {
      if (!connection) return

      try {
        setLoading(true)
        const tx = await connection.getTransaction(signature, {
          maxSupportedTransactionVersion: 0,
        })

        if (tx) {
          setTxDetails(tx)
        } else {
          setError('Transaction not found')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch transaction details')
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [signature, connection])

  const formatDate = (timestamp: number | null | undefined) => {
    if (!timestamp) return 'Unknown'
    return new Date(timestamp * 1000).toLocaleString()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-phantom-card rounded-2xl p-6 max-w-2xl w-full border border-gray-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Transaction Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading transaction details...</div>
        ) : error ? (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        ) : txDetails ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Signature</label>
              <div className="px-4 py-3 bg-phantom-dark border border-gray-700 rounded-lg">
                <p className="text-white text-sm font-mono break-all">{signature}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Slot</label>
                <div className="px-4 py-3 bg-phantom-dark border border-gray-700 rounded-lg text-white">
                  {txDetails.slot?.toLocaleString() || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Block Time</label>
                <div className="px-4 py-3 bg-phantom-dark border border-gray-700 rounded-lg text-white text-sm">
                  {formatDate(txDetails.blockTime)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Fee</label>
              <div className="px-4 py-3 bg-phantom-dark border border-gray-700 rounded-lg text-white">
                {(txDetails.meta?.fee || 0) / 1e9} SOL
              </div>
            </div>

            {txDetails.meta?.err && (
              <div>
                <label className="block text-sm text-red-400 mb-2">Error</label>
                <div className="px-4 py-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
                  {JSON.stringify(txDetails.meta.err)}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <div className={`px-4 py-3 rounded-lg ${
                txDetails.meta?.err 
                  ? 'bg-red-900/20 border border-red-500/30 text-red-400' 
                  : 'bg-green-900/20 border border-green-500/30 text-green-400'
              }`}>
                {txDetails.meta?.err ? 'Failed' : 'Success'}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Accounts</label>
              <div className="px-4 py-3 bg-phantom-dark border border-gray-700 rounded-lg max-h-40 overflow-y-auto">
                {txDetails.transaction?.message?.accountKeys?.map((key: any, index: number) => (
                  <div key={index} className="text-white text-xs font-mono py-1 break-all">
                    {key.pubkey?.toBase58() || key}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-700">
              <a
                href={`https://solscan.io/tx/${signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold text-center transition-colors"
              >
                View on Solscan
              </a>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-phantom-dark hover:bg-gray-800 border border-gray-700 rounded-lg text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

