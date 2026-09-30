import { useState } from 'react'

export default function Deploy() {
  const [repoUrl, setRepoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDeploy = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Deploy App</h1>
        <p className="text-gray-400 text-sm mt-1">Paste your GitHub repo URL and let AI handle the rest</p>
      </div>

      <form onSubmit={handleDeploy} className="space-y-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-4">

          <div>
            <label className="text-sm text-gray-400 mb-1 block">GitHub Repository URL</label>
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">App Name</label>
            <input
              type="text"
              placeholder="my-awesome-app"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Environment</label>
            <select className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors">
              <option value="production">Production</option>
              <option value="staging">Staging</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-3">What AI will do automatically:</h2>
          <ul className="space-y-2">
            {[
              '🔍 Analyze your repository structure',
              '🐳 Generate optimized Dockerfile',
              '⚙️ Create GitHub Actions CI/CD pipeline',
              '☁️ Deploy to AWS EC2',
              '🌐 Provide live deployment URL',
            ].map((item) => (
              <li key={item} className="text-sm text-gray-400 flex items-center gap-2">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          disabled={isLoading || !repoUrl}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
        >
          {isLoading ? '⏳ Preparing deployment...' : '🚀 Deploy Now'}
        </button>
      </form>
    </div>
  )
}
