import Image from "next/image";
import Link from "next/link";

import { marketingButtonClass } from "./MarketingButton";

const highlights = ["Daily Digest", "Drafts Ready", "Snooze + Rules"];

export function HeroSection() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-14 pt-14 lg:grid-cols-[1.03fr_1fr] lg:pt-18">
      <div className="space-y-7">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-300">noslip.cloud</p>

        <div className="space-y-4">
          <h1 className="max-w-xl text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-[3.45rem]">
            Never miss a follow-up again.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Daily digest + drafts so leads, invoices, and clients never slip.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/login" className={marketingButtonClass("primary")}>
            Get NoSlip
          </Link>
          <a href="#how" className={marketingButtonClass("secondary")}>
            See how it works
          </a>
        </div>

        <p className="text-xs text-slate-400">Early access • Cancel anytime • No spam</p>

        <ul className="grid max-w-lg gap-2 text-sm text-slate-200 sm:grid-cols-3">
          {highlights.map((item) => (
            <li
              key={item}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.04] px-3 py-1.5"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-300" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-[radial-gradient(circle_at_35%_20%,rgba(124,58,237,0.34),transparent_58%),radial-gradient(circle_at_78%_42%,rgba(37,99,235,0.28),transparent_55%)] blur-2xl" />

        <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.16] bg-[linear-gradient(170deg,rgba(13,18,33,0.92),rgba(27,35,58,0.82))] p-4 shadow-[0_28px_70px_rgba(3,7,20,0.62)]">
          <div className="mb-3 inline-flex items-center rounded-full border border-violet-300/35 bg-violet-400/12 px-3 py-1 text-xs font-medium text-violet-100">
            Daily digest preview
          </div>

          <Image
            src="/hero-3d-placeholder.svg"
            alt="NoSlip hero 3D placeholder"
            width={720}
            height={520}
            className="h-auto w-full"
            priority
          />

          <div className="pointer-events-none absolute bottom-2 left-1/2 h-8 w-[72%] -translate-x-1/2 rounded-full bg-black/50 blur-lg" />
        </div>
      </div>
    </section>
  );
}
