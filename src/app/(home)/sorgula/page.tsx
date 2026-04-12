"use client";

import { useState } from "react";
import {
  Search,
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const mockPastRequests = [
  { id: "IT-20260215-10234", type: "Yıllık İzin", start: "15 Şubat 2026", end: "20 Şubat 2026", days: 5, status: "APPROVED" },
  { id: "IT-20260310-10234", type: "Mazeret İzni", start: "10 Mart 2026", end: "11 Mart 2026", days: 2, status: "APPROVED" },
  { id: "IT-20260425-10234", type: "Yıllık İzin", start: "25 Nisan 2026", end: "26 Nisan 2026", days: 1, status: "PENDING" },
];

export default function QueryLeaveRequestsPage() {
  const [registryNo, setRegistryNo] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registryNo.trim()) return;
    
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 800);
  };

  return (
    <div className="relative mx-auto mt-24 min-h-[calc(100vh-140px)] max-w-7xl overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      { 
      /* <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="floating-orb absolute -left-20 top-16 h-64 w-64 rounded-full bg-sky-200/35 blur-3xl dark:bg-sky-800/30" />
        <div className="floating-orb-delay absolute -right-20 top-28 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-800/25" />
      </div> */ 
      }

      <div className="reveal reveal-1 mb-8">

        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
          İzin <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">Sorgulama</span>
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
          Sicil numaranızı girerek güncel izin bakiyenizi, yıl içindeki kullanımlarınızı ve geçmiş veya
          bekleyen tüm izin taleplerinizin son durumunu görüntüleyebilirsiniz.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="reveal reveal-2 flex flex-col gap-6 lg:col-span-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_14px_34px_-20px_rgba(2,6,23,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
              <User className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Personel Sorgusu</h2>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="registryNo"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300"
                >
                  Sicil Numarası
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="registryNo"
                    type="text"
                    value={registryNo}
                    onChange={(e) => setRegistryNo(e.target.value)}
                    placeholder="Örn: 10234"
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSearching || !registryNo}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-3.5 text-sm font-bold text-white shadow-[0_16px_30px_-16px_rgba(2,132,199,0.9)] transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSearching ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Bilgileri Getir"
                )}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-sky-100 bg-sky-50/75 p-6 dark:border-sky-900/60 dark:bg-sky-950/25">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
              <div>
                <h3 className="text-sm font-bold text-sky-900 dark:text-sky-100">Bakiye Güncellemeleri</h3>
                <p className="mt-2 text-xs font-medium leading-relaxed text-sky-800/85 dark:text-sky-200/85">
                  İzin bakiyesi, yönetici onayından sonra İnsan Kaynakları sistemine işlendiğinde güncellenir.
                  Bekliyor statüsündeki izinler bakiyeden düşülmez.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Sorgu sonuçları sadece görüntüleme amaçlıdır.
            </div>
          </div>
        </div>

        <div className="reveal reveal-3 lg:col-span-8">
          {!hasSearched ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/65 p-8 text-center dark:border-slate-700 dark:bg-slate-900/50">
              <div className="mb-4 rounded-full bg-white p-4 shadow-sm dark:bg-slate-800">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sonuç Bekleniyor</h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                İzin bakiyenizi ve geçmiş taleplerinizi görüntülemek için soldaki alana sicil numaranızı girin.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="group relative overflow-hidden rounded-3xl border border-sky-100 bg-white/85 p-5 shadow-sm dark:border-sky-900/60 dark:bg-slate-900/70">
                  <div className="absolute -right-4 -top-4 opacity-10 transition-transform group-hover:scale-110">
                    <CalendarDays className="h-24 w-24 text-sky-600" />
                  </div>
                  <div className="relative z-10">
                    <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Toplam Hak</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900 dark:text-slate-100">20</span>
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Gün</span>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-3xl border border-amber-100 bg-white/85 p-5 shadow-sm dark:border-amber-900/60 dark:bg-slate-900/70">
                  <div className="absolute -right-4 -top-4 opacity-10 transition-transform group-hover:scale-110">
                    <Clock className="h-24 w-24 text-amber-600" />
                  </div>
                  <div className="relative z-10">
                    <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Kullanılan</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-amber-600 dark:text-amber-400">8</span>
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Gün</span>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-3xl border border-emerald-100 bg-white/85 p-5 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
                  <div className="absolute -right-4 -top-4 opacity-10 transition-transform group-hover:scale-110">
                    <CheckCircle2 className="h-24 w-24 text-emerald-600" />
                  </div>
                  <div className="relative z-10">
                    <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Kalan Bakiye</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">12</span>
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Gün</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_14px_34px_-20px_rgba(2,6,23,0.4)] dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/80">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Geçmiş Talepler</h3>
                  </div>
                  <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {new Date().getFullYear()} Yılı
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mockPastRequests.map((req) => (
                    <div key={req.id} className="p-6 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-900/80">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-start gap-4">
                          <div
                            className={`rounded-xl border p-2.5 ${
                              req.status === "APPROVED"
                                ? "border-emerald-100 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/25"
                                : "border-amber-100 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/25"
                            }`}
                          >
                            {req.status === "APPROVED" ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                              {req.type}
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">({req.days} Gün)</span>
                            </div>
                            <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                              {req.start} - {req.end}
                            </div>
                            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                              Belge: {req.id}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center sm:justify-end">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                              req.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                            }`}
                          >
                            {req.status === "APPROVED" ? "Onaylandı" : "Bekliyor"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}