import Link from "next/link";

import { NoSlipLogo } from "@/components/brand/NoSlipLogo";

import { marketingButtonClass } from "./MarketingButton";

const links = [
  { href: "#product", label: "Product" },
  { href: "#how", label: "How it works" },
  { href: "#clients", label: "Clients" },
];

export function MarketingNav() {
  return (
    <header className="border-b border-white/10 bg-[#050816]/70 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" aria-label="NoSlip home" className="inline-flex items-center">
          <NoSlipLogo className="h-8" />
        </Link>

        <div className="flex items-center gap-3">
          <nav aria-label="Homepage" className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-[var(--radius-md)] px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <Link href="/login" className={marketingButtonClass("primary")}>
            Get NoSlip
          </Link>
        </div>
      </div>
    </header>
  );
}
