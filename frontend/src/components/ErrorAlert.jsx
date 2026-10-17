export default function ErrorAlert({ message, onDismiss, onRetry }) {
  if (!message) return null

  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <span className="text-red-400 text-sm">⚠️</span>
        <p className="text-red-400 text-sm">{message}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-red-400 hover:text-red-300 text-xs underline"
          >
            Try again
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="text-red-400 hover:text-red-300 text-xs"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
