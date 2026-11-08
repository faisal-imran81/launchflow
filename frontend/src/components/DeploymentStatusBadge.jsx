// frontend/src/components/DeploymentStatusBadge.jsx

/**
 * Maps each deployment status to a color set and display label.
 * Mirrors the backend DEPLOYMENT_STATUS enum values.
 */
const STATUS_CONFIG = {
  queued:    { label: 'Queued',     dot: '#a0a0a8', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.08)', text: '#a0a0a8' },
  building:  { label: 'Building…',  dot: '#a78bfa', bg: 'rgba(139,92,246,0.1)',   border: 'rgba(139,92,246,0.2)',   text: '#a78bfa' },
  pushing:   { label: 'Pushing…',   dot: '#22d3ee', bg: 'rgba(6,182,212,0.1)',    border: 'rgba(6,182,212,0.2)',    text: '#22d3ee' },
  deploying: { label: 'Deploying…', dot: '#fb923c', bg: 'rgba(249,115,22,0.1)',   border: 'rgba(249,115,22,0.2)',   text: '#fb923c' },
  running:   { label: 'Running',    dot: '#52b788', bg: 'rgba(82,183,136,0.1)',   border: 'rgba(82,183,136,0.2)',   text: '#52b788' },
  failed:    { label: 'Failed',     dot: '#e53e3e', bg: 'rgba(229,62,62,0.1)',    border: 'rgba(229,62,62,0.2)',    text: '#e53e3e' },
  stopped:   { label: 'Stopped',    dot: '#a0a0a8', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.08)', text: '#a0a0a8' },
};

/** Fallback config for unknown or null status values. */
const FALLBACK_CONFIG = {
  label: 'Unknown',
  dot: '#5a5a62',
  bg: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.07)',
  text: '#5a5a62',
};

const SIZE_STYLES = {
  sm: { fontSize: '11px', padding: '2px 8px',  dot: '5px' },
  md: { fontSize: '12px', padding: '3px 10px', dot: '6px' },
  lg: { fontSize: '13px', padding: '5px 14px', dot: '7px' },
};

/**
 * DeploymentStatusBadge — displays a colored pill for the current deployment status.
 * Size variants: 'sm' | 'md' | 'lg'
 *
 * @param {object}      props
 * @param {string|null} props.status         - Current deployment status value
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Badge size variant
 * @param {string}      [props.className]    - Extra classes for wrapper
 */
export default function DeploymentStatusBadge({
  status,
  size = 'md',
  className = '',
}) {
  const config = STATUS_CONFIG[status] ?? FALLBACK_CONFIG;
  const sizing = SIZE_STYLES[size] ?? SIZE_STYLES.md;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.text,
        fontSize: sizing.fontSize,
        fontWeight: 600,
        padding: sizing.padding,
        borderRadius: '999px',
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
      }}
    >
      <span
        style={{
          width: sizing.dot,
          height: sizing.dot,
          borderRadius: '50%',
          background: config.dot,
          flexShrink: 0,
          boxShadow: status === 'running' || status === 'failed'
            ? `0 0 6px ${config.dot}`
            : 'none',
        }}
      />
      {config.label}
    </span>
  );
}
