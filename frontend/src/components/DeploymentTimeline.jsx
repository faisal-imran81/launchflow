import { useDeploymentStatus } from '../hooks/useDeploymentStatus';

const steps = [
  {
    key: 'pending',
    label: 'Preparing',
    desc: 'Setting up deployment environment',
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

function getStepState(stepKey, currentStatus) {
  if (currentStatus === 'failed') {
    const stepIndex    = steps.findIndex(s => s.key === stepKey);
    const currentIndex = steps.findIndex(s => s.key === currentStatus);
    if (stepIndex < currentIndex) return 'done';
    return 'failed';
  }

  const stepIndex    = steps.findIndex(s => s.key === stepKey);
  const currentIndex = steps.findIndex(s => s.key === currentStatus);

  if (stepIndex < currentIndex)  return 'done';
  if (stepIndex === currentIndex) return 'active';
  return 'pending';
}

export default function DeploymentTimeline({ deploymentId }) {
  const { status } = useDeploymentStatus(deploymentId);

  const currentStatus = status ?? 'pending';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      {steps.map((step, i) => {
        const state     = getStepState(step.key, currentStatus);
        const isLast    = i === steps.length - 1;
        const isFailed  = currentStatus === 'failed' && state === 'failed' && step.key !== 'running';

        const colors = {
          done: {
            icon:   '#52b788',
            iconBg: 'rgba(82,183,136,0.12)',
            border: 'rgba(82,183,136,0.25)',
            label:  '#74c69d',
            desc:   '#5a5a62',
            line:   '#52b788',
          },
          active: {
            icon:   '#52b788',
            iconBg: 'rgba(82,183,136,0.15)',
            border: 'rgba(82,183,136,0.35)',
            label:  '#f2f2f2',
            desc:   '#a0a0a8',
            line:   'rgba(255,255,255,0.08)',
          },
          failed: {
            icon:   '#e53e3e',
            iconBg: 'rgba(229,62,62,0.1)',
            border: 'rgba(229,62,62,0.2)',
            label:  '#fc8181',
            desc:   '#5a5a62',
            line:   'rgba(255,255,255,0.05)',
          },
          pending: {
            icon:   '#3a3a42',
            iconBg: 'rgba(255,255,255,0.03)',
            border: 'rgba(255,255,255,0.08)',
            label:  '#5a5a62',
            desc:   '#3a3a42',
            line:   'rgba(255,255,255,0.05)',
          },
        };

        const c = colors[isFailed ? 'failed' : state];

        return (
          <div key={step.key} style={{ display: 'flex', gap: '12px' }}>
            {/* Left — icon + connecting line */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: c.iconBg,
                  border: `1px solid ${c.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: c.icon,
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                  boxShadow: state === 'active'
                    ? '0 0 10px rgba(82,183,136,0.2)'
                    : 'none',
                }}
              >
                {state === 'done' ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6 L5 9 L10 3"
                      stroke="#52b788"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : isFailed ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M3 3 L9 9 M9 3 L3 9"
                      stroke="#e53e3e"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  step.icon
                )}
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div
                  style={{
                    width: '1px',
                    flex: 1,
                    minHeight: '20px',
                    background: state === 'done'
                      ? 'linear-gradient(to bottom, #52b788, rgba(82,183,136,0.2))'
                      : 'rgba(255,255,255,0.06)',
                    margin: '3px 0',
                    transition: 'background 0.3s ease',
                  }}
                />
              )}
            </div>

            {/* Right — label + desc */}
            <div
              style={{
                paddingBottom: isLast ? '0' : '16px',
                paddingTop: '6px',
                flex: 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p
                  style={{
                    color: c.label,
                    fontSize: '13px',
                    fontWeight: state === 'active' ? 600 : 500,
                    transition: 'color 0.3s ease',
                  }}
                >
                  {step.label}
                </p>

                {state === 'active' && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(82,183,136,0.1)',
                      border: '1px solid rgba(82,183,136,0.2)',
                      color: '#52b788',
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '1px 7px',
                      borderRadius: '999px',
                    }}
                  >
                    <span
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: '#52b788',
                        boxShadow: '0 0 4px rgba(82,183,136,0.8)',
                      }}
                    />
                    In progress
                  </span>
                )}
              </div>

              <p
                style={{
                  color: c.desc,
                  fontSize: '12px',
                  marginTop: '2px',
                  transition: 'color 0.3s ease',
                }}
              >
                {step.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
