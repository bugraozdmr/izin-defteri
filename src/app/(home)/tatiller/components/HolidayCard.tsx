import { Palmtree, Building2 } from "lucide-react";
import { UpcomingHoliday } from "@/app/(home)/tatiller/constants/tatiller.constants";

interface HolidayCardProps {
  holiday: UpcomingHoliday;
  isClosest: boolean;
  formatFriendlyDate: (date: string | Date) => string;
}

export default function HolidayCard({ holiday, isClosest, formatFriendlyDate }: HolidayCardProps) {
  const currentYear = new Date().getFullYear();
  const holidayYear = new Date(holiday.nextDate).getFullYear();
  const isNextYear = holidayYear !== currentYear;

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-3xl border p-6 transition-all hover:-translate-y-1 hover:shadow-xl ${
        isClosest
          ? "border-sky-200 bg-gradient-to-b from-sky-50 to-white shadow-sky-100 dark:border-sky-800/60 dark:from-sky-950/40 dark:to-slate-900 dark:shadow-sky-900/20"
          : "border-slate-200 bg-white/80 shadow-slate-100 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-none"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        {holiday.type === "PUBLIC" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <Palmtree className="h-3.5 w-3.5" /> Resmi Tatil
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            <Building2 className="h-3.5 w-3.5" /> Kurumsal
          </span>
        )}

        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {holiday.duration === 0.5 ? "Yarım Gün" : `${holiday.duration} Gün`}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          {holiday.name}
        </h3>
        <p className="mt-2 text-2xl font-black text-sky-600 dark:text-sky-400">
          {formatFriendlyDate(holiday.nextDate)}
        </p>
        
        {isNextYear && (
          <p className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-500">
            Gelecek Yıl ({holidayYear})
          </p>
        )}
      </div>

      {holiday.description && (
        <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800/60">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {holiday.description}
          </p>
        </div>
      )}

      {isClosest && (
        <div className="absolute right-0 top-0 rounded-bl-2xl bg-sky-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
          En Yakın
        </div>
      )}
    </div>
  );
}