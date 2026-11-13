import { useState, useCallback } from 'react'
import { useAI } from '../hooks/useAI'
import AutoDetectForm from './AutoDetectForm'
import ManualGenerateForm from './ManualGenerateForm'
import AIOutput from './AIOutput'
import SuccessToast from './SuccessToast'

export default function AIEngine() {
  const [lastAutoRepo, setLastAutoRepo] = useState(null)
  const [lastAttempt, setLastAttempt] = useState(null)
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const {
    dockerfile,
    githubActionsYaml,
    nginxConfig,
    autoResult,
    autoWorkflow,
    loading,
    error,
    generateDockerfile,
    generateGithubActions,
    generateNginxConfig,
    generateAutoAll,
    clearError,
    reset,
  } = useAI()

  const hasOutput = Boolean(
    dockerfile || githubActionsYaml || nginxConfig || autoResult || autoWorkflow || error
  )

  const activeKind = loading ? lastAttempt?.kind : null

  const announce = async (request, message) => {
    const ok = await request
    if (ok) setToast(message)
  }

  const handleAutoSubmit = (repo) => {
    setLastAutoRepo(repo)
    setLastAttempt({ kind: 'auto', payload: repo })
    announce(generateAutoAll(repo), 'Dockerfile and workflow generated')
  }

  const handleManualDockerfile = (info) => {
    setLastAttempt({ kind: 'dockerfile', payload: info })
    announce(generateDockerfile(info), 'Dockerfile generated')
  }

  const handleManualActions = (info) => {
    setLastAttempt({ kind: 'actions', payload: info })
    announce(generateGithubActions(info), 'Workflow generated')
  }

  const handleManualNginx = (info) => {
    setLastAttempt({ kind: 'nginx', payload: info })
    announce(generateNginxConfig(info), 'Nginx config generated')
  }

  const handleRegenerate = () => {
    if (!lastAutoRepo) return
    setLastAttempt({ kind: 'auto', payload: lastAutoRepo })
    announce(generateAutoAll(lastAutoRepo), 'Dockerfile and workflow generated')
  }

  const handleRetry = () => {
    if (!lastAttempt) return
    if (lastAttempt.kind === 'auto') announce(generateAutoAll(lastAttempt.payload), 'Dockerfile and workflow generated')
    if (lastAttempt.kind === 'dockerfile') announce(generateDockerfile(lastAttempt.payload), 'Dockerfile generated')
    if (lastAttempt.kind === 'actions') announce(generateGithubActions(lastAttempt.payload), 'Workflow generated')
    if (lastAttempt.kind === 'nginx') announce(generateNginxConfig(lastAttempt.payload), 'Nginx config generated')
  }

  const handleReset = () => {
    reset()
    setLastAutoRepo(null)
    setLastAttempt(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AutoDetectForm
        onSubmit={handleAutoSubmit}
        loading={loading}
        busy={activeKind === 'auto'}
      />

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />

      <ManualGenerateForm
        onGenerateDockerfile={handleManualDockerfile}
        onGenerateActions={handleManualActions}
        onGenerateNginx={handleManualNginx}
        onReset={handleReset}
        showReset={hasOutput}
        loading={loading}
        busyKind={activeKind}
      />

      <AIOutput
        dockerfile={dockerfile}
        githubActionsYaml={githubActionsYaml}
        nginxConfig={nginxConfig}
        autoResult={autoResult}
        autoWorkflow={autoWorkflow}
        loading={loading}
        error={error}
        onRegenerate={lastAutoRepo ? handleRegenerate : null}
        onRetry={lastAttempt ? handleRetry : null}
        onDismissError={clearError}
      />

      <SuccessToast message={toast} onDismiss={dismissToast} />
    </div>
  )
}
