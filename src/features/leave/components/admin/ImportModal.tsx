import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { X, Upload, Loader2 } from "lucide-react";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export default function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const importType = useMemo<"excel" | "csv" | null>(() => {
    if (!importFile) return null;
    const name = importFile.name.toLowerCase();
    if (name.endsWith(".csv")) return "csv";
    if (name.endsWith(".xlsx")) return "excel";
    return null;
  }, [importFile]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isImporting) handleClose();
    };
    if (isOpen) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isImporting]);

  if (!isOpen) return null;

  const handleClose = () => {
    setImportFile(null);
    setIsDragOver(false);
    onClose();
  };

  const acceptImportFile = (file: File | null | undefined) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".xlsx")) {
      toast.error("Sadece CSV (.csv) veya Excel (.xlsx) dosyası yükleyebilirsiniz.");
      return;
    }
    setImportFile(file);
  };

  const handlePickFile = () => {
    if (!isImporting) fileInputRef.current?.click();
  };

  const handleUploadImport = async () => {
    if (!importFile || !importType) {
      toast.error("Geçerli bir dosya seçin.");
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
      if (!response.ok) throw new Error(data?.error || data?.message || "İçe aktarma başarısız.");

      toast.success(`İçe aktarma tamamlandı.`, { id: toastId });

      await onSuccess();
      handleClose();
    } catch (err: any) {
      toast.error(err?.message ? String(err.message) : "İçe aktarma sırasında hata oluştu.", { id: toastId });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-all"
      role="dialog"
      onMouseDown={() => !isImporting && handleClose()}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_-24px_rgba(2,6,23,0.8)] dark:border-slate-700 dark:bg-slate-900"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div>
            <div className="text-sm font-black text-slate-900 dark:text-slate-100">İçe Aktar</div>
            <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
              {isImporting ? "Dosya yükleniyor..." : "CSV veya Excel dosyası yükleyin."}
            </div>
          </div>
          <button
            type="button"
            disabled={isImporting}
            onClick={handleClose}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
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
            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); if (!isImporting) setIsDragOver(true); }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if (!isImporting) setIsDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); if (!isImporting) acceptImportFile(e.dataTransfer.files?.[0]); }}
            className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${isDragOver ? "border-sky-400 bg-sky-50/70 dark:border-sky-700" : "border-slate-200 bg-slate-50/60 hover:border-slate-300"} ${isImporting ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 group-hover:text-sky-600 dark:bg-slate-900 dark:text-slate-200">
              {isImporting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
            </div>
            <div className="mt-4 text-sm font-bold text-slate-900 dark:text-slate-100">
              {importFile ? importFile.name : "Dosyayı buraya sürükleyin veya tıklayın"}
            </div>
            
            {importFile && (
              <button
                type="button"
                disabled={isImporting}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImportFile(null); }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <X className="h-4 w-4" /> Dosyayı Kaldır
              </button>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handlePickFile}
              disabled={isImporting}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Dosya Seç
            </button>
            <button
              type="button"
              onClick={handleUploadImport}
              disabled={!importFile || !importType || isImporting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isImporting ? "Yükleniyor..." : "Yükle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}