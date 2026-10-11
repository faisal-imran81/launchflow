import { useState } from 'react'
import { parseRepoInput } from '../utils/parseRepoInput'

export default function AutoDetectForm({ onSubmit, loading }) {
  const [input, setInput] = useState('')
  const parsed = parseRepoInput(input)

  const handleSubmit = () => {
    if (!parsed) return
    onSubmit(parsed)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-300">🔍 Auto-detect from GitHub</h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="owner/repo (e.g. faisal-imran81/my-app)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
          className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !parsed}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
        >
          🔍 Auto-detect & Generate All
        </button>
      </div>
      {input && !parsed && (
        <p className="text-xs text-yellow-500">
          Format should be owner/repo (or a full GitHub URL)
        </p>
      )}
    </div>
  )
}
