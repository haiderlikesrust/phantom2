'use client'

import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { Network } from '@/contexts/WalletContext'
import NetworkSwitcher from './NetworkSwitcher'
import bs58 from 'bs58'

interface SettingsModalProps {
  onClose: () => void
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { publicKey, disconnect, balance, transactions, keypair } = useWallet()
  const [showSeedPhrase, setShowSeedPhrase] = useState(false)
  const [seedPhrase, setSeedPhrase] = useState('')
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [privateKey, setPrivateKey] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedPrivateKey, setCopiedPrivateKey] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'wallet' | 'security' | 'advanced'>('wallet')

  const handleExportSeedPhrase = () => {
    try {
      const storedSeedPhrase = localStorage.getItem('phantom_wallet_seed_phrase')
      if (!storedSeedPhrase) {
        setError('No recovery phrase found in storage')
        return
      }
      setSeedPhrase(storedSeedPhrase)
      setShowSeedPhrase(true)
    } catch (err: any) {
      setError(err.message || 'Failed to export recovery phrase')
    }
  }

  const handleCopySeedPhrase = () => {
    if (seedPhrase) {
      navigator.clipboard.writeText(seedPhrase)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExportPrivateKey = () => {
    try {
      if (!keypair) {
        setError('Wallet not connected')
        return
      }
      const privateKeyBase58 = bs58.encode(keypair.secretKey)
      setPrivateKey(privateKeyBase58)
      setShowPrivateKey(true)
    } catch (err: any) {
      setError(err.message || 'Failed to export private key')
    }
  }

  const handleCopyPrivateKey = () => {
    if (privateKey) {
      navigator.clipboard.writeText(privateKey)
      setCopiedPrivateKey(true)
      setTimeout(() => setCopiedPrivateKey(false), 2000)
    }
  }

  const exportTransactions = () => {
    const dataStr = JSON.stringify(transactions, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `phantom-transactions-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect your wallet?')) {
      disconnect()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-phantom-card rounded-2xl p-6 max-w-md w-full border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
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

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              activeTab === 'wallet'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Wallet
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              activeTab === 'security'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              activeTab === 'advanced'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Advanced
          </button>
        </div>

        <div className="space-y-4">
          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <>
              {/* Wallet Address */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Wallet Address</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 px-4 py-3 bg-phantom-dark border border-gray-700 rounded-lg text-white text-sm break-all">
                    {publicKey?.toBase58()}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(publicKey?.toBase58() || '')
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white transition-colors"
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              {/* Balance */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Balance</label>
                <div className="px-4 py-3 bg-phantom-dark border border-gray-700 rounded-lg text-white text-sm">
                  {balance?.toFixed(4) || '0'} SOL
                </div>
              </div>

              {/* Transaction Count */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Transaction History</label>
                <div className="flex items-center justify-between px-4 py-3 bg-phantom-dark border border-gray-700 rounded-lg">
                  <span className="text-white text-sm">{transactions.length} transactions</span>
                  {transactions.length > 0 && (
                    <button
                      onClick={exportTransactions}
                      className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                    >
                      Export
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <>
              {/* Export Seed Phrase */}
              <div className="mb-6">
                {!showSeedPhrase ? (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Recovery Phrase</label>
                    <button
                      onClick={handleExportSeedPhrase}
                      className="w-full px-4 py-3 bg-red-900/20 hover:bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 font-medium transition-colors"
                    >
                      Export Recovery Phrase
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      ⚠️ Warning: Never share your recovery phrase with anyone. Anyone with your recovery phrase can access your wallet.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Your Recovery Phrase</label>
                    <div className="bg-phantom-dark rounded-lg p-4 border border-gray-700 mb-3">
                      <div className="grid grid-cols-3 gap-2">
                        {seedPhrase.split(' ').map((word, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="text-gray-500 text-xs w-6">{index + 1}.</span>
                            <span className="text-white font-medium text-sm">{word}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <button
                        onClick={handleCopySeedPhrase}
                        className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white transition-colors"
                      >
                        {copied ? '✓ Copied' : '📋 Copy'}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setShowSeedPhrase(false)
                        setSeedPhrase('')
                      }}
                      className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 text-sm transition-colors"
                    >
                      Hide Recovery Phrase
                    </button>
                    <p className="text-xs text-red-400 mt-2">
                      ⚠️ Keep this recovery phrase secure. Do not share it with anyone.
                    </p>
                  </div>
                )}
              </div>

              {/* Export Private Key */}
              <div className="mb-6 pb-6 border-b border-gray-700">
                {!showPrivateKey ? (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Private Key</label>
                    <button
                      onClick={handleExportPrivateKey}
                      className="w-full px-4 py-3 bg-red-900/20 hover:bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 font-medium transition-colors"
                    >
                      Export Private Key
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      ⚠️ Warning: Never share your private key with anyone. Anyone with your private key can access your wallet.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Your Private Key</label>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex-1 px-4 py-3 bg-phantom-dark border border-red-500/30 rounded-lg text-white text-sm break-all">
                        {privateKey}
                      </div>
                      <button
                        onClick={handleCopyPrivateKey}
                        className="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white transition-colors"
                      >
                        {copiedPrivateKey ? '✓' : '📋'}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setShowPrivateKey(false)
                        setPrivateKey('')
                      }}
                      className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 text-sm transition-colors"
                    >
                      Hide Private Key
                    </button>
                    <p className="text-xs text-red-400 mt-2">
                      ⚠️ Keep this private key secure. Do not share it with anyone.
                    </p>
                  </div>
                )}
              </div>

              {/* Security Info */}
              <div className="pt-4">
                <h3 className="text-sm font-medium text-white mb-2">Security Tips</h3>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Never share your private key or recovery phrase</li>
                  <li>• Store your keys securely offline</li>
                  <li>• Be cautious of phishing attempts</li>
                  <li>• Always verify transaction details</li>
                </ul>
              </div>
            </>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Network</label>
                <NetworkSwitcher />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">RPC Endpoint</label>
                <div className="px-4 py-3 bg-phantom-dark border border-gray-700 rounded-lg text-white text-sm break-all">
                  https://api.mainnet-beta.solana.com
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">App Version</label>
                <div className="px-4 py-3 bg-phantom-dark border border-gray-700 rounded-lg text-white text-sm">
                  Phantom v2.0.0
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    if (confirm('Clear all local data? This will disconnect your wallet.')) {
                      localStorage.clear()
                      disconnect()
                      onClose()
                    }
                  }}
                  className="w-full px-4 py-3 bg-yellow-900/20 hover:bg-yellow-900/30 border border-yellow-500/30 rounded-lg text-yellow-400 font-medium transition-colors"
                >
                  Clear Local Data
                </button>
              </div>
            </>
          )}

          {/* Disconnect Wallet */}
          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

