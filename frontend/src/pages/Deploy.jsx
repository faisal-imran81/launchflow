import { useState } from 'react'

const deploymentSteps = [
  { id: 1, label: 'Analyzing repository structure', icon: '🔍' },
  { id: 2, label: 'Generating Dockerfile with AI', icon: '🐳' },
  { id: 3, label: 'Creating CI/CD pipeline', icon: '⚙️' },
  { id: 4, label: 'Deploying to AWS EC2', icon: '☁️' },
  { id: 5, label: 'Configuring Nginx & SSL', icon: '🔒' },
]

export default function Deploy() {
  const [repoUrl, setRepoUrl] = useState('')
  const [isDeploying, setIsDeploying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const handleDeploy = async (e) => {
    e.preventDefault()
    setIsDeploying(true)
    setCurrentStep(0)

    for (let i = 1; i <= deploymentSteps.length; i++) {
      await new Promise((res) => setTimeout(res, 1000))
      setCurrentStep(i)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Deploy App</h1>
        <p className="text-gray-400 text-sm mt-1">Paste your GitHub repo URL and let AI handle the rest</p>
      </div>

      {!isDeploying ? (
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
              {deploymentSteps.map((step) => (
                <li key={step.id} className="text-sm text-gray-400 flex items-center gap-2">
                  <span>{step.icon}</span>
                  <span>{step.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="submit"
            disabled={!repoUrl}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
          >
            🚀 Deploy Now
          </button>
        </form>
      ) : (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-6">
          <div>
            <h2 className="text-white font-semibold">Deploying your app...</h2>
            <p className="text-gray-400 text-xs mt-1">{repoUrl}</p>
          </div>

          <div className="space-y-3">
            {deploymentSteps.map((step, index) => {
              const stepNum = index + 1
              const isDone = currentStep > stepNum - 1
              const isActive = currentStep === stepNum - 1

              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isDone
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-gray-700 text-gray-500'
                  }`}>
                    {isDone ? '✓' : stepNum}
                  </div>
                  <span className={`text-sm ${isDone ? 'text-green-400' : isActive ? 'text-blue-400' : 'text-gray-500'}`}>
                    {step.icon} {step.label}
                  </span>
                </div>
              )
            })}
          </div>

          {currentStep >= deploymentSteps.length && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
              <p className="text-green-400 font-semibold">🎉 Deployment Successful!</p>
              <p className="text-gray-400 text-xs mt-1">Your app is live at</p>
              <a href="#" className="text-blue-400 text-sm hover:underline">https://my-app.launchflow.app</a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
