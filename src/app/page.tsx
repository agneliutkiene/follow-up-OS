import Link from "next/link";

import styles from "./page.module.css";

function LogoGlyph() {
  return (
    <svg viewBox="0 0 24 24" className={styles.logoGlyph} aria-hidden>
      <path
        fill="currentColor"
        d="M12 2.5a9.5 9.5 0 0 0-7.78 14.95l-.97 3.96 4.04-1.03A9.5 9.5 0 1 0 12 2.5Zm0 2.2a7.3 7.3 0 1 1-3.28 13.83l-.42-.21-2.19.56.53-2.16-.27-.41A7.3 7.3 0 0 1 12 4.7Z"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className={styles.pageRoot}>
      <div className={styles.stack}>
        <header className={`${styles.slice} ${styles.menuBar}`}>
          <div className={styles.menuInner}>
            <div className={styles.brand}>
              <LogoGlyph />
              <span>NoSlip</span>
            </div>
            <nav className={styles.menuLinks} aria-label="Top">
              <a href="#hero">Product</a>
              <a href="#insert">Preview</a>
              <Link href="/login">Login</Link>
            </nav>
          </div>
        </header>

        <section id="hero" className={`${styles.slice} ${styles.pinkA}`}>
          <div className={styles.contentRow}>
            <div className={styles.copyBlock}>
              <p className={styles.kicker}>noslip.cloud</p>
              <h1>Never miss a follow-up again.</h1>
            </div>
            <Link href="/login" className={styles.heroCta}>
              Get NoSlip
            </Link>
          </div>
        </section>

        <section id="insert" className={`${styles.slice} ${styles.blackInsert}`}>
          <div className={styles.insertPanel}>
            <p className={styles.insertLabel}>Daily Digest Preview</p>
            <div className={styles.insertGrid}>
              <p>Overdue</p>
              <p>Due Today</p>
              <p>Upcoming</p>
              <p>Draft Ready</p>
            </div>
          </div>
        </section>

        <section className={`${styles.slice} ${styles.pinkB}`}>
          <div className={styles.tableGhost}>
            <div className={styles.tableRow}>
              <span>Contact</span>
              <span>Thread</span>
              <span>Next follow-up</span>
            </div>
            <div className={styles.tableLine} />
            <div className={styles.tableLine} />
            <div className={styles.tableLine} />
          </div>
        </section>

        <section className={`${styles.slice} ${styles.darkViolet}`}>
          <p className={styles.sliceTitle}>Keep momentum in one focused workspace.</p>
        </section>

        <section className={`${styles.slice} ${styles.lightCyan}`}>
          <p className={styles.sliceTitleDark}>Built for solopreneurs and small teams.</p>
        </section>

        <footer className={`${styles.slice} ${styles.footerSlice}`}>
          <p>NoSlip</p>
        </footer>
      </div>
    </main>
  );
}
