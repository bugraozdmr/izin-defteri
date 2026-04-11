"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardEdit,
  Download,
  MousePointer2,
  Search,
  CalendarDays,
} from "lucide-react";
import { Holiday } from "@/features/holiday/types/holiday";
import { getClosestUpcomingHolidayAction } from "@/features/holiday/actions/holiday.action";

export default function HomePage() {
  const [upcomingHoliday, setUpcomingHoliday] = useState<Holiday | null>(null);
  const [isLoadingHoliday, setIsLoadingHoliday] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        setIsLoadingHoliday(true);
        const res = await getClosestUpcomingHolidayAction();
        if (res.success && res.data) {
          setUpcomingHoliday(res.data as unknown as Holiday);
        }
      } catch (error) {
        console.error("Yaklaşan tatil çekilemedi", error);
      } finally {
        setIsLoadingHoliday(false);
      }
    };

    fetchUpcoming();
  }, []);

  const steps = [
    {
      step: "01",
      title: "Talep Başlat",
      desc: "Sistem üzerinden yeni izin formu oluşturma ekranına geçiş yapın.",
      icon: MousePointer2,
      link: "/izin-talebi-olustur",
      buttonText: "Forma Git",
      accent: "from-sky-500 to-cyan-500",
      bg: "bg-sky-50/80 text-sky-700 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-800/70",
    },
    {
      step: "02",
      title: "Veri Girişi",
      desc: "İzin türü, başlangıç ve bitiş tarihlerini sisteme tanımlayın.",
      icon: ClipboardEdit,
      accent: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50/80 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800/70",
    },
    {
      step: "03",
      title: "PDF Çıktı",
      desc: "Sistem tarafından hazırlanan resmi dilekçeyi PDF olarak indirin.",
      icon: Download,
      accent: "from-amber-500 to-orange-500",
      bg: "bg-amber-50/80 text-amber-700 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800/70",
    },
  ];

  const formatHolidayDate = (day: number, month: number) => {
    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    return `${day} ${monthNames[month - 1]}`;
  };

  return (
    <div className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_38%,#f4f8ff_100%)] transition-colors duration-300 dark:bg-[linear-gradient(180deg,#020617_0%,#0b1220_42%,#09111e_100%)] pt-24">
      
      <div className="pointer-events-none absolute inset-0">
        <div className="floating-orb absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-200/45 blur-3xl dark:bg-sky-800/35" />
        <div className="floating-orb-delay absolute -right-16 top-40 h-64 w-64 rounded-full bg-amber-200/45 blur-3xl dark:bg-amber-700/30" />
        <div className="absolute bottom-0 left-0 right-0 h-36 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.16),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.22),transparent_70%)]" />
      </div>

      <section className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-4xl text-center reveal reveal-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold text-sky-800 shadow-sm backdrop-blur dark:border-sky-900 dark:bg-slate-900/65 dark:text-sky-200">
            <CalendarDays className="h-4 w-4 shrink-0 text-sky-500 dark:text-sky-400" />
              {isLoadingHoliday ? (
                <span className="animate-pulse">Yaklaşan tatil kontrol ediliyor...</span>
              ) : upcomingHoliday ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-medium hidden sm:inline">Yaklaşan Tatil:</span>
                  <span className="font-bold">{upcomingHoliday.name}</span>
                  <span className="inline-flex items-center rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:bg-sky-900 dark:text-sky-300">
                    {formatHolidayDate(upcomingHoliday.day, upcomingHoliday.month)}
                  </span>
                  <span className="hidden sm:inline-flex items-center rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    {upcomingHoliday.duration === 0.5 ? "Yarım Gün" : "Tam Gün"}
                  </span>
                </div>
              ) : (
                <span>Yakın zamanda resmi tatil bulunmuyor.</span>
              )}
          </div>

          <h1 className="mt-5 text-balance text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl lg:text-5xl">
            Formu Oluştur ve
            <span className="bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent dark:from-sky-400 dark:via-cyan-300 dark:to-emerald-300">
              {" "}
              İndir
            </span>
          </h1>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/izin-talebi-olustur"
              className="inline-flex min-w-52 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-[0_12px_30px_-12px_rgba(2,132,199,0.85)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-12px_rgba(2,132,199,0.9)]"
            >
              Formu Doldur 
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sorgula"
              className="inline-flex min-w-52 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white/85 px-6 py-3 text-sm font-bold text-slate-700 backdrop-blur transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-900/75 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Sorgula
              <Search className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="relative mt-12 lg:mt-14 reveal reveal-3">
          <div className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700 md:block" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="absolute left-1/2 top-8 hidden -translate-x-1/2 md:block">
                  <div className="h-3 w-3 rounded-full bg-sky-500 ring-4 ring-white dark:bg-sky-400 dark:ring-slate-950" />
                </div>

                <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 p-8 shadow-[0_12px_32px_-18px_rgba(15,23,42,0.35)] backdrop-blur transition-all hover:-translate-y-1 hover:shadow-[0_20px_45px_-20px_rgba(14,116,144,0.45)] dark:border-slate-800 dark:bg-slate-900/70">
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-90 transition-opacity group-hover:opacity-100 ${step.accent}`}
                  />

                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                      ADIM {step.step}
                    </span>

                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 transition-transform group-hover:scale-110 ${step.bg}`}>
                      <step.icon className="h-6 w-6" />
                    </div>
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {step.desc}
                  </p>

                  {step.link ? (
                    <Link
                      href={step.link}
                      className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white transition-all hover:brightness-105"
                    >
                      {step.buttonText}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <div className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                      <CheckCircle2 className="h-4 w-4" />
                      Sistem otomatik oluşturur
                    </div>
                  )}
                </div>

                {index !== steps.length - 1 && (
                  <div className="mx-auto mt-3 flex w-full items-center justify-center md:hidden">
                    <div className="h-8 w-px bg-slate-300 dark:bg-slate-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 reveal reveal-4">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_16px_38px_-24px_rgba(2,6,23,0.5)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-sky-200/40 blur-2xl dark:bg-sky-700/25" />
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-950">
                    <Search className="h-4 w-4" />
                  </span>
                  Sorgula
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Sicil numaran ile izin bakiyeni (kalan/kullanılan/toplam) ve geçmiş taleplerini görüntüle.
                </p>
              </div>

              <Link
                href="/sorgula"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
              >
                Sorgulamaya Git
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}