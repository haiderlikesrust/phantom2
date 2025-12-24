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
      <div className="fixed bottom-0 left-0 right-0 bg-phantom-card border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <Link href="/" className="flex flex-col items-center space-y-1">
              <svg className={`w-6 h-6 ${isActive('/') ? 'text-purple-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className={`text-xs ${isActive('/') ? 'text-purple-500' : 'text-gray-400'}`}>Home</span>
            </Link>
            <Link href="/swap" className="flex flex-col items-center space-y-1">
              <svg className={`w-6 h-6 ${isActive('/swap') ? 'text-purple-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className={`text-xs ${isActive('/swap') ? 'text-purple-500' : 'text-gray-400'}`}>Swap</span>
            </Link>
          <Link href="/history" className="flex flex-col items-center space-y-1">
            <svg className={`w-6 h-6 ${isActive('/history') ? 'text-purple-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-xs ${isActive('/history') ? 'text-purple-500' : 'text-gray-400'}`}>History</span>
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

