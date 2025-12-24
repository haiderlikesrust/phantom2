'use client'

import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import AddressBook from './AddressBook'

interface SendModalProps {
  onClose: () => void
}

export default function SendModal({ onClose }: SendModalProps) {
  const { sendTransaction, balance } = useWallet()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAddressBook, setShowAddressBook] = useState(false)

  const handleSend = async () => {
    setError('')
    setSuccess('')

    if (!recipient.trim()) {
      setError('Please enter a recipient address')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (parseFloat(amount) > balance) {
      setError('Insufficient balance')
      return
    }

    setLoading(true)
    try {
      const signature = await sendTransaction(recipient.trim(), parseFloat(amount))
      setSuccess(`Transaction sent! Signature: ${signature}`)
      setRecipient('')
      setAmount('')
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to send transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-phantom-card rounded-2xl p-6 max-w-md w-full border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Send SOL</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-400">Recipient Address</label>
              <button
                onClick={() => setShowAddressBook(!showAddressBook)}
                className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
              >
                {showAddressBook ? 'Hide' : 'Address Book'}
              </button>
            </div>
            {showAddressBook && (
              <div className="mb-3">
                <AddressBook onSelect={(addr) => {
                  setRecipient(addr)
                  setShowAddressBook(false)
                }} />
              </div>
            )}
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter Solana address"
              className="w-full px-4 py-3 bg-phantom-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Amount (SOL)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.0001"
              max={balance}
              className="w-full px-4 py-3 bg-phantom-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Available: {balance.toFixed(4)} SOL</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSend}
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg text-white font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-phantom-dark hover:bg-gray-800 border border-gray-700 rounded-lg text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

