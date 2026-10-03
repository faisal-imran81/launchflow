import { useEffect } from 'react'

export default function SuccessToast({ message, onDismiss, duration = 3000 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => {
      onDismiss()
    }, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onDismiss])

  if (!message) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-400 px-5 py-3 rounded-xl shadow-lg backdrop-blur-sm animate-fade-in">
      <span className="text-lg">✅</span>
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onDismiss}
        className="text-green-400 hover:text-green-300 text-xs ml-2"
      >
        ✕
      </button>
    </div>
  )
}
