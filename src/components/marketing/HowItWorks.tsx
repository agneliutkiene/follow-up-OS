const steps = [
  {
    title: "Capture the thread",
    description: "Create a contact and start a lead, invoice, meeting, or custom thread.",
  },
  {
    title: "Set the next follow-up",
    description: "Every open thread has a clear date and a draft waiting for you.",
  },
  {
    title: "Get daily digest",
    description: "Overdue, due today, and upcoming in one focused email summary.",
  },
  {
    title: "Send / snooze / close the loop",
    description: "Take action fast and keep momentum without losing track.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto w-full max-w-6xl px-6 py-18">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">How it works</p>
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Simple workflow. Strong follow-through.
        </h2>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className="rounded-2xl border border-white/12 bg-[linear-gradient(165deg,rgba(17,24,39,0.8),rgba(15,23,42,0.72))] p-5 shadow-[0_18px_50px_rgba(3,6,18,0.35)]"
          >
            <p className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-violet-300/35 bg-violet-400/15 text-sm font-semibold text-violet-100">
              {index + 1}
            </p>
            <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
