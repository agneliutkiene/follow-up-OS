const stats = [
  { value: "10 min setup", label: "Fast onboarding" },
  { value: "Daily digest", label: "One focused summary" },
  { value: "0 missed follow-ups (goal)", label: "NoSlip promise" },
];

export function StatsStrip() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-14">
      <div className="rounded-[1.3rem] border border-white/10 bg-[#0B1020] p-5 shadow-[0_20px_48px_rgba(0,0,0,0.42)]">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400">We in numbers</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.value} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-lg font-semibold text-white">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
