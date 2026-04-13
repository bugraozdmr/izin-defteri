"use client";

import { useLeaveForm } from "@/app/(home)/izin-talebi-olustur/hooks/useLeaveForm";
import LeaveFormSidebar from "@/app/(home)/izin-talebi-olustur/components/LeaveFormSidebar";
import LeaveFormPreview from "@/app/(home)/izin-talebi-olustur/components/LeaveFormPreview";

export default function CreateLeaveRequestPage() {
  const { formData, handlers, computed } = useLeaveForm();

  return (
    <div className="mx-auto mt-24 min-h-[calc(100vh-140px)] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Yıllık İzin Formu</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Alanları soldan düzenleyin, sağ tarafta resmi formun birebir önizlemesini görün ve PDF olarak indirin.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <LeaveFormSidebar formData={formData} handlers={handlers} />
        </div>
        
        <LeaveFormPreview formData={formData} computed={computed} handlers={handlers} />
      </div>
    </div>
  );
}