export default function SkeletonCard({ rows = 3 }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-3 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3">
            <div className="h-4 w-32 bg-gray-700 rounded-full" />
            <div className="h-4 w-16 bg-gray-800 rounded-full" />
          </div>
          <div className="h-3 w-48 bg-gray-800 rounded-full" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-3 w-16 bg-gray-800 rounded-full ml-auto" />
          <div className="h-3 w-24 bg-gray-800 rounded-full ml-auto" />
        </div>
      </div>
      {Array.from({ length: rows - 1 }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-800 rounded-full w-full" />
      ))}
    </div>
  )
}
