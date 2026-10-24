export default function ErrorAlert({ message, onDismiss, onRetry }) {
  if (!message) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-start justify-between gap-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3"
    >
      <div className="flex items-start gap-2 min-w-0">
        <span aria-hidden="true" className="text-red-400 text-sm mt-0.5 shrink-0">⚠️</span>
        <p className="text-red-400 text-sm break-words">{message}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-red-400 hover:text-red-300 text-xs underline underline-offset-2"
          >
            Try again
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="text-red-400 hover:text-red-300 text-xs leading-none"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
