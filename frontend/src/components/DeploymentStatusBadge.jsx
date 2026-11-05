// frontend/src/components/DeploymentStatusBadge.jsx

/**
 * Maps each deployment status to a Tailwind color class and display label.
 * Mirrors the backend DEPLOYMENT_STATUS enum values.
 */
const STATUS_CONFIG = {
  queued:    { label: 'Queued',     className: 'bg-zinc-700 text-zinc-300' },
  building:  { label: 'Building…',  className: 'bg-yellow-600 text-yellow-100 animate-pulse' },
  pushing:   { label: 'Pushing…',   className: 'bg-blue-600 text-blue-100 animate-pulse' },
  deploying: { label: 'Deploying…', className: 'bg-indigo-600 text-indigo-100 animate-pulse' },
  running:   { label: '● Running',  className: 'bg-green-600 text-green-100' },
  failed:    { label: '✕ Failed',   className: 'bg-red-600 text-red-100' },
  stopped:   { label: '■ Stopped',  className: 'bg-zinc-600 text-zinc-200' },
};

/** Fallback config for unknown or null status values. */
const FALLBACK_CONFIG = { label: 'Unknown', className: 'bg-zinc-800 text-zinc-400' };

/**
 * DeploymentStatusBadge — displays a colored pill for the current deployment status.
 * Size variants: 'sm' | 'md' | 'lg'
 *
 * @param {object}      props
 * @param {string|null} props.status         - Current deployment status value
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Badge size variant
 * @param {string}      [props.className]    - Extra Tailwind classes for wrapper
 */
export default function DeploymentStatusBadge({
  status,
  size = 'md',
  className = '',
}) {
  const config = STATUS_CONFIG[status] ?? FALLBACK_CONFIG;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${sizeClasses[size] ?? sizeClasses.md}
        ${config.className}
        ${className}
      `}
    >
      {config.label}
    </span>
  );
}
