import { Edit2, Trash2 } from "lucide-react";
import { Holiday } from "@/features/holiday/types";

interface HolidayTableProps {
  holidays: Holiday[];
  onEdit: (holiday: Holiday) => void;
  onDelete: (id: string) => void;
}

export default function HolidayTable({ holidays, onEdit, onDelete }: HolidayTableProps) {
  const formatDayMonth = (day: number, month: number) =>
    `${String(day).padStart(2, "0")} / ${String(month).padStart(2, "0")}`;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
        <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
          <tr>
            <th className="px-6 py-4">Tatil Adı</th>
            <th className="px-6 py-4">Tarih (Gün/Ay)</th>
            <th className="px-6 py-4">Yıl</th>
            <th className="px-6 py-4">Süre</th>
            <th className="px-6 py-4">Tür</th>
            <th className="px-6 py-4">Açıklama</th>
            <th className="px-6 py-4 text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {holidays.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                Henüz kayıtlı bir resmi tatil bulunmuyor.
              </td>
            </tr>
          ) : (
            holidays.map((holiday) => (
              <tr key={holiday.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{holiday.name}</td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold dark:bg-slate-800">
                    {formatDayMonth(holiday.day, holiday.month)}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {holiday.year ? (
                    <span className="font-medium text-slate-600 dark:text-slate-400">{holiday.year}</span>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                      Her Yıl
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                  {holiday.duration === 0.5 ? "Yarım Gün" : "Tam Gün"}
                </td>

                <td className="px-6 py-4">
                  {holiday.type === "PUBLIC" ? (
                    <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                      Resmi
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-violet-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                      Diğer
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{holiday.description || "-"}</td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(holiday)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-600 dark:text-slate-500 dark:hover:bg-sky-500/10 dark:hover:text-sky-400"
                      title="Düzenle"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(holiday.id)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}