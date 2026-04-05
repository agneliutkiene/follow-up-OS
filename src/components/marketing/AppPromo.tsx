import Image from "next/image";
import Link from "next/link";

import { marketingButtonClass } from "./MarketingButton";

export function AppPromoSection() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-18 lg:grid-cols-[1fr_1.02fr]">
      <div className="space-y-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">App flow</p>
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Your follow-up workspace, built for daily momentum.
        </h2>
        <p className="max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">
          Open threads, action buttons, and draft previews stay in one clean view so you can send,
          snooze, or close the loop in seconds.
        </p>
        <Link href="/login" className={marketingButtonClass("primary")}>
          Open NoSlip
        </Link>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute -inset-5 rounded-[1.8rem] bg-[radial-gradient(circle_at_30%_35%,rgba(124,58,237,0.32),transparent_62%),radial-gradient(circle_at_72%_60%,rgba(37,99,235,0.25),transparent_58%)] blur-xl" />
        <div className="relative rounded-[1.8rem] border border-white/[0.14] bg-white/[0.04] p-3 shadow-[0_24px_56px_rgba(0,0,0,0.46)]">
          <Image
            src="/app-screenshot-placeholder.svg"
            alt="NoSlip app screenshot placeholder"
            width={760}
            height={500}
            className="h-auto w-full rounded-[1.2rem]"
          />
        </div>
      </div>
    </section>
  );
}
