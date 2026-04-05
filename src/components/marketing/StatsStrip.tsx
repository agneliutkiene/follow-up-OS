const stats = [
  { label: "10 min setup", value: "Fast start" },
  { label: "Daily digest", value: "Always clear" },
  { label: "0 missed follow-ups (goal)", value: "No slip" },
];

export function StatsStrip() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-6">
      <div className="grid gap-3 rounded-[1.3rem] border border-white/12 bg-[#0a1020]/80 p-4 sm:grid-cols-3 sm:p-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-400">{stat.value}</p>
            <p className="mt-2 text-base font-semibold text-white">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
