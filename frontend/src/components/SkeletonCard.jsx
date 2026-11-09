export default function SkeletonCard({ rows = 3, variant = 'card' }) {
  const shimmer = {
    background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
    backgroundSize: '700px 100%',
    animation: 'shimmer 1.8s infinite linear',
    borderRadius: '4px',
  };

  if (variant === 'row') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div style={{ ...shimmer, height: '13px', width: '45%' }} />
          <div style={{ ...shimmer, height: '11px', width: '25%' }} />
        </div>
        <div style={{ ...shimmer, height: '22px', width: '70px', borderRadius: '999px' }} />
      </div>
    );
  }

  if (variant === 'stat') {
    return (
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ ...shimmer, height: '16px', width: '16px', borderRadius: '4px' }} />
        <div style={{ ...shimmer, height: '28px', width: '48px' }} />
        <div style={{ ...shimmer, height: '11px', width: '65%' }} />
      </div>
    );
  }

  if (variant === 'repo') {
    return (
      <div
        style={{
          padding: '10px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', flex: 1 }}>
          <div style={{ ...shimmer, height: '13px', width: '55%' }} />
          <div style={{ ...shimmer, height: '10px', width: '30%' }} />
        </div>
        <div style={{ ...shimmer, height: '18px', width: '50px', borderRadius: '999px' }} />
      </div>
    );
  }

  return (
    <div
      className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-3 animate-pulse"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '18px',
        overflow: 'hidden',
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-32 bg-gray-700 rounded-full"
              style={{
                height: '14px',
                width: '60%',
                borderRadius: '4px',
                marginBottom: '10px',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
                backgroundSize: '700px 100%',
                animation: 'shimmer 1.8s infinite linear',
              }}
            />
            <div className="h-4 w-16 bg-gray-800 rounded-full" />
          </div>
          <div
            className="h-3 w-48 bg-gray-800 rounded-full"
            style={{
              height: '12px',
              width: '40%',
              borderRadius: '4px',
              marginBottom: '16px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
              backgroundSize: '700px 100%',
              animation: 'shimmer 1.8s infinite linear',
            }}
          />
        </div>
        <div className="space-y-2 text-right">
          <div
            className="h-3 w-16 bg-gray-800 rounded-full ml-auto"
            style={{
              height: '10px',
              width: '25%',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
              backgroundSize: '700px 100%',
              animation: 'shimmer 1.8s infinite linear',
            }}
          />
          <div className="h-3 w-24 bg-gray-800 rounded-full ml-auto" />
        </div>
      </div>
      {Array.from({ length: rows - 1 }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-800 rounded-full w-full" />
      ))}
    </div>
  )
}
