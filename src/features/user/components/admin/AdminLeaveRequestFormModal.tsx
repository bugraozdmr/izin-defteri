"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import LeaveFormPreview from "@/app/(home)/izin-talebi-olustur/components/LeaveFormPreview";
import { useLeaveForm, type LeaveFormInitialData } from "@/app/(home)/izin-talebi-olustur/hooks/useLeaveForm";

type AdminLeaveRequestFormModalProps = {
  isOpen: boolean;
  initialData?: LeaveFormInitialData;
  onClose: () => void;
};
export default function AdminLeaveRequestFormModal({ isOpen, initialData, onClose }: AdminLeaveRequestFormModalProps) {
  const { formData, handlers, computed } = useLeaveForm(initialData);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
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
              Personel bilgileri sistemden otomatik gelir.
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
          <LeaveFormPreview formData={formData} computed={computed} handlers={handlers} />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
