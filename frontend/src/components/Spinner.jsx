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

  return (
    <div className={text ? 'flex flex-col items-center justify-center gap-3' : 'inline-flex'}>
      <div className={`${sizes[size]} border-4 border-gray-700 ${colors[color] ?? colors.blue} rounded-full animate-spin`} />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  )
}
