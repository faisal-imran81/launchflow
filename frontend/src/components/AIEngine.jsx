import { useState } from 'react'
import { useAI } from '../hooks/useAI'
import AutoDetectForm from './AutoDetectForm'
import ManualGenerateForm from './ManualGenerateForm'
import AIOutput from './AIOutput'

export default function AIEngine() {
  const [lastAutoRepo, setLastAutoRepo] = useState(null)
  const [lastAttempt, setLastAttempt] = useState(null)

  const {
    dockerfile,
    githubActionsYaml,
    autoResult,
    autoWorkflow,
    loading,
    error,
    generateDockerfile,
    generateGithubActions,
    generateAutoAll,
    clearError,
    reset,
  } = useAI()

  const hasOutput = Boolean(
    dockerfile || githubActionsYaml || autoResult || autoWorkflow || error
  )

  const activeKind = loading ? lastAttempt?.kind : null

  const handleAutoSubmit = (repo) => {
    setLastAutoRepo(repo)
    setLastAttempt({ kind: 'auto', payload: repo })
    generateAutoAll(repo)
  }

  const handleManualDockerfile = (info) => {
    setLastAttempt({ kind: 'dockerfile', payload: info })
    generateDockerfile(info)
  }

  const handleManualActions = (info) => {
    setLastAttempt({ kind: 'actions', payload: info })
    generateGithubActions(info)
  }

  const handleRegenerate = () => {
    if (!lastAutoRepo) return
    setLastAttempt({ kind: 'auto', payload: lastAutoRepo })
    generateAutoAll(lastAutoRepo)
  }

  const handleRetry = () => {
    if (!lastAttempt) return
    if (lastAttempt.kind === 'auto') generateAutoAll(lastAttempt.payload)
    if (lastAttempt.kind === 'dockerfile') generateDockerfile(lastAttempt.payload)
    if (lastAttempt.kind === 'actions') generateGithubActions(lastAttempt.payload)
  }

  const handleReset = () => {
    reset()
    setLastAutoRepo(null)
    setLastAttempt(null)
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6 space-y-6">
      <div>
        <h2 className="text-white font-semibold text-lg">🤖 AI Engine</h2>
        <p className="text-gray-400 text-sm mt-1">
          Generate Dockerfile, .dockerignore and GitHub Actions workflow for your repo
        </p>
      </div>

      <AutoDetectForm
        onSubmit={handleAutoSubmit}
        loading={loading}
        busy={activeKind === 'auto'}
      />

      <div className="border-t border-gray-700" />

      <ManualGenerateForm
        onGenerateDockerfile={handleManualDockerfile}
        onGenerateActions={handleManualActions}
        onReset={handleReset}
        showReset={hasOutput}
        loading={loading}
        busyKind={activeKind}
      />

      <AIOutput
        dockerfile={dockerfile}
        githubActionsYaml={githubActionsYaml}
        autoResult={autoResult}
        autoWorkflow={autoWorkflow}
        loading={loading}
        error={error}
        onRegenerate={lastAutoRepo ? handleRegenerate : null}
        onRetry={lastAttempt ? handleRetry : null}
        onDismissError={clearError}
      />
    </div>
  )
}
