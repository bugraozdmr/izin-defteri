import { notFound } from "next/navigation";
import { Briefcase, CalendarDays, FileText, Phone } from "lucide-react";

import { getUserDetailsAction } from "@/features/user/actions";
import { formatDateLong, formatDateShort, formatDays } from "@/features/leave/helpers";
import BalanceModalButton from "@/features/leave/components/admin/BalanceModalButton";
import BalanceTable from "@/features/leave/components/admin/BalanceTable";
import LeaveModalButton from "@/features/leave/components/admin/LeaveModalButton";
import LeaveTable from "@/features/leave/components/admin/LeaveTable";
import PersonelPdfModalButton from "@/features/user/components/admin/PersonelPdfModalButton";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}
export default async function PersonelDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const response = await getUserDetailsAction(id);

  if (!response.success || !response.data) {
    return notFound();
  }

  const user = response.data;
  const balances = user.balances || [];
  const leaves = user.leaves || [];

  const totalDays = balances.reduce((acc, b) => acc + b.totalDays, 0);
  const usedDays = balances.reduce((acc, b) => acc + b.usedDays, 0);
  const remainingDays = Math.max(0, totalDays - usedDays);
  const usageRate = totalDays > 0 ? Math.min(100, Math.round((usedDays / totalDays) * 100)) : 0;

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
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Personel Detayı</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {user.fullName}
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{user.jobTitle || "-"}</p>
            </div>
          </div>

          {/* <div className="grid grid-cols-1 gap-2 sm:grid-cols-1 xl:grid-cols-1">
            <PersonelPdfModalButton user={user} balances={balances} />
          </div> */}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_14px_34px_-20px_rgba(2,6,23,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div>
                  
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Bilgiler</p>
                </div>
              </div>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">İşe giriş</dt>
                <dd className="inline-flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  {formatDateLong(user.hireDate)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">Unvan</dt>
                <dd className="inline-flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  {user.jobTitle || "-"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">Telefon</dt>
                <dd className="inline-flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {user.phone || "-"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_14px_34px_-20px_rgba(2,6,23,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Toplam Özet</p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Toplam</p>
                <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{formatDays(totalDays)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Kullanılan</p>
                <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{formatDays(usedDays)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Kalan</p>
                <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{formatDays(remainingDays)}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-500"
                  style={{ width: `${usageRate}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Kullanım oranı: %{usageRate}</p>
            </div>

          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          
          <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_14px_34px_-20px_rgba(2,6,23,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-sky-500" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Yıllık İzin Bakiyeleri</h2>
              </div>
              <div className="flex items-center gap-2">
                <BalanceModalButton
                  userId={user.id}
                  compact
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                />
              </div>
            </div>

            <BalanceTable userId={user.id} balances={balances} />
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_14px_34px_-20px_rgba(2,6,23,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">İzin Kayıtları</h2>
              </div>
              <div className="flex items-center gap-2">
                <LeaveModalButton
                  userId={user.id}
                  compact
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                />
              </div>
            </div>

            <LeaveTable
              userId={user.id}
              user={{ fullName: user.fullName, jobTitle: user.jobTitle, phone: user.phone ?? null, hireDate: user.hireDate ?? null }}
              balances={balances}
              leaves={leaves}
            />
          </div>

        </div>
      </div>
    </div>
  );
}