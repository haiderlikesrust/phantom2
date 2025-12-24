'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL, Cluster } from '@solana/web3.js'
import { getAssociatedTokenAddress, getAccount, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import * as bip39 from 'bip39'
import { derivePath } from 'ed25519-hd-key'
import bs58 from 'bs58'

export type Network = 'mainnet-beta' | 'devnet' | 'testnet'

interface TokenBalance {
  mint: string
  symbol: string
  name: string
  balance: number
  decimals: number
  uiAmount: number
}

interface WalletContextType {
  connected: boolean
  publicKey: PublicKey | null
  balance: number
  connection: Connection | null
  keypair: Keypair | null
  network: Network
  tokens: TokenBalance[]
  isInitializing: boolean
  connect: (seedPhrase?: string) => Promise<void>
  disconnect: () => void
  sendTransaction: (to: string, amount: number) => Promise<string>
  transactions: TransactionInfo[]
  refreshBalance: () => Promise<void>
  refreshTokens: () => Promise<void>
  switchNetwork: (network: Network) => void
  createWallet: () => { publicKey: string; seedPhrase: string }
  importFromSeedPhrase: (seedPhrase: string) => Promise<void>
}

interface TransactionInfo {
  signature: string
  type: 'sent' | 'received'
  amount: number
  timestamp: number
  to?: string
  from?: string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Helius RPC endpoints - using Helius API key
const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY || '119fb272-26e7-452a-93b3-9dc8387f4c2e'

const getRpcUrl = (net: Network): string => {
  if (net === 'mainnet-beta') {
    return `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  } else if (net === 'devnet') {
    return `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  } else {
    return 'https://api.testnet.solana.com'
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null)
  const [balance, setBalance] = useState(0)
  const [network, setNetwork] = useState<Network>('mainnet-beta')
  const [connection, setConnection] = useState<Connection>(new Connection(getRpcUrl('mainnet-beta'), 'confirmed'))
  const [keypair, setKeypair] = useState<Keypair | null>(null)
  const [transactions, setTransactions] = useState<TransactionInfo[]>([])
  const [tokens, setTokens] = useState<TokenBalance[]>([])
  const [isInitializing, setIsInitializing] = useState(true)

  const refreshBalance = useCallback(async () => {
    if (!publicKey) {
      console.log('Cannot fetch balance - no public key')
      return
    }

    // Use Helius RPC
    const rpcUrl = getRpcUrl(network)
    
    try {
      console.log('Fetching balance for:', publicKey.toBase58(), 'on network:', network)
      console.log('Using RPC Endpoint:', rpcUrl)
      const rpcConnection = new Connection(rpcUrl, 'confirmed')
      const balance = await rpcConnection.getBalance(publicKey, 'confirmed')
      const solBalance = balance / LAMPORTS_PER_SOL
      console.log('Balance fetched successfully:', solBalance, 'SOL (', balance, 'lamports)')
      setBalance(solBalance)
      setConnection(rpcConnection) // Update connection to working one
    } catch (error: any) {
        console.error('Error fetching balance:', error)
        console.error('Error details:', error.message, error.stack)
        // Retry with Helius (should always work if API key is valid)
        console.error('Helius RPC failed, this should not happen if API key is valid')
      }
  }, [publicKey, connection, network])

  const refreshTokens = useCallback(async () => {
    if (!publicKey || !connection) return

    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      })

      const tokenBalances: TokenBalance[] = await Promise.all(
        tokenAccounts.value.map(async (account) => {
          const parsedInfo = account.account.data.parsed.info
          const mint = parsedInfo.mint
          const tokenAmount = parsedInfo.tokenAmount

          // Try to fetch token metadata
          let symbol = 'UNKNOWN'
          let name = 'Unknown Token'
          
          try {
            // Try to get from token registry or known tokens
            const knownTokens: Record<string, { symbol: string; name: string }> = {
              'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', name: 'USD Coin' },
              'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', name: 'Tether USD' },
            }
            if (knownTokens[mint]) {
              symbol = knownTokens[mint].symbol
              name = knownTokens[mint].name
            }
          } catch {}

          return {
            mint,
            symbol,
            name,
            balance: Number(tokenAmount.amount),
            decimals: tokenAmount.decimals,
            uiAmount: Number(tokenAmount.uiAmount) || 0,
          }
        })
      )

      setTokens(tokenBalances)
    } catch (error) {
      console.error('Error fetching tokens:', error)
      setTokens([])
    }
  }, [publicKey, connection])

  const switchNetwork = useCallback((newNetwork: Network) => {
    setNetwork(newNetwork)
    const rpcUrl = getRpcUrl(newNetwork)
    const newConnection = new Connection(rpcUrl, 'confirmed')
    setConnection(newConnection)
    if (connected && publicKey) {
      refreshBalance()
      refreshTokens()
    }
  }, [connected, publicKey])

  useEffect(() => {
    if (connected && publicKey && connection) {
      console.log('Wallet connected, fetching balance and tokens...')
      refreshBalance()
      refreshTokens()
      const interval = setInterval(() => {
        console.log('Auto-refreshing balance (every 5 minutes)...')
        refreshBalance()
        refreshTokens()
      }, 300000) // Refresh every 5 minutes (300000 ms)
      return () => clearInterval(interval)
    }
  }, [connected, publicKey, connection, refreshBalance, refreshTokens])

  const createWallet = useCallback(() => {
    // Generate 12-word mnemonic
    const mnemonic = bip39.generateMnemonic()
    return {
      publicKey: '', // Will be set after deriving keypair
      seedPhrase: mnemonic,
    }
  }, [])

  const deriveKeypairFromSeed = useCallback((seedPhrase: string): Keypair => {
    // Validate mnemonic
    if (!bip39.validateMnemonic(seedPhrase)) {
      throw new Error('Invalid seed phrase')
    }

    // Convert mnemonic to seed
    const seed = bip39.mnemonicToSeedSync(seedPhrase)
    
    // Derive Solana keypair using Ed25519 derivation path
    // Solana uses m/44'/501'/0'/0' derivation path
    const derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key
    
    // Create keypair from derived seed (first 32 bytes)
    // derivedSeed is a Buffer, slice it to get the first 32 bytes
    const seedBytes = Buffer.from(derivedSeed).slice(0, 32)
    return Keypair.fromSeed(seedBytes)
  }, [])

  const importFromSeedPhrase = useCallback(async (seedPhrase: string) => {
    try {
      const walletKeypair = deriveKeypairFromSeed(seedPhrase.trim())
      setKeypair(walletKeypair)
      setPublicKey(walletKeypair.publicKey)
      setConnected(true)
      
      // Store seed phrase
      localStorage.setItem('phantom_wallet_seed_phrase', seedPhrase.trim())
    } catch (error) {
      console.error('Error importing from seed phrase:', error)
      throw error
    }
  }, [deriveKeypairFromSeed])

  const connect = useCallback(async (seedPhrase?: string) => {
    try {
      let walletKeypair: Keypair

      if (seedPhrase) {
        // Import from seed phrase
        walletKeypair = deriveKeypairFromSeed(seedPhrase.trim())
        localStorage.setItem('phantom_wallet_seed_phrase', seedPhrase.trim())
      } else {
        // Check if wallet exists in localStorage
        const storedSeedPhrase = localStorage.getItem('phantom_wallet_seed_phrase')
        if (storedSeedPhrase) {
          walletKeypair = deriveKeypairFromSeed(storedSeedPhrase)
        } else {
          // No existing wallet - user needs to create one
          throw new Error('No wallet found. Please create a new wallet.')
        }
      }

      setKeypair(walletKeypair)
      setPublicKey(walletKeypair.publicKey)
      setConnected(true)
      
      // Immediately fetch balance after connection
      // Use setTimeout to ensure state is updated first
      setTimeout(async () => {
        try {
          console.log('Fetching balance immediately after connect...')
          const rpcUrl = getRpcUrl(network)
          const currentConnection = connection || new Connection(rpcUrl, 'confirmed')
          const balance = await currentConnection.getBalance(walletKeypair.publicKey, 'confirmed')
          const solBalance = balance / LAMPORTS_PER_SOL
          console.log('Initial balance fetched:', solBalance, 'SOL')
          setBalance(solBalance)
        } catch (error: any) {
          console.error('Error fetching balance on connect:', error.message)
          console.error('Make sure Helius API key is set correctly')
        }
      }, 500)
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    }
  }, [deriveKeypairFromSeed, connection])

  const disconnect = useCallback(() => {
    setConnected(false)
    setPublicKey(null)
    setKeypair(null)
    setBalance(0)
    setTransactions([])
    // Don't remove seed phrase on disconnect - keep it for reconnection
  }, [])

  // Auto-connect on mount if wallet exists in localStorage
  useEffect(() => {
    const autoConnect = async () => {
      try {
        const storedSeedPhrase = localStorage.getItem('phantom_wallet_seed_phrase')
        if (storedSeedPhrase) {
          await connect()
        }
      } catch (error) {
        console.error('Auto-connect failed:', error)
        // If auto-connect fails, clear the invalid seed phrase
        localStorage.removeItem('phantom_wallet_seed_phrase')
      } finally {
        setIsInitializing(false)
      }
    }

    autoConnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const sendTransaction = useCallback(async (to: string, amount: number) => {
    if (!keypair || !publicKey) {
      throw new Error('Wallet not connected')
    }

    try {
      const toPublicKey = new PublicKey(to)
      const lamports = amount * LAMPORTS_PER_SOL

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: toPublicKey,
          lamports,
        })
      )

      const signature = await connection.sendTransaction(transaction, [keypair])
      await connection.confirmTransaction(signature, 'confirmed')

      // Add to transaction history
      const txInfo: TransactionInfo = {
        signature,
        type: 'sent',
        amount,
        timestamp: Date.now(),
        to,
      }
      setTransactions((prev) => [txInfo, ...prev])

      // Refresh balance
      await refreshBalance()

      return signature
    } catch (error) {
      console.error('Error sending transaction:', error)
      throw error
    }
  }, [keypair, publicKey, connection, refreshBalance])

  return (
    <WalletContext.Provider
      value={{
        connected,
        publicKey,
        balance,
        connection,
        keypair,
        network,
        tokens,
        isInitializing,
        connect,
        disconnect,
        sendTransaction,
        transactions,
        refreshBalance,
        refreshTokens,
        switchNetwork,
        createWallet,
        importFromSeedPhrase,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

