export default function Spinner({ size = 'md', text = '', color = 'blue' }) {
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
