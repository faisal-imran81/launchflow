import supabase from '../config/supabase.js'

export const fetchAllProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export const fetchProjectById = async (id) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const createNewProject = async ({ name, repoUrl, environment }) => {
  const { data, error } = await supabase
    .from('projects')
    .insert([{ name, repo_url: repoUrl, environment }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const removeProject = async (id) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return { success: true }
}
