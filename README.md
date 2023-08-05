# bun-plugin-lightningcss-modules

## Install

```bash
bun install -d bun-plugin-lightningcss-modules
```

## Usage

```ts
import lightningcss from 'bun-plugin-lightningcss-modules'

await Bun.build({
  entrypoints: ['./dev/index.tsx'],
  outdir: './dist',
  plugins: [lightningcss()],
})
```

## License

MIT
