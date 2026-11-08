import StatusBadge from './StatusBadge';

const stepOrder = [
  'pending',
  'cloning',
  'building',
  'pushing',
  'deploying',
  'running',
];

const stepLabels = {
  pending:   'Preparing',
  cloning:   'Cloning repo',
  building:  'Building image',
  pushing:   'Pushing to ECR',
  deploying: 'Deploying to EC2',
  running:   'Live',
  failed:    'Failed',
};

export default function DeploymentStatusBadge({ status, showProgress = false }) {
  if (!showProgress) {
    return <StatusBadge status={status} />;
  }

  const currentIndex = stepOrder.indexOf(status);
  const isFailed = status === 'failed';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Badge */}
      <StatusBadge status={status} />

      {/* Progress bar */}
      {!isFailed && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {stepOrder.map((step, i) => {
            const done    = i < currentIndex;
            const active  = i === currentIndex;
            const pending = i > currentIndex;

            return (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div
                  title={stepLabels[step]}
                  style={{
                    width: active ? '20px' : '8px',
                    height: '4px',
                    borderRadius: '999px',
                    background: done
                      ? '#52b788'
                      : active
                      ? '#52b788'
                      : 'rgba(255,255,255,0.08)',
                    opacity: pending ? 0.4 : 1,
                    transition: 'all 0.3s ease',
                    boxShadow: active ? '0 0 6px rgba(82,183,136,0.5)' : 'none',
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {isFailed && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div
            style={{
              width: '100%',
              height: '4px',
              borderRadius: '999px',
              background: 'rgba(229,62,62,0.3)',
              boxShadow: '0 0 6px rgba(229,62,62,0.2)',
            }}
          />
        </div>
      )}

      {/* Step label */}
      <p style={{ color: '#5a5a62', fontSize: '11px', fontWeight: 500 }}>
        {stepLabels[status] ?? 'Processing'}
      </p>
    </div>
  );
}
