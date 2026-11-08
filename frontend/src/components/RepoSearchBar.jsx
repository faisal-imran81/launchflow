import Spinner from './Spinner';

export default function RepoSearchBar({ value, onChange, onSearch, loading }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSearch?.();
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          style={{
            position: 'absolute',
            left: '11px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#5a5a62',
            pointerEvents: 'none',
          }}
        >
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 10 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          value={value}
          onChange={e => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter GitHub username..."
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '9px 12px 9px 32px',
            fontSize: '13px',
            color: '#f2f2f2',
            outline: 'none',
            transition: 'all 0.15s ease',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(82,183,136,0.4)';
            e.target.style.boxShadow   = '0 0 0 3px rgba(82,183,136,0.08)';
            e.target.style.background  = 'rgba(255,255,255,0.05)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(255,255,255,0.08)';
            e.target.style.boxShadow   = 'none';
            e.target.style.background  = 'rgba(255,255,255,0.04)';
          }}
        />
      </div>

      <button
        onClick={onSearch}
        disabled={loading || !value?.trim()}
        style={{
          padding: '9px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          border: '1px solid rgba(82,183,136,0.2)',
          background: 'rgba(82,183,136,0.08)',
          color: '#52b788',
          cursor: loading || !value?.trim() ? 'not-allowed' : 'pointer',
          opacity: !value?.trim() ? 0.5 : 1,
          transition: 'all 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          if (!loading && value?.trim()) {
            e.currentTarget.style.background  = 'rgba(82,183,136,0.14)';
            e.currentTarget.style.borderColor = 'rgba(82,183,136,0.3)';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background  = 'rgba(82,183,136,0.08)';
          e.currentTarget.style.borderColor = 'rgba(82,183,136,0.2)';
        }}
      >
        {loading ? <Spinner size="sm" color="green" /> : null}
        {loading ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
}
