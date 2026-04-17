"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2, X } from "lucide-react";
import { deleteBalanceAction, updateBalanceAction } from "@/features/leave/actions";
import { formatDays } from "@/features/leave/helpers";
import ConfirmDeleteModal from "@/shared/components/ui/ConfirmDeleteModal";

interface BalanceRow {
  id: string;
  year: number;
  totalDays: number;
  usedDays: number;
}

interface BalanceTableProps {
  userId: string;
  balances: BalanceRow[];
}

export default function BalanceTable({ userId, balances }: BalanceTableProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [year, setYear] = useState("");
  const [totalDays, setTotalDays] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [deleteTarget, setDeleteTarget] = useState<BalanceRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editingRow = useMemo(
    () => balances.find((item) => item.id === editingId) ?? null,
    [balances, editingId]
  );

  const handleOpenEdit = (row: BalanceRow) => {
    setEditingId(row.id);
    setYear(String(row.year));
    setTotalDays(String(row.totalDays));
  };

  const handleCloseEdit = () => {
    if (isSaving) return;
    setEditingId(null);
    setYear("");
    setTotalDays("");
  };

  const handleSubmitEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingRow) return;

    const parsedYear = Number(year);
    const parsedTotalDays = Number(totalDays);

    if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      toast.error("Geçerli bir yıl girin.");
      return;
    }

    if (!Number.isFinite(parsedTotalDays) || parsedTotalDays <= 0) {
      toast.error("Geçerli bir bakiye girin.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Bakiye güncelleniyor...");
    try {
      const response = await updateBalanceAction(editingRow.id, userId, parsedYear, parsedTotalDays);
      if (!response.success) {
        throw new Error(response.message || "Bakiye güncellenemedi.");
      }

      toast.success("Bakiye güncellendi.", { id: toastId });
      handleCloseEdit();
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message ? String(error.message) : "Bakiye güncellenemedi.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (row: BalanceRow) => {
    setDeleteTarget(row);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const toastId = toast.loading("Bakiye siliniyor...");
    try {
      const response = await deleteBalanceAction(deleteTarget.id, userId);
      if (!response.success) {
        throw new Error(response.message || "Bakiye silinemedi.");
      }

      toast.success("Bakiye silindi.", { id: toastId });
      router.refresh();
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error?.message ? String(error.message) : "Bakiye silinemedi.", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const editModal = editingRow ? (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <button type="button" onClick={handleCloseEdit} className="absolute inset-0" aria-label="Modalı kapat" />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(2,6,23,0.75)] dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <p className="text-sm font-black text-slate-900 dark:text-slate-100">Bakiye Düzenle</p>
          <button
            type="button"
            onClick={handleCloseEdit}
            disabled={isSaving}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmitEdit} className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Yıl</label>
            <input
              type="number"
              min={2000}
              max={2100}
              step={1}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Toplam Bakiye</label>
            <input
              type="number"
              min={0}
              step="0.5"
              value={totalDays}
              onChange={(e) => setTotalDays(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleCloseEdit}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-[0_14px_28px_-12px_rgba(2,132,199,0.9)] disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSaving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="w-full overflow-x-auto">
          <table className="min-w-[760px] w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-950/40 dark:text-slate-400">
                <th className="px-4 py-3 text-left">Yıl</th>
                <th className="px-4 py-3 text-left">Toplam</th>
                <th className="px-4 py-3 text-left">Kullanılan</th>
                <th className="px-4 py-3 text-left">Kalan</th>
                <th className="px-4 py-3 text-left">İşlem</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {balances.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-5 text-center text-sm text-slate-500 dark:text-slate-400">
                    Bakiye kaydı bulunmuyor.
                  </td>
                </tr>
              ) : (
                balances.map((b) => {
                  const remaining = Math.max(0, b.totalDays - b.usedDays);

                  return (
                    <tr
                      key={b.id}
                      className="text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-slate-100">{b.year}</td>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap">{formatDays(b.totalDays)}</td>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap">{formatDays(b.usedDays)}</td>
                      <td className="px-4 py-3 font-black text-sky-700 dark:text-sky-300 whitespace-nowrap">{formatDays(remaining)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-start gap-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(b)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(b)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingRow && mounted ? createPortal(editModal, document.body) : null}

      {mounted && createPortal(
        <ConfirmDeleteModal
          isOpen={!!deleteTarget}
          title="Bakiye Kaydı Silinecek"
          description={
            <>
              <span className="font-bold text-slate-900 dark:text-white">
                {deleteTarget?.year}
              </span>{" "}
              yılına ait{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {deleteTarget?.totalDays}
              </span>{" "}
              günlük izin bakiye kaydı kalıcı olarak silinecektir. Onaylıyor musunuz?
            </>
          }
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />,
        document.body
      )}
    </>
  );
}