export default function Spinner({ size = 'md', color = 'blue', text = '', overlay = false }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const colors = {
    blue: 'border-t-blue-500',
    green: 'border-t-[#52b788]',
  }

  const sizeMap = {
    sm: { width: '14px', height: '14px', borderWidth: '2px' },
    md: { width: '20px', height: '20px', borderWidth: '2px' },
    lg: { width: '28px', height: '28px', borderWidth: '3px' },
  };
  const s = sizeMap[size] ?? sizeMap.md;
  const borderColor = color === 'green'
    ? 'rgba(82,183,136,0.2)'
    : 'rgba(255,255,255,0.1)';
  const spinColor = color === 'green' ? '#52b788' : '#a0a0a8';

  if (overlay) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          background: 'rgba(12,12,12,0.8)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        <div
          style={{
            padding: '28px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '3px solid rgba(82,183,136,0.15)',
              borderTopColor: '#52b788',
              animation: 'spin 0.7s linear infinite',
            }}
          />
          {text && (
            <p
              style={{
                color: '#a0a0a8',
                fontSize: '13px',
                fontWeight: 500,
                textAlign: 'center',
                maxWidth: '200px',
                lineHeight: '1.5',
              }}
            >
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={text ? 'flex flex-col items-center justify-center gap-3' : 'inline-flex'}>
      <div
        className={`${sizes[size]} border-4 border-gray-700 ${colors[color] ?? colors.blue} rounded-full animate-spin`}
        style={{
          width: s.width,
          height: s.height,
          borderRadius: '50%',
          border: `${s.borderWidth} solid ${borderColor}`,
          borderTopColor: spinColor,
          animation: 'spin 0.7s linear infinite',
          flexShrink: 0,
          display: 'inline-block',
        }}
      />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  )
}
