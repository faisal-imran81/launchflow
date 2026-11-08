import { useState } from 'react';
import { useDeploy } from '../hooks/useDeploy';
import { useGitHub } from '../hooks/useGitHub';
import AutoDetectForm from '../components/AutoDetectForm';
import ManualGenerateForm from '../components/ManualGenerateForm';
import DeployForm from '../components/DeployForm';
import AIEngine from '../components/AIEngine';
import AIOutput from '../components/AIOutput';
import LogStreamPanel from '../components/LogStreamPanel';
import DeploymentStatusBadge from '../components/DeploymentStatusBadge';
import ErrorAlert from '../components/ErrorAlert';
import Spinner from '../components/Spinner';

const tabs = ['Auto Detect', 'Manual'];

const getStatusLabel = (status) => {
  const labels = {
    pending:   'Preparing deployment...',
    cloning:   'Cloning repository...',
    building:  'Building Docker image...',
    pushing:   'Pushing to ECR...',
    deploying: 'Deploying to EC2...',
    running:   '🚀 Deployment live!',
    failed:    'Deployment failed.',
  };
  return labels[status] ?? 'Processing...';
};

export default function Deploy() {
  const [activeTab, setActiveTab] = useState(0);

  const {
    deploy,
    loading: deployLoading,
    error: deployError,
    deploymentId,
    containerId,
    status,
    clearError: clearDeployError,
    reset,
  } = useDeploy();

  const {
    repos,
    loading: repoLoading,
    error: repoError,
    fetchRepos,
    fetchFiles,
    clearError: clearRepoError,
  } = useGitHub();

  const hasOutput = deploymentId || containerId || status;

  return (
    <div
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      className="max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <h1
          style={{
            color: '#f2f2f2',
            fontWeight: 700,
            fontSize: '24px',
            letterSpacing: '-0.02em',
          }}
        >
          Deploy
        </h1>
        <p style={{ color: '#5a5a62', fontSize: '14px', marginTop: '4px' }}>
          Connect a GitHub repository and deploy to EC2 in one click
        </p>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* LEFT — Input panel */}
        <div className="flex flex-col gap-5">

          {/* AI Config card */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px',
              padding: '24px',
            }}
          >
            {/* Card header */}
            <div className="flex items-center gap-3 mb-6">
              <div
                style={{
                  background: 'rgba(82,183,136,0.1)',
                  border: '1px solid rgba(82,183,136,0.15)',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3" stroke="#52b788" strokeWidth="1.5"/>
                  <path d="M8 1 L8 3M8 13 L8 15M1 8 L3 8M13 8 L15 8" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p style={{ color: '#f2f2f2', fontSize: '14px', fontWeight: 600 }}>
                  AI Configuration
                </p>
                <p style={{ color: '#5a5a62', fontSize: '12px' }}>
                  Generate Dockerfile + GitHub Actions workflow
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '8px',
                padding: '3px',
                marginBottom: '20px',
              }}
            >
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: activeTab === i
                      ? 'rgba(82,183,136,0.12)'
                      : 'transparent',
                    color: activeTab === i ? '#74c69d' : '#5a5a62',
                    borderColor: activeTab === i
                      ? 'rgba(82,183,136,0.2)'
                      : 'transparent',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* AI form */}
            <AIEngine>
              {activeTab === 0
                ? <AutoDetectForm />
                : <ManualGenerateForm />
              }
            </AIEngine>
          </div>

          {/* Deploy card */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px',
              padding: '24px',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                style={{
                  background: 'rgba(82,183,136,0.1)',
                  border: '1px solid rgba(82,183,136,0.15)',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2 L8 10" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M5 5 L8 2 L11 5" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 12 C3 13.1 3.9 14 5 14 L11 14 C12.1 14 13 13.1 13 12" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p style={{ color: '#f2f2f2', fontSize: '14px', fontWeight: 600 }}>
                  Deploy
                </p>
                <p style={{ color: '#5a5a62', fontSize: '12px' }}>
                  Select a repository and launch
                </p>
              </div>
            </div>

            {repoError && (
              <div className="mb-4">
                <ErrorAlert message={repoError} onDismiss={clearRepoError} />
              </div>
            )}

            {deployError && (
              <div className="mb-4">
                <ErrorAlert message={deployError} onDismiss={clearDeployError} />
              </div>
            )}

            <DeployForm
              repos={repos}
              repoLoading={repoLoading}
              fetchRepos={fetchRepos}
              fetchFiles={fetchFiles}
              onDeploy={deploy}
              deployLoading={deployLoading}
              status={status}
              getStatusLabel={getStatusLabel}
            />

            {(status === 'running' || status === 'failed') && (
              <button
                onClick={reset}
                style={{
                  marginTop: '12px',
                  fontSize: '12px',
                  color: '#5a5a62',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#a0a0a8'}
                onMouseLeave={e => e.currentTarget.style.color = '#5a5a62'}
              >
                Start a new deployment
              </button>
            )}
          </div>
        </div>

        {/* RIGHT — Output panel */}
        <div className="flex flex-col gap-5">

          {/* AI Output */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px',
              padding: '24px',
              minHeight: '200px',
            }}
          >
            <p
              style={{
                color: '#5a5a62',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '16px',
              }}
            >
              AI Output
            </p>
            <AIOutput />
          </div>

          {/* Status + Logs — only when deployment started */}
          {hasOutput && (
            <>
              {/* Status */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px',
                  padding: '20px',
                  animation: 'slideUp 0.25s ease-out',
                }}
              >
                <p
                  style={{
                    color: '#5a5a62',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '14px',
                  }}
                >
                  Deployment Status
                </p>
                <DeploymentStatusBadge status={status} showProgress />
                {deployLoading && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '12px',
                    }}
                  >
                    <Spinner size="sm" />
                    <span style={{ color: '#a0a0a8', fontSize: '13px' }}>
                      {getStatusLabel(status)}
                    </span>
                  </div>
                )}
              </div>

              {/* Log stream */}
              {containerId && (
                <div
                  style={{
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.07)',
                    animation: 'slideUp 0.3s ease-out',
                  }}
                >
                  <LogStreamPanel
                    containerId={containerId}
                    deploymentId={deploymentId}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
