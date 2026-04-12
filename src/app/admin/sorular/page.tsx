"use client";

import { CalendarPlus, Search, CircleQuestionMark, Edit2, Trash2, Loader2 } from "lucide-react";
import { formatDate } from "@/app/admin/sorular/utils/helpers";
import SssFormModal from "@/app/admin/sorular/components/SssFormModal";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import { useSssAdmin } from "@/app/admin/sorular/hooks/useSssAdmin"; 

export default function AdminSssPage() {
  const {
    isLoading,
    searchTerm,
    setSearchTerm,
    filteredSssList,
    modalOpen,
    setModalOpen,
    modalMode,
    selectedSss,
    handleOpenCreate,
    handleOpenEdit,
    handleSaveSss,
    deleteModalOpen,
    isDeleting,
    itemToDelete,
    handleDeleteClick,
    handleCancelDelete,
    confirmDelete,
  } = useSssAdmin();

  return (
    <div className="relative mx-auto max-w-7xl space-y-8 overflow-hidden p-6 sm:p-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="floating-orb absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl dark:bg-cyan-900/25" />
        <div className="floating-orb-delay absolute -right-24 top-32 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-900/25" />
      </div>

      <div className="reveal reveal-1 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_14px_34px_-20px_rgba(2,6,23,0.5)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/65 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="mt-3 flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              <CircleQuestionMark className="h-7 w-7 text-sky-500" />
              Sık Sorulan Sorular
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              İnsanların en çok sorduğu soruları oluştur ve düzenle.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="group relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-sky-500" />
              <input
                type="text"
                placeholder="Soru ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm font-medium text-slate-700 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-14px_rgba(2,132,199,0.95)] transition-all hover:-translate-y-0.5 hover:brightness-105 active:scale-95"
            >
              <CalendarPlus className="h-4 w-4" />
              Yeni Ekle
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/50 bg-white/40 py-20 backdrop-blur dark:border-slate-800/50 dark:bg-slate-900/40">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Sorular yükleniyor...</p>
        </div>
      ) : filteredSssList.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredSssList.map((item, index) => (
            <article
              key={item.id}
              className="reveal flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_28px_-22px_rgba(2,6,23,0.7)] backdrop-blur transition-all hover:shadow-[0_16px_32px_-22px_rgba(2,6,23,0.85)] dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-extrabold leading-tight text-slate-900 dark:text-slate-100 sm:text-lg">
                    {index + 1}. {item.question}
                  </h2>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      item.isActive
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                    }`}
                  >
                    {item.isActive ? "Aktif" : "Pasif"}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {item.answer}
                </p>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-t border-slate-200/70 pt-4 dark:border-slate-700">
                <div className="grid gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <p>Oluşturma: {formatDate(item.createdAt)}</p>
                  <p>Güncelleme: {formatDate(item.updatedAt)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-sky-400"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)} // <-- Değişiklik burada
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Sil
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/60 p-8 text-center text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
          {searchTerm ? "Aramanıza uygun soru bulunamadı." : "Henüz hiç SSS eklenmemiş."}
        </div>
      )}

      <SssFormModal
        isOpen={modalOpen}
        mode={modalMode}
        initialData={selectedSss}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveSss}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Soruyu Sil"
        description={
          <>
            <strong>{itemToDelete?.question}</strong> başlıklı soruyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </>
        }
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}