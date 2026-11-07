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

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-5">
      <div>
        <h2 className="text-white font-semibold text-lg">New Deployment</h2>
        <p className="text-gray-400 text-sm mt-1">
          Search your GitHub repos and deploy instantly
        </p>
      </div>

      {repoError && (
        <div className="mt-2">
          <ErrorAlert message={repoError} onDismiss={clearRepoError} />
        </div>
      )}

      {deployError && (
        <div className="mt-2">
          <ErrorAlert message={deployError} onDismiss={clearDeployError} />
        </div>
      )}

      <RepoSearchBar
        onSearch={handleSearch}
        onClear={() => { clearRepos(); setSelectedRepo(null); setSearched(false) }}
        isLoading={repoLoading}
      />

      {repoLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
          <Spinner size="sm" />
          <span>Fetching repositories...</span>
        </div>
      )}

      <RepoList
        repos={repos}
        onSelect={handleRepoSelect}
        selectedRepo={selectedRepo}
        searched={searched}
      />

      {selectedRepo && (
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg px-4 py-3 space-y-1">
          <p className="text-blue-400 text-xs font-medium">Selected Repo</p>
          <p className="text-white text-sm font-semibold">{selectedRepo.fullName}</p>
          <p className="text-gray-400 text-xs">{selectedRepo.cloneUrl}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-gray-400 text-sm">App Name</label>
          <input
            type="text"
            name="appName"
            value={form.appName}
            onChange={handleChange}
            placeholder="my-awesome-app"
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-gray-400 text-sm">Environment</label>
          <select
            name="environment"
            value={form.environment}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={deployLoading || repoLoading || !selectedRepo}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            deployLoading || repoLoading || !selectedRepo
              ? 'bg-gray-600 cursor-not-allowed opacity-60'
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
          } text-white`}
        >
          {deployLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              {getStatusLabel(status)}
            </span>
          ) : (
            'Deploy'
          )}
        </button>

        {(status === 'running' || status === 'failed') && (
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 text-sm text-gray-400 hover:text-white underline transition-colors"
          >
            Start a new deployment
          </button>
        )}

        {!selectedRepo && (
          <p className="text-gray-600 text-xs text-center">
            Search and select a repo above to enable deployment
          </p>
        )}
      </form>
    </div>
  )
}
