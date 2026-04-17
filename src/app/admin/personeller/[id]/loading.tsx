export default function Loading() {
  return (
    <div className="relative mx-auto max-w-7xl space-y-6 overflow-hidden p-4 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="floating-orb absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl dark:bg-cyan-900/25" />
        <div className="floating-orb-delay absolute -right-24 top-32 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-900/25" />
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_14px_34px_-20px_rgba(2,6,23,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 sm:p-6">
        <div className="pointer-events-none absolute -top-20 right-0 h-44 w-44 rounded-full bg-cyan-300/35 blur-3xl dark:bg-cyan-700/20" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="animate-pulse">
              <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-3 h-8 w-64 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-3 h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_14px_34px_-20px_rgba(2,6,23,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <div className="animate-pulse">
              <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_14px_34px_-20px_rgba(2,6,23,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <div className="animate-pulse">
              <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />

              <div className="mt-4 grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <div className="h-3 w-14 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="mt-2 h-6 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="mt-2 h-3 w-32 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_14px_34px_-20px_rgba(2,6,23,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-5 w-52 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-8 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-full overflow-x-auto">
                <table className="min-w-[760px] w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-950/40 dark:text-slate-400">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <th key={idx} className="px-4 py-3 text-left">
                          <div className="h-3 w-20 rounded bg-slate-200/80 dark:bg-slate-800" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        {Array.from({ length: 5 }).map((__, cidx) => (
                          <td key={cidx} className="px-4 py-3">
                            <div className="h-4 w-24 rounded bg-slate-200/80 dark:bg-slate-800" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_14px_34px_-20px_rgba(2,6,23,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-8 w-20 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-full overflow-x-auto">
                <table className="min-w-[900px] w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-950/40 dark:text-slate-400">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <th key={idx} className="px-4 py-3 text-left">
                          <div className="h-3 w-20 rounded bg-slate-200/80 dark:bg-slate-800" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        {Array.from({ length: 5 }).map((__, cidx) => (
                          <td key={cidx} className="px-4 py-3">
                            <div className="h-4 w-24 rounded bg-slate-200/80 dark:bg-slate-800" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
