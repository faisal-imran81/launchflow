import { useState } from 'react'
import DeployForm from '../components/DeployForm'
import DeploymentCard from '../components/DeploymentCard'
import EmptyState from '../components/EmptyState'
import SuccessToast from '../components/SuccessToast'
import Spinner from '../components/Spinner'
import { useHistory } from '../hooks/useHistory'

export default function Deploy() {
  const { deployments, fetchDeployments, isLoading } = useHistory()
  const [toastMessage, setToastMessage] = useState('')

  const handleSuccess = async (result) => {
    const newProject = result.data?.project
    if (newProject) {
      setToastMessage(`🚀 ${newProject.name} deployed successfully!`)
      await fetchDeployments()
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
            <h2 className="text-white font-semibold">Recent Deployments</h2>
            <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
              {deployments.length} total
            </span>
          </div>

          {isLoading ? (
            <div className="py-10">
              <Spinner text="Loading deployments..." />
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

      <SuccessToast
        message={toastMessage}
        onDismiss={() => setToastMessage('')}
      />
    </div>
  )
}
