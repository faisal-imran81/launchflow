export function parseRepoInput(value) {
  const cleaned = value
    .trim()
    .replace(/^https?:\/\/github\.com\//, '')
    .replace(/\/$/, '')
    .replace(/\.git$/, '')

  const parts = cleaned.split('/')
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null

  return { owner: parts[0], repo: parts[1] }
}
