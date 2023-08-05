# bun-plugin-lightningcss-modules

CSS modules plugin for Bun based on [Lightning CSS](https://lightningcss.dev/) with full support for [class composition](https://lightningcss.dev/css-modules.html#class-composition).

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

Say you have a `app.module.css` file...

```css
.bg-indigo {
  background: indigo;
}

.container {
  /* https://lightningcss.dev/css-modules.html#class-composition */
  composes: bg-indigo;
  color: white;
}
```

Import and use it like so

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

## TypeScript Shim

Add the following to your .d.ts file:

```ts
declare module '*.module.css' {
  const styles: Record<string, string>
  export default styles
}
```

## License

MIT
