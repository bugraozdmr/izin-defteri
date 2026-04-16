import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Holiday } from "@/features/holiday/types";

import { 
  INITIAL_HOLIDAY_FORM, 
  DAY_OPTIONS, 
  MONTH_OPTIONS 
} from "@/features/holiday/constants";

import type { HolidayFormType } from "@/features/holiday/types";

interface HolidayFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: Holiday | null;
  onClose: () => void;
  onSave: (payload: Omit<Holiday, "id">) => void;
}

export default function HolidayFormModal({ isOpen, mode, initialData, onClose, onSave }: HolidayFormModalProps) {
  const [form, setForm] = useState<HolidayFormType>(INITIAL_HOLIDAY_FORM);

  useEffect(() => {
    if (isOpen && initialData && mode === "edit") {
      setForm({
        name: initialData.name,
        day: String(initialData.day),
        month: String(initialData.month),
        year: initialData.year ? String(initialData.year) : "",
        duration: String(initialData.duration),
        type: initialData.type,
        description: initialData.description ?? "",
      });
    } else {
      setForm(INITIAL_HOLIDAY_FORM);
    }
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedDay = Number(form.day);
    const parsedMonth = Number(form.month);
    const parsedDuration = Number(form.duration);
    const parsedYear = form.year.trim() ? Number(form.year) : null;

    if (!form.name.trim()) return;
    if (!Number.isInteger(parsedDay) || parsedDay < 1 || parsedDay > 31) return;
    if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) return;
    if (![0.5, 1].includes(parsedDuration)) return;
    if (parsedYear !== null && (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > 2100)) return;

    onSave({
      name: form.name.trim(),
      day: parsedDay,
      month: parsedMonth,
      year: parsedYear,
      duration: parsedDuration,
      type: form.type,
      description: form.description.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto p-3 sm:p-6">
       <button
        type="button"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,116,144,0.28),rgba(2,6,23,0.75))] backdrop-blur-md"
        onClick={onClose}
        aria-label="Modalı kapat"
      />

      <div className="relative mx-auto my-3 flex min-h-[calc(100dvh-1.5rem)] w-full items-end justify-center sm:my-0 sm:min-h-[calc(100dvh-3rem)] sm:items-center">
        <div className="relative mx-auto flex w-full max-w-3xl max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_42px_110px_-42px_rgba(2,6,23,0.85)] backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/95 sm:rounded-[28px] sm:max-h-[calc(100dvh-3rem)] sm:p-7">
        <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-cyan-200/45 blur-3xl dark:bg-cyan-800/20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-52 w-52 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-800/20" />

        <div className="relative mb-4 flex items-start justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800 sm:mb-5 sm:pb-5">
          <div className="space-y-2">
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                {mode === "create" ? "Yeni Tatil Ekle" : "Tatili Düzenle"}
              </h2>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 overscroll-contain">
            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/65 p-4 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-950/55">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Tatil Adı
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Örn: Cumhuriyet Bayramı"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                required
              />
            </div>
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/65 p-4 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-950/55">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Gün
              </label>
              <select
                value={form.day}
                onChange={(e) => setForm((prev) => ({ ...prev, day: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                required
              >
                <option value="">Gün seçin</option>
                {DAY_OPTIONS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Ay
              </label>
              <select
                value={form.month}
                onChange={(e) => setForm((prev) => ({ ...prev, month: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                required
              >
                <option value="">Ay seçin</option>
                {MONTH_OPTIONS.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Yıl (Opsiyonel)
              </label>
              <input
                type="number"
                min={1900}
                max={2100}
                value={form.year}
                onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))}
                placeholder="Boş bırakılırsa her yıl"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Süre (Gün)
              </label>
              <select
                value={form.duration}
                onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="1">Tam Gün</option>
                <option value="0.5">Yarım Gün</option>
              </select>
            </div>
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/65 p-4 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-950/55">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Tür
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, type: e.target.value as "PUBLIC" | "CORPORATE" }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="PUBLIC">Resmi</option>
                <option value="CORPORATE">Kurumsal</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Açıklama
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Kısa açıklama (opsiyonel)"
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-200/80 pt-4 dark:border-slate-800">
              <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                İptal
              </button>
              <button type="submit" className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-2 text-sm font-bold text-white shadow-[0_14px_28px_-12px_rgba(2,132,199,0.9)] transition hover:-translate-y-0.5 hover:brightness-105">
                {mode === "create" ? "Kaydet" : "Güncelle"}
              </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}