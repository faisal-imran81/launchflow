import supabase from '../config/supabase.js'

export const fetchAllDeployments = async () => {
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

export const fetchDeploymentById = async (id) => {
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
