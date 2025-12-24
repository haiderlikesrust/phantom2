'use client'

import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js'

interface Recipient {
  address: string
  amount: string
  error?: string
}

export default function BatchSendModal({ onClose }: { onClose: () => void }) {
  const { publicKey, connection, keypair, refreshBalance } = useWallet()
  const [recipients, setRecipients] = useState<Recipient[]>([{ address: '', amount: '' }])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const addRecipient = () => {
    setRecipients([...recipients, { address: '', amount: '' }])
  }

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index))
  }

  const updateRecipient = (index: number, field: 'address' | 'amount', value: string) => {
    const updated = [...recipients]
    updated[index] = { ...updated[index], [field]: value, error: undefined }
    setRecipients(updated)
  }

  const validateRecipients = (): boolean => {
    let isValid = true
    const updated = recipients.map((recipient) => {
      const errors: string[] = []
      
      if (!recipient.address.trim()) {
        errors.push('Address required')
      } else {
        try {
          new PublicKey(recipient.address)
        } catch {
          errors.push('Invalid address')
        }
      }

      if (!recipient.amount.trim() || parseFloat(recipient.amount) <= 0) {
        errors.push('Amount must be greater than 0')
      }

      if (errors.length > 0) {
        isValid = false
        return { ...recipient, error: errors.join(', ') }
      }
      return recipient
    })

    setRecipients(updated)
    return isValid
  }

  const handleSend = async () => {
    if (!publicKey || !connection || !keypair) return

    if (!validateRecipients()) {
      setError('Please fix all errors before sending')
      return
    }

    setSending(true)
    setError('')

    try {
      const totalAmount = recipients.reduce((sum, r) => sum + parseFloat(r.amount), 0)
      const totalLamports = totalAmount * LAMPORTS_PER_SOL

      // Check balance
      const balance = await connection.getBalance(publicKey)
      if (balance < totalLamports) {
        throw new Error(`Insufficient balance. Need ${totalAmount} SOL, have ${balance / LAMPORTS_PER_SOL} SOL`)
      }

      // Create transactions for each recipient
      const { blockhash } = await connection.getLatestBlockhash('confirmed')
      
      // Create a single transaction with multiple transfers
      const transaction = new Transaction()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      recipients.forEach((recipient) => {
        const lamports = parseFloat(recipient.amount) * LAMPORTS_PER_SOL
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(recipient.address),
            lamports,
          })
        )
      })

      // Sign and send
      transaction.sign(keypair)
      const signature = await connection.sendTransaction(transaction, [keypair], {
        skipPreflight: false,
        maxRetries: 3,
      })

      await connection.confirmTransaction(signature, 'confirmed')
      
      alert(`Successfully sent to ${recipients.length} recipient(s)!`)
      await refreshBalance()
      onClose()
    } catch (err: any) {
      console.error('Batch send error:', err)
      setError(err.message || 'Failed to send transactions')
    } finally {
      setSending(false)
    }
  }

  const totalAmount = recipients.reduce((sum, r) => {
    const amount = parseFloat(r.amount) || 0
    return sum + amount
  }, 0)

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-pump-card rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-6">Batch Send</h2>

        <div className="space-y-4 mb-6">
          {recipients.map((recipient, index) => (
            <div key={index} className="bg-pump-dark rounded-lg p-4 border border-gray-700">
              <div className="flex items-start space-x-3">
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Recipient {index + 1}</label>
                    <input
                      type="text"
                      value={recipient.address}
                      onChange={(e) => updateRecipient(index, 'address', e.target.value)}
                      placeholder="Enter Solana address"
                      className={`w-full px-4 py-3 bg-pump-card border rounded-lg text-white placeholder-gray-500 focus:outline-none ${
                        recipient.error ? 'border-red-500' : 'border-gray-700 focus:border-pump-green'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Amount (SOL)</label>
                    <input
                      type="number"
                      value={recipient.amount}
                      onChange={(e) => updateRecipient(index, 'amount', e.target.value)}
                      placeholder="0.0"
                      step="0.000000001"
                      className={`w-full px-4 py-3 bg-pump-card border rounded-lg text-white placeholder-gray-500 focus:outline-none ${
                        recipient.error ? 'border-red-500' : 'border-gray-700 focus:border-pump-green'
                      }`}
                    />
                  </div>
                  {recipient.error && (
                    <p className="text-red-400 text-xs">{recipient.error}</p>
                  )}
                </div>
                {recipients.length > 1 && (
                  <button
                    onClick={() => removeRecipient(index)}
                    className="text-red-400 hover:text-red-500 text-xl font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={addRecipient}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm font-medium transition-colors"
          >
            + Add Recipient
          </button>
          <div className="text-right">
            <div className="text-gray-400 text-sm">Total Amount</div>
            <div className="text-white text-xl font-bold">{totalAmount.toFixed(9)} SOL</div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-pump-dark hover:bg-gray-800 border border-gray-700 rounded-lg text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || totalAmount === 0}
            className="flex-1 py-3 bg-pump-green hover:bg-pump-green rounded-lg text-black font-bold font-semibold transition-colors disabled:opacity-50"
          >
            {sending ? 'Sending...' : `Send to ${recipients.length} Recipient(s)`}
          </button>
        </div>
      </div>
    </div>
  )
}





