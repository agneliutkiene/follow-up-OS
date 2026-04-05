const faqItems = [
  {
    question: "What is NoSlip?",
    answer:
      "NoSlip is a lightweight follow-up system that keeps every thread tied to a next action.",
  },
  {
    question: "Is it a CRM?",
    answer:
      "NoSlip is intentionally focused. It tracks follow-ups, drafts, and deadlines without full CRM complexity.",
  },
  {
    question: "How do daily digests work?",
    answer:
      "You get one daily email summarizing overdue, due today, and upcoming threads so you can act quickly.",
  },
  {
    question: "Can I turn off emails?",
    answer:
      "Yes. Digest settings let you enable/disable delivery and choose your preferred local send time.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "No free trial in this phase. We offer early access pricing while shaping the product with user feedback.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="mx-auto w-full max-w-6xl px-6 pb-22">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">FAQ</p>
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Questions before you join?
        </h2>
      </div>

      <div className="mt-8 space-y-3">
        {faqItems.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-white/12 bg-[linear-gradient(165deg,rgba(14,20,35,0.84),rgba(23,31,52,0.8))] p-5 open:border-violet-300/25"
          >
            <summary className="cursor-pointer list-none text-base font-medium text-white focus-visible:outline-none">
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-300" aria-hidden />
                {item.question}
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
