'use client'

import { useState } from 'react'

export default function HomePage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [lengthSeconds, setLengthSeconds] = useState<number | null>(null)
  const [hasSummarized, setHasSummarized] = useState(false)   // NEW

  const handleSummarize = async () => {
    setLoading(true)
    setSummary('')
    setHasSummarized(false)          // ready for a fresh run

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()
      setSummary(data.summary || 'No summary returned.')
      setLengthSeconds(data.lengthSeconds || null)
    } catch (err) {
      setSummary('❌ Error summarizing video.')
    } finally {
      setLoading(false)
      setHasSummarized(true)         // hide the button
    }
  }

  // Whenever the user edits the URL, allow a new summary
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
    setHasSummarized(false)
    setSummary('')
    setLengthSeconds(null)
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center pt-30 overflow-hidden text-white">

      <div className="absolute inset-0 z-[-2] bg-gradient-to-br from-black via-indigo-800 to-blue-300 
                bg-[length:400%_400%] animate-gradient blur-md scale-125 transition-transform duration-10000" />

      <div className="absolute inset-0 z-[-1] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)] pointer-events-none" />

      <div className="w-full flex flex-col items-center max-w-3xl space-y-4 z-10">
        <h1 className="text-2xl font-bold text-center">Save time.</h1>

        <input
          type="text"
          value={url}
          onChange={handleUrlChange}
          placeholder="Paste YouTube URL here..."
          className="w-[65%] px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
        />

        {loading ? (
          // loading dots
          <div className="flex items-center justify-center h-10">
            <div className="flex space-x-2">
              <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-3 h-3 bg-white rounded-full animate-bounce" />
            </div>
          </div>
        ) : (
          // show button **only** if we haven’t summarized yet
          !hasSummarized && (
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
          )
        )}

        {lengthSeconds && (
          <h2 className="font-semibold mb-0 text-xl">
            ⏱️ Saved&nbsp;
            {lengthSeconds >= 3600
              ? `${Math.floor(lengthSeconds / 3600)}h ${Math.floor((lengthSeconds % 3600) / 60)}min`
              : `${Math.round(lengthSeconds / 60)}min`}
          </h2>
        )}

        {summary && (
          <div className="w-full mt-6 p-4 rounded-lg bg-white/10 backdrop-blur border border-white/10 text-white shadow-md">
            <h1 className = "text-white font-semibold text-xl pb-3">📑 Video Summary:</h1>
            <p>{summary}</p>
          </div>
        )}
      </div>
    </main>
  )
}
