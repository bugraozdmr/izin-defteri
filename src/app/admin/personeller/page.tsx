"use client";

import { useState } from "react";
import { UserPlus, Search, ClipboardList, ChevronLeft, ChevronRight, Download, Upload, Loader2 } from "lucide-react";
import UserTable from "@/features/user/components/admin/UserTable";
import UserFormModal from "@/features/user/components/admin/UserFormModal";
import ExportModal from "@/features/user/components/admin/ExportModal";
import ImportModal from "@/features/user/components/admin/ImportModal";
import ConfirmDeleteModal from "@/shared/components/ui/ConfirmDeleteModal";
import { useUserManagement } from "@/features/user/hooks/useMain";
import { User } from "@/features/user/constants";

function UserTableSkeleton() {
  return (
    <div className="w-full overflow-x-auto">

      <table className="min-w-[860px] w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
          <tr>
            <th className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4">Adı Soyadı</th>
            <th className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4">İş Unvanı</th>
            <th className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4">İşe Giriş Tarihi</th>
            <th className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4">Kalan İzin</th>
            <th className="px-3 py-3 whitespace-nowrap text-right sm:px-6 sm:py-4">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {Array.from({ length: 6 }).map((_, idx) => (
            <tr key={idx} className="animate-pulse">
              <td className="px-3 py-3 sm:px-6 sm:py-4">
                <div className="h-4 w-40 rounded bg-slate-200/80 dark:bg-slate-800" />
              </td>
              <td className="px-3 py-3 sm:px-6 sm:py-4">
                <div className="h-4 w-32 rounded bg-slate-200/80 dark:bg-slate-800" />
              </td>
              <td className="px-3 py-3 sm:px-6 sm:py-4">
                <div className="h-4 w-36 rounded bg-slate-200/80 dark:bg-slate-800" />
              </td>
              <td className="px-3 py-3 sm:px-6 sm:py-4">
                <div className="h-4 w-16 rounded bg-slate-200/80 dark:bg-slate-800" />
              </td>
              <td className="px-3 py-3 sm:px-6 sm:py-4">
                <div className="ml-auto flex justify-end gap-2">
                  <div className="h-8 w-8 rounded-lg bg-slate-200/80 dark:bg-slate-800" />
                  <div className="h-8 w-8 rounded-lg bg-slate-200/80 dark:bg-slate-800" />
                  <div className="h-8 w-8 rounded-lg bg-slate-200/80 dark:bg-slate-800" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminUserPage() {
  const {
    users,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    totalPages,
    totalCount,
    isLoading,
    refreshUsers,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    selectedUser,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    handleOpenCreate,
    handleOpenEdit,
    handleSaveUser,
    handleDeleteUser,
    handleConfirmDelete,
  } = useUserManagement();
  
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [requestFormUser, setRequestFormUser] = useState<User | null>(null);

  const handleOpenRequestForm = (user: User) => {
    setRequestFormUser(user);
    setIsRequestFormOpen(true);
  };

  return (
    <div className="relative mx-auto max-w-7xl space-y-8 overflow-hidden p-6 sm:p-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="floating-orb absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl dark:bg-cyan-900/25" />
        <div className="floating-orb-delay absolute -right-24 top-32 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-900/25" />
      </div>

      <div className="reveal reveal-1 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_14px_34px_-20px_rgba(2,6,23,0.5)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/65 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-6">
          <div className="flex-shrink-0">
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              <ClipboardList className="h-7 w-7 text-sky-500" />
              Personel Yönetimi
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Personelleri yönetin ve güncel tutun.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
            <div className="group relative w-full md:w-56 xl:w-64 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-sky-500" />
              <input
                type="text"
                placeholder="Personel ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-row w-full lg:w-auto items-center gap-2">
              <button 
                onClick={() => setIsImportOpen(true)} 
                title="İçe Aktar"
                className="col-span-1 inline-flex justify-center items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold shadow-sm hover:bg-slate-50 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 whitespace-nowrap"
              >
                <Upload className="h-4 w-4 shrink-0" /> 
                <span className="sm:hidden xl:inline">İçe Aktar</span>
              </button>

              <button 
                onClick={() => setIsExportOpen(true)} 
                title="Dışa Aktar"
                className="col-span-1 inline-flex justify-center items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold shadow-sm hover:bg-slate-50 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 whitespace-nowrap"
              >
                <Download className="h-4 w-4 shrink-0" /> 
                <span className="sm:hidden xl:inline">Dışa Aktar</span>
              </button>

              <button 
                onClick={handleOpenCreate} 
                title="Yeni Ekle"
                className="col-span-2 sm:col-auto w-full sm:w-auto inline-flex justify-center items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-105 active:scale-95 whitespace-nowrap"
              >
                <UserPlus className="h-4 w-4 shrink-0" /> 
                <span className="sm:hidden xl:inline">Yeni Ekle</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="reveal reveal-2 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 shadow-[0_14px_34px_-20px_rgba(2,6,23,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        {isLoading ? (
          <UserTableSkeleton />
        ) : (
          <UserTable
            users={users}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteUser}
            onOpenForm={handleOpenRequestForm}
          />
        )}
        
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div>
            Toplam <span className="font-bold text-slate-900 dark:text-slate-200">{totalCount}</span> kayıt bulundu.
          </div>

          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              aria-label="Önceki sayfa"
              className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 font-medium hover:bg-slate-200 disabled:opacity-50 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Önceki</span>
            </button>

            <span className="shrink-0 text-xs font-semibold text-slate-900 dark:text-slate-200 sm:text-sm">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0 || isLoading}
              aria-label="Sonraki sayfa"
              className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 font-medium hover:bg-slate-200 disabled:opacity-50 dark:hover:bg-slate-800"
            >
              <span className="hidden sm:inline">Sonraki</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <UserFormModal isOpen={isModalOpen} mode={modalMode} initialData={selectedUser} onClose={() => setIsModalOpen(false)} onSave={handleSaveUser} />
      
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Bu personelin silmek istediğine emin misin?"
        description={<><span className="font-semibold text-slate-900 dark:text-slate-100">{deleteTarget?.fullName}</span> adlı personel kalıcı olarak silinecek. Bu işlem geri alınamaz.</>}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      { /* isRequestFormOpen && (
        <AdminUserRequestFormModal isOpen={isRequestFormOpen} user={requestFormUser} onClose={() => { setIsRequestFormOpen(false); setRequestFormUser(null); }} />
      ) */ }

      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      
      <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onSuccess={refreshUsers} />
      
    </div>
  );
}