'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SettingsModal from './SettingsModal'

export default function BottomNav() {
  const pathname = usePathname()
  const [showSettings, setShowSettings] = useState(false)
  const isActive = (path: string) => pathname === path

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-pump-card border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <Link href="/" className="flex flex-col items-center space-y-1">
              <svg className={`w-6 h-6 ${isActive('/') ? 'text-pump-green' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className={`text-xs ${isActive('/') ? 'text-pump-green' : 'text-gray-400'}`}>Home</span>
            </Link>
            <Link href="/deploy" className="flex flex-col items-center space-y-1">
              <svg className={`w-6 h-6 ${isActive('/deploy') ? 'text-pump-green' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className={`text-xs ${isActive('/deploy') ? 'text-pump-green' : 'text-gray-400'}`}>Deploy</span>
            </Link>
            <Link href="/live" className="flex flex-col items-center space-y-1">
              <svg className={`w-6 h-6 ${isActive('/live') ? 'text-pump-green' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className={`text-xs ${isActive('/live') ? 'text-pump-green' : 'text-gray-400'}`}>Live</span>
            </Link>
            <Link href="/portfolio" className="flex flex-col items-center space-y-1">
              <svg className={`w-6 h-6 ${isActive('/portfolio') ? 'text-pump-green' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className={`text-xs ${isActive('/portfolio') ? 'text-pump-green' : 'text-gray-400'}`}>Portfolio</span>
            </Link>
            <Link href="/nfts" className="flex flex-col items-center space-y-1">
              <svg className={`w-6 h-6 ${isActive('/nfts') ? 'text-pump-green' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={`text-xs ${isActive('/nfts') ? 'text-pump-green' : 'text-gray-400'}`}>NFTs</span>
            </Link>
            <Link href="/staking" className="flex flex-col items-center space-y-1">
              <svg className={`w-6 h-6 ${isActive('/staking') ? 'text-pump-green' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-xs ${isActive('/staking') ? 'text-pump-green' : 'text-gray-400'}`}>Stake</span>
            </Link>
          <Link href="/history" className="flex flex-col items-center space-y-1">
            <svg className={`w-6 h-6 ${isActive('/history') ? 'text-pump-green' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-xs ${isActive('/history') ? 'text-pump-green' : 'text-gray-400'}`}>History</span>
          </Link>
            <button
              onClick={() => setShowSettings(true)}
              className="flex flex-col items-center space-y-1"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs text-gray-400">Settings</span>
            </button>
          </div>
        </div>
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  )
}





