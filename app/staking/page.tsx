'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js'

export default function StakingPage() {
  const { publicKey, connection, balance, keypair, refreshBalance } = useWallet()
  const [stakedAmount, setStakedAmount] = useState(0)
  const [stakingRewards, setStakingRewards] = useState(0)
  const [apy, setApy] = useState(6.5) // Mock APY
  const [loading, setLoading] = useState(false)
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')

  useEffect(() => {
    if (publicKey) {
      fetchStakingInfo()
    }
  }, [publicKey])

  const fetchStakingInfo = async () => {
    // In production, fetch from actual staking program
    // For now, use localStorage to simulate staking
    if (publicKey) {
      const saved = localStorage.getItem(`staking_${publicKey.toBase58()}`)
      if (saved) {
        const data = JSON.parse(saved)
        setStakedAmount(data.amount || 0)
        setStakingRewards(data.rewards || 0)
      }
    }
  }

  const handleStake = async () => {
    if (!publicKey || !connection || !keypair || !stakeAmount) return

    const amount = parseFloat(stakeAmount)
    if (amount <= 0 || amount > balance) {
      alert('Invalid amount')
      return
    }

    setLoading(true)
    try {
      // In production, interact with actual staking program
      // For now, simulate staking
      if (publicKey) {
        const saved = localStorage.getItem(`staking_${publicKey.toBase58()}`) || '{}'
        const data = JSON.parse(saved)
        const newAmount = (data.amount || 0) + amount
        const stakedAt = Date.now()
        
        localStorage.setItem(`staking_${publicKey.toBase58()}`, JSON.stringify({
          amount: newAmount,
          stakedAt,
          rewards: data.rewards || 0,
        }))
        
        setStakedAmount(newAmount)
        setStakeAmount('')
        alert(`Successfully staked ${amount} SOL!`)
        await refreshBalance()
      }
    } catch (error: any) {
      console.error('Staking error:', error)
      alert('Failed to stake: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUnstake = async () => {
    if (!publicKey || !unstakeAmount) return

    const amount = parseFloat(unstakeAmount)
    if (amount <= 0 || amount > stakedAmount) {
      alert('Invalid amount')
      return
    }

    setLoading(true)
    try {
      // In production, interact with actual staking program
      if (publicKey) {
        const saved = localStorage.getItem(`staking_${publicKey.toBase58()}`) || '{}'
        const data = JSON.parse(saved)
        const newAmount = Math.max(0, (data.amount || 0) - amount)
        
        localStorage.setItem(`staking_${publicKey.toBase58()}`, JSON.stringify({
          amount: newAmount,
          stakedAt: data.stakedAt,
          rewards: data.rewards || 0,
        }))
        
        setStakedAmount(newAmount)
        setUnstakeAmount('')
        alert(`Successfully unstaked ${amount} SOL!`)
        await refreshBalance()
      }
    } catch (error: any) {
      console.error('Unstaking error:', error)
      alert('Failed to unstake: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const claimRewards = async () => {
    if (!publicKey || stakingRewards <= 0) return

    setLoading(true)
    try {
      // In production, claim from actual staking program
      if (publicKey) {
        const saved = localStorage.getItem(`staking_${publicKey.toBase58()}`) || '{}'
        const data = JSON.parse(saved)
        
        localStorage.setItem(`staking_${publicKey.toBase58()}`, JSON.stringify({
          amount: data.amount || 0,
          stakedAt: data.stakedAt,
          rewards: 0,
        }))
        
        setStakingRewards(0)
        alert(`Successfully claimed ${stakingRewards.toFixed(4)} SOL rewards!`)
        await refreshBalance()
      }
    } catch (error: any) {
      console.error('Claim error:', error)
      alert('Failed to claim rewards: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-pump-dark pb-20">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6">Staking</h1>

        {/* Staking Overview */}
        <div className="bg-pump-card rounded-xl p-6 mb-6 border border-gray-800">
          <div className="text-center mb-6">
            <div className="text-gray-400 text-sm mb-2">Total Staked</div>
            <div className="text-4xl font-bold text-white mb-2">{stakedAmount.toFixed(4)} SOL</div>
            <div className="text-green-400 text-sm">APY: {apy}%</div>
          </div>

          {stakingRewards > 0 && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm">Available Rewards</div>
                  <div className="text-green-400 text-xl font-bold">{stakingRewards.toFixed(4)} SOL</div>
                </div>
                <button
                  onClick={claimRewards}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
                >
                  Claim
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-pump-dark rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Estimated Annual</div>
              <div className="text-white font-semibold">{(stakedAmount * apy / 100).toFixed(4)} SOL</div>
            </div>
            <div className="bg-pump-dark rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Estimated Monthly</div>
              <div className="text-white font-semibold">{(stakedAmount * apy / 100 / 12).toFixed(4)} SOL</div>
            </div>
          </div>
        </div>

        {/* Stake */}
        <div className="bg-pump-card rounded-xl p-6 mb-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">Stake SOL</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Amount (SOL)</label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.0"
                step="0.000000001"
                max={balance}
                className="w-full px-4 py-3 bg-pump-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pump-green"
              />
              <div className="text-gray-400 text-xs mt-1">Available: {balance.toFixed(4)} SOL</div>
            </div>
            <button
              onClick={handleStake}
              disabled={loading || !stakeAmount || parseFloat(stakeAmount) <= 0}
              className="w-full py-3 bg-pump-green hover:bg-pump-green rounded-lg text-black font-bold font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Staking...' : 'Stake SOL'}
            </button>
          </div>
        </div>

        {/* Unstake */}
        {stakedAmount > 0 && (
          <div className="bg-pump-card rounded-xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">Unstake SOL</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Amount (SOL)</label>
                <input
                  type="number"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.000000001"
                  max={stakedAmount}
                  className="w-full px-4 py-3 bg-pump-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pump-green"
                />
                <div className="text-gray-400 text-xs mt-1">Staked: {stakedAmount.toFixed(4)} SOL</div>
              </div>
              <button
                onClick={handleUnstake}
                disabled={loading || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Unstaking...' : 'Unstake SOL'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm">
            ⚠️ This is a demo staking interface. In production, this would interact with actual Solana staking validators.
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}





