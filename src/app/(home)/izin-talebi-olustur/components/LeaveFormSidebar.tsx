"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, FileText, Search, UserPlus, X } from "lucide-react";
import { makeId } from "@/app/(home)/izin-talebi-olustur/hooks/useLeaveForm";
import { getUserNamesAction } from "@/features/user/actions";
import { toast } from "sonner";
import DatePicker from "@/shared/components/ui/DatePicker";

type ReadonlyField = "fullName" | "duty" | "returnDate";
type HideableField = "fullName" | "duty" | "returnDate";

type LeaveFormSidebarProps = {
  formData: any;
  handlers: any;
  computed?: any;
  readonlyFields?: ReadonlyField[];
  hiddenFields?: HideableField[];
};

type PersonOption = {
  id: string;
  fullName: string;
  isCustom?: boolean;
};

export default function LeaveFormSidebar({ formData, handlers, computed, readonlyFields = [], hiddenFields = [] }: LeaveFormSidebarProps) {
  const isReadonly = (field: ReadonlyField) => readonlyFields.includes(field);
  const isHidden = (field: HideableField) => hiddenFields.includes(field);
  const baseInputClass = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950";
  const readonlyClass = "cursor-not-allowed bg-slate-100 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400";
  const substituteDropdownRef = useRef<HTMLDivElement | null>(null);

  const [isNameOpen, setIsNameOpen] = useState(false);
  const [nameSearch, setNameSearch] = useState("");
  const [isLoadingNames, setIsLoadingNames] = useState(false);
  const [fetchedNames, setFetchedNames] = useState<PersonOption[]>([]);
  const [customNames, setCustomNames] = useState<PersonOption[]>([]);

  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadNames = async () => {
      setIsLoadingNames(true);
      try {
        const response = await getUserNamesAction();
        if (!mounted) return;

        if (response.success && Array.isArray(response.data)) {
          const mapped = response.data
            .map((item: any) => ({
              id: String(item.id),
              fullName: String(item.fullName ?? "").trim(),
            }))
            .filter((item: PersonOption) => item.fullName.length > 0);

          setFetchedNames(mapped);
        } else {
          toast.error(response.message || "Personel isimleri alınamadı.");
        }
      } catch {
        if (mounted) toast.error("Personel isimleri alınırken hata oluştu.");
      } finally {
        if (mounted) setIsLoadingNames(false);
      }
    };

    loadNames();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!substituteDropdownRef.current) return;
      if (!substituteDropdownRef.current.contains(event.target as Node)) {
        setIsNameOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allNameOptions = useMemo(() => {
    const unique = new Map<string, PersonOption>();

    [...fetchedNames, ...customNames].forEach((item) => {
      const key = item.fullName.trim().toLocaleLowerCase("tr");
      if (!key) return;
      if (!unique.has(key)) unique.set(key, item);
    });

    return Array.from(unique.values()).sort((a, b) => a.fullName.localeCompare(b.fullName, "tr"));
  }, [customNames, fetchedNames]);

  const filteredNameOptions = useMemo(() => {
    const query = nameSearch.trim().toLocaleLowerCase("tr");
    if (!query) return allNameOptions;
    return allNameOptions.filter((item) => item.fullName.toLocaleLowerCase("tr").includes(query));
  }, [allNameOptions, nameSearch]);

  const selectSubstitute = (name: string) => {
    handlers.setSubstitutePerson(name);
    setNameSearch(name);
    setIsNameOpen(false);
  };

  const removeCustomPerson = (name: string) => {
    setCustomNames((prev) => prev.filter((item) => item.fullName !== name));
    if (formData.substitutePerson === name) {
      handlers.setSubstitutePerson("");
      setNameSearch("");
    }
  };

  const handleAddNewPerson = () => {
    const normalized = newPersonName.trim().replace(/\s+/g, " ");
    if (!normalized) {
      toast.error("Lütfen isim girin.");
      return;
    }

    const exists = allNameOptions.some(
      (item) => item.fullName.toLocaleLowerCase("tr") === normalized.toLocaleLowerCase("tr")
    );

    if (!exists) {
      setCustomNames((prev) => [
        ...prev,
        {
          id: `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          fullName: normalized,
          isCustom: true,
        },
      ]);
    }

    handlers.setSubstitutePerson(normalized);
    setNameSearch(normalized);
    setNewPersonName("");
    setIsAddPersonModalOpen(false);
    setIsNameOpen(false);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
        <FileText className="h-4 w-4 text-slate-500" />
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Form Alanları</h2>
      </div>

      {isHidden("fullName") ? null : (
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Adı Soyadı</label>
          <input
            value={formData.fullName}
            onChange={(e) => handlers.setFullName(e.target.value)}
            readOnly={isReadonly("fullName")}
            disabled={isReadonly("fullName")}
            className={`${baseInputClass} ${isReadonly("fullName") ? readonlyClass : ""}`}
          />
        </div>
      )}

      {isHidden("duty") ? null : (
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Görevi</label>
          <input
            value={formData.duty}
            onChange={(e) => handlers.setDuty(e.target.value)}
            readOnly={isReadonly("duty")}
            disabled={isReadonly("duty")}
            className={`${baseInputClass} ${isReadonly("duty") ? readonlyClass : ""}`}
          />
        </div>
      )}

      {isHidden("returnDate") ? null : (
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">İşbaşı Tarihi</label>
          <DatePicker
            value={formData.returnDate}
            onChange={handlers.setReturnDate}
            disabled={isReadonly("returnDate")}
          />
        </div>
      )}

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

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">İzin Başlangıç Tarihi</label>
        <DatePicker
          value={formData.leaveStartDate}
          onChange={handlers.setLeaveStartDate}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Kullanılacak İzin (Gün)</label>
        <input
          type="number"
          min={1}
          step={1}
          max={computed?.totalAvailableDays && computed.totalAvailableDays > 0 ? computed.totalAvailableDays : undefined}
          value={formData.requestedLeaveDays}
          onChange={(e) => {
            const next = e.target.value;
            const max = computed?.totalAvailableDays ?? 0;

            if (next === "") {
              handlers.setRequestedLeaveDays(next);
              return;
            }

            if (max > 0) {
              const n = Number(next);
              if (Number.isFinite(n) && n > max) {
                handlers.setRequestedLeaveDays(String(max));
                return;
              }
            }

            handlers.setRequestedLeaveDays(next);
          }}
          placeholder={computed?.totalAvailableDays && computed.totalAvailableDays > 0 ? `Maks: ${computed.totalAvailableDays}` : "Örn: 10"}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950"
        />
        {computed?.totalAvailableDays && computed.totalAvailableDays > 0 ? (
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Toplam izin bakiyesi: {computed.totalAvailableDays} gün</p>
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/40">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Otomatik Dağılım</p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Kullanılacak gün en eski yıldan başlayarak otomatik düşülür.</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Kalan (sonrası)</p>
            <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">
              {typeof computed?.remainingLeaveAfter === "number" ? `${computed.remainingLeaveAfter} gün` : "..."}
            </p>
          </div>
        </div>

        {computed?.allocationPlan?.length ? (
          <div className="mt-3 space-y-2">
            {computed.allocationPlan.map((item: any) => {
              const usedPercent = item.availableDays > 0 ? Math.min(100, Math.round((item.usedDays / item.availableDays) * 100)) : 0;
              return (
                <div key={item.year} className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <span>{item.year}</span>
                    <span>{item.usedDays} / {item.availableDays} gün</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-sky-500" style={{ width: `${usedPercent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Dağılım görmek için kullanılacak gün girin.</p>
        )}
      </div>

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
        <div className="relative" ref={substituteDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsNameOpen((prev) => !prev);
              if (!isNameOpen) setNameSearch(formData.substitutePerson || "");
            }}
            className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-left text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            aria-expanded={isNameOpen}
            aria-haspopup="listbox"
          >
            <span className={formData.substitutePerson ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}>
              {formData.substitutePerson || "Personel seçin"}
            </span>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isNameOpen ? "rotate-180" : ""}`} />
          </button>

          {isNameOpen ? (
            <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_-28px_rgba(2,6,23,0.65)] dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-slate-200 p-2 dark:border-slate-700">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                    placeholder="İsim ara..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm text-slate-700 outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto p-1.5">
                {isLoadingNames ? (
                  <div className="px-3 py-5 text-center text-xs text-slate-500 dark:text-slate-400">İsimler yükleniyor...</div>
                ) : filteredNameOptions.length === 0 ? (
                  <div className="px-3 py-5 text-center text-xs text-slate-500 dark:text-slate-400">Sonuç bulunamadı.</div>
                ) : (
                  filteredNameOptions.map((item) => {
                    const isSelected = formData.substitutePerson === item.fullName;
                    return (
                      <div
                        key={item.id}
                        role="option"
                        aria-selected={isSelected}
                        className="flex items-center gap-1"
                      >
                        <button
                          type="button"
                          onClick={() => selectSubstitute(item.fullName)}
                          className="flex flex-1 items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <span className="truncate">{item.fullName}</span>
                          {isSelected ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : null}
                        </button>

                        {item.isCustom ? (
                          <button
                            type="button"
                            onClick={() => removeCustomPerson(item.fullName)}
                            className="mr-1 rounded-md p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/25 dark:hover:text-rose-300"
                            title="Eklenen kişiyi kaldır"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-slate-200 p-2 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setNewPersonName(nameSearch.trim());
                    setIsNameOpen(false);
                    setIsAddPersonModalOpen(true);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Yeni kişi
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/40">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Uygundur</p>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Onaylayan kişi bilgileri PDF çıktısında görünür.</p>

        <div className="mt-3 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Yönetici Adı Soyadı</label>
            <input
              value={formData.managerName ?? ""}
              onChange={(e) => handlers.setManagerName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Ünvan</label>
            <input
              value={formData.managerTitle ?? ""}
              onChange={(e) => handlers.setManagerTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
        </div>
      </div>

      {isAddPersonModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm" onMouseDown={() => setIsAddPersonModalOpen(false)}>
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_55px_-32px_rgba(2,6,23,0.85)] dark:border-slate-700 dark:bg-slate-900"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-slate-100">Yeni kişi ekle</p>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">Sadece isim eklenir, listede kullanılabilir.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPersonModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 p-5">
              <input
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPersonModalOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleAddNewPerson}
                  className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}