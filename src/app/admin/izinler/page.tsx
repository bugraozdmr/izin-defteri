"use client";

import { useState } from "react";
import { UserPlus, Search, ClipboardList, ChevronLeft, ChevronRight, Download, Upload } from "lucide-react";
import LeaveTable from "@/features/leave/components/admin/LeaveTable";
import LeaveFormModal from "@/features/leave/components/admin/LeaveFormModal";
import AdminLeaveRequestFormModal from "@/features/leave/components/admin/AdminLeaveRequestFormModal";
import ExportModal from "@/features/leave/components/admin/ExportModal";
import ImportModal from "@/features/leave/components/admin/ImportModal";
import ConfirmDeleteModal from "@/shared/components/ui/ConfirmDeleteModal";
import { useLeaveManagement } from "@/features/leave/hooks";
import type { Leave } from "@/features/leave/types";

export default function AdminLeavesPage() {
  const {
    leaves,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    totalPages,
    totalCount,
    isLoading,
    refreshLeaves,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    selectedLeave,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    handleOpenCreate,
    handleOpenEdit,
    handleSaveLeave,
    handleDeleteLeave,
    handleConfirmDelete,
  } = useLeaveManagement();
  
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [requestFormLeave, setRequestFormLeave] = useState<Leave | null>(null);

  const handleOpenRequestForm = (leave: Leave) => {
    setRequestFormLeave(leave);
    setIsRequestFormOpen(true);
  };

  return (
    <div className="relative mx-auto max-w-7xl space-y-8 overflow-hidden p-6 sm:p-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="floating-orb absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl dark:bg-cyan-900/25" />
        <div className="floating-orb-delay absolute -right-24 top-32 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-900/25" />
      </div>

      <div className="reveal reveal-1 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_14px_34px_-20px_rgba(2,6,23,0.5)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/65 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              <ClipboardList className="h-7 w-7 text-sky-500" />
              Personel İzin Yönetimi
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Personellerin yıllık izin bakiyelerini yönetin ve güncel tutun.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="group relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-sky-500" />
              <input
                type="text"
                placeholder="Personel ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div className="flex w-full sm:w-auto items-center gap-2">
              <button onClick={() => setIsImportOpen(true)} className="flex-1 sm:flex-none inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-slate-50 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Upload className="h-4 w-4" /> <span className="hidden sm:inline">İçe Aktar</span>
              </button>

              <button onClick={() => setIsExportOpen(true)} className="flex-1 sm:flex-none inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-slate-50 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Download className="h-4 w-4" /> <span className="hidden sm:inline">Dışa Aktar</span>
              </button>

              <button onClick={handleOpenCreate} className="flex-1 sm:flex-none inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-105 active:scale-95">
                <UserPlus className="h-4 w-4" /> <span className="hidden sm:inline">Yeni Ekle</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="reveal reveal-2 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 shadow-[0_14px_34px_-20px_rgba(2,6,23,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-400">Veriler yükleniyor...</div>
        ) : (
          <LeaveTable 
            leaves={leaves}
            onEdit={handleOpenEdit} 
            onDelete={handleDeleteLeave} 
            onOpenForm={handleOpenRequestForm}
          />
        )}
        
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400">
          <div>Toplam <span className="font-bold text-slate-900 dark:text-slate-200">{totalCount}</span> kayıt bulundu.</div>
          <div className="flex items-center gap-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading} className="flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium hover:bg-slate-200 disabled:opacity-50 dark:hover:bg-slate-800">
              <ChevronLeft className="h-4 w-4" /> Önceki
            </button>
            <span className="font-semibold text-slate-900 dark:text-slate-200">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0 || isLoading} className="flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium hover:bg-slate-200 disabled:opacity-50 dark:hover:bg-slate-800">
              Sonraki <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <LeaveFormModal isOpen={isModalOpen} mode={modalMode} initialData={selectedLeave} onClose={() => setIsModalOpen(false)} onSave={handleSaveLeave} />
      
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Bu personelin izin kaydını silmek istediğine emin misin?"
        description={<><span className="font-semibold text-slate-900 dark:text-slate-100">{deleteTarget?.fullName}</span> adlı personelin izin bakiyeleri kalıcı olarak silinecek. Bu işlem geri alınamaz.</>}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {isRequestFormOpen && (
        <AdminLeaveRequestFormModal isOpen={isRequestFormOpen} leave={requestFormLeave} onClose={() => { setIsRequestFormOpen(false); setRequestFormLeave(null); }} />
      )}

      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      
      <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onSuccess={refreshLeaves} />
      
    </div>
  );
}