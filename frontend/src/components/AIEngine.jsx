import { useState } from 'react'
import { useAI } from '../hooks/useAI'
import AutoDetectForm from './AutoDetectForm'
import ManualGenerateForm from './ManualGenerateForm'
import AIOutput from './AIOutput'

export default function AIEngine() {
  const [lastAutoRepo, setLastAutoRepo] = useState(null)

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
    reset,
  } = useAI()

  const hasOutput = Boolean(
    dockerfile || githubActionsYaml || autoResult || autoWorkflow || error
  )

  const handleAutoSubmit = (repo) => {
    setLastAutoRepo(repo)
    generateAutoAll(repo)
  }

  const handleRegenerate = () => {
    if (lastAutoRepo) generateAutoAll(lastAutoRepo)
  }

  const handleReset = () => {
    reset()
    setLastAutoRepo(null)
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-white font-semibold text-lg">🤖 AI Engine</h2>
        <p className="text-gray-400 text-sm mt-1">
          Generate Dockerfile, .dockerignore and GitHub Actions workflow for your repo
        </p>
      </div>

      <AutoDetectForm onSubmit={handleAutoSubmit} loading={loading} />

      <div className="border-t border-gray-700" />

      <ManualGenerateForm
        onGenerateDockerfile={generateDockerfile}
        onGenerateActions={generateGithubActions}
        onReset={handleReset}
        showReset={hasOutput}
        loading={loading}
      />

      <AIOutput
        dockerfile={dockerfile}
        githubActionsYaml={githubActionsYaml}
        autoResult={autoResult}
        autoWorkflow={autoWorkflow}
        loading={loading}
        error={error}
        onRegenerate={lastAutoRepo ? handleRegenerate : null}
      />
    </div>
  )
}
