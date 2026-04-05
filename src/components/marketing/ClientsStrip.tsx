import Image from "next/image";

export function ClientsStrip() {
  return (
    <section id="clients" className="mx-auto w-full max-w-6xl px-6 pb-20">
      <div className="rounded-[1.4rem] border border-white/[0.55] bg-white/[0.58] p-6 shadow-[0_16px_28px_rgba(76,76,153,0.14)]">
        <p className="text-sm font-medium text-[#2e2a4e]">Our clients</p>
        <p className="mt-1 text-sm text-[#555074]">Placeholder logos for now</p>

        <div className="mt-5 rounded-xl border border-black/[0.08] bg-white/[0.65] p-4">
          <Image
            src="/logo-strip-placeholder.svg"
            alt="Client logo placeholders"
            width={1120}
            height={140}
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
