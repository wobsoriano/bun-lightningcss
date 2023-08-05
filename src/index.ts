import fs from 'node:fs/promises'
import { transform } from 'lightningcss'

export default function lightningcssPlugin(): import('bun').BunPlugin {
  return {
    name: 'bun-plugin-lightningcss-modules',
    setup({ onLoad, onResolve }) {
      onResolve({ filter: /^__style_helper__$/ }, (args) => {
        return {
          path: args.path,
          namespace: 'style-helper',
        }
      })

      onLoad({ filter: /.*/, namespace: 'style-helper' }, async () => {
        return {
          contents: `
            export function injectStyle(text) {
              if (typeof document !== 'undefined') {
                var style = document.createElement('style')
                var node = document.createTextNode(text)
                style.appendChild(node)
                document.head.appendChild(style)
              }
            }
          `,
          loader: 'js',
        }
      })

      onLoad({ filter: /\.module\.css$/ }, async ({ path }) => {
        const rawCssBuffer = await fs.readFile(path)

        const { code, exports = {} } = transform({
          filename: path,
          code: rawCssBuffer,
          cssModules: true,
        })

        const defaultExports: Record<string, string> = {}
        for (const key in exports)
          defaultExports[key] = exports[key].name

        return {
          contents: `
          import { injectStyle } from '__style_helper__'
          injectStyle(${JSON.stringify(code.toString())})

          export default ${JSON.stringify(defaultExports)}
          `,
          loader: 'js',
        }
      })
    },
  }
}
