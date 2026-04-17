import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { UserFormPayload } from "@/features/user/types";
import { User } from "@/features/user/constants";
import DatePicker from "@/shared/components/ui/DatePicker";

interface UserModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: User | null;
  onClose: () => void;
  onSave: (payload: UserFormPayload) => void;
}

export default function LeaveFormModal({ isOpen, mode, initialData, onClose, onSave }: UserModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState<string | null>(null);
  const [hireDate, setHireDate] = useState("");

  useEffect(() => {
    if (isOpen && initialData && mode === "edit") {
      setFullName(initialData.fullName);
      setPhone(initialData.phone);
      setJobTitle(initialData.jobTitle);

      setHireDate(initialData.hireDate ? new Date(initialData.hireDate).toISOString().split("T")[0] : "");
    } else {
      setFullName("");
      setPhone(null);
      setJobTitle(null);
      setHireDate("");
    }
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    onSave({
      fullName: fullName.trim(),
      hireDate: hireDate ? new Date(hireDate) : null,
      phone: phone?.trim() || null,
      jobTitle: jobTitle,
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

      <div className="relative mx-auto my-3 flex min-h-[calc(100dvh-1.5rem)] w-full items-center justify-center sm:my-0 sm:min-h-[calc(100dvh-3rem)]">
        <div className="relative mx-auto flex w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_42px_110px_-42px_rgba(2,6,23,0.85)] backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/95 sm:rounded-[28px] sm:max-h-[calc(100dvh-3rem)] sm:p-7">
          <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-cyan-200/45 blur-3xl dark:bg-cyan-800/20" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-52 w-52 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-800/20" />

          <div className="relative mb-4 flex items-start justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800 sm:mb-5 sm:pb-5">
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {mode === "create" ? "Yeni Personel Ekle" : "Personeli Düzenle"}
            </h2>
            <button onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 overscroll-contain">
              
              <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/65 p-4 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-950/55">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Adı Soyadı
                  </label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Örn: Ali Kadir Kamacı"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    İş Unvanı
                  </label>
                  <input
                    value={jobTitle ?? ""}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Örn: Memur"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Telefon
                  </label>
                  <input
                    value={phone ?? ""}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Örn: 555 555 55 55"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2 relative z-50">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    İşe Giriş Tarihi
                  </label>
                  <DatePicker 
                    value={hireDate} 
                    onChange={setHireDate} 
                    placeholder="Tarih seçmek için tıklayın"
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