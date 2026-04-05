const rows = [
  {
    bucket: "Overdue",
    contact: "Lina C.",
    thread: "Proposal follow-up",
    next: "Today, 09:30",
    draft: "Quick check-in about your decision...",
    action: "Send",
  },
  {
    bucket: "Due today",
    contact: "Mantas R.",
    thread: "Invoice #311",
    next: "Today, 14:00",
    draft: "Friendly reminder on invoice due date...",
    action: "Snooze",
  },
  {
    bucket: "Upcoming",
    contact: "Austeja P.",
    thread: "Meeting notes",
    next: "Apr 8, 10:00",
    draft: "Sharing recap and next steps from our call...",
    action: "Open",
  },
];

export function DigestPreviewSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-18">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#2f2b4e]">Digest preview</p>
        <h2 className="text-3xl font-semibold tracking-tight text-[#1f1c3a] sm:text-4xl">
          One table. Zero guesswork.
        </h2>
      </div>

      <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-black/[0.06] bg-[rgba(255,255,255,0.65)] p-4 shadow-[0_20px_40px_rgba(67,56,202,0.18)] backdrop-blur-sm sm:p-5">
        <table className="min-w-[820px] w-full text-left text-sm text-[#2a2744]">
          <thead>
            <tr className="border-b border-black/[0.1] text-xs uppercase tracking-[0.1em] text-[#4f4a74]">
              <th className="px-3 py-3 font-medium">Bucket</th>
              <th className="px-3 py-3 font-medium">Contact</th>
              <th className="px-3 py-3 font-medium">Thread</th>
              <th className="px-3 py-3 font-medium">Next follow-up</th>
              <th className="px-3 py-3 font-medium">Draft preview</th>
              <th className="px-3 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.contact + row.thread} className="border-b border-black/[0.06] last:border-0">
                <td className="px-3 py-4 font-medium">{row.bucket}</td>
                <td className="px-3 py-4">{row.contact}</td>
                <td className="px-3 py-4">{row.thread}</td>
                <td className="px-3 py-4">{row.next}</td>
                <td className="max-w-[260px] truncate px-3 py-4" title={row.draft}>
                  {row.draft}
                </td>
                <td className="px-3 py-4">
                  <span className="inline-flex rounded-full border border-black/10 bg-white/[0.7] px-3 py-1 text-xs font-medium text-[#231f3e]">
                    {row.action}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
