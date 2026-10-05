import { useNavigate } from 'react-router-dom'

import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('404 — Not Found')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center px-4">
      <span className="text-7xl mb-6">🚀</span>
      <h1 className="text-6xl font-bold text-white mb-2">404</h1>
      <p className="text-gray-400 text-lg mb-1">Houston, we have a problem.</p>
      <p className="text-gray-600 text-sm mb-8">This page doesn't exist or was moved.</p>
      <button
        onClick={() => navigate('/')}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
      >
        Back to Dashboard
      </button>
    </div>
  )
}
