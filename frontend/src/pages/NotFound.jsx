import { useNavigate } from 'react-router-dom'

import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('404 — Not Found')
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center px-4"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <h1
        className="text-6xl font-bold text-white mb-2"
        style={{
          fontSize: '96px',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          background: 'linear-gradient(135deg, #e53e3e, #7f1d1d)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px',
        }}
      >
        404
      </h1>
      <p
        className="text-gray-400 text-lg mb-1"
        style={{
          color: '#f2f2f2',
          fontSize: '20px',
          fontWeight: 600,
          marginBottom: '10px',
          letterSpacing: '-0.01em',
        }}
      >
        Houston, we have a problem.
      </p>
      <p
        className="text-gray-600 text-sm mb-8"
        style={{
          color: '#5a5a62',
          fontSize: '14px',
          lineHeight: '1.6',
          maxWidth: '320px',
          marginBottom: '28px',
        }}
      >
        This page doesn't exist or was moved.
      </p>
      <button
        onClick={() => navigate('/')}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        style={{
          padding: '9px 20px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          border: '1px solid rgba(82,183,136,0.2)',
          background: 'rgba(82,183,136,0.08)',
          color: '#52b788',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        Back to Dashboard
      </button>
    </div>
  )
}
