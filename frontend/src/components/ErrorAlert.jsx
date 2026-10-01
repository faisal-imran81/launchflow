export default function ErrorAlert({ message, onDismiss }) {
  if (!message) return null

  return (
    <div className="flex items-start justify-between gap-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-red-400 text-sm">⚠️</span>
        <p className="text-red-400 text-sm">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-300 text-xs shrink-0"
        >
          ✕
        </button>
      )}
    </div>
  )
}
