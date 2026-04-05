import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="bg-[#050816]">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-12 md:grid-cols-3">
        <div>
          <p className="text-base font-semibold text-white">NoSlip</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Daily digest + drafts so leads, invoices, and clients never slip.
          </p>
        </div>

        <div className="text-sm text-slate-300 md:text-center">
          <Link href="/login" className="underline-offset-4 hover:text-white hover:underline">
            Get NoSlip
          </Link>
        </div>

        <div className="space-y-1 text-sm text-slate-400 md:text-right">
          <p>agne@noslip.cloud</p>
          <p>noslip.cloud</p>
        </div>
      </div>
    </footer>
  );
}
