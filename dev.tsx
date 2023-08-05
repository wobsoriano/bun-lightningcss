import * as path from 'node:path'
import { statSync } from 'node:fs'
import lightningcssPlugin from './src'

const PROJECT_ROOT = import.meta.dir
const PUBLIC_DIR = path.resolve(PROJECT_ROOT, 'dev/public')
const BUILD_DIR = path.resolve(PROJECT_ROOT, 'dev/dist')

await Bun.build({
  entrypoints: ['./dev/index.tsx'],
  outdir: './dist',
  plugins: [lightningcssPlugin()],
})

function serveFromDir(config: {
  directory: string
  path: string
}): Response | null {
  const basePath = path.join(config.directory, config.path)
  const suffixes = ['', '.html', 'index.html']

  for (const suffix of suffixes) {
    try {
      const pathWithSuffix = path.join(basePath, suffix)
      const stat = statSync(pathWithSuffix)
      if (stat && stat.isFile())
        return new Response(Bun.file(pathWithSuffix))
    }
    catch (err) {}
  }

  return null
}

const server = Bun.serve({
  fetch(request) {
    let reqPath = new URL(request.url).pathname
    console.log(request.method, reqPath)
    if (reqPath === '/')
      reqPath = '/index.html'

    // check public
    const publicResponse = serveFromDir({
      directory: PUBLIC_DIR,
      path: reqPath,
    })
    if (publicResponse)
      return publicResponse

    // check /.build
    const buildResponse = serveFromDir({ directory: BUILD_DIR, path: reqPath })
    if (buildResponse)
      return buildResponse

    return new Response('File not found', {
      status: 404,
    })
  },
})

console.log(`Listening on http://localhost:${server.port}`)
