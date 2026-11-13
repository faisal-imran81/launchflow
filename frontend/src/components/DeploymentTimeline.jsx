// frontend/src/components/DeploymentTimeline.jsx

import DeploymentStatusBadge from './DeploymentStatusBadge.jsx';

/**
 * Ordered pipeline steps shown in the timeline.
 * Each step maps to a DEPLOYMENT_STATUS value.
 */
const steps = [
  {
    key: 'queued',
    label: 'Queued',
    desc: 'Deployment added to queue',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 4 L7 7.5 L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'cloning',
    label: 'Cloning',
    desc: 'Fetching repository from GitHub',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 2.5C2 1.67 2.67 1 3.5 1h7C11.33 1 12 1.67 12 2.5v9a.5.5 0 01-.777.416L7 8.6l-4.223 3.316A.5.5 0 012 11.5v-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'building',
    label: 'Building',
    desc: 'Building Docker image',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    key: 'pushing',
    label: 'Pushing',
    desc: 'Uploading image to ECR',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 9 L7 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M4.5 4.5 L7 2 L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 10 C2 11.1 2.9 12 4 12 L10 12 C11.1 12 12 11.1 12 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'deploying',
    label: 'Deploying',
    desc: 'Launching container on EC2',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1 C4 1 1 4 1 7 C1 10 4 13 7 13 C10 13 13 10 13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9 1 L13 1 L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 1 L7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'running',
    label: 'Live',
    desc: 'Deployment is running',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 4.5 L10 7 L5 9.5 Z" fill="currentColor"/>
      </svg>
    ),
  },
];

/**
 * Returns the visual state of a pipeline step relative to the current status.
 *
 * @param {string} stepKey       - The status this step represents
 * @param {string|null} current  - The current deployment status
 * @returns {'done'|'active'|'failed'|'pending'}
 */
function getStepState(stepKey, currentStatus) {
  if (currentStatus === 'failed') {
    const stepIndex    = steps.findIndex(s => s.key === stepKey);
    const currentIndex = steps.findIndex(s => s.key === 'deploying');
    if (stepIndex < currentIndex) return 'done';
    return 'failed';
  }

  const stepIndex    = steps.findIndex(s => s.key === stepKey);
  const currentIndex = steps.findIndex(s => s.key === currentStatus);

  if (currentIndex === -1)      return 'pending';
  if (stepIndex < currentIndex)  return 'done';
  if (stepIndex === currentIndex) return 'active';
  return 'pending';
}

/**
 * Returns the color set for the step indicator circle based on its state.
 *
 * @param {'done'|'active'|'failed'|'pending'} state
 * @returns {{ icon: string, iconBg: string, border: string, label: string, desc: string }}
 */
function getCircleColors(state) {
  const map = {
    done: {
      icon: '#52b788',
      iconBg: 'rgba(82,183,136,0.12)',
      border: 'rgba(82,183,136,0.25)',
      label: '#74c69d',
      desc: '#5a5a62',
    },
    active: {
      icon: '#52b788',
      iconBg: 'rgba(82,183,136,0.15)',
      border: 'rgba(82,183,136,0.35)',
      label: '#f2f2f2',
      desc: '#a0a0a8',
    },
    failed: {
      icon: '#e53e3e',
      iconBg: 'rgba(229,62,62,0.1)',
      border: 'rgba(229,62,62,0.2)',
      label: '#fc8181',
      desc: '#5a5a62',
    },
    pending: {
      icon: '#3a3a42',
      iconBg: 'rgba(255,255,255,0.03)',
      border: 'rgba(255,255,255,0.08)',
      label: '#5a5a62',
      desc: '#3a3a42',
    },
  };
  return map[state] ?? map.pending;
}

/**
 * Returns the icon character shown inside the step circle.
 *
 * @param {'done'|'active'|'failed'|'pending'} state
 * @param {number} index - Step index (shown for pending steps)
 * @returns {string}
 */
function getCircleIcon(state, index) {
  if (state === 'done') return '✓';
  if (state === 'failed')    return '✕';
  if (state === 'active')    return '●';
  return String(index + 1);
}

/**
 * DeploymentTimeline — renders a vertical step-by-step pipeline timeline.
 * Shows completed, active, failed, and pending steps with icons and descriptions.
 *
 * @param {object}       props
 * @param {string|null}  props.status           - Current deployment status
 * @param {Array}        props.history           - Status history array from useDeploymentStatus
 * @param {{ error: string|null }} props.meta    - Deployment metadata from useDeploymentStatus
 * @param {string}       [props.className]       - Extra classes for wrapper
 */
export default function DeploymentTimeline({
  status,
  history = [],
  meta = {},
  className = '',
}) {
  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: 0, animation: 'fadeIn 0.3s ease-out' }}
    >

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ color: '#f2f2f2', fontSize: '14px', fontWeight: 600 }}>
          Deployment Pipeline
        </h3>
        {status && (
          <DeploymentStatusBadge status={status} size="sm" />
        )}
      </div>

      {/* ── Pipeline steps ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((step, idx) => {
          const state = getStepState(step.key, status);
          const isLast = idx === steps.length - 1;
          const c = getCircleColors(state);
          const isFailed = state === 'failed';

          // Find timestamp for this step from history
          const historyEntry = history
            .filter((h) => h.status === step.key)
            .at(-1);

          return (
            <div key={step.key} style={{ display: 'flex', gap: '16px' }}>

              {/* ── Left column: circle + connector line ── */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Step circle */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: `1px solid ${c.border}`,
                    background: c.iconBg,
                    color: c.icon,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    flexShrink: 0,
                    zIndex: 10,
                    transition: 'all 0.3s ease',
                    boxShadow: state === 'active'
                      ? '0 0 10px rgba(82,183,136,0.2)'
                      : isFailed
                      ? '0 0 10px rgba(229,62,62,0.15)'
                      : 'none',
                  }}
                >
                  {getCircleIcon(state, idx)}
                </div>

                {/* Connector line — hidden on last step */}
                {!isLast && (
                  <div
                    style={{
                      width: '1px',
                      flex: 1,
                      minHeight: '20px',
                      background: state === 'done'
                        ? 'linear-gradient(to bottom, #52b788, rgba(82,183,136,0.15))'
                        : isFailed
                        ? 'linear-gradient(to bottom, rgba(229,62,62,0.3), rgba(229,62,62,0.05))'
                        : 'rgba(255,255,255,0.05)',
                      margin: '3px 0',
                      transition: 'background 0.3s ease',
                    }}
                  />
                )}
              </div>

              {/* ── Right column: step content ── */}
              <div style={{ paddingBottom: isLast ? 0 : '24px', paddingTop: '6px' }}>
                <p
                  style={{
                    color: c.label,
                    fontSize: '13px',
                    fontWeight: state === 'active' ? 600 : 500,
                    lineHeight: 1.3,
                    transition: 'color 0.3s ease',
                  }}
                >
                  {step.label}
                </p>
                <p style={{ color: c.desc, fontSize: '12px', marginTop: '2px' }}>
                  {step.desc}
                </p>

                {(isFailed || (status === 'failed' && state === 'active')) && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '6px',
                      padding: '6px 10px',
                      background: 'rgba(229,62,62,0.06)',
                      border: '1px solid rgba(229,62,62,0.15)',
                      borderRadius: '6px',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="6" cy="6" r="5" stroke="#e53e3e" strokeWidth="1.2"/>
                      <path d="M6 4 L6 6.5" stroke="#e53e3e" strokeWidth="1.2" strokeLinecap="round"/>
                      <circle cx="6" cy="8.5" r="0.6" fill="#e53e3e"/>
                    </svg>
                    <span style={{ color: '#fc8181', fontSize: '11px', fontWeight: 500 }}>
                      {meta?.error ?? 'Deployment failed at this step'}
                    </span>
                  </div>
                )}

                {/* Timestamp from history */}
                {historyEntry?.updatedAt && (
                  <p style={{ color: '#3a3a42', fontSize: '11px', marginTop: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {new Date(historyEntry.updatedAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Error message — shown only on failed status ── */}
      {status === 'failed' && meta?.error && (
        <div
          style={{
            marginTop: '16px',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(229,62,62,0.08)',
            border: '1px solid rgba(229,62,62,0.2)',
            fontSize: '12px',
            color: '#fc8181',
          }}
        >
          <span style={{ fontWeight: 600 }}>Error: </span>{meta.error}
        </div>
      )}

      {/* ── Stopped message — shown when deployment was manually stopped ── */}
      {status === 'stopped' && (
        <div
          style={{
            marginTop: '16px',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '12px',
            color: '#a0a0a8',
          }}
        >
          <span style={{ fontWeight: 600 }}>■ Stopped: </span>
          Deployment was stopped manually.
        </div>
      )}
    </div>
  );
}
