import { useState } from 'react'
import { useDeploy } from '../hooks/useDeploy'
import Spinner from './Spinner'
import ErrorAlert from './ErrorAlert'

export default function DeployForm({ onSuccess }) {
  const { deploy, isLoading, error, clearError } = useDeploy()

  const [form, setForm] = useState({
    appName: '',
    repoUrl: '',
    environment: 'production',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    const result = await deploy(form.repoUrl, form.appName, form.environment)
    if (result) {
      setForm({ appName: '', repoUrl: '', environment: 'production' })
      if (onSuccess) onSuccess(result)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-5">
      <div>
        <h2 className="text-white font-semibold text-lg">New Deployment</h2>
        <p className="text-gray-400 text-sm mt-1">Fill in the details to trigger a deployment</p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={clearError} />}

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
          <label className="text-gray-400 text-sm">Repository URL</label>
          <input
            type="url"
            name="repoUrl"
            value={form.repoUrl}
            onChange={handleChange}
            placeholder="https://github.com/username/repo"
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
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? <Spinner size="sm" text="" /> : '🚀 Deploy Now'}
        </button>
      </form>
    </div>
  )
}
