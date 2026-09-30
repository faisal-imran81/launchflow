import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Deploy', path: '/deploy' },
    { name: 'History', path: '/history' },
  ]

  return (
    <nav className="w-full bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-blue-500 font-bold text-xl">🚀 LaunchFlow</span>
      </div>
      <div className="flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-sm font-medium transition-colors ${
              location.pathname === link.path
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">Beta v0.1</span>
      </div>
    </nav>
  )
}
