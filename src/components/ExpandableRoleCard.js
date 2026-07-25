import styles from './ExpandableRoleCard.module.css';

export default function ExpandableRoleCard({
  index,
  name,
  description,
  children,
}) {
  return (
    <details className={styles.card} data-role-name={name}>
      <summary className={styles.summary}>
        <span className={styles.index} aria-hidden="true">
          {index}
        </span>
        <span className={styles.identity}>
          <span className={styles.name}>{name}</span>
          <span className={styles.description}>{description}</span>
        </span>
        <span className={styles.toggle} aria-hidden="true" />
      </summary>

      <div className={styles.expanded}>
        <p className={styles.eyebrow}>Associated user journey</p>
        <div className={styles.journey}>{children}</div>
      </div>
    </details>
  );
}
