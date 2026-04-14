import { FileText } from "lucide-react";
import { makeId } from "@/app/(home)/izin-talebi-olustur/hooks/useLeaveForm";

export default function LeaveFormSidebar({ formData, handlers }: any) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
        <FileText className="h-4 w-4 text-slate-500" />
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Form Alanları</h2>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Adı Soyadı</label>
        <input
          value={formData.fullName}
          onChange={(e) => handlers.setFullName(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Görevi</label>
        <input
          value={formData.duty}
          onChange={(e) => handlers.setDuty(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">İşbaşı Tarihi</label>
        <input type="date" value={formData.returnDate} onChange={(e) => handlers.setReturnDate(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950" />
      </div>

      <div className="col-span-2">
        <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">Yıllara Göre İzin</label>
        <div className="space-y-2">
          {formData.leaveYears.map((item: any) => (
            <div key={item.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input
                value={item.year}
                onChange={(e) => handlers.setLeaveYears((prev: any) => prev.map((x: any) => (x.id === item.id ? { ...x, year: e.target.value } : x)))}
                placeholder="Yıl"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950"
              />
              <input
                value={item.days}
                onChange={(e) => handlers.setLeaveYears((prev: any) => prev.map((x: any) => (x.id === item.id ? { ...x, days: e.target.value } : x)))}
                placeholder="Gün"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950"
              />
              <button
                type="button"
                onClick={() => handlers.setLeaveYears((prev: any) => (prev.length <= 1 ? prev : prev.filter((x: any) => x.id !== item.id)))}
                disabled={formData.leaveYears.length <= 1}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Sil
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => handlers.setLeaveYears((prev: any) => [...prev, { id: makeId(), year: "", days: "" }])}
          className="mt-3 inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          + Yıl Ekle
        </button>
      </div>

      {/*<div>
        <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">İzin Başlangıç Tarihi</label>
        <input type="date" value={formData.leaveStartDate} onChange={(e) => handlers.setLeaveStartDate(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950" />
      </div>*/}

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">İzin Adresi</label>
        <input value={formData.leaveAddress} onChange={(e) => handlers.setLeaveAddress(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">TEL</label>
        <input value={formData.phone} onChange={(e) => handlers.setPhone(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Yerine Görev Alacak Personel</label>
        <input value={formData.substitutePerson} onChange={(e) => handlers.setSubstitutePerson(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Kalan İzin</label>
        <input
          value={formData.remainingLeave}
          onChange={(e) => handlers.setRemainingLeave(e.target.value)}
          placeholder="Örn: 17"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Talep Metni</label>
        <textarea
          value={formData.requestOverride}
          onChange={(e) => handlers.setRequestOverride(e.target.value)}
          rows={2}
          placeholder="Özel metin girmek isterseniz burayı kullanın..."
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      
    </div>
  );
}