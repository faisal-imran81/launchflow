import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const [backendOnline, setBackendOnline] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'}/health`,
          { signal: AbortSignal.timeout(3000) }
        );
        setBackendOnline(res.ok);
      } catch {
        setBackendOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      style={{
        background: 'rgba(12,12,12,0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        height: '48px',
        padding: '0 20px',
      }}
      className="sticky top-0 z-50 flex items-center gap-6"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div
          style={{
            background: 'linear-gradient(135deg, #52b788, #40916c)',
            boxShadow: '0 0 12px rgba(82,183,136,0.3)',
            width: '24px',
            height: '24px',
          }}
          className="rounded-lg flex items-center justify-center"
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
            fontSize: '13px',
            fontWeight: 700,
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
              padding: '5px 10px',
              fontSize: '13px',
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
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '8px',
            background: backendOnline
              ? 'rgba(82,183,136,0.06)'
              : 'rgba(229,62,62,0.06)',
            border: backendOnline
              ? '1px solid rgba(82,183,136,0.12)'
              : '1px solid rgba(229,62,62,0.15)',
            transition: 'all 0.3s ease',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: backendOnline ? '#52b788' : '#e53e3e',
              boxShadow: backendOnline
                ? '0 0 6px rgba(82,183,136,0.6)'
                : '0 0 6px rgba(229,62,62,0.6)',
              display: 'inline-block',
              transition: 'all 0.3s ease',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: backendOnline ? '#52b788' : '#fc8181',
              transition: 'color 0.3s ease',
            }}
          >
            {backendOnline ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  );
}
