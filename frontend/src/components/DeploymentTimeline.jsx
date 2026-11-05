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

  // Failed or stopped — mark active step as failed, prior steps completed
  if (current === 'failed' || current === 'stopped') {
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'failed';
    return 'pending';
  }

  if (stepIdx < currentIdx) return 'completed';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

/**
 * Returns Tailwind classes for the step indicator circle based on its state.
 *
 * @param {'completed'|'active'|'failed'|'pending'} state
 * @returns {string}
 */
function getCircleClasses(state) {
  const map = {
    completed: 'bg-green-500 border-green-500 text-white',
    active:    'bg-indigo-500 border-indigo-500 text-white animate-pulse',
    failed:    'bg-red-500 border-red-500 text-white',
    pending:   'bg-zinc-800 border-zinc-600 text-zinc-500',
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
 * @param {string}       [props.className]       - Extra Tailwind classes for wrapper
 */
export default function DeploymentTimeline({
  status,
  history = [],
  meta = {},
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-0 ${className}`}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-200">
          Deployment Pipeline
        </h3>
        {status && (
          <DeploymentStatusBadge status={status} size="sm" />
        )}
      </div>

      {/* ── Pipeline steps ── */}
      <div className="relative flex flex-col gap-0">
        {PIPELINE_STEPS.map((step, idx) => {
          const state = getStepState(step.status, status);
          const isLast = idx === PIPELINE_STEPS.length - 1;

          // Find timestamp for this step from history
          const historyEntry = history
            .filter((h) => h.status === step.status)
            .at(-1);

          return (
            <div key={step.status} className="flex gap-4">

              {/* ── Left column: circle + connector line ── */}
              <div className="flex flex-col items-center">
                {/* Step circle */}
                <div
                  className={`
                    w-8 h-8 rounded-full border-2 flex items-center justify-center
                    text-xs font-bold shrink-0 z-10
                    ${getCircleClasses(state)}
                  `}
                >
                  {getCircleIcon(state, idx)}
                </div>

                {/* Connector line — hidden on last step */}
                {!isLast && (
                  <div
                    className={`
                      w-0.5 flex-1 min-h-6
                      ${state === 'completed' ? 'bg-green-500' : 'bg-zinc-700'}
                    `}
                  />
                )}
              </div>

              {/* ── Right column: step content ── */}
              <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
                <p
                  className={`
                    text-sm font-medium leading-tight
                    ${state === 'completed' ? 'text-green-400' : ''}
                    ${state === 'active'    ? 'text-indigo-300' : ''}
                    ${state === 'failed'    ? 'text-red-400' : ''}
                    ${state === 'pending'   ? 'text-zinc-500' : ''}
                  `}
                >
                  {step.label}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {step.description}
                </p>

                {/* Timestamp from history */}
                {historyEntry?.updatedAt && (
                  <p className="text-xs text-zinc-600 mt-1">
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
        <div className="mt-4 px-3 py-2 rounded-lg bg-red-950 border border-red-800 text-xs text-red-300">
          <span className="font-semibold">Error: </span>{meta.error}
        </div>
      )}
    </div>
  );
}
