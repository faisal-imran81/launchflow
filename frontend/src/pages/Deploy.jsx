import { useState } from 'react'
import DeployForm from '../components/DeployForm'
import DeploymentCard from '../components/DeploymentCard'
import EmptyState from '../components/EmptyState'

export default function Deploy() {
  const [recentDeployments, setRecentDeployments] = useState([])

  const handleSuccess = (result) => {
    const newDeployment = result.data?.deployment
    const newProject = result.data?.project

    if (newDeployment && newProject) {
      setRecentDeployments((prev) => [
        { ...newDeployment, projects: newProject },
        ...prev,
      ])
    }
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
            <h2 className="text-white font-semibold">This Session</h2>
            <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
              {recentDeployments.length} deployed
            </span>
          </div>

          {recentDeployments.length === 0 ? (
            <EmptyState
              icon="🚀"
              title="No deployments yet"
              description="Fill the form and hit Deploy Now to get started"
            />
          ) : (
            <div className="space-y-3">
              {recentDeployments.map((deployment) => (
                <DeploymentCard
                  key={deployment.id}
                  deployment={deployment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
