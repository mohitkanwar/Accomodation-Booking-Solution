import {useId} from 'react';

import styles from './RoleGroup.module.css';

export default function RoleGroup({
  eyebrow,
  title,
  description,
  tone = 'seeker',
  children,
}) {
  const headingId = useId();

  return (
    <section
      className={`${styles.group} ${styles[tone]}`}
      aria-labelledby={headingId}>
      <header className={styles.header}>
        <span className={styles.marker} aria-hidden="true" />
        <div>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h3 className={styles.title} id={headingId}>
            {title}
          </h3>
          <p className={styles.description}>{description}</p>
        </div>
      </header>

      <div className={styles.roles}>{children}</div>
    </section>
  );
}
