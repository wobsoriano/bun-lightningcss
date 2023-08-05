import fs from 'node:fs/promises'
import { transform } from 'lightningcss'
import { join } from 'node:path'

export default function lightningcssPlugin(): import('bun').BunPlugin {
  return {
    name: 'bun-plugin-lightningcss-modules',
    setup({ onLoad, onResolve, config }) {
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

      const escape = (string: string) => JSON.stringify(string).slice(1, -1)

      onLoad({ filter: /\.module\.css$/ }, async ({ path }) => {
        const rawCssBuffer = await fs.readFile(path)

        const { code, exports = {} } = transform({
          filename: path,
          code: rawCssBuffer,
          cssModules: {
              pattern: `[hash]_[local]`
          },
          projectRoot: join(process.cwd(), config.outdir || 'dist'),
        })

        let contents = '';

        contents += `import { injectStyle } from '__style_helper__'\n`;
        contents += `injectStyle(${JSON.stringify(code.toString())})\n`
        contents += `export default {`;

        for (const [cssClassReadableName, cssClassExport] of Object.entries(exports)) {
            let compiledCssClasses = `"${escape(cssClassExport.name)}`

            if (cssClassExport.composes) {
                for (const composition of cssClassExport.composes) {
                    switch (composition.type) {
                        case "local":
                            compiledCssClasses += " " + escape(composition.name)
                            break;
                    
                        case "global":
                            compiledCssClasses += " " + escape(composition.name)
                            break;

                       // TODO: dependency import
                    }
                }
            }

            compiledCssClasses += `"`

            contents += `${JSON.stringify(cssClassReadableName)}:${compiledCssClasses},`
        }

        contents += "}"

        // https://github.com/evanw/esbuild/issues/2943#issuecomment-1439755408
        const emptyishSourceMap = "data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIiJdLCJtYXBwaW5ncyI6IkEifQ==";
        contents += `\n//# sourceMappingURL=${emptyishSourceMap}`

        console.log(contents);

        return {
          contents,
          loader: 'js',
        }
      })
    },
  }
}
