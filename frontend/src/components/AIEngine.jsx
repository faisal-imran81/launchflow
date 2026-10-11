import { useAI } from '../hooks/useAI'
import AutoDetectForm from './AutoDetectForm'
import ManualGenerateForm from './ManualGenerateForm'
import AIOutput from './AIOutput'

export default function AIEngine() {
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

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-white font-semibold text-lg">🤖 AI Engine</h2>
        <p className="text-gray-400 text-sm mt-1">
          Generate Dockerfile, .dockerignore and GitHub Actions workflow for your repo
        </p>
      </div>

      <AutoDetectForm onSubmit={generateAutoAll} loading={loading} />

      <div className="border-t border-gray-700" />

      <ManualGenerateForm
        onGenerateDockerfile={generateDockerfile}
        onGenerateActions={generateGithubActions}
        onReset={reset}
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
      />
    </div>
  )
}
