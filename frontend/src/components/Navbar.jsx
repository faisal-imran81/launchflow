import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header
      style={{
        background: 'rgba(12,12,12,0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
      className="sticky top-0 z-50 h-14 flex items-center px-6 gap-6"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div
          style={{
            background: 'linear-gradient(135deg, #52b788, #40916c)',
            boxShadow: '0 0 12px rgba(82,183,136,0.3)',
          }}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 13 L8 3 L13 13"
              stroke="#0c0c0c"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 9.5 L11 9.5"
              stroke="#0c0c0c"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span
          style={{
            background: 'linear-gradient(90deg, #74c69d, #52b788)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          className="text-sm font-semibold tracking-tight"
        >
          LaunchFlow
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex items-center gap-1">
        {[
          { to: '/',        label: 'Dashboard' },
          { to: '/deploy',  label: 'Deploy'    },
          { to: '/history', label: 'History'   },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              color: isActive ? '#74c69d' : '#a0a0a8',
              background: isActive ? 'rgba(82,183,136,0.08)' : 'transparent',
              border: isActive
                ? '1px solid rgba(82,183,136,0.15)'
                : '1px solid transparent',
              transition: 'all 0.15s ease',
            })}
            className="px-3 py-1.5 rounded-lg text-sm font-medium hover:text-[#f2f2f2] hover:bg-white/5"
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Right side — status dot */}
      <div className="ml-auto flex items-center gap-2">
        <div
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
        >
          <span
            style={{ background: '#52b788', boxShadow: '0 0 6px rgba(82,183,136,0.6)' }}
            className="w-1.5 h-1.5 rounded-full"
          />
          <span className="text-xs text-[#a0a0a8] font-medium">Live</span>
        </div>
      </div>
    </header>
  );
}
