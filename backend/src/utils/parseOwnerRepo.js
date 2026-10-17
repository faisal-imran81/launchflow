export function parseOwnerRepo(input) {
  if (!input || typeof input !== 'string') return null

  const trimmed = input.trim()

  // Handle full GitHub URLs
  const urlMatch = trimmed.match(/github\.com\/([^/]+)\/([^/\s]+?)(?:\.git)?$/)
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] }

  // Handle owner/repo format
  const slashMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/)
  if (slashMatch) return { owner: slashMatch[1], repo: slashMatch[2] }

  return null
}
