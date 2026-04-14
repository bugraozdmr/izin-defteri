import { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import LeaveFormSidebar from "@/app/(home)/izin-talebi-olustur/components/LeaveFormSidebar";
import LeaveFormPreview from "@/app/(home)/izin-talebi-olustur/components/LeaveFormPreview";
import { useLeaveForm, type LeaveFormInitialData } from "@/app/(home)/izin-talebi-olustur/hooks/useLeaveForm";
import type { Leave } from "@/features/leave/types/leave";

type AdminLeaveRequestFormModalProps = {
  isOpen: boolean;
  leave: Leave | null;
  onClose: () => void;
};

function toInputDate(value: Date | string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapLeaveToInitialData(leave: Leave | null): LeaveFormInitialData {
  if (!leave) return {};
  const leaveYears = Object.entries(leave.leaves ?? {})
    .map(([year, days]) => ({ year, days: Number(days) }))
    .filter((item) => Number.isFinite(item.days) && /^\d{4}$/.test(item.year))
    .sort((a, b) => Number.parseInt(a.year, 10) - Number.parseInt(b.year, 10))
    .map((item) => ({
      year: item.year,
      days: String(item.days),
    }));

  return {
    fullName: leave.fullName ?? "",
    leaveYears,
    returnDate: toInputDate(leave.hireDate),
    remainingLeave: Number.isFinite(leave.totalDays) ? String(leave.totalDays) : "",
  };
}

export default function AdminLeaveRequestFormModal({ isOpen, leave, onClose }: AdminLeaveRequestFormModalProps) {
  const initialData = useMemo(() => mapLeaveToInitialData(leave), [leave]);
  const { formData, handlers, computed } = useLeaveForm(initialData);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Yıllık izin formu"
      onMouseDown={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-[1380px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-[0_24px_70px_-34px_rgba(2,6,23,0.85)] dark:border-slate-700 dark:bg-slate-950"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/80">
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-slate-100">Yıllık İzin Formu</p>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
              Personel verileri otomatik dolduruldu, alanlar düzenlenebilir.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <LeaveFormSidebar formData={formData} handlers={handlers} />
            </div>
            <LeaveFormPreview formData={formData} computed={computed} handlers={handlers} />
          </div>
        </div>
      </div>
    </div>
  );
}
