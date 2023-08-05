# bun-plugin-lightningcss-modules

## Install

```bash
bun install -d bun-plugin-lightningcss-modules
```

## Usage

```ts
import lightningcss from 'bun-plugin-lightningcss-modules'

await Bun.build({
  entrypoints: ['./index.tsx'],
  outdir: './dist',
  plugins: [lightningcss()],
})
```

```css
.bg-indigo {
  background: indigo;
}

.container {
  composes: bg-indigo;
  color: white;
}
```

```tsx
import styles from './app.module.css'

export default function App() {
  return (
    <div className={styles.container}>
      Hello, Bun!
    </div>
  )
}
```

## License

MIT
