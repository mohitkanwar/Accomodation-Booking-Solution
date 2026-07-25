import styles from './JourneyScenario.module.css';

export default function JourneyScenario({title, description, children}) {
  return (
    <details className={styles.scenario}>
      <summary className={styles.summary}>
        <span className={styles.symbol} aria-hidden="true">
          →
        </span>
        <span className={styles.identity}>
          <span className={styles.title}>{title}</span>
          <span className={styles.description}>{description}</span>
        </span>
        <span className={styles.toggle} aria-hidden="true" />
      </summary>

      <div className={styles.steps}>{children}</div>
    </details>
  );
}
