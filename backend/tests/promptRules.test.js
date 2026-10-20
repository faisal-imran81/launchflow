import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { detectStack } from '../src/utils/detectStack.js'
import { getWorkflowRules } from '../src/utils/workflowRules.js'

const load = (name) =>
  JSON.parse(readFileSync(new URL(`./fixtures/stacks/${name}.json`, import.meta.url), 'utf8'))

const analysis = (fixture) => {
  const pkg = load(fixture)
  return { ...detectStack(pkg), repoName: pkg.name }
}

const COMMON_PHRASES = [
  'actions/checkout@v4',
  'actions/setup-node@v4',
  'Node.js version 20',
  'npm ci',
  'npm test --if-present',
]

const DOCKER_PHRASES = [
  'docker/login-action@v3',
  'docker/build-push-action@v5',
  'DOCKER_USERNAME',
  'DOCKER_PASSWORD',
  'github.sha',
]

const ALL_FIXTURES = [
  'vite-react', 'vite-vue', 'vite-vanilla', 'cra-app', 'next-app',
  'express-api', 'fastify-api', 'koa-api', 'nestjs-api', 'plain-node',
]

const FRONTEND_FIXTURES = ['vite-react', 'vite-vue', 'vite-vanilla', 'cra-app']
const BACKEND_FIXTURES  = ['express-api', 'fastify-api', 'koa-api', 'nestjs-api', 'plain-node']

describe('getWorkflowRules per stack — common CI and Docker phrases', () => {
  for (const fixture of ALL_FIXTURES) {
    it(`${fixture}: contains all common CI phrases`, () => {
      const rules = getWorkflowRules(analysis(fixture))
      for (const phrase of COMMON_PHRASES) {
        assert.ok(rules.includes(phrase), `${fixture}: missing common phrase "${phrase}"`)
      }
    })

    it(`${fixture}: contains all Docker phrases`, () => {
      const rules = getWorkflowRules(analysis(fixture))
      for (const phrase of DOCKER_PHRASES) {
        assert.ok(rules.includes(phrase), `${fixture}: missing Docker phrase "${phrase}"`)
      }
    })
  }
})

describe('getWorkflowRules per stack — build step rule', () => {
  for (const fixture of FRONTEND_FIXTURES) {
    it(`${fixture}: uses required "npm run build" with no --if-present`, () => {
      const rules = getWorkflowRules(analysis(fixture))
      assert.ok(rules.includes('npm run build'), `${fixture}: missing "npm run build"`)
      assert.ok(
        !rules.includes('npm run build --if-present'),
        `${fixture}: frontend must not use --if-present`
      )
    })
  }

  it('next-app: uses required "npm run build" with no --if-present', () => {
    const rules = getWorkflowRules(analysis('next-app'))
    assert.ok(rules.includes('npm run build'))
    assert.ok(!rules.includes('npm run build --if-present'))
  })

  for (const fixture of BACKEND_FIXTURES) {
    it(`${fixture}: uses "npm run build --if-present"`, () => {
      const rules = getWorkflowRules(analysis(fixture))
      assert.ok(
        rules.includes('npm run build --if-present'),
        `${fixture}: missing --if-present in build step`
      )
    })
  }
})

describe('getWorkflowRules per stack — framework name in build rule', () => {
  const frameworkCases = [
    ['vite-react',   'React (Vite)'],
    ['vite-vue',     'Vue (Vite)'],
    ['vite-vanilla', 'Vite'],
    ['cra-app',      'React (CRA)'],
    ['next-app',     'Next.js'],
  ]

  for (const [fixture, framework] of frameworkCases) {
    it(`${fixture}: build rule mentions the framework "${framework}"`, () => {
      const rules = getWorkflowRules(analysis(fixture))
      assert.ok(rules.includes(framework), `Expected "${framework}" in rules for ${fixture}`)
    })
  }
})

describe('getWorkflowRules per stack — image tag uses repoName', () => {
  const tagCases = [
    ['vite-react', 'vite-react-app'],
    ['express-api', 'express-api'],
    ['next-app',    'next-app'],
    ['nestjs-api',  'nestjs-api'],
  ]

  for (const [fixture, slug] of tagCases) {
    it(`${fixture}: image tag contains slug "${slug}"`, () => {
      const rules = getWorkflowRules(analysis(fixture))
      assert.ok(rules.includes(slug), `Expected slug "${slug}" in rules for ${fixture}`)
    })
  }

  it('every fixture has both :latest and :github.sha tags', () => {
    for (const fixture of ALL_FIXTURES) {
      const rules = getWorkflowRules(analysis(fixture))
      assert.ok(rules.includes(':latest'),    `${fixture}: missing :latest tag`)
      assert.ok(rules.includes('github.sha'), `${fixture}: missing github.sha tag`)
    }
  })
})

describe('getWorkflowRules per stack — credential safety', () => {
  it('every fixture references DOCKER_USERNAME and DOCKER_PASSWORD as GitHub Secrets', () => {
    for (const fixture of ALL_FIXTURES) {
      const rules = getWorkflowRules(analysis(fixture))
      assert.ok(rules.includes('never hardcode'), `${fixture}: missing hardcode warning`)
      assert.ok(rules.includes('secrets.DOCKER_USERNAME'), `${fixture}: DOCKER_USERNAME not used as secret`)
    }
  })
})
