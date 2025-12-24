'use client'

import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import WalletLogo from '@/components/WalletLogo'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-pump-dark pb-20">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <WalletLogo size={80} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">PumpPocket</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The only Solana wallet that lets you deploy tokens directly from your wallet
          </p>
        </div>

        {/* What Makes Us Different */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">What Makes PumpPocket Different?</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Token Deployment */}
            <div className="bg-pump-card rounded-xl p-6 border border-gray-800">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-pump-green rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Token Deployment</h3>
              </div>
              <p className="text-gray-400 mb-3">
                Deploy your own tokens directly from the wallet using PumpPortal.fun API. No need for external tools or complex setups.
              </p>
              <ul className="text-gray-400 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>One-click token creation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Built-in IPFS metadata upload</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Automatic dev buy on deployment</span>
                </li>
              </ul>
            </div>

            {/* Advanced Portfolio Analytics */}
            <div className="bg-pump-card rounded-xl p-6 border border-gray-800">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-pump-green rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Portfolio Analytics</h3>
              </div>
              <p className="text-gray-400 mb-3">
                Track your entire portfolio with real-time P&L, gains/losses, and performance metrics across all your tokens.
              </p>
              <ul className="text-gray-400 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Real-time portfolio valuation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>24h change tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Performance charts</span>
                </li>
              </ul>
            </div>

            {/* Token Watchlist & Alerts */}
            <div className="bg-pump-card rounded-xl p-6 border border-gray-800">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-pump-green rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Price Alerts</h3>
              </div>
              <p className="text-gray-400 mb-3">
                Set custom price alerts for any token. Get notified when prices hit your target levels.
              </p>
              <ul className="text-gray-400 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Custom price targets</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Above/below alerts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Token watchlist</span>
                </li>
              </ul>
            </div>

            {/* Batch Operations */}
            <div className="bg-pump-card rounded-xl p-6 border border-gray-800">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-pump-green rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Batch Send</h3>
              </div>
              <p className="text-gray-400 mb-3">
                Send SOL to multiple addresses in a single transaction. Perfect for airdrops, payments, and distributions.
              </p>
              <ul className="text-gray-400 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Multiple recipients at once</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Single transaction fee</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Easy address management</span>
                </li>
              </ul>
            </div>

            {/* Transaction Notes */}
            <div className="bg-pump-card rounded-xl p-6 border border-gray-800">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-pump-green rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Transaction Notes</h3>
              </div>
              <p className="text-gray-400 mb-3">
                Add custom notes and memos to your transactions for better organization and record-keeping.
              </p>
              <ul className="text-gray-400 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Edit and delete notes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Persistent storage</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Transaction history with context</span>
                </li>
              </ul>
            </div>

            {/* NFT Gallery */}
            <div className="bg-pump-card rounded-xl p-6 border border-gray-800">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-pump-green rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">NFT Gallery</h3>
              </div>
              <p className="text-gray-400 mb-3">
                View and manage all your NFTs in one place with a beautiful gallery interface.
              </p>
              <ul className="text-gray-400 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Automatic NFT detection</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Grid view gallery</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Detailed NFT information</span>
                </li>
              </ul>
            </div>

            {/* Live Pump.fun Activity */}
            <div className="bg-pump-card rounded-xl p-6 border border-gray-800">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-pump-green rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Live Pump.fun Activity</h3>
              </div>
              <p className="text-gray-400 mb-3">
                Watch pump.fun in real-time with live token creations, trades, and migrations. Never miss a new launch.
              </p>
              <ul className="text-gray-400 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Real-time WebSocket feed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Token images & social links</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Mayhem mode & market cap tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pump-green mr-2">✓</span>
                  <span>Dev buy amounts & live trades</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">PumpPocket vs Other Wallets</h2>
          
          <div className="bg-pump-card rounded-xl p-6 border border-gray-800 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-white font-semibold">Feature</th>
                  <th className="text-center py-3 px-4 text-pump-green font-semibold">PumpPocket</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-semibold">Other Wallets</th>
                </tr>
              </thead>
              <tbody className="text-gray-400">
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">Token Deployment</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-pump-green font-bold">✓</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-gray-600">✗</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">Portfolio Analytics</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-pump-green font-bold">✓</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-gray-400">Limited</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">Price Alerts</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-pump-green font-bold">✓</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-gray-600">✗</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">Batch Send</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-pump-green font-bold">✓</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-gray-600">✗</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">Transaction Notes</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-pump-green font-bold">✓</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-gray-600">✗</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">NFT Gallery</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-pump-green font-bold">✓</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-gray-400">Basic</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">Token Watchlist</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-pump-green font-bold">✓</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-gray-600">✗</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Live Pump.fun Activity</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-pump-green font-bold">✓</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-gray-600">✗</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Advantages */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Why Choose PumpPocket?</h2>
          
          <div className="space-y-4">
            <div className="bg-pump-card rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-2">🚀 Built for Token Creators</h3>
              <p className="text-gray-400">
                PumpPocket is the first and only wallet that integrates token deployment directly into the wallet experience. 
                Deploy your token in minutes without leaving the app or using external tools.
              </p>
            </div>

            <div className="bg-pump-card rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-2">📊 Complete Portfolio Management</h3>
              <p className="text-gray-400">
                Track everything in one place - your SOL, SPL tokens, NFTs, and portfolio performance. 
                Get real-time updates and detailed analytics that other wallets don't provide.
              </p>
            </div>

            <div className="bg-pump-card rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-2">⚡ Advanced Features</h3>
              <p className="text-gray-400">
                From batch sending to price alerts, PumpPocket includes features that make managing your 
                Solana assets easier and more efficient than ever before.
              </p>
            </div>

            <div className="bg-pump-card rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-2">⚡ Live Market Intelligence</h3>
              <p className="text-gray-400">
                Stay ahead of the curve with real-time pump.fun activity feed. Watch new tokens launch, 
                track trades, monitor migrations, and see market cap and dev buy information instantly. 
                The only wallet that gives you live market data directly in the app.
              </p>
            </div>

            <div className="bg-pump-card rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-2">🔒 Secure & Private</h3>
              <p className="text-gray-400">
                Your keys, your wallet. All data is stored locally on your device. We never have access 
                to your private keys or seed phrases. Full control, full security.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-pump-card rounded-xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Experience the most advanced Solana wallet with built-in token deployment and portfolio management.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-pump-green hover:bg-pump-green/90 rounded-lg text-black font-bold text-lg transition-colors"
          >
            Open PumpPocket
          </Link>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

