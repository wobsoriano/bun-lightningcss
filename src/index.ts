import browserslist from 'browserslist';
import { type TransformOptions, transform, browserslistToTargets } from 'lightningcss'
import { join } from 'node:path'

export type LightningcssPluginOptions = Omit<TransformOptions<any>, "filename" | "code"> & {
  browserslist?: string | readonly string[];
}

export default function lightningcssPlugin(options: LightningcssPluginOptions = {}): import('bun').BunPlugin {
  return {
    name: 'bun-plugin-lightningcss-modules',
    setup({ onLoad, onResolve, config }) {
      const defaultOptions: LightningcssPluginOptions = {
        minify: true,
        sourceMap: true,
        cssModules: true,
        projectRoot: join(process.cwd(), config.outdir || 'dist'),
      };
      const { browserslist: browserslistOpts, ...lightningOpts } = options ?? {};
      const targets = browserslistToTargets(browserslist(browserslistOpts));

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

      const quote = JSON.stringify
      const escape = (string: string) => quote(string).slice(1, -1)

      onLoad({ filter: /\.module\.css$/ }, async ({ path }) => {
        const file = Bun.file(path)
        const rawCssBuffer = await file.arrayBuffer()

        const { code, exports = {} } = transform({
          filename: path,
          code: rawCssBuffer as unknown as Buffer,
          ...defaultOptions,
          targets,
          ...lightningOpts,
        });
        
        let contents = '';

        const dependencies = new Map<string, string>()

        const importDependency = (path: string) => {
            if (dependencies.has(path)) {
                return dependencies.get(path)
            }
            const dependenciesName = `dependency_${dependencies.size}`
            // prepend dependency to to the contents
            contents = `import ${dependenciesName} from ${quote(path)}\n` + contents;
            dependencies.set(path, dependenciesName)
            return dependenciesName;
        }

        contents += `import { injectStyle } from '__style_helper__'\n`;
        contents += `injectStyle(${quote(code.toString())})\n`;
        contents += `export default {`;
        
        // Credits to https://github.com/mhsdesign/esbuild-plugin-lightningcss-modules
        for (const [cssClassReadableName, cssClassExport] of Object.entries(exports)) {
          let compiledCssClasses = `"${escape(cssClassExport.name)}`;
        
          if (cssClassExport.composes) {
            for (const composition of cssClassExport.composes) {
              switch (composition.type) {
                case "local":
                case "global":
                  compiledCssClasses += " " + escape(composition.name);
                  break;
                case "dependency":
                  compiledCssClasses += ` " + ${importDependency(composition.specifier)}[${quote(composition.name)}] + "`
                  break;
              }
            }
          }
        
          compiledCssClasses += `"`;
        
          contents += `${JSON.stringify(cssClassReadableName)}:${compiledCssClasses},`;
        }
        
        contents += "}";
        
        // https://github.com/evanw/esbuild/issues/2943#issuecomment-1439755408
        const emptyishSourceMap = "data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIiJdLCJtYXBwaW5ncyI6IkEifQ==";
        contents += `\n//# sourceMappingURL=${emptyishSourceMap}`;

        return {
          contents,
          loader: 'js',
        }
      })
    },
  }
}
