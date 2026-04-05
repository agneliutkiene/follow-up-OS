import Image from "next/image";

export function ClientsStrip() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-18">
      <div className="rounded-[1.45rem] border border-white/12 bg-[linear-gradient(165deg,rgba(20,28,48,0.85),rgba(13,19,34,0.82))] p-6 shadow-[0_18px_50px_rgba(3,6,18,0.35)]">
        <p className="text-sm font-medium text-slate-200">
          Trusted by solopreneurs, freelancers, and small teams.
        </p>
        <p className="mt-1 text-sm text-slate-400">Placeholder logos shown below</p>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
          <Image
            src="/logo-strip-placeholder.svg"
            alt="Placeholder client logos"
            width={1120}
            height={140}
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
