import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Deploy', path: '/deploy' },
    { name: 'History', path: '/history' },
  ]

  return (
    <nav className="w-full bg-gray-900 border-b border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="flex items-center gap-2">
        <span className="text-blue-500 font-bold text-lg sm:text-xl whitespace-nowrap">
          🚀 LaunchFlow
        </span>
      </div>
      <div className="flex items-center gap-3 sm:gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-xs sm:text-sm font-medium transition-colors ${
              location.pathname === link.path
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full whitespace-nowrap">
          Beta v0.1
        </span>
      </div>
    </nav>
  )
}
