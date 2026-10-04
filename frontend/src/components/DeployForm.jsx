import { useState } from 'react'
import { useDeploy } from '../hooks/useDeploy'
import { useGitHub } from '../hooks/useGitHub'
import RepoSearchBar from './RepoSearchBar'
import RepoList from './RepoList'
import Spinner from './Spinner'
import ErrorAlert from './ErrorAlert'

export default function DeployForm({ onSuccess }) {
  const { deploy, isLoading, error, clearError } = useDeploy()
  const { repos, getRepos, clearRepos, isLoading: repoLoading, error: repoError } = useGitHub()

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
    await getRepos(username)
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
    clearError()

    const result = await deploy(
      selectedRepo.cloneUrl,
      form.appName,
      form.environment
    )

    if (result) {
      setForm({ appName: '', environment: 'production' })
      setSelectedRepo(null)
      clearRepos()
      if (onSuccess) onSuccess(result)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-5">
      <div>
        <h2 className="text-white font-semibold text-lg">New Deployment</h2>
        <p className="text-gray-400 text-sm mt-1">
          Search your GitHub repos and deploy instantly
        </p>
      </div>

      {(error || repoError) && (
        <ErrorAlert message={error || repoError} onDismiss={clearError} />
      )}

      <RepoSearchBar
        onSearch={handleSearch}
        onClear={() => { clearRepos(); setSelectedRepo(null); setSearched(false) }}
        isLoading={repoLoading}
      />

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
          disabled={isLoading || !selectedRepo}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? <Spinner size="sm" text="" /> : '🚀 Deploy Now'}
        </button>

        {!selectedRepo && (
          <p className="text-gray-600 text-xs text-center">
            Search and select a repo above to enable deployment
          </p>
        )}
      </form>
    </div>
  )
}
