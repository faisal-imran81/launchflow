export default function OutputTabs({ tabs, activeId, onChange }) {
  if (!tabs || tabs.length === 0) return null

  return (
    <div
      role="tablist"
      aria-label="Output tabs"
      className="flex flex-wrap gap-2 border-b border-gray-700 pb-2"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              isActive
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
