import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>AI-Q</h1>
      <p className={styles.description}>
        Evaluate your AI readiness with AI-Q, the AI readiness assessment tool.
      </p>
    </main>
  );
}
