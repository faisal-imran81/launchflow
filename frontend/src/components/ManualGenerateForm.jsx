import { useState } from 'react'

const inputClass =
  'bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500'

export default function ManualGenerateForm({
  onGenerateDockerfile,
  onGenerateActions,
  onReset,
  showReset,
  loading,
  busyKind,
}) {
  const [repoInfo, setRepoInfo] = useState({
    repoName: '',
    language: '',
    framework: '',
  })

  const updateField = (field) => (e) =>
    setRepoInfo({ ...repoInfo, [field]: e.target.value })

  const canGenerate = !loading && repoInfo.repoName.trim() !== ''

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-300">✍️ Or enter details manually</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Repo name"
          value={repoInfo.repoName}
          onChange={updateField('repoName')}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="Language (e.g. JavaScript)"
          value={repoInfo.language}
          onChange={updateField('language')}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="Framework (e.g. React)"
          value={repoInfo.framework}
          onChange={updateField('framework')}
          className={inputClass}
        />
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => onGenerateDockerfile(repoInfo)}
          disabled={!canGenerate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
        >
          {busyKind === 'dockerfile' ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </span>
          ) : (
            '🐳 Generate Dockerfile'
          )}
        </button>
        <button
          onClick={() => onGenerateActions(repoInfo)}
          disabled={!canGenerate}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
        >
          {busyKind === 'actions' ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </span>
          ) : (
            '⚙️ Generate GitHub Actions'
          )}
        </button>
        {showReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
