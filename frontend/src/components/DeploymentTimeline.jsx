// frontend/src/components/DeploymentTimeline.jsx

import DeploymentStatusBadge from './DeploymentStatusBadge.jsx';

/**
 * Ordered pipeline steps shown in the timeline.
 * Each step maps to a DEPLOYMENT_STATUS value.
 */
const PIPELINE_STEPS = [
  { status: 'queued',    label: 'Queued',    description: 'Deployment added to queue' },
  { status: 'building',  label: 'Build',     description: 'Building Docker image' },
  { status: 'pushing',   label: 'Push',      description: 'Pushing image to ECR' },
  { status: 'deploying', label: 'Deploy',    description: 'Deploying container to EC2' },
  { status: 'running',   label: 'Running',   description: 'Container is live and healthy' },
];

/**
 * Returns the visual state of a pipeline step relative to the current status.
 *
 * @param {string} stepStatus    - The status this step represents
 * @param {string|null} current  - The current deployment status
 * @returns {'completed'|'active'|'failed'|'pending'}
 */
function getStepState(stepStatus, current) {
  if (!current) return 'pending';

  const order = PIPELINE_STEPS.map((s) => s.status);
  const currentIdx = order.indexOf(current);
  const stepIdx = order.indexOf(stepStatus);

  // Failed — mark current step as failed, prior steps completed
  if (current === 'failed') {
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'failed';
    return 'pending';
  }

  // Stopped — all steps up to and including running are completed
  // since stopped only happens after a successful running state
  if (current === 'stopped') {
    return 'completed';
  }

  if (stepIdx < currentIdx) return 'completed';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

/**
 * Returns the color set for the step indicator circle based on its state.
 *
 * @param {'completed'|'active'|'failed'|'pending'} state
 * @returns {{ icon: string, iconBg: string, border: string, label: string, desc: string }}
 */
function getCircleColors(state) {
  const map = {
    completed: {
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
 * @param {'completed'|'active'|'failed'|'pending'} state
 * @param {number} index - Step index (shown for pending steps)
 * @returns {string}
 */
function getCircleIcon(state, index) {
  if (state === 'completed') return '✓';
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
        {PIPELINE_STEPS.map((step, idx) => {
          const state = getStepState(step.status, status);
          const isLast = idx === PIPELINE_STEPS.length - 1;
          const c = getCircleColors(state);

          // Find timestamp for this step from history
          const historyEntry = history
            .filter((h) => h.status === step.status)
            .at(-1);

          return (
            <div key={step.status} style={{ display: 'flex', gap: '16px' }}>

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
                      minHeight: '24px',
                      background: state === 'completed'
                        ? 'linear-gradient(to bottom, #52b788, rgba(82,183,136,0.2))'
                        : 'rgba(255,255,255,0.06)',
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
                  {step.description}
                </p>

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
