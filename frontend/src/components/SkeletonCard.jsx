export default function SkeletonCard({ rows = 3 }) {
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
