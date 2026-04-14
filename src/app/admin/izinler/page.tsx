"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { UserPlus, Search, ClipboardList, ChevronLeft, ChevronRight, Download, Upload, X, FileJson, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import LeaveTable from "@/app/admin/izinler/components/LeaveTable";
import LeaveFormModal from "@/app/admin/izinler/components/LeaveFormModal";
import AdminLeaveRequestFormModal from "@/app/admin/izinler/components/AdminLeaveRequestFormModal";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import { useLeaveManagement } from "@/app/admin/izinler/hooks/useLeaveManagement";
import type { Leave } from "@/features/leave/types/leave";

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
  const [exportingType, setExportingType] = useState<"excel" | "csv" | "json" | null>(null);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [requestFormLeave, setRequestFormLeave] = useState<Leave | null>(null);

  const importType = useMemo<"excel" | "csv" | null>(() => {
    if (!importFile) return null;
    const name = importFile.name.toLowerCase();
    if (name.endsWith(".csv")) return "csv";
    if (name.endsWith(".xlsx")) return "excel";
    return null;
  }, [importFile]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !exportingType) setIsExportOpen(false);
    };

    if (!isExportOpen) return;
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isExportOpen, exportingType]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isImporting) setIsImportOpen(false);
    };
    if (!isImportOpen) return;
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isImportOpen, isImporting]);

  const handleImportClick = () => {
    setImportFile(null);
    setIsDragOver(false);
    setIsImportOpen(true);
  };

  const handleOpenRequestForm = (leave: Leave) => {
    setRequestFormLeave(leave);
    setIsRequestFormOpen(true);
  };

  const handleCloseRequestForm = () => {
    setIsRequestFormOpen(false);
    setRequestFormLeave(null);
  };

  const acceptImportFile = (file: File | null | undefined) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    const isOk = name.endsWith(".csv") || name.endsWith(".xlsx");
    if (!isOk) {
      toast.error("Sadece CSV (.csv) veya Excel (.xlsx) dosyası yükleyebilirsiniz.");
      return;
    }
    setImportFile(file);
  };

  const handlePickFile = () => {
    if (isImporting) return;
    fileInputRef.current?.click();
  };

  const handleUploadImport = async () => {
    if (!importFile) {
      toast.error("Lütfen bir dosya seçin.");
      return;
    }
    if (!importType) {
      toast.error("Dosya formatı desteklenmiyor. (.csv veya .xlsx)");
      return;
    }

    setIsImporting(true);
    const toastId = toast.loading("Dosya yükleniyor...");
    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const response = await fetch(`/api/import/${importType}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({} as any));
      if (!response.ok) {
        throw new Error(data?.error || data?.message || "İçe aktarma başarısız.");
      }

      const created = Number(data?.createdCount ?? 0);
      const updated = Number(data?.updatedCount ?? 0);
      const skipped = Number(data?.skippedCount ?? 0);
      const conflicts = Number(data?.conflictCount ?? 0);
      const errors = Number(data?.errorCount ?? 0);

      const parts = [
        `${created} yeni`,
        `${updated} güncellendi`,
      ];
      if (skipped) parts.push(`${skipped} atlandı`);
      if (conflicts) parts.push(`${conflicts} çakışma`);
      if (errors) parts.push(`${errors} hata`);

      toast.success(`İçe aktarma tamamlandı (${parts.join(", ")}).`, { id: toastId });

      await refreshLeaves();
      setIsImportOpen(false);
      setImportFile(null);
      setIsDragOver(false);
    } catch (err: any) {
      toast.error(err?.message ? String(err.message) : "İçe aktarma sırasında hata oluştu.", { id: toastId });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownload = async (type: "excel" | "csv" | "json") => {
    try {
      setExportingType(type);
      
      const response = await fetch(`/api/export/${type}`);
      if (!response.ok) throw new Error("İndirme işlemi başarısız oldu");

      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      const disposition = response.headers.get('Content-Disposition');
      let filename = `personel_izinleri.${type === 'excel' ? 'xlsx' : type}`;
      if (disposition && disposition.includes('filename="')) {
        filename = disposition.split('filename="')[1].split('"')[0];
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      a.remove();
      window.URL.revokeObjectURL(url);
      
      setTimeout(() => setIsExportOpen(false), 300);
      
    } catch (error) {
      console.error("İndirme hatası:", error);
      alert("Dosya indirilirken bir hata oluştu.");
    } finally {
      setExportingType(null);
    }
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
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-medium text-slate-700 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div className="flex w-full sm:w-auto items-center gap-2">
              <button
                onClick={handleImportClick}
                className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-sky-600 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-sky-400"
                title="Sisteme Veri Yükle"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">İçe Aktar</span>
              </button>

              <div className="relative flex-1 sm:flex-none">
                <button
                  type="button"
                  onClick={() => setIsExportOpen((v) => !v)}
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-sky-600 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-sky-400"
                  title="Sistemdeki Verileri İndir"
                  aria-haspopup="menu"
                  aria-expanded={isExportOpen}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Dışa Aktar</span>
                </button>
              </div>

              <button
                onClick={handleOpenCreate}
                className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-14px_rgba(2,132,199,0.95)] transition-all hover:-translate-y-0.5 hover:brightness-105 active:scale-95"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Yeni Ekle</span>
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
          <div>
            Toplam <span className="font-bold text-slate-900 dark:text-slate-200">{totalCount}</span> kayıt bulundu.
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-transparent dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" /> Önceki
            </button>
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0 || isLoading}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-transparent dark:hover:bg-slate-800"
            >
              Sonraki <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <LeaveFormModal 
         isOpen={isModalOpen}
         mode={modalMode}
         initialData={selectedLeave}
         onClose={() => setIsModalOpen(false)}
         onSave={handleSaveLeave}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Bu personelin izin kaydını silmek istediğine emin misin?"
        description={
          <>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {deleteTarget?.fullName}
            </span>{" "}
            adlı personelin izin bakiyeleri kalıcı olarak silinecek. Bu işlem geri alınamaz.
          </>
        }
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {isRequestFormOpen ? (
        <AdminLeaveRequestFormModal
          isOpen={isRequestFormOpen}
          leave={requestFormLeave}
          onClose={handleCloseRequestForm}
          key={requestFormLeave?.id ?? "empty"}
        />
      ) : null}

      {isExportOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-all"
          role="dialog"
          aria-modal="true"
          aria-label="Dışa aktar"
          onMouseDown={() => !exportingType && setIsExportOpen(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_-24px_rgba(2,6,23,0.8)] dark:border-slate-700 dark:bg-slate-900"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <div>
                <div className="text-sm font-black text-slate-900 dark:text-slate-100">Dışa Aktar</div>
                <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                  {exportingType ? "Dosya hazırlanıyor, lütfen bekleyin..." : "İndirmek istediğiniz formatı seçin."}
                </div>
              </div>
              <button
                type="button"
                disabled={!!exportingType}
                onClick={() => setIsExportOpen(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 space-y-2">
              
              <button
                onClick={() => handleDownload("excel")}
                disabled={exportingType !== null}
                className={`group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-sm active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-emerald-900/50 dark:hover:bg-emerald-950/40 ${
                  exportingType !== null ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100/80 text-emerald-600 transition-colors group-hover:bg-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400">
                    {exportingType === "excel" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileSpreadsheet className="h-5 w-5" />}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-slate-700 transition-colors group-hover:text-emerald-700 dark:text-slate-200 dark:group-hover:text-emerald-400">Excel Belgesi</span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Görsel tablo ve formatlı veri</span>
                  </div>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-emerald-900/50 dark:group-hover:text-emerald-300">
                  .xlsx
                </span>
              </button>

              <button
                onClick={() => handleDownload("csv")}
                disabled={exportingType !== null}
                className={`group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 transition-all duration-200 hover:border-amber-200 hover:bg-amber-50 hover:shadow-sm active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-amber-900/50 dark:hover:bg-amber-950/40 ${
                  exportingType !== null ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100/80 text-amber-600 transition-colors group-hover:bg-amber-200/80 dark:bg-amber-500/10 dark:text-amber-400">
                    {exportingType === "csv" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-slate-700 transition-colors group-hover:text-amber-700 dark:text-slate-200 dark:group-hover:text-amber-400">CSV Dosyası</span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Sade ve virgülle ayrılmış veri</span>
                  </div>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 transition-colors group-hover:bg-amber-100 group-hover:text-amber-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-amber-900/50 dark:group-hover:text-amber-300">
                  .csv
                </span>
              </button>

              <button
                onClick={() => handleDownload("json")}
                disabled={exportingType !== null}
                className={`group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 transition-all duration-200 hover:border-sky-200 hover:bg-sky-50 hover:shadow-sm active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-sky-900/50 dark:hover:bg-sky-950/40 ${
                  exportingType !== null ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100/80 text-sky-600 transition-colors group-hover:bg-sky-200/80 dark:bg-sky-500/10 dark:text-sky-400">
                    {exportingType === "json" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileJson className="h-5 w-5" />}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-slate-700 transition-colors group-hover:text-sky-700 dark:text-slate-200 dark:group-hover:text-sky-400">JSON Formatı</span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Yedekleme için ham kaynak veri</span>
                  </div>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 transition-colors group-hover:bg-sky-100 group-hover:text-sky-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-sky-900/50 dark:group-hover:text-sky-300">
                  .json
                </span>
              </button>

            </div>
          </div>
        </div>
      ) : null}

      {isImportOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-all"
          role="dialog"
          aria-modal="true"
          aria-label="İçe aktar"
          onMouseDown={() => !isImporting && setIsImportOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_-24px_rgba(2,6,23,0.8)] dark:border-slate-700 dark:bg-slate-900"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <div>
                <div className="text-sm font-black text-slate-900 dark:text-slate-100">İçe Aktar</div>
                <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                  {isImporting
                    ? "Dosya yükleniyor, lütfen bekleyin..."
                    : "CSV veya Excel dosyası yükleyin (.csv / .xlsx)."}
                </div>
              </div>
              <button
                type="button"
                disabled={isImporting}
                onClick={() => setIsImportOpen(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".csv,.xlsx"
                onChange={(e) => acceptImportFile(e.target.files?.[0])}
              />

              <div
                onClick={handlePickFile}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isImporting) setIsDragOver(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isImporting) setIsDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOver(false);
                  if (isImporting) return;
                  acceptImportFile(e.dataTransfer.files?.[0]);
                }}
                className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all dark:bg-slate-950/30 ${
                  isDragOver
                    ? "border-sky-400 bg-sky-50/70 dark:border-sky-700 dark:bg-sky-950/30"
                    : "border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/10 dark:hover:border-slate-700"
                } ${isImporting ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition-colors group-hover:text-sky-600 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
                  {isImporting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                </div>

                <div className="mt-4 text-sm font-bold text-slate-900 dark:text-slate-100">
                  {importFile ? importFile.name : "Dosyayı buraya sürükleyin veya tıklayın"}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Tek dosya • Desteklenen: .csv, .xlsx
                </div>

                {importFile ? (
                  <button
                    type="button"
                    disabled={isImporting}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setImportFile(null);
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <X className="h-4 w-4" />
                    Dosyayı Kaldır
                  </button>
                ) : null}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handlePickFile}
                  disabled={isImporting}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Dosya Seç
                </button>
                <button
                  type="button"
                  onClick={handleUploadImport}
                  disabled={!importFile || !importType || isImporting}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-14px_rgba(2,132,199,0.95)] transition-all hover:-translate-y-0.5 hover:brightness-105 active:scale-95 disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isImporting ? "Yükleniyor..." : "Yükle"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}