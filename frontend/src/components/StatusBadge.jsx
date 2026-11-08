const statusConfig = {
  pending:   { dot: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  text: '#fbbf24', label: 'Pending'   },
  cloning:   { dot: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)',  text: '#60a5fa', label: 'Cloning'   },
  building:  { dot: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.2)',  text: '#a78bfa', label: 'Building'  },
  pushing:   { dot: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.2)',   text: '#22d3ee', label: 'Pushing'   },
  deploying: { dot: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.2)',  text: '#fb923c', label: 'Deploying' },
  running:   { dot: '#52b788', bg: 'rgba(82,183,136,0.1)',  border: 'rgba(82,183,136,0.2)',  text: '#52b788', label: 'Running'   },
  failed:    { dot: '#e53e3e', bg: 'rgba(229,62,62,0.1)',   border: 'rgba(229,62,62,0.2)',   text: '#e53e3e', label: 'Failed'    },
};

export default function StatusBadge({ status, size = 'md' }) {
  const c = statusConfig[status] ?? statusConfig.pending;

  const fontSize = size === 'sm' ? '11px' : size === 'lg' ? '13px' : '12px';
  const padding  = size === 'sm' ? '2px 8px' : size === 'lg' ? '5px 14px' : '3px 10px';
  const dotSize  = size === 'sm' ? '5px' : size === 'lg' ? '7px' : '6px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        fontSize,
        fontWeight: 600,
        padding,
        borderRadius: '999px',
        textTransform: 'capitalize',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          background: c.dot,
          flexShrink: 0,
          boxShadow: status === 'running'
            ? `0 0 6px ${c.dot}`
            : status === 'failed'
            ? `0 0 6px ${c.dot}`
            : 'none',
        }}
      />
      {c.label}
    </span>
  );
}
