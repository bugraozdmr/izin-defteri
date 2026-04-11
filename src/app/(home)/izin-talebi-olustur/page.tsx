"use client";

import { useMemo, useState } from "react";
import { generatePDF } from "@/lib/pdf";
import {
  Download,
  Loader2,
  CalendarRange,
  UserSquare2,
  FileText,
  AlignLeft,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

function formatDateTR(value: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function calcDaysInclusive(start: string, end: string) {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
  const utcS = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
  const utcE = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
  const diff = Math.floor((utcE - utcS) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null;
  return diff + 1;
}

export default function CreateLeaveRequestPage() {
  const [leaveType, setLeaveType] = useState("Yıllık İzin");
  const [registryNo, setRegistryNo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const days = useMemo(() => calcDaysInclusive(startDate, endDate), [startDate, endDate]);
  
  const documentNo = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `IT-${y}${m}${d}-${String(registryNo || "00000").slice(-5)}`;
  }, [registryNo]);

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    await generatePDF("print-area", `Izin_Talebi_${documentNo}`, {
      leaveType,
      registryNo,
      startDate,
      endDate,
      reason,
      documentNo,
    });
    setIsGeneratingPdf(false);
  };

  return (
    <div className="relative mx-auto mt-24 min-h-[calc(100vh-140px)] max-w-7xl overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="floating-orb absolute -left-20 top-20 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl dark:bg-cyan-800/25" />
        <div className="floating-orb-delay absolute -right-16 top-32 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-800/20" />
      </div>

      <div className="reveal reveal-1 mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-4 py-1.5 text-xs font-semibold text-cyan-800 shadow-sm backdrop-blur dark:border-cyan-900 dark:bg-slate-900/70 dark:text-cyan-200">
          <Sparkles className="h-3.5 w-3.5" />
          Dijital Form Üretimi
        </div>

        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
          İzin <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">Talebi</span> Oluştur
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
          Sol panelden izin bilgilerini gir, sağda resmi belgenin canlı önizlemesini kontrol et ve
          saniyeler içinde PDF olarak indir.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="reveal reveal-2 lg:col-span-4">
          <div className="flex h-fit flex-col gap-6 rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_14px_34px_-20px_rgba(2,6,23,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
              <FileText className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Talep Formu</h2>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">
                  İzin Türü
                </label>
                <div className="relative">
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="block w-full cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-10 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="Yıllık İzin">Yıllık İzin</option>
                    <option value="Mazeret İzni">Mazeret İzni</option>
                    <option value="Sağlık İzni">Sağlık İzni</option>
                    <option value="Ücretsiz İzin">Ücretsiz İzin</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg
                      className="h-4 w-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">
                  Sicil No
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <UserSquare2 className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Örn: 10234"
                    value={registryNo}
                    onChange={(e) => setRegistryNo(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">
                  <CalendarRange className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                  Tarih Aralığı
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              {!days && startDate && endDate && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                  Tarih aralığını kontrol edin (bitiş, başlangıçtan önce olamaz).
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">
                  Açıklama / Mazeret
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-0 top-3 flex items-center pl-4">
                    <AlignLeft className="h-4 w-4 text-slate-400" />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Kısa bir açıklama ekleyin..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="block w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-950/70">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Belge No</div>
                <div className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">{documentNo}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-950/70">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">İzin Süresi</div>
                <div className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">{days ?? "—"} Gün</div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Önizleme çıktısı resmi formatla uyumludur.
            </div>
          </div>
        </div>

        <div className="reveal reveal-3 flex flex-col lg:col-span-8">
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              <FileText className="h-4 w-4 text-slate-400" />
              A4 Önizlemesi
            </div>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_28px_-14px_rgba(2,132,199,0.9)] transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isGeneratingPdf ? "Hazırlanıyor..." : "PDF'i İndir"}
            </button>
          </div>

          <div className="relative overflow-x-auto rounded-3xl border border-slate-200 bg-slate-100 p-4 shadow-inner sm:p-8 dark:border-slate-800 dark:bg-slate-950/60">
            <div
              id="print-area"
              className="mx-auto border border-gray-200 bg-white p-10 text-black shadow-lg sm:p-14"
              style={{ minHeight: "842px", maxWidth: "595px", width: "100%" }}
            >
              <div className="mb-8 flex items-end justify-between border-b-2 border-black pb-6">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-widest text-black">İzin Talep Formu</h2>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-gray-700">İnsan Kaynakları Departmanı</p>
                </div>
                <div className="text-right">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">Belge No</div>
                  <div className="text-sm font-bold text-black">{documentNo}</div>
                </div>
              </div>

              <div className="mb-8 flex flex-col border-2 border-black text-sm">
                <div className="grid grid-cols-2 divide-x-2 divide-black border-b-2 border-black">
                  <div className="p-3">
                    <span className="mb-1 block text-[10px] font-bold uppercase text-gray-600">Personel Sicil No</span>
                    <span className="block text-base font-bold text-black">{registryNo || "—"}</span>
                  </div>
                  <div className="bg-gray-50 p-3">
                    <span className="mb-1 block text-[10px] font-bold uppercase text-gray-600">Talep Edilen İzin Türü</span>
                    <span className="block text-base font-bold text-black">{leaveType}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x-2 divide-black border-b-2 border-black">
                  <div className="p-3">
                    <span className="mb-1 block text-[10px] font-bold uppercase text-gray-600">Başlangıç Tarihi</span>
                    <span className="block text-sm font-bold text-black">{formatDateTR(startDate)}</span>
                  </div>
                  <div className="p-3">
                    <span className="mb-1 block text-[10px] font-bold uppercase text-gray-600">Bitiş Tarihi</span>
                    <span className="block text-sm font-bold text-black">{formatDateTR(endDate)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x-2 divide-black bg-gray-50">
                  <div className="flex flex-col justify-center p-3">
                    <span className="mb-1 block text-[10px] font-bold uppercase text-gray-600">Toplam İzin Süresi</span>
                    <span className="block text-xl font-black text-black">
                      {days ?? "—"} <span className="text-sm font-bold">GÜN</span>
                    </span>
                  </div>
                  <div className="p-3">
                    <span className="mb-1 block text-[10px] font-bold uppercase text-gray-600">Talep Oluşturma Tarihi</span>
                    <span className="block text-sm font-bold text-black">{new Date().toLocaleDateString("tr-TR")}</span>
                  </div>
                </div>
              </div>

              <div className="relative mb-12 min-h-[120px] border-2 border-black p-4">
                <span className="absolute -top-2.5 left-3 bg-white px-2 text-[10px] font-bold uppercase tracking-wider text-black">
                  Açıklama / Mazeret Detayı
                </span>
                <p className="mt-2 text-xs font-medium leading-relaxed text-black">
                  {reason.trim() ? reason : "Mazeret bildirilmemiştir."}
                </p>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-6">
                <div className="relative flex h-40 flex-col border-2 border-black p-3">
                  <span className="mb-1 block text-center text-xs font-black uppercase tracking-widest text-black">Çalışan</span>
                  <div className="mb-auto h-px w-full bg-gray-300" />

                  <div className="mt-auto space-y-2 text-[10px] font-bold uppercase text-gray-500">
                    <div className="flex justify-between border-b border-dotted border-gray-400 pb-1">
                      <span>Tarih:</span>
                      <span className="text-black">{new Date().toLocaleDateString("tr-TR")}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span>İmza:</span>
                      <span></span>
                    </div>
                  </div>
                </div>

                <div className="relative flex h-40 flex-col border-2 border-black p-3">
                  <span className="mb-1 block text-center text-xs font-black uppercase tracking-widest text-black">Yönetici Onayı</span>
                  <div className="mb-auto h-px w-full bg-gray-300" />

                  <div className="mt-auto space-y-2 text-[10px] font-bold uppercase text-gray-500">
                    <div className="flex justify-between border-b border-dotted border-gray-400 pb-1">
                      <span>Tarih:</span>
                      <span>...... / ...... / 20....</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span>İmza / Kaşe:</span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}