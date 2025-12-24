'use client'

import { useWallet } from '@/contexts/WalletContext'
import { Network } from '@/contexts/WalletContext'

export default function NetworkSwitcher() {
  const { network, switchNetwork } = useWallet()

  return (
    <div className="flex items-center space-x-2">
      <select
        value={network}
        onChange={(e) => switchNetwork(e.target.value as Network)}
        className="px-3 py-2 bg-pump-dark border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-pump-green"
      >
        <option value="mainnet-beta">Mainnet</option>
        <option value="devnet">Devnet</option>
        <option value="testnet">Testnet</option>
      </select>
    </div>
  )
}





