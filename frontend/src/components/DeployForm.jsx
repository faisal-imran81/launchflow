import { useState } from 'react';
import RepoSearchBar from './RepoSearchBar';
import RepoList from './RepoList';
import Spinner from './Spinner';

export default function DeployForm({
  repos,
  repoLoading,
  fetchRepos,
  fetchFiles,
  onDeploy,
  deployLoading,
  status,
  getStatusLabel,
}) {
  const [username, setUsername]       = useState('');
  const [selectedRepo, setSelectedRepo] = useState(null);

  const handleSearch = (searchTerm) => {
    const name = (searchTerm ?? username).trim();
    if (name) fetchRepos(name);
  };

  const handleDeploy = () => {
    if (!selectedRepo) return;
    onDeploy({
      repoUrl: selectedRepo.cloneUrl ?? selectedRepo.url,
      appName: selectedRepo.name,
      environment: 'production',
      stack: 'auto',
    });
  };

  const repoName = selectedRepo?.fullName ?? selectedRepo?.name;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Username search */}
      <div>
        <label
          style={{
            display: 'block',
            color: '#5a5a62',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '8px',
          }}
        >
          GitHub Username
        </label>
        <RepoSearchBar
          value={username}
          onChange={setUsername}
          onSearch={handleSearch}
          loading={repoLoading}
          isLoading={repoLoading}
        />
      </div>

      {/* Repo list */}
      {repos?.length > 0 && (
        <div>
          <label
            style={{
              display: 'block',
              color: '#5a5a62',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '8px',
            }}
          >
            Select Repository
          </label>
          <RepoList
            repos={repos}
            selectedRepo={selectedRepo}
            searched
            onSelect={setSelectedRepo}
          />
        </div>
      )}

      {/* Loading repos */}
      {repoLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Spinner size="sm" />
          <span style={{ color: '#5a5a62', fontSize: '13px' }}>
            Fetching repositories...
          </span>
        </div>
      )}

      {/* Selected repo indicator */}
      {selectedRepo && (
        <div
          style={{
            background: 'rgba(82,183,136,0.06)',
            border: '1px solid rgba(82,183,136,0.15)',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: '#74c69d', fontSize: '13px', fontWeight: 500 }}>
            {repoName}
          </span>
          <button
            onClick={() => setSelectedRepo(null)}
            style={{
              color: '#5a5a62',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              lineHeight: 1,
              padding: '0 2px',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#a0a0a8'}
            onMouseLeave={e => e.currentTarget.style.color = '#5a5a62'}
          >
            ×
          </button>
        </div>
      )}

      {/* Deploy button */}
      <button
        onClick={handleDeploy}
        disabled={deployLoading || !selectedRepo}
        style={{
          width: '100%',
          padding: '10px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          border: 'none',
          cursor: deployLoading || !selectedRepo ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          background: deployLoading || !selectedRepo
            ? 'rgba(82,183,136,0.15)'
            : '#52b788',
          color: deployLoading || !selectedRepo ? '#52b788' : '#0c0c0c',
          opacity: !selectedRepo ? 0.5 : 1,
        }}
        onMouseEnter={e => {
          if (!deployLoading && selectedRepo) {
            e.currentTarget.style.background = '#74c69d';
            e.currentTarget.style.boxShadow = '0 0 16px rgba(82,183,136,0.25)';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = deployLoading || !selectedRepo
            ? 'rgba(82,183,136,0.15)'
            : '#52b788';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {deployLoading ? (
          <>
            <Spinner size="sm" color="green" />
            {getStatusLabel?.(status) ?? 'Deploying...'}
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2 L8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 5 L8 2 L11 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 12 C3 13.1 3.9 14 5 14 L11 14 C12.1 14 13 13.1 13 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Deploy
          </>
        )}
      </button>
    </div>
  );
}
