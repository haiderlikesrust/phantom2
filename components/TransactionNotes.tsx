'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'

interface TransactionNote {
  signature: string
  note: string
  timestamp: number
}

export default function TransactionNotes({ signature }: { signature: string }) {
  const { publicKey } = useWallet()
  const [note, setNote] = useState('')
  const [savedNote, setSavedNote] = useState<string>('')
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (publicKey) {
      loadNote()
    }
  }, [signature, publicKey])

  const loadNote = () => {
    if (!publicKey) return
    const notes = JSON.parse(localStorage.getItem(`tx_notes_${publicKey.toBase58()}`) || '{}')
    const saved = notes[signature]
    if (saved) {
      setSavedNote(saved.note)
      setNote(saved.note)
    }
  }

  const saveNote = () => {
    if (!publicKey) return
    const notes = JSON.parse(localStorage.getItem(`tx_notes_${publicKey.toBase58()}`) || '{}')
    notes[signature] = {
      note,
      timestamp: Date.now(),
    }
    localStorage.setItem(`tx_notes_${publicKey.toBase58()}`, JSON.stringify(notes))
    setSavedNote(note)
    setEditing(false)
  }

  const deleteNote = () => {
    if (!publicKey) return
    const notes = JSON.parse(localStorage.getItem(`tx_notes_${publicKey.toBase58()}`) || '{}')
    delete notes[signature]
    localStorage.setItem(`tx_notes_${publicKey.toBase58()}`, JSON.stringify(notes))
    setNote('')
    setSavedNote('')
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="mt-4 p-4 bg-pump-dark rounded-lg border border-gray-700">
        <label className="block text-gray-400 text-sm mb-2">Add Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about this transaction..."
          className="w-full px-4 py-3 bg-pump-card border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pump-green resize-none"
          rows={3}
        />
        <div className="flex space-x-2 mt-3">
          <button
            onClick={saveNote}
            className="px-4 py-2 bg-pump-green hover:bg-pump-green rounded-lg text-black font-bold text-sm font-medium transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => {
              setNote(savedNote)
              setEditing(false)
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          {savedNote && (
            <button
              onClick={deleteNote}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4">
      {savedNote ? (
        <div className="p-4 bg-pump-dark rounded-lg border border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-gray-400 text-xs mb-1">Note</div>
              <p className="text-white text-sm">{savedNote}</p>
            </div>
            <button
              onClick={() => setEditing(true)}
              className="ml-3 text-pump-green hover:text-pump-green text-sm"
            >
              Edit
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full py-2 text-pump-green hover:text-pump-green text-sm font-medium"
        >
          + Add Note
        </button>
      )}
    </div>
  )
}





