import Image from "next/image";
import Link from "next/link";

import styles from "./page.module.css";

type Feature = {
  title: string;
  description: string;
};

type Metric = {
  label: string;
  value: string;
};

type TableRow = {
  status: string;
  threadContact: string;
  nextFollowup: string;
  draft: string;
  action: string;
};

type Step = {
  title: string;
  description: string;
  highlighted?: boolean;
};

type Plan = {
  name: string;
  price: string;
  billing: string;
  points: string[];
  cta: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

const features: Feature[] = [
  {
    title: "Daily Digest",
    description: "Overdue, due today, and upcoming in one clear summary.",
  },
  {
    title: "Drafts Ready",
    description: "Always keep a draft prepared before the next follow-up.",
  },
  {
    title: "Snooze in 1 Click",
    description: "Shift deadlines forward instantly without losing context.",
  },
  {
    title: "Rules that stick",
    description: "No open thread lives without a next follow-up date.",
  },
];

const metrics: Metric[] = [
  { value: "10 min setup", label: "Fast onboarding" },
  { value: "Daily digest", label: "Morning focus" },
  { value: "0 missed follow-ups (goal)", label: "NoSlip promise" },
];

const rows: TableRow[] = [
  {
    status: "Overdue",
    threadContact: "Proposal follow-up · Lina C.",
    nextFollowup: "Today, 09:30",
    draft: "Checking in on your decision and next steps...",
    action: "Send",
  },
  {
    status: "Due Today",
    threadContact: "Invoice #311 · Mantas R.",
    nextFollowup: "Today, 14:00",
    draft: "Friendly reminder before invoice due date...",
    action: "Snooze",
  },
  {
    status: "Upcoming",
    threadContact: "Meeting recap · Austeja P.",
    nextFollowup: "Apr 8, 10:00",
    draft: "Sharing recap and proposed timeline...",
    action: "Open",
  },
  {
    status: "Due This Week",
    threadContact: "Warm lead · Northline",
    nextFollowup: "Apr 9, 11:30",
    draft: "Following up on fit and budget alignment...",
    action: "Open",
  },
  {
    status: "Upcoming",
    threadContact: "Contract note · Waveboard",
    nextFollowup: "Apr 11, 16:00",
    draft: "Quick review request before signature...",
    action: "Draft",
  },
];

const steps: Step[] = [
  {
    title: "Create an account",
    description: "Sign in and start a clean follow-up workspace.",
  },
  {
    title: "Add contacts",
    description: "Capture the people and threads you need to track.",
  },
  {
    title: "Link your workflow",
    description: "Attach next dates and message drafts to open threads.",
  },
  {
    title: "Start closing the loop",
    description: "Send, snooze, and close threads from one inbox.",
    highlighted: true,
  },
];

const plans: Plan[] = [
  {
    name: "Early Access",
    price: "$9",
    billing: "/month",
    points: [
      "Inbox with due/overdue/upcoming buckets",
      "Follow-up drafts + snooze actions",
      "Daily digest in your timezone",
    ],
    cta: "Start monthly",
  },
  {
    name: "Yearly",
    price: "$49",
    billing: "/year",
    points: [
      "Everything in Early Access",
      "Best value for solo operators",
      "Priority product feedback loop",
    ],
    cta: "Start yearly",
  },
];

const faqs: FaqItem[] = [
  {
    question: "What is NoSlip?",
    answer:
      "NoSlip is a lightweight follow-up workspace that keeps every thread tied to a clear next action.",
  },
  {
    question: "Is this a full CRM?",
    answer:
      "No. It is intentionally lean: contacts, threads, drafts, and daily digest so nothing falls through.",
  },
  {
    question: "How do daily digests work?",
    answer:
      "You set your local time in settings and get one focused email with overdue, due today, and upcoming follow-ups.",
  },
  {
    question: "Can I turn digest emails off?",
    answer:
      "Yes. You can disable digest delivery anytime from Settings and still use the inbox manually.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "No free trial in this early-access phase. Pricing is intentionally simple while we ship quickly.",
  },
];

function FeatureIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.featureIconSvg} fill="none" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Sparkline({ seed }: { seed: number }) {
  const variants = [
    "M2 18C8 10 12 8 18 12C22 14 28 17 34 11",
    "M2 15C8 12 12 14 18 9C23 6 27 7 34 12",
    "M2 19C9 18 13 8 18 10C24 12 29 12 34 7",
    "M2 16C8 17 13 11 18 9C24 8 28 10 34 8",
    "M2 18C8 14 13 12 18 13C24 14 29 10 34 9",
  ];

  return (
    <svg viewBox="0 0 36 22" className={styles.sparkline} fill="none" aria-hidden>
      <path d={variants[seed % variants.length]} stroke="#747096" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className={styles.pageRoot}>
      <section className={styles.heroSection}>
        <header className={styles.navbarWrap}>
          <div className={styles.container}>
            <nav className={styles.navbar} aria-label="Top">
              <Link href="/" className={styles.brand} aria-label="NoSlip home">
                <Image src="/icon.svg" alt="" width={18} height={18} aria-hidden />
                <span>NoSlip</span>
              </Link>

              <div className={styles.navCenter}>
                <a href="#product" className={styles.navLink}>
                  Product
                </a>
                <a href="#pricing" className={styles.navLink}>
                  Pricing
                </a>
                <a href="#faq" className={styles.navLink}>
                  FAQ
                </a>
              </div>

              <div className={styles.navCta}>
                <Link href="/#pricing" className={styles.primaryButtonNav}>
                  Get NoSlip
                </Link>
              </div>
            </nav>
          </div>
        </header>

        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <h1 className={styles.heroTitle}>
              Never miss a
              <br />
              follow-up
              <br />
              again.
            </h1>
            <p className={styles.heroSubtitle}>
              Daily digest + drafts so leads, invoices, and clients never slip.
            </p>

            <div className={styles.heroActions}>
              <Link href="/#pricing" className={styles.primaryButtonHero}>
                Get NoSlip
              </Link>
              <a href="#how" className={styles.learnLink}>
                <span className={styles.learnIcon} aria-hidden>
                  ↗
                </span>
                Learn how to start
              </a>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <img src="/hero-3d.png" alt="NoSlip daily digest preview" className={styles.heroImage} />
          </div>
        </div>

        <div id="product" className={`${styles.container} ${styles.featurePanelWrap}`}>
          <div className={styles.featurePanel}>
            <div className={styles.featuresGrid}>
              {features.map((feature) => (
                <article key={feature.title} className={styles.featureItem}>
                  <div className={styles.featureIconWrap}>
                    <FeatureIcon />
                  </div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </article>
              ))}
            </div>

            <div className={styles.numbersStrip}>
              <p className={styles.numbersLabel}>We in numbers</p>
              <div className={styles.metricsGrid}>
                {metrics.map((metric) => (
                  <div key={metric.value} className={styles.metricCard}>
                    <p className={styles.metricValue}>{metric.value}</p>
                    <p className={styles.metricLabel}>{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.tableSection}>
        <div className={styles.container}>
          <h2 className={styles.tableHeading}>See your follow-ups at a glance</h2>

          <div className={styles.tableCard}>
            <div className={styles.tableScroll}>
              <table className={styles.digestTable}>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Thread / Contact</th>
                    <th>Next follow-up</th>
                    <th>Draft preview</th>
                    <th>Action</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={`${row.status}-${row.threadContact}`}>
                      <td>{row.status}</td>
                      <td>{row.threadContact}</td>
                      <td>{row.nextFollowup}</td>
                      <td className={styles.draftCell}>{row.draft}</td>
                      <td>
                        <button type="button" className={styles.tableActionButton}>
                          {row.action}
                        </button>
                      </td>
                      <td>
                        <Sparkline seed={index} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className={styles.pricingSection}>
        <div className={styles.container}>
          <div className={styles.pricingHeader}>
            <h2 className={styles.pricingTitle}>Pricing</h2>
            <p className={styles.pricingSubtitle}>
              Pick your plan and start closing follow-up loops today.
            </p>
          </div>

          <div className={styles.pricingGrid}>
            {plans.map((plan) => (
              <article key={plan.name} className={styles.pricingCard}>
                <p className={styles.planName}>{plan.name}</p>
                <p className={styles.planPrice}>
                  {plan.price}
                  <span>{plan.billing}</span>
                </p>
                <ul className={styles.planList}>
                  {plan.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <Link href="/login" className={styles.planButton}>
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.promoSection}>
        <div className={`${styles.container} ${styles.promoGrid}`}>
          <div className={styles.promoCopy}>
            <h2 className={styles.promoTitle}>Keep momentum without a CRM.</h2>
            <p className={styles.promoSubtitle}>
              Capture the thread, set the next follow-up, and let NoSlip keep you honest.
            </p>
            <Link href="/#pricing" className={styles.primaryButtonHero}>
              Get NoSlip
            </Link>
          </div>

          <div className={styles.promoVisualWrap}>
            <div className={styles.ratingBubble}>4.5</div>
            <Image
              src="/app-screenshot-placeholder.svg"
              alt="App screenshot placeholder"
              width={620}
              height={440}
              className={styles.promoImage}
            />
          </div>
        </div>
      </section>

      <section id="how" className={styles.getStartedSection}>
        <div className={styles.container}>
          <h2 className={styles.getStartedTitle}>
            Get started together
          </h2>

          <div className={styles.stepsGrid}>
            {steps.map((step) => (
              <article
                key={step.title}
                className={step.highlighted ? styles.stepCardHighlight : styles.stepCard}
              >
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.clientsSection}>
        <div className={styles.container}>
          <h2 className={styles.clientsTitle}>Our Clients</h2>
          <p className={styles.clientsSubtitle}>Placeholder logos</p>

          <div className={styles.clientsStrip}>
            <Image
              src="/logo-strip-placeholder.svg"
              alt="Client logo placeholders"
              width={1120}
              height={140}
              className={styles.clientsImage}
            />
          </div>
        </div>
      </section>

      <section id="faq" className={styles.faqSection}>
        <div className={styles.container}>
          <h2 className={styles.faqTitle}>FAQ</h2>
          <div className={styles.faqGrid}>
            {faqs.map((item) => (
              <article key={item.question} className={styles.faqCard}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className={styles.footerSection}>
        <div className={`${styles.container} ${styles.footerGrid}`}>
          <div>
            <p className={styles.footerBrand}>NoSlip</p>
            <p className={styles.footerText}>
              Daily digest + drafts so leads, invoices, and clients never slip.
            </p>
          </div>

          <div className={styles.footerLinks}>
            <Link href="/#pricing">Get NoSlip</Link>
            <a href="#product">Product</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className={styles.footerMeta}>
            <p>agne@noslip.cloud</p>
            <p>noslip.cloud</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
