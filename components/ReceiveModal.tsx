'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useWallet } from '@/contexts/WalletContext'

interface ReceiveModalProps {
  onClose: () => void
}

export default function ReceiveModal({ onClose }: ReceiveModalProps) {
  const { publicKey } = useWallet()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const walletAddress = publicKey?.toBase58() || ''

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-phantom-card rounded-2xl p-6 max-w-md w-full border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Receive SOL</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG
                value={walletAddress}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>

          <div className="bg-phantom-dark rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-2">Your Wallet Address</p>
            <p className="text-white break-all font-mono text-sm">
              {walletAddress}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg text-white font-semibold transition-all"
          >
            {copied ? '✓ Copied!' : 'Copy Address'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-phantom-dark hover:bg-gray-800 border border-gray-700 rounded-lg text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

