import { NavLink } from 'react-router-dom';

const links = [
  {
    to: '/',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    to: '/deploy',
    label: 'Deploy',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2 L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5 5 L8 2 L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 11 C3 12.1 3.9 13 5 13 L11 13 C12.1 13 13 12.1 13 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/history',
    label: 'History',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 5 L8 8.5 L10.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  return (
    <aside
      style={{
        background: 'rgba(12,12,12,0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        width: '220px',
        minHeight: 'calc(100vh - 56px)',
      }}
      className="flex flex-col py-4 px-3 shrink-0"
    >
      {/* Nav section */}
      <div className="flex flex-col gap-0.5">
        <p
          style={{ color: '#5a5a62' }}
          className="text-xs font-medium uppercase tracking-widest px-3 mb-2"
        >
          Navigation
        </p>

        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: isActive ? '#74c69d' : '#a0a0a8',
              background: isActive
                ? 'rgba(82,183,136,0.08)'
                : 'transparent',
              border: isActive
                ? '1px solid rgba(82,183,136,0.12)'
                : '1px solid transparent',
              transition: 'all 0.15s ease',
              textDecoration: 'none',
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.style.background.includes('82,183')) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.color = '#f2f2f2';
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.style.background.includes('82,183')) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#a0a0a8';
              }
            }}
          >
            <span style={{ opacity: 0.9 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>

      {/* Bottom section */}
      <div className="mt-auto">
        <div
          style={{
            background: 'rgba(82,183,136,0.06)',
            border: '1px solid rgba(82,183,136,0.1)',
            borderRadius: '10px',
            padding: '12px',
          }}
        >
          <p style={{ color: '#52b788' }} className="text-xs font-semibold mb-1">
            LaunchFlow
          </p>
          <p style={{ color: '#5a5a62' }} className="text-xs leading-relaxed">
            AI-powered deployment platform
          </p>
        </div>
      </div>
    </aside>
  );
}
