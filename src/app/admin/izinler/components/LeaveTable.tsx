import { Edit2, FileIcon, Trash2 } from "lucide-react";
import { Leave } from "@/features/leave/types/leave";

interface LeaveTableProps {
  leaves: Leave[];
  onEdit: (leave: Leave) => void;
  onDelete: (id: string) => void;
  onOpenForm: (leave: Leave) => void;
}

export default function LeaveTable({ leaves = [], onEdit, onDelete, onOpenForm }: LeaveTableProps) {
  const formatDate = (dateValue: Date | null | string) => {
    if (!dateValue) return "-";
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
  };

  const formatLeaves = (leavesObj: Record<string, number> | any) => {
    if (!leavesObj || Object.keys(leavesObj).length === 0) return "-";
    
    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(leavesObj).map(([year, days]) => (
          <span key={year} className="inline-flex items-center rounded-md bg-sky-50 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:bg-sky-500/10 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/50">
            {year} ({String(days)} Gün)
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
        <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
          <tr>
            <th className="px-6 py-4">Adı Soyadı</th>
            <th className="px-6 py-4">İşe Giriş Tarihi</th>
            <th className="px-6 py-4">İzin Bakiyeleri (Yıl)</th>
            <th className="px-6 py-4 text-center">Yıllık İzin</th>
            <th className="px-6 py-4 text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {leaves.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                Henüz kayıtlı bir personel izni bulunmuyor.
              </td>
            </tr>
          ) : (
            leaves.map((leave) => (
              <tr key={leave.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                  {leave.fullName}
                </td>

                <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">
                  {formatDate(leave.hireDate)}
                </td>

                <td className="px-6 py-4">
                  {formatLeaves(leave.leaves)}
                </td>

                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex h-7 min-w-[28px] items-center justify-center rounded-full px-2.5 text-xs font-bold ${
                      leave.totalDays === 0
                        ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                    }`}
                  >
                    {leave.totalDays}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenForm(leave)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:text-slate-500 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
                      title="Formu Aç"
                    >
                      <FileIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(leave)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-600 dark:text-slate-500 dark:hover:bg-sky-500/10 dark:hover:text-sky-400"
                      title="Düzenle"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(leave.id)}
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