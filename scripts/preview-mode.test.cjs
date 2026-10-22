const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const test = require('node:test')

function loadPreview(env) {
  const source = ts.transpileModule(fs.readFileSync('pages/api/preview.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const module = { exports: {} }
  const client = { withConfig: () => client, fetch: async () => ({ slug: 'safe-post' }) }
  vm.runInNewContext(source, {
    exports: module.exports, module, process: { env },
    require: (name) => {
      if (name === 'next-sanity') return { createClient: () => client }
      if (name === 'plugins/productionUrl/utils') return { getSecret: async () => 'studio-secret' }
      if (name === 'lib/sanity.api') return { projectId: 'test', dataset: 'test', previewSecretId: 'preview' }
      if (name === 'lib/sanity.queries') return { postBySlugQuery: 'query' }
      throw new Error(`Unexpected import: ${name}`)
    },
  })
  return module.exports.default
}

async function request(env, query) {
  const result = { status: 200 }
  const response = {
    status(code) { result.status = code; return this },
    send(body) { result.body = body; return this },
    setDraftMode(value) { result.draft = JSON.parse(JSON.stringify(value)); return this },
    writeHead(code, headers) { result.status = code; result.headers = headers; return this },
    end() {},
  }
  await loadPreview(env)({ query }, response)
  return result
}

test('private preview requires the existing valid Studio secret', async () => {
  const env = { SANITY_API_READ_TOKEN: 'server-only-token' }
  for (const query of [{}, { secret: 'wrong' }]) {
    const result = await request(env, query)
    assert.equal(result.status, 401)
    assert.equal(result.draft, undefined)
  }
  const result = await request(env, { secret: 'studio-secret' })
  assert.equal(result.status, 307)
  assert.deepEqual(result.draft, { enable: true })
  assert.equal(JSON.stringify(result).includes(env.SANITY_API_READ_TOKEN), false)
})

test('validated post previews use the fetched local path', async () => {
  const result = await request({ SANITY_API_READ_TOKEN: 'server-only-token' }, {
    secret: 'studio-secret', slug: 'https://untrusted.example',
  })
  assert.equal(result.headers.Location, '/posts/safe-post')
})

test('public previews remain public unless secret validation is required', async () => {
  assert.equal((await request({}, {})).status, 307)
  assert.equal((await request({}, { secret: 'unconfigured' })).status, 401)
  assert.equal((await request({ SANITY_REQUIRE_PREVIEW_SECRET: 'true' }, {})).status, 401)
})
