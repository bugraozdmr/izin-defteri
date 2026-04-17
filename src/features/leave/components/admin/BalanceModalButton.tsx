"use client";

import { createPortal } from "react-dom";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useBalanceDetail } from "@/features/leave/hooks/useBalanceDetail";

interface BalanceModalButtonProps {
  userId: string;
  className?: string;
  compact?: boolean;
}

export default function BalanceModalButton({ userId, className, compact = false }: BalanceModalButtonProps) {
  const {
    isOpen,
    isSaving,
    mounted,
    rows,
    openModal,
    closeModal,
    addRow,
    removeRow,
    updateYear,
    updateTotalDays,
    submit,
  } = useBalanceDetail(userId);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={openModal}
        className={className ?? "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400"}
      >
        <Plus className="h-4 w-4" /> {compact ? "Bakiye" : "Bakiye Ekle"}
      </button>
    );
  }

  const modal = (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={closeModal}
        aria-label="Modalı kapat"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_42px_110px_-42px_rgba(2,6,23,0.85)] dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-cyan-200/40 blur-3xl dark:bg-cyan-800/20" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-emerald-200/35 blur-3xl dark:bg-emerald-800/20" />

        <div className="relative flex items-start justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-slate-100">
              Yıllık Bakiye Ekle
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Yıl ve bakiye girerek personelin izin bakiyesini tanımla.</p>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={closeModal}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={async (event) => {
            event.preventDefault();
            await submit();
          }}
          className="relative flex min-h-0 flex-1 flex-col"
        >
          <div className="border-b border-slate-100 px-5 pt-5 pb-4 dark:border-slate-800">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300">
              Her satıra yıl ve bakiye gir. Örnek: <span className="font-bold text-slate-800 dark:text-slate-100">2025 / 5</span>, <span className="font-bold text-slate-800 dark:text-slate-100">2024 / 6</span>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 pr-4">
            {rows.map((balance, index) => (
              <div key={balance.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-950/35">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Satır {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeRow(balance.id)}
                    disabled={rows.length === 1 || isSaving}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Sil
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                      Yıl
                    </label>
                    <input
                      type="number"
                      min={2000}
                      max={2100}
                      step={1}
                      value={balance.year}
                      onChange={(event) => updateYear(balance.id, event.target.value)}
                      placeholder="Örn: 2026"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                      Bakiye
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      value={balance.totalDays}
                      onChange={(event) => updateTotalDays(balance.id, event.target.value)}
                      placeholder="Örn: 14"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addRow}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" /> Yıl Satırı Ekle
            </button>
          </div>

          <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800">

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-[0_14px_28px_-12px_rgba(2,132,199,0.9)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSaving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={className ?? "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400"}
      >
        <Plus className="h-4 w-4" /> {compact ? "Bakiye" : "Bakiye Ekle"}
      </button>

      {isOpen && mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
