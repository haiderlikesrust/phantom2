'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { PublicKey, LAMPORTS_PER_SOL, Transaction, VersionedTransaction } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

interface TokenInfo {
  mint: string
  name: string
  symbol: string
  image?: string
  marketCap?: number
  price?: number
  priceChange24h?: number
  volume24h?: number
}

export default function SwapInterface() {
  const { publicKey, connection, balance, keypair } = useWallet()
  const [payAmount, setPayAmount] = useState('')
  const [receiveAmount, setReceiveAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null)
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [swapping, setSwapping] = useState(false)
  const [error, setError] = useState('')
  const [showTokenList, setShowTokenList] = useState(false)
  const [contractAddress, setContractAddress] = useState('')
  const [loadingTokenInfo, setLoadingTokenInfo] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Jupiter API base URL (Metis Swap API)
  const JUPITER_API_KEY = process.env.NEXT_PUBLIC_JUPITER_API_KEY || '35362181-8625-4067-a704-56c73d3713c0'
  const JUPITER_SWAP_API = 'https://api.jup.ag/swap/v1'

  // Fetch popular tokens from Jupiter
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true)
        // Fetch token list from Jupiter
        const response = await fetch('https://token.jup.ag/all')
        if (response.ok) {
          const data = await response.json()
          // Filter for popular tokens and format
          const popularTokens = data
            .filter((token: any) => 
              ['SOL', 'USDC', 'USDT', 'BONK', 'WIF', 'JUP', 'RAY', 'ORCA'].includes(token.symbol)
            )
            .slice(0, 20)
            .map((token: any) => ({
              mint: token.address,
              name: token.name,
              symbol: token.symbol,
              image: token.logoURI,
              price: 0, // Will be fetched from quote
            }))
          setTokens(popularTokens)
        } else {
          throw new Error('Failed to fetch tokens')
        }
      } catch (err) {
        console.error('Error fetching tokens:', err)
        // Fallback to SOL
        setTokens([
          {
            mint: 'So11111111111111111111111111111111111111112',
            name: 'Wrapped SOL',
            symbol: 'SOL',
            price: 0,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchTokens()
  }, [])

  // Calculate receive amount using Jupiter quote API
  useEffect(() => {
    const fetchQuote = async () => {
      if (!selectedToken || !payAmount || parseFloat(payAmount) <= 0 || !publicKey) {
        setReceiveAmount('0')
        return
      }

      try {
        const inputMint = 'So11111111111111111111111111111111111111112' // SOL
        const outputMint = selectedToken.mint
        const amount = Math.floor(parseFloat(payAmount) * LAMPORTS_PER_SOL)

        const quoteUrl = `${JUPITER_SWAP_API}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50&swapMode=ExactIn&restrictIntermediateTokens=true&maxAccounts=64&instructionVersion=V1`
        const quoteResponse = await fetch(quoteUrl, {
          method: 'GET',
          headers: JUPITER_API_KEY ? {
            'x-api-key': JUPITER_API_KEY,
          } : {},
        })
        
        if (quoteResponse.ok) {
          const quote = await quoteResponse.json()
          const outputAmount = parseFloat(quote.outAmount) / Math.pow(10, quote.outputDecimals || 9)
          setReceiveAmount(outputAmount.toFixed(6))
        } else {
          setReceiveAmount('0')
        }
      } catch (err) {
        console.error('Error fetching quote:', err)
        setReceiveAmount('0')
      }
    }

    fetchQuote()
  }, [payAmount, selectedToken, publicKey])

  const handleQuickAmount = (percent: number) => {
    if (balance) {
      const amount = (balance * percent).toFixed(4)
      setPayAmount(amount)
    }
  }

  const handleLoadTokenFromCA = async () => {
    if (!contractAddress.trim()) {
      setError('Please enter a contract address')
      return
    }

    setLoadingTokenInfo(true)
    setError('')

    try {
      // Validate the address is a valid PublicKey
      const mintPublicKey = new PublicKey(contractAddress.trim())
      
      // Try to fetch token metadata from pump.fun API
      try {
        const response = await fetch(`https://frontend-api.pump.fun/coins/${contractAddress.trim()}`)
        if (response.ok) {
          const tokenData = await response.json()
          const tokenInfo: TokenInfo = {
            mint: contractAddress.trim(),
            name: tokenData.name || tokenData.symbol || 'Unknown Token',
            symbol: tokenData.symbol || tokenData.name || 'UNKNOWN',
            image: tokenData.imageUri,
            marketCap: tokenData.marketCap || tokenData.usd_market_cap,
            price: tokenData.price || (tokenData.usd_market_cap && tokenData.supply ? tokenData.usd_market_cap / tokenData.supply : undefined),
            priceChange24h: tokenData.priceChange24h || tokenData.price_change_24h || 0,
            volume24h: tokenData.volume24h || tokenData.usd_volume_24h,
          }
          setSelectedToken(tokenInfo)
          setContractAddress('')
          setShowTokenList(false)
        } else {
          throw new Error('Token not found in API')
        }
      } catch (apiError) {
        // If API fails, create a basic token info from the address
        const tokenInfo: TokenInfo = {
          mint: contractAddress.trim(),
          name: `Token ${contractAddress.slice(0, 4)}...${contractAddress.slice(-4)}`,
          symbol: contractAddress.slice(0, 6).toUpperCase(),
          price: 0.0001, // Default price, will be calculated from bonding curve
        }
        setSelectedToken(tokenInfo)
        setContractAddress('')
        setShowTokenList(false)
      }
    } catch (err: any) {
      console.error('Error loading token:', err)
      setError('Invalid contract address. Please check the address and try again.')
    } finally {
      setLoadingTokenInfo(false)
    }
  }

  // Filter tokens based on search term
  const filteredTokens = searchTerm
    ? tokens.filter(token =>
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.mint.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : tokens

  const handleSwap = async () => {
    if (!publicKey || !selectedToken || !keypair || !connection || !payAmount || parseFloat(payAmount) <= 0) {
      setError('Please select a token and enter an amount')
      return
    }

    if (parseFloat(payAmount) > balance) {
      setError('Insufficient SOL balance')
      return
    }

    setSwapping(true)
    setError('')

    try {
      const inputMint = 'So11111111111111111111111111111111111111112' // SOL
      const outputMint = selectedToken.mint
      const amount = Math.floor(parseFloat(payAmount) * LAMPORTS_PER_SOL)

      console.log('Starting Jupiter swap:', {
        inputMint,
        outputMint,
        amount,
      })

      // Step 1: Get quote from Jupiter
      const quoteUrl = `${JUPITER_SWAP_API}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50&swapMode=ExactIn&restrictIntermediateTokens=true&maxAccounts=64&instructionVersion=V1`
      console.log('Fetching quote from:', quoteUrl)
      
      let quoteResponse
      try {
        quoteResponse = await fetch(quoteUrl, {
          method: 'GET',
          headers: JUPITER_API_KEY ? {
            'x-api-key': JUPITER_API_KEY,
          } : {},
        })
      } catch (fetchError: any) {
        console.error('Network error fetching quote:', fetchError)
        if (fetchError.message?.includes('Failed to fetch') || fetchError.message?.includes('ERR_NAME_NOT_RESOLVED')) {
          throw new Error('Network error: Unable to reach Jupiter API. Please check your internet connection.')
        }
        throw fetchError
      }
      
      if (!quoteResponse.ok) {
        const errorText = await quoteResponse.text()
        console.error('Quote error:', errorText)
        throw new Error(`Failed to get swap quote: ${errorText}`)
      }

      const quote = await quoteResponse.json()
      console.log('Quote received:', quote)
      
      if (!quote || !quote.outAmount) {
        throw new Error('Invalid quote response from Jupiter')
      }

      // Step 2: Get swap instructions from Jupiter (Metis Swap API - swap-instructions endpoint)
      const swapHeaders: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (JUPITER_API_KEY) {
        swapHeaders['x-api-key'] = JUPITER_API_KEY
      }
      
      const swapRequest = {
        userPublicKey: publicKey.toBase58(),
        quoteResponse: quote,
        wrapAndUnwrapSol: true,
        useSharedAccounts: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: {
          priorityLevelWithMaxLamports: {
            priorityLevel: 'medium' as const,
            maxLamports: 100000,
            global: false,
          },
        },
        asLegacyTransaction: false,
      }
      
      console.log('Requesting swap instructions from:', `${JUPITER_SWAP_API}/swap-instructions`)
      console.log('Swap request payload:', JSON.stringify(swapRequest, null, 2))
      
      let swapInstructionsResponse
      try {
        swapInstructionsResponse = await fetch(`${JUPITER_SWAP_API}/swap-instructions`, {
          method: 'POST',
          headers: swapHeaders,
          body: JSON.stringify(swapRequest),
        })
      } catch (fetchError: any) {
        console.error('Network error fetching swap instructions:', fetchError)
        if (fetchError.message?.includes('Failed to fetch') || fetchError.message?.includes('ERR_NAME_NOT_RESOLVED')) {
          throw new Error('Network error: Unable to reach Jupiter API. Please check your internet connection.')
        }
        throw fetchError
      }

      if (!swapInstructionsResponse.ok) {
        const errorText = await swapInstructionsResponse.text()
        console.error('Swap instructions error response:', errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }
        throw new Error(errorData.error || errorData.message || 'Failed to create swap instructions')
      }

      const swapData = await swapInstructionsResponse.json()
      console.log('Swap instructions received:', swapData)

      // Step 3: Deserialize and sign the transaction
      // When asLegacyTransaction: false, Jupiter returns a serialized VersionedTransaction
      if (!swapData.transaction) {
        throw new Error('No transaction data received from Jupiter')
      }

      // Deserialize the transaction
      const transactionBuffer = Buffer.from(swapData.transaction, 'base64')
      const transaction = VersionedTransaction.deserialize(transactionBuffer)

      // Sign the transaction
      transaction.sign([keypair])

      // Step 4: Send the transaction
      const signature = await connection.sendTransaction(transaction, {
        skipPreflight: false,
        maxRetries: 3,
      })

      console.log('Transaction sent, signature:', signature)

      // Step 5: Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed')

      console.log('Transaction confirmed!')

      alert(`Successfully swapped ${payAmount} SOL for ${receiveAmount} ${selectedToken.symbol}`)
      setPayAmount('')
      setReceiveAmount('')
    } catch (err: any) {
      console.error('Swap error:', err)
      let errorMessage = 'Failed to swap tokens. Please try again.'
      
      if (err.message) {
        errorMessage = err.message
      }
      
      // Check for specific error types
      if (err.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient SOL balance for this transaction.'
      } else if (err.message?.includes('slippage')) {
        errorMessage = 'Slippage tolerance exceeded. Try again with a smaller amount.'
      } else if (err.message?.includes('quote')) {
        errorMessage = 'Unable to get swap quote. The token may not be tradeable or liquidity may be insufficient.'
      }
      
      setError(errorMessage)
    } finally {
      setSwapping(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* You Pay Section */}
      <div className="bg-pump-card rounded-xl p-4 mb-3 border border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">You Pay</span>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="number"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder="0"
            className="flex-1 bg-transparent text-white text-2xl font-semibold outline-none"
          />
          <button
            onClick={() => setShowTokenList(true)}
            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
          >
            <div className="w-6 h-6 relative">
              <div className="absolute inset-0 solana-gradient rounded opacity-80" style={{ transform: 'translateX(-2px)' }}></div>
              <div className="absolute inset-0 solana-gradient rounded opacity-60" style={{ transform: 'translateX(0px)' }}></div>
              <div className="absolute inset-0 solana-gradient rounded" style={{ transform: 'translateX(2px)' }}></div>
            </div>
            <span className="text-white font-medium">SOL</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleQuickAmount(0.25)}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors"
            >
              25%
            </button>
            <button
              onClick={() => handleQuickAmount(0.5)}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors"
            >
              50%
            </button>
            <button
              onClick={() => handleQuickAmount(1)}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors"
            >
              Max
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Balance: {balance?.toFixed(4) || '0'} SOL
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center -my-2 relative z-10">
        <button
          onClick={() => {
            // Swap the tokens
            const temp = payAmount
            setPayAmount(receiveAmount)
            setReceiveAmount(temp)
          }}
          className="w-12 h-12 bg-pump-green hover:bg-pump-green/90 rounded-full flex items-center justify-center transition-colors shadow-lg"
        >
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      {/* You Receive Section */}
      <div className="bg-pump-card rounded-xl p-4 mb-6 border border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">You Receive</span>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="number"
            value={receiveAmount}
            readOnly
            className="flex-1 bg-transparent text-white text-2xl font-semibold outline-none"
          />
          <button
            onClick={() => setShowTokenList(true)}
            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
          >
            {selectedToken ? (
              <>
                <div className="w-6 h-6 bg-pump-green rounded-full flex items-center justify-center text-black font-bold text-xs font-bold">
                  {selectedToken.symbol[0]}
                </div>
                <span className="text-white font-medium">{selectedToken.symbol}</span>
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </>
            ) : (
              <>
                <span className="text-gray-400">Select Token</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>
        <div className="text-xs text-gray-500">
          {selectedToken ? `Balance: 0 ${selectedToken.symbol}` : 'Select a pump.fun token'}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={swapping || !selectedToken || !payAmount || parseFloat(payAmount) <= 0}
        className="w-full py-4 bg-gradient-to-r from-pump-green to-pump-green hover:from-pump-green hover:to-purple-800 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {swapping ? 'Swapping...' : selectedToken ? `Swap to ${selectedToken.symbol}` : 'Select Token to Swap'}
      </button>

      {/* Tokens Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Tokens</h2>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tokens..."
              className="px-3 py-2 bg-pump-dark border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-pump-green w-48"
            />
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 flex items-center space-x-1">
                <span>Rank</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 flex items-center space-x-1">
                <span>Solana</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 flex items-center space-x-1">
                <span>24h</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Token List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading tokens...</div>
          ) : filteredTokens.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchTerm ? 'No tokens found' : 'No tokens available'}
            </div>
          ) : (
            filteredTokens.map((token, index) => (
              <div
                key={token.mint}
                onClick={() => {
                  setSelectedToken(token)
                  setShowTokenList(false)
                }}
                className="bg-pump-card hover:bg-gray-800 rounded-lg p-4 border border-gray-800 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-500 text-sm w-8">#{index + 1}</div>
                    <div className="w-10 h-10 bg-pump-green rounded-full flex items-center justify-center text-black font-bold font-bold">
                      {token.symbol[0] || '?'}
                    </div>
                    <div>
                      <div className="text-white font-medium">{token.name}</div>
                      {token.marketCap && (
                        <div className="text-gray-400 text-sm">${(token.marketCap / 1000).toFixed(0)}K MC</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {token.price && (
                      <div className="text-white font-medium">${token.price.toFixed(8)}</div>
                    )}
                    {token.priceChange24h && (
                      <div className={`text-sm ${token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Token Selection Modal */}
      {showTokenList && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-pump-card rounded-2xl p-6 max-w-md w-full border border-gray-800 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Select Token</h2>
              <button
                onClick={() => {
                  setShowTokenList(false)
                  setContractAddress('')
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Contract Address Input in Modal */}
            <div className="mb-4 pb-4 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="Enter contract address (CA)"
                  className="flex-1 px-3 py-2 bg-pump-dark border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-pump-green"
                />
                <button
                  onClick={handleLoadTokenFromCA}
                  disabled={loadingTokenInfo || !contractAddress.trim()}
                  className="px-4 py-2 bg-pump-green hover:bg-pump-green disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-black font-bold text-sm font-medium transition-colors"
                >
                  {loadingTokenInfo ? 'Loading...' : 'Load'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {tokens.map((token, index) => (
                <div
                  key={token.mint}
                  onClick={() => {
                    setSelectedToken(token)
                    setShowTokenList(false)
                  }}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 bg-pump-green rounded-full flex items-center justify-center text-black font-bold font-bold">
                    {token.symbol[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{token.name}</div>
                    {token.marketCap && (
                      <div className="text-gray-400 text-sm">${(token.marketCap / 1000).toFixed(0)}K MC</div>
                    )}
                  </div>
                  {token.price && (
                    <div className="text-right">
                      <div className="text-white font-medium">${token.price.toFixed(8)}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}





