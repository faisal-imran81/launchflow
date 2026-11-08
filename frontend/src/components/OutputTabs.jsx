export default function OutputTabs({ tabs, activeId, onChange }) {
  if (!tabs || tabs.length === 0) return null

  return (
    <div
      role="tablist"
      aria-label="Output tabs"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '8px',
        padding: '3px',
      }}
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
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: isActive ? 'rgba(82,183,136,0.1)' : 'transparent',
              color: isActive ? '#74c69d' : '#5a5a62',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.color = '#a0a0a8'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#5a5a62'
              }
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
