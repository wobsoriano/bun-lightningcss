import dts from 'bun-plugin-dts'

await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  minify: true,
  plugins: [dts()],
  sourcemap: 'external',
  target: 'bun',
  external: ['lightningcss', 'browserslist'],
})
