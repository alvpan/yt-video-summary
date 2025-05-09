'use client'

import { useState } from 'react'

export default function HomePage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState('')

  const handleSummarize = async () => {
    setLoading(true)
    setSummary('')

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()
      setSummary(data.summary || 'No summary returned.')
    } catch (err) {
      setSummary('❌ Error summarizing video.')
    }

    setLoading(false)
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center pt-30 overflow-hidden text-white">

      <div className="absolute inset-0 z-[-2] bg-gradient-to-br from-black via-indigo-800 to-blue-300 
                bg-[length:400%_400%] animate-gradient blur-md scale-125 transition-transform duration-10000" />

      <div className="absolute inset-0 z-[-1] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)] pointer-events-none" />

      <div className="w-full flex flex-col items-center max-w-md space-y-4 z-10">
        <h1 className="text-2xl font-bold text-center">Save time.</h1>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste Youtube URL here..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
        />
        {loading ? (
          <div className="flex items-center justify-center h-10">
            <div className="flex space-x-2">
              <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-3 h-3 bg-white rounded-full animate-bounce"></span>
            </div>
          </div>
        ) : (
          <button
            onClick={handleSummarize}
            disabled={!url}
            className="px-4 py-2 rounded-lg 
            bg-white/10 backdrop-blur 
            border border-white/10 
            text-white shadow-md 
            hover:bg-white/20 hover:cursor-pointer transition"
          >
            Summarize
          </button>
        )}

        {summary && (
          <div className="mt-6 p-4 bg-white border rounded shadow text-black">
            <h2 className="font-semibold mb-2">📄 TL;DR Summary:</h2>
            <p>{summary}</p>
          </div>
        )}
      </div>
    </main>
  )
}
