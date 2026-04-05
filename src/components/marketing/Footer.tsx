import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#05080f]">
      <div className="mx-auto grid w-full max-w-6xl gap-5 px-6 py-9 md:grid-cols-3 md:items-center">
        <div>
          <p className="text-base font-semibold text-white">NoSlip</p>
          <p className="mt-1 text-sm text-slate-400">
            Daily digest + drafts so nothing falls through.
          </p>
        </div>

        <div className="text-sm text-slate-300 md:text-center">
          <Link href="/login" className="underline-offset-4 hover:text-white hover:underline">
            Go to login
          </Link>
        </div>

        <p className="text-sm text-slate-400 md:text-right">agne@noslip.cloud</p>
      </div>
    </footer>
  );
}
