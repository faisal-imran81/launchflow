export default function EmptyState({ icon = '', title, description, action }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      {icon && (
        <span
          className="text-5xl mb-4"
          style={{
            fontSize: '32px',
            marginBottom: '16px',
            opacity: 0.6,
          }}
        >
          {icon}
        </span>
      )}
      <h3
        className="text-white font-semibold text-lg"
        style={{
          color: '#f2f2f2',
          fontSize: '16px',
          fontWeight: 600,
          marginBottom: '8px',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-gray-400 text-sm mt-1 max-w-xs"
          style={{
            color: '#5a5a62',
            fontSize: '14px',
            lineHeight: '1.6',
            maxWidth: '300px',
          }}
        >
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          style={{
            marginTop: '20px',
            padding: '8px 20px',
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
          {action.label}
        </button>
      )}
    </div>
  )
}
