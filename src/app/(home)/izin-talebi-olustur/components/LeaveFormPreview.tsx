import Image from "next/image";
import { Download, Loader2 } from "lucide-react";
import { formatDateDot } from "@/app/(home)/izin-talebi-olustur/hooks/useLeaveForm";

export default function LeaveFormPreview({ formData, computed, handlers }: any) {
  return (
    <div className="lg:col-span-8">
      <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">A4 Önizleme</div>
          {!computed.canDownloadPdf && computed.validationMessage ? (
            <div className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">{computed.validationMessage}</div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handlers.handleDownloadPDF}
          disabled={computed.isGeneratingPdf || !computed.canDownloadPdf}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {computed.isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {computed.isGeneratingPdf ? "Hazırlanıyor..." : "PDF İndir"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-300 bg-slate-200 p-3 dark:border-slate-700 dark:bg-slate-950">
        <div
          id="print-area"
          className="mx-auto border border-black bg-white p-7 text-black"
          style={{ minHeight: "1123px", maxWidth: "794px", width: "100%", fontFamily: "Times New Roman, serif" }}
        >
          <div className="mb-7 grid grid-cols-[128px_1fr_128px] items-start">
            <div className="pt-1">
              <Image src="/gungoren_belediyesi.png" alt="Güngören Belediyesi" width={128} height={128} priority />
            </div>
            <div className="w-full pt-3 text-center leading-tight">
              <p className="text-[17px] font-bold">T.C</p>
              <p className="text-[17px] font-bold uppercase">GÜNGÖREN BELEDİYESİ</p>
              <p className="text-[17px] font-bold">Kültür, Sanat ve Sosyal İşler Müdürlüğü</p>
              <p className="mt-8 text-[15px] font-bold uppercase">YILLIK İZİN FORMU</p>
            </div>
            <div />
          </div>

          <div className="border border-black text-[14px]">
            <div className="grid border-b border-black" style={{ gridTemplateColumns: "24% 36% 16% 24%" }}>
              <div className="border-r border-black px-3 py-2.5 font-bold uppercase">ADI SOYADI</div>
              <div className="border-r border-black px-3 py-2.5">{formData.fullName}</div>
              <div className="border-r border-black px-3 py-2.5 font-bold uppercase">GÖREVİ</div>
              <div className="px-3 py-2.5">{formData.duty}</div>
            </div>

            <div className="border-b border-black px-3 py-3">{computed.leaveSummary}</div>

            <div className="flex min-h-[350px] flex-col px-3 py-3">
              <div>
                <p className="text-[14px]">{computed.finalRequestText}</p>
                <p className="pl-7 text-[14px]">Gereğini arz ederim.</p>
              </div>

              <div className="mt-6 mb-8 ml-auto pr-2 text-right text-[14px]">
                <p>.. / .. / ....</p>
                <p className="mt-3">Personel Adı Soyadı</p>
                <p className="mt-1 font-bold">{formData.fullName}</p>
              </div>

              <div className="mt-auto border-t border-black pt-2 text-[14px] leading-tight">
                <p><span className="font-bold uppercase">İZİN ADRESİ:</span> {formData.leaveAddress}</p>
                <p><span className="font-bold uppercase">İŞE GİRİŞ TARİHİ:</span> {formatDateDot(formData.hireDate, ".../.../....")}</p>
                <p><span className="font-bold uppercase">TEL:</span> {formData.phone}</p>
                <p><span className="font-bold uppercase">YERİNE GÖREV ALACAK PERSONEL:</span> {formData.substitutePerson}</p>
                <p><span className="font-bold uppercase">KALAN İZİN:</span> {typeof computed?.remainingLeaveAfter === "number" ? String(computed.remainingLeaveAfter) : "..."}</p>
              </div>
            </div>
          </div>

          <div className="mt-7 border border-black py-7 text-center text-[20px]">
            <p className="uppercase">UYGUNDUR</p>
            <p className="mt-2 text-[16px]">.. / .. / ....</p>
            <p className="mt-4 text-[17px]">{formData.managerName}</p>
            <p className="text-[16px]">{formData.managerTitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}