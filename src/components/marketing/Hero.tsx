import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/Button";

const highlights = ["Daily Digest", "Drafts Ready", "Snooze + Rules"];

export function HeroSection() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pb-10 pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-20">
      <div className="space-y-7">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-300">
          noslip.cloud
        </p>
        <div className="space-y-4">
          <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.45rem]">
            Never miss a follow-up again.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Daily digest + drafts so leads, invoices, and clients never slip.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/login">
            <Button variant="primary" size="lg" className="min-w-[136px]">
              Get NoSlip
            </Button>
          </Link>
          <a href="#how">
            <Button variant="secondary" size="lg" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
              See how it works
            </Button>
          </a>
        </div>

        <p className="text-xs text-slate-400">Early access • Cancel anytime • No spam</p>

        <ul className="grid max-w-lg gap-2 text-sm text-slate-200 sm:grid-cols-3">
          {highlights.map((item) => (
            <li key={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-300" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_50%_40%,rgba(124,58,237,0.35),transparent_55%),radial-gradient(circle_at_66%_62%,rgba(37,99,235,0.3),transparent_50%)] blur-2xl" />
        <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(160deg,rgba(15,23,42,0.88),rgba(30,41,59,0.7))] p-4 shadow-[0_28px_80px_rgba(8,12,25,0.65)]">
          <div className="mb-3 inline-flex items-center rounded-full border border-violet-300/35 bg-violet-400/15 px-3 py-1 text-xs font-medium text-violet-100">
            Daily digest preview
          </div>
          <Image
            src="/hero-3d-placeholder.svg"
            alt="NoSlip 3D productivity illustration placeholder"
            width={720}
            height={520}
            className="h-auto w-full"
            priority
          />
        </div>
      </div>
    </section>
  );
}
