import supabase from '../config/supabase.js'

export const createDeployment = async ({ projectId, status = 'queued' }) => {
  const { data, error } = await supabase
    .from('deployments')
    .insert([{ project_id: projectId, status }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const getAllDeployments = async () => {
  const { data, error } = await supabase
    .from('deployments')
    .select(`
      *,
      projects (
        id,
        name,
        repo_url,
        environment
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export const getDeploymentById = async (id) => {
  const { data, error } = await supabase
    .from('deployments')
    .select(`
      *,
      projects (
        id,
        name,
        repo_url,
        environment
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const updateDeploymentStatus = async (id, status, logs = null) => {
  const updates = { status }
  if (logs) updates.logs = logs
  if (status === 'success' || status === 'failed') {
    updates.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('deployments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
