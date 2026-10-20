import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { validateWorkflow } from '../src/utils/validateWorkflow.js'

const df = (...lines) => lines.join('\n')
const FENCE = '`'.repeat(3)
const CHECKOUT = '      - uses: actions/checkout@v4'
const HEAD = [
  'name: CI',
  'on: push',
  'jobs:',
  '  build:',
  '    runs-on: ubuntu-latest',
  '    steps:',
]
const wf = (...extra) => df(...HEAD, ...extra)

describe('validateWorkflow', () => {
  describe('input handling', () => {
    it('returns the { valid, errors, warnings } shape', () => {
      const result = validateWorkflow(wf(CHECKOUT))
      assert.deepEqual(Object.keys(result).sort(), ['errors', 'valid', 'warnings'])
      assert.ok(Array.isArray(result.errors))
      assert.ok(Array.isArray(result.warnings))
    })

    const emptyCases = [
      ['an empty string', ''],
      ['whitespace-only text', '  \n\t \n'],
      ['null', null],
      ['undefined', undefined],
      ['a number', 42],
      ['an object', {}],
    ]

    for (const [label, input] of emptyCases) {
      it(`rejects ${label} without throwing`, () => {
        const result = validateWorkflow(input)
        assert.equal(result.valid, false)
        assert.deepEqual(result.errors, ['Workflow is empty'])
        assert.deepEqual(result.warnings, [])
      })
    }

    it('rejects output that still contains markdown code fences', () => {
      const result = validateWorkflow(df(FENCE + 'yaml', 'name: CI', FENCE))
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, ['Workflow contains markdown code fences'])
    })
  })

  describe('valid workflows', () => {
    it('accepts a basic Node CI workflow with no errors or warnings', () => {
      const result = validateWorkflow(
        df(
          'name: CI',
          'on:',
          '  push:',
          '    branches: [main]',
          'jobs:',
          '  build:',
          '    runs-on: ubuntu-latest',
          '    steps:',
          '      - uses: actions/checkout@v4',
          '      - uses: actions/setup-node@v4',
          '        with:',
          '          node-version: 20',
          '      - run: npm ci',
          '      - run: npm test --if-present'
        )
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.errors, [])
      assert.deepEqual(result.warnings, [])
    })

    it('accepts a Docker build and push workflow that uses GitHub Secrets', () => {
      const result = validateWorkflow(
        df(
          'name: Docker CI',
          'on:',
          '  push:',
          '    branches: [main]',
          'jobs:',
          '  docker:',
          '    runs-on: ubuntu-latest',
          '    steps:',
          '      - uses: actions/checkout@v4',
          '      - uses: docker/login-action@v3',
          '        with:',
          '          username: ${{ secrets.DOCKERHUB_USERNAME }}',
          '          password: ${{ secrets.DOCKERHUB_TOKEN }}',
          '      - uses: docker/build-push-action@v6',
          '        with:',
          '          push: true',
          '          tags: user/app:latest'
        )
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.errors, [])
      assert.deepEqual(result.warnings, [])
    })

    it('handles Windows (CRLF) line endings', () => {
      const result = validateWorkflow([...HEAD, CHECKOUT].join('\r\n'))
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, [])
    })

    it('ignores comments and the YAML document marker', () => {
      const result = validateWorkflow(df('---', '# CI pipeline', ...HEAD, CHECKOUT))
      assert.equal(result.valid, true)
      assert.deepEqual(result.errors, [])
      assert.deepEqual(result.warnings, [])
    })

    it('accepts a quoted "on" key', () => {
      const result = validateWorkflow(
        df(
          'name: CI',
          '"on":',
          '  push:',
          'jobs:',
          '  build:',
          '    runs-on: ubuntu-latest',
          '    steps:',
          CHECKOUT
        )
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, [])
    })

    it('does not warn for local actions or docker:// references', () => {
      const result = validateWorkflow(
        wf(
          CHECKOUT,
          '      - uses: ./.github/actions/setup',
          '      - uses: docker://alpine:3.20'
        )
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, [])
    })

    it('reads quoted action references', () => {
      const result = validateWorkflow(
        wf(CHECKOUT, '      - uses: "actions/setup-node@v4"')
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, [])
    })
  })

  describe('structure rules', () => {
    it('only warns when the workflow has no name', () => {
      const result = validateWorkflow(
        df('on: push', 'jobs:', '  build:', '    runs-on: ubuntu-latest', '    steps:', CHECKOUT)
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, ['Workflow has no "name"'])
    })

    it('flags a workflow with no on trigger', () => {
      const result = validateWorkflow(
        df('name: CI', 'jobs:', '  build:', '    runs-on: ubuntu-latest', '    steps:', CHECKOUT)
      )
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, ['Workflow has no "on" trigger'])
    })

    it('flags a workflow with no jobs section', () => {
      const result = validateWorkflow(df('name: CI', 'on: push'))
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, ['Workflow has no "jobs" section'])
    })

    it('flags an empty jobs section', () => {
      const result = validateWorkflow(df('name: CI', 'on: push', 'jobs:'))
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, ['No jobs defined under jobs'])
    })

    it('flags a job with no runs-on', () => {
      const result = validateWorkflow(
        df('name: CI', 'on: push', 'jobs:', '  build:', '    steps:', CHECKOUT)
      )
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, ['Job "build" has no runs-on'])
    })

    it('flags a job with no steps', () => {
      const result = validateWorkflow(
        df('name: CI', 'on: push', 'jobs:', '  build:', '    runs-on: ubuntu-latest')
      )
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, ['Job "build" has no steps'])
    })

    it('checks every job separately', () => {
      const result = validateWorkflow(
        df(
          'name: CI',
          'on: push',
          'jobs:',
          '  test:',
          '    runs-on: ubuntu-latest',
          '    steps:',
          CHECKOUT,
          '  deploy:',
          '    steps:',
          CHECKOUT
        )
      )
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, ['Job "deploy" has no runs-on'])
    })

    it('rejects plain English prose instead of a workflow', () => {
      const result = validateWorkflow('Here is your workflow for the project')
      assert.equal(result.valid, false)
      assert.ok(
        result.errors.some((e) => e.startsWith('Line 1 is not valid workflow YAML'))
      )
    })

    it('flags tab indentation', () => {
      const result = validateWorkflow(wf(CHECKOUT, '\t- run: echo hi'))
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, [
        'Workflow uses tab indentation (YAML requires spaces)',
      ])
    })

    it('collects several errors at once', () => {
      const result = validateWorkflow(
        df('jobs:', '  build:', '    steps:', CHECKOUT)
      )
      assert.equal(result.valid, false)
      assert.equal(result.errors.length, 2)
      assert.ok(result.errors.includes('Workflow has no "on" trigger'))
      assert.ok(result.errors.includes('Job "build" has no runs-on'))
    })
  })

  describe('action warnings', () => {
    it('warns when an action has no version', () => {
      const result = validateWorkflow(wf(CHECKOUT, '      - uses: some/action'))
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, ['Action "some/action" has no version'])
    })

    for (const branch of ['main', 'master', 'latest']) {
      it(`warns when an action is pinned to @${branch}`, () => {
        const result = validateWorkflow(wf(CHECKOUT, `      - uses: some/action@${branch}`))
        assert.equal(result.valid, true)
        assert.deepEqual(result.warnings, [
          `Action "some/action@${branch}" is not pinned to a version`,
        ])
      })
    }

    it('warns when actions/checkout has no version', () => {
      const result = validateWorkflow(wf('      - uses: actions/checkout'))
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, ['Action "actions/checkout" has no version'])
    })

    it('warns when there is no actions/checkout step', () => {
      const result = validateWorkflow(wf('      - run: npm ci'))
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, ['No actions/checkout step found'])
    })
  })

  describe('docker login warning', () => {
    it('warns when an image is pushed without docker/login-action', () => {
      const result = validateWorkflow(
        wf(CHECKOUT, '      - uses: docker/build-push-action@v6')
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, [
        'Image is built and pushed without docker/login-action',
      ])
    })

    it('does not warn when docker/login-action is present', () => {
      const result = validateWorkflow(
        wf(
          CHECKOUT,
          '      - uses: docker/login-action@v3',
          '      - uses: docker/build-push-action@v6'
        )
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, [])
    })
  })

  describe('hardcoded secret detection', () => {
    it('flags a hardcoded password', () => {
      const result = validateWorkflow(
        wf(
          CHECKOUT,
          '      - uses: docker/login-action@v3',
          '        with:',
          '          password: hunter2'
        )
      )
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, ['Possible hardcoded secret in "password"'])
    })

    it('flags a hardcoded token in env', () => {
      const result = validateWorkflow(
        wf(CHECKOUT, '      - run: npm publish', '        env:', '          NPM_TOKEN: abc123')
      )
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, ['Possible hardcoded secret in "NPM_TOKEN"'])
    })

    it('flags a hardcoded API key', () => {
      const result = validateWorkflow(
        wf(CHECKOUT, '      - run: node app.js', '        env:', '          OPENAI_API_KEY: sk-123')
      )
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, ['Possible hardcoded secret in "OPENAI_API_KEY"'])
    })

    it('accepts secrets that come from GitHub Secrets', () => {
      const result = validateWorkflow(
        wf(
          CHECKOUT,
          '      - run: node app.js',
          '        env:',
          '          API_KEY: ${{ secrets.API_KEY }}'
        )
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.errors, [])
    })

    it('does not flag secrets: inherit', () => {
      const result = validateWorkflow(wf(CHECKOUT, '    secrets: inherit'))
      assert.equal(result.valid, true)
      assert.deepEqual(result.errors, [])
    })

    it('does not flag permission values such as id-token: write', () => {
      const result = validateWorkflow(
        wf(CHECKOUT, '    permissions:', '      id-token: write')
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.errors, [])
    })
  })
})
