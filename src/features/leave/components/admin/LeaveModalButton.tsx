"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, ChevronDown, Loader2, Plus, Search, UserPlus, X } from "lucide-react";
import { createLeaveRecordAction } from "@/features/leave/actions";
import DatePicker from "@/shared/components/ui/DatePicker";
import { getUserNamesAction } from "@/features/user/actions";
import { getAllHolidaysAction } from "@/features/holiday/actions";
import { calculateEndDateSkippingHolidays } from "@/features/leave/helpers";

type PersonOption = {
  id: string;
  fullName: string;
  isCustom?: boolean;
};

interface LeaveModalButtonProps {
  userId: string;
  className?: string;
  compact?: boolean;
}

export default function LeaveModalButton({ userId, className, compact = false }: LeaveModalButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState("");

  const [location, setLocation] = useState("");
  const [reason, setReason] = useState("");
  const [tradedWith, setTradedWith] = useState("");
  const [manager, setManager] = useState("M. Kübra KAHRAMAN");
  const [title, setTitle] = useState("Müdür");
  const [isCustomManagerOpen, setIsCustomManagerOpen] = useState(false);

  const substituteDropdownRef = useRef<HTMLDivElement | null>(null);
  const substituteButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isNameOpen, setIsNameOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [nameSearch, setNameSearch] = useState("");
  const [isLoadingNames, setIsLoadingNames] = useState(false);
  const [fetchedNames, setFetchedNames] = useState<PersonOption[]>([]);
  const [customNames, setCustomNames] = useState<PersonOption[]>([]);
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");

  const [allHolidays, setAllHolidays] = useState<any[] | null>(null);

  useEffect(() => {
    setMounted(true);
    let active = true;

    getAllHolidaysAction().then((res) => {
      if (active) {
        if (res.success && res.data) {
          setAllHolidays(res.data);
        } else {
          setAllHolidays([]);
        }
      }
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!startDate || !days || allHolidays === null) return;
    const pDays = Number.parseFloat(days);
    if (!Number.isFinite(pDays) || pDays <= 0) return;

    const calcEnd = calculateEndDateSkippingHolidays(startDate, pDays, allHolidays);
    if (calcEnd) {
      setEndDate(calcEnd);
    }
  }, [startDate, days, allHolidays]);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;

    const loadNames = async () => {
      setIsLoadingNames(true);
      try {
        const response = await getUserNamesAction();
        if (!active) return;

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
        if (active) toast.error("Personel isimleri alınırken hata oluştu.");
      } finally {
        if (active) setIsLoadingNames(false);
      }
    };

    loadNames();

    const handleClickOutside = (event: MouseEvent) => {
      if (!substituteDropdownRef.current) return;
      if (!substituteDropdownRef.current.contains(event.target as Node)) {
        setIsNameOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      active = false;
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

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
    setTradedWith(name);
    setNameSearch(name);
    setIsNameOpen(false);
  };

  const removeCustomPerson = (name: string) => {
    setCustomNames((prev) => prev.filter((item) => item.fullName !== name));
    if (tradedWith === name) {
      setTradedWith("");
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

    setTradedWith(normalized);
    setNameSearch(normalized);
    setNewPersonName("");
    setIsAddPersonModalOpen(false);
    setIsNameOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) setIsOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isSaving]);

  const closeModal = () => {
    if (isSaving) return;
    setIsOpen(false);
    setStartDate("");
    setEndDate("");
    setDays("");

    setLocation("");
    setReason("");
    setTradedWith("");
    setManager("M. Kübra KAHRAMAN");
    setTitle("Müdür");
    setIsCustomManagerOpen(false);

    setIsNameOpen(false);
    setNameSearch("");
    setIsAddPersonModalOpen(false);
    setNewPersonName("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!startDate || !endDate) {
      toast.error("Başlangıç ve bitiş tarihi seçin.");
      return;
    }

    const parsedDays = Number(days);
    if (!Number.isFinite(parsedDays) || parsedDays <= 0) {
      toast.error("Geçerli bir izin günü girin.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      toast.error("Başlangıç tarihi bitiş tarihinden sonra olamaz.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("İzin kaydı ekleniyor...");

    const normalizeOptional = (value: string) => {
      const trimmed = value.trim();
      return trimmed.length ? trimmed : undefined;
    };

    try {
      const response = await createLeaveRecordAction(userId, {
        startDate: start,
        endDate: end,
        days: parsedDays,

        location: normalizeOptional(location),
        reason: normalizeOptional(reason),
        tradedWith: normalizeOptional(tradedWith),
        manager: normalizeOptional(manager),
        title: normalizeOptional(title),
      });

      if (!response.success) {
        throw new Error(response.message || "İzin kaydı eklenemedi.");
      }

      toast.success("İzin kaydı eklendi.", { id: toastId });
      closeModal();
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message ? String(error.message) : "İzin kaydı eklenemedi.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <button type="button" onClick={closeModal} className="absolute inset-0" aria-label="Modalı kapat" />

      <div className="relative w-full max-w-md overflow-visible rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(2,6,23,0.75)] dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-slate-100">İzin Kaydı Ekle</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Başlangıç, bitiş ve izin günü girerek yeni kayıt oluştur.</p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            disabled={isSaving}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Başlangıç</label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Tarih seçin"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Kullanılacak Gün</label>
              <input
                type="number"
                min={1}
                step="0.5"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="Örn: 5"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          </div>

          {days && Number(days) > 0 ? (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">İşbaşı</label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="Otomatik hesaplanır..."
                required
              />
            </div>
          ) : null}

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Ek Bilgiler </p>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">İzin Adresi</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Örn: İstanbul"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            { /* <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">İzin Nedeni</label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Örn: Yıllık izin"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div> */}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Yerine Görev Alacak</label>
              <div className="relative" ref={substituteDropdownRef}>
                <button
                  ref={substituteButtonRef}
                  type="button"
                  onClick={() => {
                    const nextOpen = !isNameOpen;
                    setIsNameOpen(nextOpen);
                    if (nextOpen) {
                      setNameSearch(tradedWith || "");
                      const rect = substituteButtonRef.current?.getBoundingClientRect();
                      if (rect) {
                        const estimatedMenuHeight = 260;
                        const spaceBelow = window.innerHeight - rect.bottom;
                        setOpenUpward(spaceBelow < estimatedMenuHeight);
                      } else {
                        setOpenUpward(false);
                      }
                    }
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-left text-sm font-semibold text-slate-900 outline-none transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  aria-expanded={isNameOpen}
                  aria-haspopup="listbox"
                >
                  <span className={tradedWith ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}>
                    {tradedWith || "Personel seçin"}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isNameOpen ? "rotate-180" : ""}`} />
                </button>

                {isNameOpen ? (
                  <div
                    className={`absolute z-[130] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_-28px_rgba(2,6,23,0.65)] dark:border-slate-700 dark:bg-slate-900 ${openUpward ? "bottom-full mb-2" : "top-full mt-2"
                      }`}
                  >
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
                          const isSelected = tradedWith === item.fullName;
                          return (
                            <div key={item.id} role="option" aria-selected={isSelected} className="flex items-center gap-1">
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

            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Onay Makamı</p>
                  {!isCustomManagerOpen && (
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {manager || "-"} <span className="font-normal text-slate-500">{title ? `(${title})` : ""}</span>
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (isCustomManagerOpen) {
                      setManager("M. Kübra KAHRAMAN");
                      setTitle("Müdür");
                    }
                    setIsCustomManagerOpen(!isCustomManagerOpen);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {isCustomManagerOpen ? "Vazgeç" : "Vekalet / Değiştir"}
                </button>
              </div>

              {isCustomManagerOpen && (
                <div className="mt-3 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 dark:border-slate-800 sm:grid-cols-2 animate-in fade-in slide-in-from-top-1">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Onaylayan</label>
                    <input
                      value={manager}
                      onChange={(e) => setManager(e.target.value)}
                      placeholder="Ad Soyad"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Ünvan</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: Müdür"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-[0_14px_28px_-12px_rgba(16,185,129,0.9)] disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSaving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const addPersonModal = isAddPersonModalOpen ? (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
      onMouseDown={() => setIsAddPersonModalOpen(false)}
    >
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
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className ?? "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400"}
      >
        <Plus className="h-4 w-4" /> {compact ? "İzin" : "İzin Ekle"}
      </button>

      {isOpen && mounted ? createPortal(modal, document.body) : null}
      {mounted ? createPortal(addPersonModal, document.body) : null}
    </>
  );
}
