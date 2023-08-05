# bun-lightningcss

[Lightning CSS](https://lightningcss.dev/) plugin for Bun with full support for [class composition](https://lightningcss.dev/css-modules.html#class-composition).

## Install

```bash
bun install -d bun-lightningcss
```

## Usage

```ts
import lightningcss from 'bun-lightningcss'

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
  const styles: {
    readonly [key: string]: string
  }
  export default styles
}
```

## License

MIT
