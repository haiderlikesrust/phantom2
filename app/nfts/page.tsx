'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { PublicKey } from '@solana/web3.js'

export default function NFTsPage() {
  const { publicKey, connection } = useWallet()
  const [nfts, setNfts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedNft, setSelectedNft] = useState<any>(null)

  useEffect(() => {
    if (publicKey && connection) {
      fetchNFTs()
    }
  }, [publicKey, connection])

  const fetchNFTs = async () => {
    if (!publicKey || !connection) return
    
    setLoading(true)
    try {
      // Fetch all token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      })

      // Filter for NFTs (tokens with supply = 1 and decimals = 0)
      const nftAccounts = tokenAccounts.value.filter(
        (account) => account.account.data.parsed.info.tokenAmount.amount === '1' &&
                     account.account.data.parsed.info.tokenAmount.decimals === 0
      )

      // Fetch metadata for each NFT
      const nftData = await Promise.all(
        nftAccounts.map(async (account) => {
          try {
            const mint = account.account.data.parsed.info.mint
            // Try to fetch metadata from various sources
            const metadata = await fetchNFTMetadata(mint)
            return {
              mint,
              account: account.pubkey.toBase58(),
              ...metadata,
            }
          } catch (error) {
            console.error('Error fetching NFT metadata:', error)
            return {
              mint: account.account.data.parsed.info.mint,
              account: account.pubkey.toBase58(),
              name: 'Unknown NFT',
              image: null,
            }
          }
        })
      )

      setNfts(nftData.filter(nft => nft.name !== 'Unknown NFT' || nft.image))
    } catch (error) {
      console.error('Error fetching NFTs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNFTMetadata = async (mint: string) => {
    try {
      // Try Metaplex metadata
      const metadataUrl = `https://api.mainnet-beta.solana.com`
      // For now, return basic info - in production, use Metaplex SDK
      return {
        name: `NFT #${mint.slice(0, 8)}`,
        image: null,
        description: '',
      }
    } catch (error) {
      return {
        name: 'Unknown NFT',
        image: null,
        description: '',
      }
    }
  }

  return (
    <div className="min-h-screen bg-pump-dark pb-20">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6">My NFTs</h1>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pump-green mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading NFTs...</p>
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No NFTs found in your wallet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nfts.map((nft, index) => (
              <div
                key={index}
                onClick={() => setSelectedNft(nft)}
                className="bg-pump-card rounded-xl p-4 border border-gray-800 hover:border-pump-green transition-colors cursor-pointer"
              >
                <div className="aspect-square bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {nft.image ? (
                    <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-500 text-4xl">🎨</div>
                  )}
                </div>
                <h3 className="text-white font-semibold text-sm truncate">{nft.name}</h3>
                <p className="text-gray-400 text-xs mt-1 truncate">{nft.mint.slice(0, 8)}...</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedNft && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedNft(null)}>
          <div className="bg-pump-card rounded-xl p-6 max-w-md w-full border border-gray-800" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">{selectedNft.name}</h2>
            {selectedNft.image && (
              <img src={selectedNft.image} alt={selectedNft.name} className="w-full rounded-lg mb-4" />
            )}
            <div className="space-y-2">
              <div>
                <label className="text-gray-400 text-sm">Mint Address</label>
                <p className="text-white font-mono text-xs break-all">{selectedNft.mint}</p>
              </div>
              {selectedNft.description && (
                <div>
                  <label className="text-gray-400 text-sm">Description</label>
                  <p className="text-white text-sm">{selectedNft.description}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedNft(null)}
              className="mt-6 w-full py-3 bg-pump-green hover:bg-pump-green rounded-lg text-black font-bold font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}





