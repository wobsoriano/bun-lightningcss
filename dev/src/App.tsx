import styles from './index.module.css'

function App() {
  return (
    <div className={styles.app} role="main">
      <article className={styles.appArticle}>
        <img src={'/bunlogo.svg'} className={styles.appLogo} alt="logo" />
        <div style={{ height: '30px' }}></div>
        <h3>Welcome to Bun!</h3>
        <div style={{ height: '10px' }}></div>
        <a
          className={styles.appLink}
          href="https://bun.sh/docs"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read the docs →
        </a>
      </article>
    </div>
  )
}

export default App
