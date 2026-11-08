import { useState } from 'react'
import RepoSearchBar from './RepoSearchBar'
import RepoList from './RepoList'
import Spinner from './Spinner'
import ErrorAlert from './ErrorAlert'

export default function DeployForm({
  onSuccess,
  repos,
  repoLoading,
  repoError,
  fetchRepos,
  clearRepoError,
  clearRepos,
  deploy,
  deployLoading,
  deployError,
  clearDeployError,
  status,
  getStatusLabel,
  reset,
}) {
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [searched, setSearched] = useState(false)
  const [form, setForm] = useState({
    appName: '',
    environment: 'production',
  })

  const handleSearch = async (username) => {
    clearRepos()
    setSelectedRepo(null)
    setSearched(false)
    await fetchRepos(username)
    setSearched(true)
  }

  const handleRepoSelect = (repo) => {
    setSelectedRepo(repo)
    setForm((prev) => ({ ...prev, appName: repo.name }))
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedRepo) return
    clearDeployError()

    const result = await deploy({
      repoUrl: selectedRepo.cloneUrl,
      appName: form.appName,
      environment: form.environment,
    })

    if (result) {
      setForm({ appName: '', environment: 'production' })
      setSelectedRepo(null)
      clearRepos()
      if (onSuccess) onSuccess(result)
    }
  }

  const handleReset = () => {
    reset()
    clearRepos()
    setSelectedRepo(null)
    setSearched(false)
    setForm({ appName: '', environment: 'production' })
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '13px',
    color: '#f2f2f2',
    outline: 'none',
    transition: 'all 0.15s ease',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ color: '#f2f2f2', fontSize: '14px', fontWeight: 600 }}>
          New Deployment
        </h2>
        <p style={{ color: '#5a5a62', fontSize: '12px', marginTop: '4px' }}>
          Search your GitHub repos and deploy instantly
        </p>
      </div>

      {repoError && (
        <ErrorAlert message={repoError} onDismiss={clearRepoError} />
      )}

      {deployError && (
        <ErrorAlert message={deployError} onDismiss={clearDeployError} />
      )}

      <RepoSearchBar
        onSearch={handleSearch}
        onClear={() => { clearRepos(); setSelectedRepo(null); setSearched(false) }}
        isLoading={repoLoading}
      />

      {repoLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Spinner size="sm" color="green" />
          <span style={{ color: '#5a5a62', fontSize: '13px' }}>Fetching repositories...</span>
        </div>
      )}

      <RepoList
        repos={repos}
        onSelect={handleRepoSelect}
        selectedRepo={selectedRepo}
        searched={searched}
      />

      {selectedRepo && (
        <div
          style={{
            background: 'rgba(82,183,136,0.06)',
            border: '1px solid rgba(82,183,136,0.15)',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <p style={{ color: '#74c69d', fontSize: '11px', fontWeight: 600 }}>
            Selected Repo
          </p>
          <p style={{ color: '#f2f2f2', fontSize: '13px', fontWeight: 600 }}>
            {selectedRepo.fullName}
          </p>
          <p style={{ color: '#5a5a62', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}>
            {selectedRepo.cloneUrl}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            style={{
              color: '#5a5a62',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            App Name
          </label>
          <input
            type="text"
            name="appName"
            value={form.appName}
            onChange={handleChange}
            placeholder="my-awesome-app"
            required
            style={inputStyle}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(82,183,136,0.4)'
              e.target.style.boxShadow = '0 0 0 3px rgba(82,183,136,0.08)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'rgba(255,255,255,0.08)'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            style={{
              color: '#5a5a62',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Environment
          </label>
          <select
            name="environment"
            value={form.environment}
            onChange={handleChange}
            style={inputStyle}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(82,183,136,0.4)'
              e.target.style.boxShadow = '0 0 0 3px rgba(82,183,136,0.08)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'rgba(255,255,255,0.08)'
              e.target.style.boxShadow = 'none'
            }}
          >
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={deployLoading || repoLoading || !selectedRepo}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            cursor: deployLoading || repoLoading || !selectedRepo ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: deployLoading || repoLoading || !selectedRepo
              ? 'rgba(82,183,136,0.15)'
              : '#52b788',
            color: deployLoading || repoLoading || !selectedRepo ? '#52b788' : '#0c0c0c',
            opacity: !selectedRepo ? 0.5 : 1,
          }}
          onMouseEnter={e => {
            if (!deployLoading && !repoLoading && selectedRepo) {
              e.currentTarget.style.background = '#74c69d'
              e.currentTarget.style.boxShadow = '0 0 16px rgba(82,183,136,0.25)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = deployLoading || repoLoading || !selectedRepo
              ? 'rgba(82,183,136,0.15)'
              : '#52b788'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {deployLoading ? (
            <>
              <Spinner size="sm" color="green" />
              {getStatusLabel(status)}
            </>
          ) : (
            'Deploy'
          )}
        </button>

        {(status === 'running' || status === 'failed') && (
          <button
            type="button"
            onClick={handleReset}
            style={{
              marginTop: '4px',
              fontSize: '12px',
              color: '#5a5a62',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#a0a0a8' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#5a5a62' }}
          >
            Start a new deployment
          </button>
        )}

        {!selectedRepo && (
          <p style={{ color: '#5a5a62', fontSize: '11px', textAlign: 'center' }}>
            Search and select a repo above to enable deployment
          </p>
        )}
      </form>
    </div>
  )
}
