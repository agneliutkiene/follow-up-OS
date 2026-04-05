const steps = [
  {
    title: "Create account",
    description: "Set up in minutes and land in your NoSlip inbox.",
  },
  {
    title: "Add contacts",
    description: "Capture who matters before anything falls through.",
  },
  {
    title: "Set follow-ups",
    description: "Attach a next date and draft to every open thread.",
  },
  {
    title: "Never miss",
    description: "Use digest + snooze + actions to keep momentum daily.",
  },
];

export function GetStartedSection() {
  return (
    <section id="how" className="mx-auto w-full max-w-6xl px-6 py-18">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#36335e]">Get started together</p>
        <h2 className="text-3xl font-semibold tracking-tight text-[#1e1a3d] sm:text-4xl">
          Build a follow-up habit that sticks.
        </h2>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className="rounded-2xl border border-white/[0.55] bg-white/[0.65] p-5 shadow-[0_16px_30px_rgba(76,76,153,0.16)]"
          >
            <p className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#9a91d8] bg-white/[0.7] text-sm font-semibold text-[#2b2551]">
              {index + 1}
            </p>
            <h3 className="mt-4 text-lg font-semibold text-[#241f42]">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#4a4669]">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
