"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import AdminLeaveRequestFormModal from "@/features/user/components/admin/AdminLeaveRequestFormModal";
import type { LeaveFormInitialData } from "@/app/(home)/izin-talebi-olustur/hooks/useLeaveForm";

type BalanceRow = {
  year: number;
  totalDays: number;
  usedDays: number;
};

type PersonelPdfModalButtonProps = {
  user: {
    fullName: string;
    jobTitle: string | null;
    phone: string | null;
    hireDate: Date | string | null;
  };
  balances: BalanceRow[];
};

function toInputDate(value: Date | string | null | undefined) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function PersonelPdfModalButton({ user, balances }: PersonelPdfModalButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const initialData = useMemo<LeaveFormInitialData>(() => {
    const leaveYears = (balances ?? [])
      .slice()
      .sort((a, b) => a.year - b.year)
      .map((b) => ({
        year: String(b.year),
        days: String(Math.max(0, (b.totalDays ?? 0) - (b.usedDays ?? 0))),
      }));

    return {
      fullName: user.fullName ?? "",
      duty: user.jobTitle ?? "",
      phone: user.phone ?? "",
      hireDate: toInputDate(user.hireDate),
      leaveYears,
    };
  }, [balances, user.fullName, user.hireDate, user.jobTitle, user.phone]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-sky-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
      >
        <Download className="h-4 w-4" /> PDF Çıktısı
      </button>

      <AdminLeaveRequestFormModal isOpen={isOpen} initialData={initialData} onClose={() => setIsOpen(false)} />
    </>
  );
}
