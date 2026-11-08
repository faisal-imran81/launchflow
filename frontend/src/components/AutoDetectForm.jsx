export default function AutoDetectForm({ onSubmit, loading }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <p style={{ color: '#a0a0a8', fontSize: '13px', lineHeight: '1.6' }}>
        LaunchFlow will automatically detect your stack and generate an
        optimized Dockerfile and GitHub Actions workflow.
      </p>

      <div
        style={{
          background: 'rgba(82,183,136,0.05)',
          border: '1px solid rgba(82,183,136,0.1)',
          borderRadius: '8px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {[
          'Detects Node.js, Python, Go, and more',
          'Generates production-ready Dockerfile',
          'Creates GitHub Actions CI/CD workflow',
        ].map((item) => (
          <div
            key={item}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6 L5 9 L10 3"
                stroke="#52b788"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ color: '#a0a0a8', fontSize: '12px' }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
