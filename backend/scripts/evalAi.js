import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { detectStack } from '../src/utils/detectStack.js'
import { validateDockerfile } from '../src/utils/validateDockerfile.js'
import { validateWorkflow } from '../src/utils/validateWorkflow.js'
import { generateDockerignore } from '../src/utils/generateDockerignore.js'
import { generateDockerfileFromStack, generateGithubActionsFromStack } from '../src/services/aiService.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

try {
  const { config } = await import('dotenv')
  config({ path: join(__dirname, '../.env') })
} catch {}

const FIXTURES_DIR = join(__dirname, '../tests/fixtures/stacks')
const OUT_DIR      = join(__dirname, '../eval-outputs')

mkdirSync(OUT_DIR, { recursive: true })

const ALL_FIXTURES = [
  'vite-react', 'vite-vue', 'vite-vanilla', 'cra-app', 'next-app',
  'express-api', 'fastify-api', 'koa-api', 'nestjs-api', 'plain-node',
]

const args        = process.argv.slice(2)
const JSON_MODE   = args.includes('--json')
const fixtureFlag = args.indexOf('--fixture')
const FIXTURES    = fixtureFlag !== -1 && args[fixtureFlag + 1]
  ? [args[fixtureFlag + 1]]
  : ALL_FIXTURES

if (!JSON_MODE) {
  console.log(`Running eval for: ${FIXTURES.join(', ')}`)
  console.log(`JSON output: ${JSON_MODE ? 'ON' : 'OFF'}`)
}

const results = []

for (const name of FIXTURES) {
  let pkg
  try {
    pkg = JSON.parse(readFileSync(join(FIXTURES_DIR, `${name}.json`), 'utf8'))
  } catch {
    if (!JSON_MODE) console.error(`ERROR: fixture "${name}" not found in ${FIXTURES_DIR}`)
    process.exitCode = 1
    continue
  }

  const analysis = { ...detectStack(pkg), repoName: pkg.name }

  if (!JSON_MODE) {
    console.log(`\n${'─'.repeat(60)}`)
    console.log(`FIXTURE: ${name}  (${analysis.framework}, ${analysis.type})`)
    console.log('─'.repeat(60))
  }

  const row = { fixture: name, framework: analysis.framework, type: analysis.type }

  try {
    if (!JSON_MODE) console.log('  Generating Dockerfile...')
    const dockerfile = await generateDockerfileFromStack(analysis)
    writeFileSync(join(OUT_DIR, `${name}.Dockerfile`), dockerfile, 'utf8')
    const { valid, errors, warnings } = validateDockerfile(dockerfile)
    row.dockerfileValid    = valid
    row.dockerfileErrors   = errors
    row.dockerfileWarnings = warnings
    if (!JSON_MODE) {
      console.log(`  Dockerfile: ${valid ? '✅ valid' : '❌ invalid'} — ${errors.length} error(s), ${warnings.length} warning(s)`)
      for (const e of errors)   console.error(`    ERROR: ${e}`)
      for (const w of warnings) console.warn(`    WARN:  ${w}`)
    }

    const dockerignore = generateDockerignore(analysis.type)
    writeFileSync(join(OUT_DIR, `${name}.dockerignore`), dockerignore, 'utf8')
    if (!JSON_MODE) console.log(`  .dockerignore: ✅ generated (${dockerignore.split('\n').filter(Boolean).length} rules)`)
  } catch (err) {
    row.dockerfileValid    = false
    row.dockerfileErrors   = [err.message]
    row.dockerfileWarnings = []
    if (!JSON_MODE) console.error(`  Dockerfile generation FAILED: ${err.message}`)
  }

  try {
    if (!JSON_MODE) console.log('  Generating GitHub Actions workflow...')
    const workflow = await generateGithubActionsFromStack(analysis)
    writeFileSync(join(OUT_DIR, `${name}.workflow.yml`), workflow, 'utf8')
    const { valid, errors, warnings } = validateWorkflow(workflow)
    row.workflowValid    = valid
    row.workflowErrors   = errors
    row.workflowWarnings = warnings
    if (!JSON_MODE) {
      console.log(`  Workflow:   ${valid ? '✅ valid' : '❌ invalid'} — ${errors.length} error(s), ${warnings.length} warning(s)`)
      for (const e of errors)   console.error(`    ERROR: ${e}`)
      for (const w of warnings) console.warn(`    WARN:  ${w}`)
    }
  } catch (err) {
    row.workflowValid    = false
    row.workflowErrors   = [err.message]
    row.workflowWarnings = []
    if (!JSON_MODE) console.error(`  Workflow generation FAILED: ${err.message}`)
  }

  results.push(row)
}

if (JSON_MODE) {
  console.log(JSON.stringify(results, null, 2))
} else {
  console.log(`\n${'═'.repeat(60)}`)
  console.log('EVAL SUMMARY')
  console.log('═'.repeat(60))

  let dfPass = 0
  let wfPass = 0

  for (const r of results) {
    const df = r.dockerfileValid ? '✅' : '❌'
    const wf = r.workflowValid  ? '✅' : '❌'
    console.log(`  ${r.fixture.padEnd(22)} Dockerfile: ${df}   Workflow: ${wf}`)
    if (r.dockerfileValid) dfPass++
    if (r.workflowValid)   wfPass++
  }

  console.log('─'.repeat(60))
  console.log(`  Dockerfile : ${dfPass}/${results.length} passed`)
  console.log(`  Workflow   : ${wfPass}/${results.length} passed`)
  console.log(`  .dockerignore: ${results.length}/${results.length} generated`)
  console.log(`\n  Raw outputs saved to: backend/eval-outputs/`)
}
