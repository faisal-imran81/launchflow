import Spinner from './Spinner';

export default function AIEngine({ children, loading, error, onGenerate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {children}

      {loading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            background: 'rgba(82,183,136,0.05)',
            border: '1px solid rgba(82,183,136,0.1)',
            borderRadius: '8px',
          }}
        >
          <Spinner size="sm" color="green" />
          <span style={{ color: '#74c69d', fontSize: '13px', fontWeight: 500 }}>
            AI is generating your configuration...
          </span>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '12px 14px',
            background: 'rgba(229,62,62,0.06)',
            border: '1px solid rgba(229,62,62,0.15)',
            borderRadius: '8px',
          }}
        >
          <p style={{ color: '#fc8181', fontSize: '13px' }}>{error}</p>
        </div>
      )}
    </div>
  );
}
