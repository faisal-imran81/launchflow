import { useState } from 'react'
import Spinner from './Spinner'

export default function RepoSearchBar({ onSearch, isLoading }) {
  const [username, setUsername] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!username.trim()) return
    onSearch(username.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      <label className="text-gray-400 text-sm">GitHub Username</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. faisal-imran81"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !username.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
        >
          {isLoading ? <Spinner size="sm" text="" /> : '🔍 Search'}
        </button>
      </div>
    </form>
  )
}
