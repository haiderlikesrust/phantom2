'use client'

import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { Keypair, VersionedTransaction, Connection } from '@solana/web3.js'
import bs58 from 'bs58'

interface TokenMetadata {
  name: string
  symbol: string
  description: string
  twitter: string
  telegram: string
  website: string
  showName: string
}

export default function DeployInterface() {
  const { publicKey, connection, balance, keypair } = useWallet()
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata>({
    name: '',
    symbol: '',
    description: '',
    twitter: '',
    telegram: '',
    website: '',
    showName: 'true',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [devBuyAmount, setDevBuyAmount] = useState('1')
  const [slippage, setSlippage] = useState('10')
  const [priorityFee, setPriorityFee] = useState('0.0005')
  const [deploying, setDeploying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [generatedMint, setGeneratedMint] = useState<string | null>(null)

  const PUMP_PORTAL_API_KEY = process.env.NEXT_PUBLIC_PUMP_PORTAL_API_KEY || ''

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeploy = async () => {
    if (!publicKey || !connection || !keypair) {
      setError('Wallet not connected')
      return
    }

    if (!tokenMetadata.name || !tokenMetadata.symbol) {
      setError('Token name and symbol are required')
      return
    }

    if (!imageFile) {
      setError('Token image is required')
      return
    }

    if (parseFloat(devBuyAmount) <= 0) {
      setError('Dev buy amount must be greater than 0')
      return
    }

    if (balance < parseFloat(devBuyAmount)) {
      setError('Insufficient SOL balance')
      return
    }

    setDeploying(true)
    setError('')
    setSuccess('')

    try {
      // Step 1: Generate a random keypair for token mint
      const mintKeypair = Keypair.generate()
      const mintAddress = mintKeypair.publicKey.toBase58()
      setGeneratedMint(mintAddress)
      console.log('Generated mint address:', mintAddress)

      // Step 2: Upload image and create IPFS metadata
      const formData = new FormData()
      formData.append('file', imageFile)
      formData.append('name', tokenMetadata.name)
      formData.append('symbol', tokenMetadata.symbol)
      formData.append('description', tokenMetadata.description || '')
      formData.append('twitter', tokenMetadata.twitter || '')
      formData.append('telegram', tokenMetadata.telegram || '')
      formData.append('website', tokenMetadata.website || '')
      formData.append('showName', tokenMetadata.showName)

      console.log('Uploading metadata to IPFS...')
      const metadataResponse = await fetch('https://pump.fun/api/ipfs', {
        method: 'POST',
        body: formData,
      })

      if (!metadataResponse.ok) {
        const errorText = await metadataResponse.text()
        throw new Error(`Failed to upload metadata: ${errorText}`)
      }

      const metadataResponseJson = await metadataResponse.json()
      console.log('Metadata uploaded:', metadataResponseJson)

      // Step 3: Generate the create transaction using local API
      const createRequest = {
        publicKey: publicKey.toBase58(),
        action: 'create',
        tokenMetadata: {
          name: tokenMetadata.name,
          symbol: tokenMetadata.symbol,
          uri: metadataResponseJson.metadataUri,
        },
        mint: mintKeypair.publicKey.toBase58(),
        denominatedInSol: 'true',
        amount: parseFloat(devBuyAmount),
        slippage: parseFloat(slippage),
        priorityFee: parseFloat(priorityFee),
        pool: 'pump',
        isMayhemMode: 'false',
      }

      console.log('Requesting create transaction from PumpPortal...')
      const txResponse = await fetch('https://pumpportal.fun/api/trade-local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createRequest),
      })

      if (!txResponse.ok) {
        const errorText = await txResponse.text()
        throw new Error(`Failed to generate transaction: ${errorText}`)
      }

      // Step 4: Deserialize and sign the transaction
      const txBytes = await txResponse.arrayBuffer()
      const transaction = VersionedTransaction.deserialize(new Uint8Array(txBytes))

      // Sign with both mint keypair and signer keypair (for creation, both are needed)
      transaction.sign([mintKeypair, keypair])

      console.log('Transaction signed, sending...')

      // Step 5: Send the transaction
      const signature = await connection.sendTransaction(transaction, {
        skipPreflight: false,
        maxRetries: 3,
      })

      console.log('Transaction sent, signature:', signature)

      // Step 6: Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed')

      setSuccess(`Token created successfully! Mint: ${mintAddress}`)
      console.log(`Transaction: https://solscan.io/tx/${signature}`)

      // Reset form
      setTokenMetadata({
        name: '',
        symbol: '',
        description: '',
        twitter: '',
        telegram: '',
        website: '',
        showName: 'true',
      })
      setImageFile(null)
      setImagePreview(null)
      setDevBuyAmount('1')
      setGeneratedMint(null)
    } catch (err: any) {
      console.error('Deploy error:', err)
      setError(err.message || 'Failed to deploy token')
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-6">Deploy Token</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-green-400">
          <div className="font-semibold mb-2">Success!</div>
          <div className="text-sm">{success}</div>
          {generatedMint && (
            <div className="mt-2">
              <div className="text-xs text-gray-400 mb-1">Token Address:</div>
              <div className="font-mono text-xs break-all">{generatedMint}</div>
            </div>
          )}
        </div>
      )}

      <div className="bg-pump-card rounded-xl p-6 border border-gray-800 space-y-6">
        {/* Token Image */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Token Image *</label>
          <div className="flex items-center space-x-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Token preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-700"
                />
                <button
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="w-32 h-32 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center hover:border-pump-green transition-colors">
                  <div className="text-center">
                    <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-400 text-xs">Upload Image</span>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Token Name */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Token Name *</label>
          <input
            type="text"
            value={tokenMetadata.name}
            onChange={(e) => setTokenMetadata({ ...tokenMetadata, name: e.target.value })}
            placeholder="My Awesome Token"
            maxLength={32}
            className="w-full px-4 py-3 bg-pump-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pump-green"
          />
        </div>

        {/* Token Symbol */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Token Symbol *</label>
          <input
            type="text"
            value={tokenMetadata.symbol}
            onChange={(e) => setTokenMetadata({ ...tokenMetadata, symbol: e.target.value.toUpperCase() })}
            placeholder="MAT"
            maxLength={10}
            className="w-full px-4 py-3 bg-pump-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pump-green"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Description</label>
          <textarea
            value={tokenMetadata.description}
            onChange={(e) => setTokenMetadata({ ...tokenMetadata, description: e.target.value })}
            placeholder="Describe your token..."
            rows={3}
            className="w-full px-4 py-3 bg-pump-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pump-green resize-none"
          />
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Twitter/X</label>
            <input
              type="url"
              value={tokenMetadata.twitter}
              onChange={(e) => setTokenMetadata({ ...tokenMetadata, twitter: e.target.value })}
              placeholder="https://x.com/..."
              className="w-full px-4 py-3 bg-pump-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pump-green"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Telegram</label>
            <input
              type="url"
              value={tokenMetadata.telegram}
              onChange={(e) => setTokenMetadata({ ...tokenMetadata, telegram: e.target.value })}
              placeholder="https://t.me/..."
              className="w-full px-4 py-3 bg-pump-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pump-green"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Website</label>
            <input
              type="url"
              value={tokenMetadata.website}
              onChange={(e) => setTokenMetadata({ ...tokenMetadata, website: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-pump-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pump-green"
            />
          </div>
        </div>

        {/* Dev Buy Settings */}
        <div className="border-t border-gray-800 pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Initial Buy Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Dev Buy Amount (SOL) *</label>
              <input
                type="number"
                value={devBuyAmount}
                onChange={(e) => setDevBuyAmount(e.target.value)}
                placeholder="1"
                step="0.1"
                min="0.1"
                className="w-full px-4 py-3 bg-pump-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pump-green"
              />
              <div className="text-gray-500 text-xs mt-1">Available: {balance.toFixed(4)} SOL</div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Slippage (%)</label>
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                placeholder="10"
                step="1"
                min="1"
                max="50"
                className="w-full px-4 py-3 bg-pump-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pump-green"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Priority Fee (SOL)</label>
              <input
                type="number"
                value={priorityFee}
                onChange={(e) => setPriorityFee(e.target.value)}
                placeholder="0.0005"
                step="0.0001"
                min="0"
                className="w-full px-4 py-3 bg-pump-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pump-green"
              />
            </div>
          </div>
        </div>

        {/* Deploy Button */}
        <button
          onClick={handleDeploy}
          disabled={deploying || !tokenMetadata.name || !tokenMetadata.symbol || !imageFile}
          className="w-full py-4 bg-pump-green hover:bg-pump-green rounded-lg text-black font-bold font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deploying ? 'Deploying Token...' : 'Deploy Token'}
        </button>

        <div className="text-center text-gray-500 text-xs">
          <p>Token creation uses PumpPortal.fun API</p>
          <p className="mt-1">Standard trading fees apply to the initial dev buy</p>
        </div>
      </div>
    </div>
  )
}





