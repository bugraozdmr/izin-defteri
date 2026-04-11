"use client";

import { CalendarDays, Filter, Loader2, Calendar, Palmtree } from "lucide-react";
import { UpcomingHoliday } from "@/app/(home)/tatiller/constants/tatiller.constants";
import HolidayCard from "@/app/(home)/tatiller/components/HolidayCard";
import { useTatiller } from "./hooks/useTatiller";

export default function PublicHolidaysPage() {
  const {
    holidays,
    isLoading,
    viewMode,
    setViewMode,
    formatFriendlyDate,
  } = useTatiller();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 pt-24 transition-colors duration-300 dark:bg-[#020617]">
      
      <div className="relative mx-auto min-h-[calc(100vh-140px)] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        <div className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
          <div className="text-center md:text-left">
            <h1 className="flex items-center justify-center gap-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl md:justify-start">
              <CalendarDays className="h-8 w-8 text-sky-500" />
              Resmi Tatil Takvimi
            </h1>
            <p className="mt-2 max-w-xl text-slate-600 dark:text-slate-400">
              Önümüzdeki resmi ve kurumsal tatilleri görüntüleyerek yıllık izin planlamanızı kolayca yapabilirsiniz.
            </p>
          </div>

          <div className="flex shrink-0 items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <button
              onClick={() => setViewMode("thisYear")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                viewMode === "thisYear"
                  ? "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Filter className="h-4 w-4" />
              Bu Yıl Kalanlar
            </button>
            <button
              onClick={() => setViewMode("all")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                viewMode === "all"
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Calendar className="h-4 w-4" />
              Tümünü Göster
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
            <span className="mt-4 font-medium">Tatiller listesi hazırlanıyor...</span>
          </div>
        ) : holidays.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 border-dashed bg-white/50 py-20 text-center backdrop-blur dark:border-slate-800 dark:bg-slate-900/50">
            <Palmtree className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Tatil Bulunamadı</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Seçili filtrelere uygun yaklaşan bir tatil görünmüyor.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {holidays.map((holiday, index) => (
              <HolidayCard
                key={`${holiday.id}-${index}`}
                holiday={holiday}
                isClosest={index === 0 && viewMode === "thisYear"}
                formatFriendlyDate={formatFriendlyDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}