'use client'

import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import WalletLogo from './WalletLogo'

export default function ConnectWallet() {
  const { connect, createWallet, importFromSeedPhrase } = useWallet()
  const [seedPhrase, setSeedPhrase] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [showSeedPhrase, setShowSeedPhrase] = useState(false)
  const [newSeedPhrase, setNewSeedPhrase] = useState('')
  const [confirmedSeedPhrase, setConfirmedSeedPhrase] = useState(false)
  const [error, setError] = useState('')

  const handleCreateWallet = () => {
    try {
      setError('')
      const wallet = createWallet()
      setNewSeedPhrase(wallet.seedPhrase)
      setShowSeedPhrase(true)
    } catch (err: any) {
      setError(err.message || 'Failed to create wallet')
    }
  }

  const handleConfirmSeedPhrase = async () => {
    try {
      setError('')
      if (!confirmedSeedPhrase) {
        setError('Please confirm that you have saved your recovery phrase')
        return
      }
      await importFromSeedPhrase(newSeedPhrase)
      setShowSeedPhrase(false)
      setNewSeedPhrase('')
      setConfirmedSeedPhrase(false)
    } catch (err: any) {
      setError(err.message || 'Failed to import wallet')
    }
  }

  const handleImportWallet = async () => {
    try {
      setError('')
      if (!seedPhrase.trim()) {
        setError('Please enter your recovery phrase')
        return
      }
      // Validate it's 12 words
      const words = seedPhrase.trim().split(/\s+/)
      if (words.length !== 12) {
        setError('Recovery phrase must be 12 words')
        return
      }
      await importFromSeedPhrase(seedPhrase.trim())
      setSeedPhrase('')
      setShowImport(false)
    } catch (err: any) {
      setError(err.message || 'Invalid recovery phrase')
    }
  }

  const handleConnect = async () => {
    try {
      setError('')
      await connect()
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-pump-card rounded-2xl p-8 shadow-2xl border border-gray-800">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mx-auto mb-4">
              <WalletLogo size={80} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome to PumpPocket</h2>
            <p className="text-gray-400">Connect your Solana wallet to get started</p>
          </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {showSeedPhrase ? (
          <div className="space-y-4">
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <p className="text-yellow-400 text-sm font-semibold mb-2">⚠️ Save Your Recovery Phrase</p>
              <p className="text-yellow-300/80 text-xs">
                Write down these 12 words in order and keep them safe. You'll need them to recover your wallet.
              </p>
            </div>
            <div className="bg-pump-dark rounded-lg p-4 border border-gray-700">
              <div className="grid grid-cols-3 gap-2">
                {newSeedPhrase.split(' ').map((word, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-gray-500 text-xs w-6">{index + 1}.</span>
                    <span className="text-white font-medium text-sm">{word}</span>
                  </div>
                ))}
              </div>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedSeedPhrase}
                onChange={(e) => setConfirmedSeedPhrase(e.target.checked)}
                className="w-4 h-4 text-pump-green bg-pump-dark border-gray-700 rounded focus:ring-pump-green"
              />
              <span className="text-gray-300 text-sm">I have saved my recovery phrase</span>
            </label>
            <button
              onClick={handleConfirmSeedPhrase}
              disabled={!confirmedSeedPhrase}
              className="w-full py-3 bg-gradient-to-r from-pump-green to-pump-green hover:from-pump-green hover:to-pump-green800 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
            <button
              onClick={() => {
                setShowSeedPhrase(false)
                setNewSeedPhrase('')
                setConfirmedSeedPhrase(false)
                setError('')
              }}
              className="w-full py-3 text-pump-green hover:text-pump-green300 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : showImport ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Recovery Phrase (12 words)</label>
              <textarea
                value={seedPhrase}
                onChange={(e) => setSeedPhrase(e.target.value)}
                placeholder="Enter your 12-word recovery phrase"
                rows={3}
                className="w-full px-4 py-3 bg-pump-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pump-green resize-none"
              />
            </div>
            <button
              onClick={handleImportWallet}
              className="w-full py-3 bg-pump-green hover:bg-pump-green/90 rounded-lg text-black font-bold transition-all"
            >
              Import Wallet
            </button>
            <button
              onClick={() => {
                setShowImport(false)
                setSeedPhrase('')
                setError('')
              }}
              className="w-full py-3 text-pump-green hover:text-pump-green300 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleConnect}
              className="w-full py-3 bg-pump-green hover:bg-pump-green/90 rounded-lg text-black font-bold transition-all"
            >
              Connect Existing Wallet
            </button>
            <button
              onClick={handleCreateWallet}
              className="w-full py-3 bg-pump-green/30 hover:bg-pump-green/40 border border-pump-green/30 rounded-lg text-black font-bold font-semibold transition-all"
            >
              Create New Wallet
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="w-full py-3 text-pump-green hover:text-pump-green300 transition-colors"
            >
              Import from Seed Phrase
            </button>
          </div>
        )}
      </div>
    </div>
  )
}





