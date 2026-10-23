import { useState } from 'react'

const LIMITS = { repoName: 100, language: 50, framework: 50, description: 500 }

const inputClass =
  'bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500'

const warnClass =
  'bg-gray-900 border border-yellow-500 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400'

function LimitedInput({ field, value, onChange, placeholder, className }) {
  const max = LIMITS[field]
  const over = value.length > max
  return (
    <div className="space-y-0.5">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        maxLength={max + 20}
        className={`${className} ${over ? warnClass : inputClass} w-full`}
      />
      {over && (
        <p className="text-xs text-yellow-400">
          Max {max} characters ({value.length - max} over)
        </p>
      )}
    </div>
  )
}

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
    description: '',
  })

  const updateField = (field, value) =>
    setRepoInfo((prev) => ({ ...prev, [field]: value }))

  const hasOverLimit = Object.entries(LIMITS).some(
    ([key, max]) => (repoInfo[key] || '').length > max
  )

  const canGenerate = !loading && repoInfo.repoName.trim() !== '' && !hasOverLimit

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-300">✍️ Or enter details manually</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <LimitedInput
          field="repoName"
          value={repoInfo.repoName}
          onChange={updateField}
          placeholder="Repo name *"
        />
        <LimitedInput
          field="language"
          value={repoInfo.language}
          onChange={updateField}
          placeholder="Language (e.g. JavaScript)"
        />
        <LimitedInput
          field="framework"
          value={repoInfo.framework}
          onChange={updateField}
          placeholder="Framework (e.g. React)"
        />
      </div>

      <LimitedInput
        field="description"
        value={repoInfo.description}
        onChange={updateField}
        placeholder="Description (optional — helps the AI generate a better Dockerfile)"
      />

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
