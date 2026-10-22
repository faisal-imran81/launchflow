import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { detectStack } from '../src/utils/detectStack.js'
import { validateDockerfile } from '../src/utils/validateDockerfile.js'
import { validateWorkflow } from '../src/utils/validateWorkflow.js'
import { generateDockerfileFromStack, generateGithubActionsFromStack } from '../src/services/aiService.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

try {
  const { config } = await import('dotenv')
  config({ path: join(__dirname, '../.env') })
} catch {}

const GITHUB_USER = process.env.GITHUB_USER || 'faisal-imran81'
const GENERATE    = process.argv.includes('--generate')
const OUT_DIR     = join(__dirname, '../eval-outputs/real-repos')

mkdirSync(OUT_DIR, { recursive: true })

async function ghFetch(url) {
  const headers = { 'User-Agent': 'launchflow-eval' }
  if (process.env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${url}`)
  return res.json()
}

console.log(`\nFetching public repos for: ${GITHUB_USER}`)
console.log(`AI generation: ${GENERATE ? 'ON (--generate flag set)' : 'OFF (pass --generate to enable)'}`)
console.log('─'.repeat(60))

let repos
try {
  repos = await ghFetch(
    `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`
  )
} catch (err) {
  console.error(`Failed to fetch repos: ${err.message}`)
  process.exit(1)
}

const results = []

for (const repo of repos) {
  if (repo.fork) continue
  if (repo.archived) continue

  const pkgUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${repo.name}/HEAD/package.json`

  let pkg = null
  try {
    const res = await fetch(pkgUrl, { headers: { 'User-Agent': 'launchflow-eval' } })
    if (res.ok) pkg = await res.json()
  } catch {}

  if (!pkg) {
    console.log(`  SKIP  ${repo.name.padEnd(30)} — no package.json`)
    continue
  }

  const analysis = { ...detectStack(pkg), repoName: repo.name }
  const row = {
    repo: repo.name,
    framework: analysis.framework,
    type: analysis.type,
    dockerfileValid: null,
    dockerfileErrors: [],
    dockerfileWarnings: [],
    workflowValid: null,
    workflowErrors: [],
    workflowWarnings: [],
  }

  console.log(`\n${'─'.repeat(60)}`)
  console.log(`REPO: ${repo.name}  (${analysis.framework}, ${analysis.type})`)
  console.log('─'.repeat(60))

  if (GENERATE) {
    try {
      console.log('  Generating Dockerfile...')
      const dockerfile = await generateDockerfileFromStack(analysis)
      writeFileSync(join(OUT_DIR, `${repo.name}.Dockerfile`), dockerfile, 'utf8')
      const { valid, errors, warnings } = validateDockerfile(dockerfile)
      Object.assign(row, { dockerfileValid: valid, dockerfileErrors: errors, dockerfileWarnings: warnings })
      console.log(`  Dockerfile: ${valid ? '✅ valid' : '❌ invalid'} — ${errors.length} error(s), ${warnings.length} warning(s)`)
      for (const e of errors)   console.error(`    ERROR: ${e}`)
      for (const w of warnings) console.warn(`    WARN:  ${w}`)
    } catch (err) {
      row.dockerfileValid = false
      row.dockerfileErrors = [err.message]
      console.error(`  Dockerfile FAILED: ${err.message}`)
    }

    try {
      console.log('  Generating Workflow...')
      const workflow = await generateGithubActionsFromStack(analysis)
      writeFileSync(join(OUT_DIR, `${repo.name}.workflow.yml`), workflow, 'utf8')
      const { valid, errors, warnings } = validateWorkflow(workflow)
      Object.assign(row, { workflowValid: valid, workflowErrors: errors, workflowWarnings: warnings })
      console.log(`  Workflow:   ${valid ? '✅ valid' : '❌ invalid'} — ${errors.length} error(s), ${warnings.length} warning(s)`)
      for (const e of errors)   console.error(`    ERROR: ${e}`)
      for (const w of warnings) console.warn(`    WARN:  ${w}`)
    } catch (err) {
      row.workflowValid = false
      row.workflowErrors = [err.message]
      console.error(`  Workflow FAILED: ${err.message}`)
    }
  } else {
    console.log(`  detectStack → framework: ${analysis.framework}, type: ${analysis.type}, port: ${analysis.port}, startCommand: ${analysis.startCommand}`)
  }

  results.push(row)
}

console.log(`\n${'═'.repeat(60)}`)
console.log(`REAL REPOS SUMMARY  (${GITHUB_USER})`)
console.log('═'.repeat(60))

if (results.length === 0) {
  console.log('  No JS repos with package.json found.')
} else {
  for (const r of results) {
    if (GENERATE) {
      const df = r.dockerfileValid === true ? '✅' : r.dockerfileValid === false ? '❌' : '—'
      const wf = r.workflowValid   === true ? '✅' : r.workflowValid   === false ? '❌' : '—'
      console.log(`  ${r.repo.padEnd(30)} Dockerfile: ${df}   Workflow: ${wf}  [${r.framework}]`)
    } else {
      console.log(`  ${r.repo.padEnd(30)} ${r.framework.padEnd(18)} ${r.type}`)
    }
  }
}

console.log(`\n  Total JS repos checked: ${results.length}`)
if (GENERATE) console.log(`  Raw outputs saved to: backend/eval-outputs/real-repos/`)
