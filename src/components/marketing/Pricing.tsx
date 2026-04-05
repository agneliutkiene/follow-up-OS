import Link from "next/link";

import { Button } from "@/components/ui/Button";

const plans = [
  {
    name: "Early Access",
    price: "$9",
    period: "/mo",
    description: "For solo operators keeping every lead and invoice moving.",
    bullets: ["Daily digest", "Draft templates", "Snooze + rules"],
  },
  {
    name: "Yearly",
    price: "$49",
    period: "/year",
    description: "Best value for focused workflows and long-term consistency.",
    bullets: ["Everything in Early Access", "Priority improvements", "Locked yearly rate"],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="mx-auto w-full max-w-6xl px-6 pb-18">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">Pricing</p>
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Simple early-access pricing.
        </h2>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {plans.map((plan, index) => (
          <article
            key={plan.name}
            className="rounded-2xl border border-white/12 bg-[linear-gradient(165deg,rgba(14,20,35,0.84),rgba(23,31,52,0.8))] p-6 shadow-[0_18px_55px_rgba(3,6,18,0.45)]"
          >
            <p className="text-sm font-medium text-violet-200">{plan.name}</p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
              {plan.price}
              <span className="ml-1 text-base font-medium text-slate-400">{plan.period}</span>
            </p>
            <p className="mt-3 text-sm text-slate-300">{plan.description}</p>

            <ul className="mt-5 space-y-2 text-sm text-slate-300">
              {plan.bullets.map((bullet) => (
                <li key={bullet} className="inline-flex w-full items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-sky-300" aria-hidden />
                  {bullet}
                </li>
              ))}
            </ul>

            <Link href="/login" className="mt-6 inline-flex">
              <Button variant={index === 0 ? "primary" : "secondary"} className="min-w-[132px]">
                Get NoSlip
              </Button>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
