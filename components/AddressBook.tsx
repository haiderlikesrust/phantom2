'use client'

import { useState, useEffect } from 'react'

interface Address {
  id: string
  name: string
  address: string
  createdAt: number
}

interface AddressBookProps {
  onSelect?: (address: string) => void
}

export default function AddressBook({ onSelect }: AddressBookProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = () => {
    const stored = localStorage.getItem('phantom_address_book')
    if (stored) {
      setAddresses(JSON.parse(stored))
    }
  }

  const saveAddresses = (newAddresses: Address[]) => {
    localStorage.setItem('phantom_address_book', JSON.stringify(newAddresses))
    setAddresses(newAddresses)
  }

  const handleAdd = () => {
    setError('')
    if (!name.trim() || !address.trim()) {
      setError('Please fill in all fields')
      return
    }

    // Basic address validation
    if (address.length < 32 || address.length > 44) {
      setError('Invalid Solana address')
      return
    }

    const newAddress: Address = {
      id: Date.now().toString(),
      name: name.trim(),
      address: address.trim(),
      createdAt: Date.now(),
    }

    const updated = [...addresses, newAddress]
    saveAddresses(updated)
    setName('')
    setAddress('')
    setShowAddModal(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this address?')) {
      const updated = addresses.filter(addr => addr.id !== id)
      saveAddresses(updated)
    }
  }

  const handleSelect = (addr: string) => {
    if (onSelect) {
      onSelect(addr)
      setShowAddModal(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Address Book</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition-colors"
        >
          + Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No saved addresses</p>
          <p className="text-sm mt-2">Add frequently used addresses for quick access</p>
        </div>
      ) : (
        <div className="space-y-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-phantom-card rounded-lg p-4 border border-gray-800 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="text-white font-medium">{addr.name}</div>
                <div className="text-gray-400 text-sm font-mono">
                  {addr.address.slice(0, 8)}...{addr.address.slice(-8)}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {onSelect && (
                  <button
                    onClick={() => handleSelect(addr.address)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm transition-colors"
                  >
                    Use
                  </button>
                )}
                <button
                  onClick={() => navigator.clipboard.writeText(addr.address)}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 text-sm transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-phantom-card rounded-2xl p-6 max-w-md w-full border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Add Address</h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setName('')
                  setAddress('')
                  setError('')
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., My Wallet, Exchange"
                  className="w-full px-4 py-3 bg-phantom-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter Solana address"
                  className="w-full px-4 py-3 bg-phantom-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono text-sm"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAdd}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg text-white font-semibold transition-all"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setName('')
                    setAddress('')
                    setError('')
                  }}
                  className="px-6 py-3 bg-phantom-dark hover:bg-gray-800 border border-gray-700 rounded-lg text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

