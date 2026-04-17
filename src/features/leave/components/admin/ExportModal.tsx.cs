import { useEffect, useState } from "react";
import { X, FileSpreadsheet, FileText, FileJson, Loader2 } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [exportingType, setExportingType] = useState<"excel" | "csv" | "json" | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !exportingType) onClose();
    };
    if (isOpen) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, exportingType, onClose]);

  if (!isOpen) return null;

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
      
      setTimeout(() => onClose(), 300);
    } catch (error) {
      console.error("İndirme hatası:", error);
      alert("Dosya indirilirken bir hata oluştu.");
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-all"
      role="dialog"
      onMouseDown={() => !exportingType && onClose()}
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
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3 space-y-2">
          <button
            onClick={() => handleDownload("excel")}
            disabled={exportingType !== null}
            className={`group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-emerald-200 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-900/50 ${exportingType !== null ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100/80 text-emerald-600 group-hover:bg-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400">
                {exportingType === "excel" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileSpreadsheet className="h-5 w-5" />}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700 dark:text-slate-200 dark:group-hover:text-emerald-400">Excel Belgesi</span>
                <span className="text-[11px] font-medium text-slate-500">Görsel tablo ve formatlı veri</span>
              </div>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">.xlsx</span>
          </button>

          <button
            onClick={() => handleDownload("csv")}
            disabled={exportingType !== null}
            className={`group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-amber-200 hover:bg-amber-50 dark:border-slate-800 dark:bg-slate-900/50 ${exportingType !== null ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100/80 text-amber-600 group-hover:bg-amber-200/80 dark:bg-amber-500/10 dark:text-amber-400">
                {exportingType === "csv" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-slate-700 group-hover:text-amber-700 dark:text-slate-200 dark:group-hover:text-amber-400">CSV Dosyası</span>
                <span className="text-[11px] font-medium text-slate-500">Sade ve virgülle ayrılmış veri</span>
              </div>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">.csv</span>
          </button>

          <button
            onClick={() => handleDownload("json")}
            disabled={exportingType !== null}
            className={`group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-sky-200 hover:bg-sky-50 dark:border-slate-800 dark:bg-slate-900/50 ${exportingType !== null ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100/80 text-sky-600 group-hover:bg-sky-200/80 dark:bg-sky-500/10 dark:text-sky-400">
                {exportingType === "json" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileJson className="h-5 w-5" />}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-slate-700 group-hover:text-sky-700 dark:text-slate-200 dark:group-hover:text-sky-400">JSON Formatı</span>
                <span className="text-[11px] font-medium text-slate-500">Yedekleme için ham kaynak veri</span>
              </div>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">.json</span>
          </button>
        </div>
      </div>
    </div>
  );
}