const features = [
  {
    title: "Daily Digest",
    description: "Overdue, due today, upcoming. One clear summary every morning.",
  },
  {
    title: "Drafts Ready",
    description: "Keep the next message prepared so you can reply fast.",
  },
  {
    title: "Snooze in 1 Click",
    description: "Push a thread +2d or +7d without losing context.",
  },
  {
    title: "Rules that stick",
    description: "No open thread can exist without a next follow-up date.",
  },
];

function MiniIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function FeaturePanel() {
  return (
    <section id="product" className="mx-auto w-full max-w-6xl px-6">
      <div className="grid gap-4 rounded-[1.6rem] border border-white/15 bg-[linear-gradient(170deg,rgba(7,12,28,0.86),rgba(18,24,44,0.8))] p-6 shadow-[0_20px_60px_rgba(3,6,18,0.55)] md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition duration-300 hover:-translate-y-1 hover:border-violet-300/25 hover:bg-white/[0.06]"
          >
            <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-violet-300/30 bg-violet-400/15 text-violet-100">
              <MiniIcon />
            </div>
            <h3 className="text-base font-semibold text-white">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
