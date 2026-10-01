export const triggerDeploy = async (req, res) => {
  try {
    const { repoUrl, appName, environment } = req.body

    if (!repoUrl || !appName) {
      return res.status(400).json({ error: 'repoUrl and appName are required' })
    }

    res.status(200).json({
      success: true,
      message: 'Deployment triggered successfully',
      data: {
        id: Date.now(),
        repoUrl,
        appName,
        environment: environment || 'production',
        status: 'queued',
        createdAt: new Date().toISOString(),
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getDeployStatus = async (req, res) => {
  try {
    const { id } = req.params
    res.status(200).json({
      success: true,
      data: {
        id,
        status: 'running',
        currentStep: 'Generating Dockerfile',
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
