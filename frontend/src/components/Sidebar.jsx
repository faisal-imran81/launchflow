import { Link, useLocation } from 'react-router-dom'

const links = [
  { name: 'Dashboard', path: '/', icon: '🏠' },
  { name: 'Deploy', path: '/deploy', icon: '🚀' },
  { name: 'History', path: '/history', icon: '📋' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="h-screen w-56 bg-gray-900 border-r border-gray-700 flex flex-col py-6 px-3">
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 text-sm font-medium transition-colors ${
            location.pathname === link.path
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <span>{link.icon}</span>
          <span>{link.name}</span>
        </Link>
      ))}
    </aside>
  )
}
