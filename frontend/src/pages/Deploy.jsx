import { useState } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useHistory } from '../hooks/useHistory'
import { useAI } from '../hooks/useAI'
import DeployForm from '../components/DeployForm'
import DeploymentCard from '../components/DeploymentCard'
import SkeletonCard from '../components/SkeletonCard'
import EmptyState from '../components/EmptyState'
import SuccessToast from '../components/SuccessToast'
import AIOutput from '../components/AIOutput'

function parseRepoInput(value) {
  const cleaned = value
    .trim()
    .replace(/^https?:\/\/github\.com\//, '')
    .replace(/\.git$/, '')
    .replace(/\/$/, '')
  const parts = cleaned.split('/')
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null
  return { owner: parts[0], repo: parts[1] }
}

export default function Deploy() {
  usePageTitle('Deploy')
  const { deployments, fetchDeployments, isLoading } = useHistory()
  const [toastMessage, setToastMessage] = useState('')
  const [repoInfo, setRepoInfo] = useState({ repoName: '', language: '', framework: '' })
  const [autoRepoInput, setAutoRepoInput] = useState('')
  const {
    dockerfile,
    githubActionsYaml,
    autoResult,
    loading: aiLoading,
    error: aiError,
    generateDockerfile,
    generateGithubActions,
    generateAutoDockerfile,
    reset,
  } = useAI()

  const parsedAutoRepo = parseRepoInput(autoRepoInput)

  const handleSuccess = async (result) => {
    const newProject = result.data?.project
    if (newProject) {
      setToastMessage(`🚀 ${newProject.name} deployed successfully!`)
      await fetchDeployments()
    }
  }

  const handleAutoDetect = () => {
    if (!parsedAutoRepo) return
    generateAutoDockerfile(parsedAutoRepo)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Deploy</h1>
        <p className="text-gray-400 text-sm mt-1">
          Trigger a new deployment for your app
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeployForm onSuccess={handleSuccess} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Recent Deployments</h2>
            <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
              {isLoading ? '...' : `${deployments.length} total`}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} rows={2} />
              ))}
            </div>
          ) : deployments.length === 0 ? (
            <EmptyState
              icon="🚀"
              title="No deployments yet"
              description="Fill the form and hit Deploy Now to get started"
            />
          ) : (
            <div className="space-y-3">
              {deployments.slice(0, 5).map((deployment) => (
                <DeploymentCard
                  key={deployment.id}
                  deployment={deployment}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Engine Section */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-white font-semibold text-lg">🤖 AI Engine</h2>
          <p className="text-gray-400 text-sm mt-1">
            Generate Dockerfile + GitHub Actions YAML for your repo
          </p>
        </div>

        {/* Auto-detect */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300">🔍 Auto-detect from GitHub</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="owner/repo (e.g. faisal-imran81/my-app)"
              value={autoRepoInput}
              onChange={(e) => setAutoRepoInput(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleAutoDetect}
              disabled={aiLoading || !parsedAutoRepo}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
            >
              🔍 Auto-detect & Generate
            </button>
          </div>
          {autoRepoInput && !parsedAutoRepo && (
            <p className="text-xs text-yellow-500">
              Format should be owner/repo (or a full GitHub URL)
            </p>
          )}
        </div>

        <div className="border-t border-gray-700" />

        {/* Manual */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300">✍️ Or enter details manually</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Repo name"
              value={repoInfo.repoName}
              onChange={(e) => setRepoInfo({ ...repoInfo, repoName: e.target.value })}
              className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Language (e.g. JavaScript)"
              value={repoInfo.language}
              onChange={(e) => setRepoInfo({ ...repoInfo, language: e.target.value })}
              className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Framework (e.g. React)"
              value={repoInfo.framework}
              onChange={(e) => setRepoInfo({ ...repoInfo, framework: e.target.value })}
              className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => generateDockerfile(repoInfo)}
              disabled={aiLoading || !repoInfo.repoName}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
            >
              🐳 Generate Dockerfile
            </button>
            <button
              onClick={() => generateGithubActions(repoInfo)}
              disabled={aiLoading || !repoInfo.repoName}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
            >
              ⚙️ Generate GitHub Actions
            </button>
            {(dockerfile || githubActionsYaml || autoResult || aiError) && (
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <AIOutput
          dockerfile={dockerfile}
          githubActionsYaml={githubActionsYaml}
          autoResult={autoResult}
          loading={aiLoading}
          error={aiError}
        />
      </div>

      <SuccessToast
        message={toastMessage}
        onDismiss={() => setToastMessage('')}
      />
    </div>
  )
}
