import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";

import { SssItem } from "@/features/sss/constants";

import { SssFormType } from "@/features/sss/types";
import { INITIAL_SSS_FORM } from "@/features/sss/constants";


interface SssFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: SssItem | null;
  onClose: () => void;
  onSave: (payload: Pick<SssItem, "question" | "answer" | "isActive">) => void;
}

export default function SssFormModal({ isOpen, mode, initialData, onClose, onSave }: SssFormModalProps) {
  const [form, setForm] = useState<SssFormType>(INITIAL_SSS_FORM);

  useEffect(() => {
    if (isOpen && initialData && mode === "edit") {
      setForm({
        question: initialData.question,
        answer: initialData.answer,
        isActive: initialData.isActive,
      });
    } else {
      setForm(INITIAL_SSS_FORM);
    }
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const questionTrimmed = form.question.trim();
    const answerTrimmed = form.answer.trim();

    if (!questionTrimmed || !answerTrimmed) return;

    onSave({
      question: questionTrimmed,
      answer: answerTrimmed,
      isActive: form.isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto p-4 sm:p-6">
      <button
        type="button"
        className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(14,116,144,0.28),rgba(2,6,23,0.75))] backdrop-blur-md"
        onClick={onClose}
        aria-label="Modalı kapat"
        style={{ cursor: "default" }}
      />

      <div className="relative flex min-h-full items-center justify-center py-6 sm:py-0">
        <div className="relative flex w-full max-w-3xl max-h-[calc(100dvh-3rem)] flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_42px_110px_-42px_rgba(2,6,23,0.85)] backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/95 sm:rounded-[28px] sm:p-7">
          
          <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-cyan-200/45 blur-3xl dark:bg-cyan-800/20" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-52 w-52 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-800/20" />

          <div className="relative mb-4 flex shrink-0 items-start justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800 sm:mb-5 sm:pb-5">
            <div className="space-y-2">
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                {mode === "create" ? "Yeni Soru Ekle" : "Soruyu Düzenle"}
              </h2>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2 overscroll-contain">
              
              <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/65 p-4 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-950/55">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Soru Başlığı
                  </label>
                  <input
                    value={form.question}
                    onChange={(e) => setForm((prev) => ({ ...prev, question: e.target.value }))}
                    placeholder="Örn: Yıllık izin hakkım kaç gündür?"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/65 p-4 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-950/55">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Cevap
                  </label>
                  <textarea
                    rows={5}
                    value={form.answer}
                    onChange={(e) => setForm((prev) => ({ ...prev, answer: e.target.value }))}
                    placeholder="Sorunun detaylı açıklamasını girin..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Yayın Durumu
                  </label>
                  <select
                    value={form.isActive ? "true" : "false"}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, isActive: e.target.value === "true" }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="true">Aktif (Kullanıcılara Gösterilir)</option>
                    <option value="false">Pasif (Gizli)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4 flex shrink-0 items-center justify-end gap-2 border-t border-slate-200/80 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                İptal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-2 text-sm font-bold text-white shadow-[0_14px_28px_-12px_rgba(2,132,199,0.9)] transition hover:-translate-y-0.5 hover:brightness-105"
              >
                {mode === "create" ? "Kaydet" : "Güncelle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}