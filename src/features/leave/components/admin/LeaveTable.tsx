"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, ChevronDown, FileIcon, Loader2, Pencil, Search, Trash2, UserPlus, X } from "lucide-react";
import { deleteLeaveRecordAction, updateLeaveRecordAction } from "@/features/leave/actions";
import { formatDays, calculateEndDateSkippingHolidays } from "@/features/leave/helpers";
import ConfirmDeleteModal from "@/shared/components/ui/ConfirmDeleteModal";
import AdminLeaveRequestFormModal from "@/features/user/components/admin/AdminLeaveRequestFormModal";
import type { LeaveFormInitialData } from "@/app/(home)/izin-talebi-olustur/hooks/useLeaveForm";
import { getUserNamesAction } from "@/features/user/actions";
import { getAllHolidaysAction } from "@/features/holiday/actions";

type PersonOption = {
  id: string;
  fullName: string;
  isCustom?: boolean;
};

interface LeaveRow {
  id: string;
  startDate: string | Date;
  endDate: string | Date;
  days: number;
  location?: string | null;
  reason?: string | null;
  tradedWith?: string | null;
  manager?: string | null;
  title?: string | null;
  createdAt: string | Date;
}

interface LeaveTableProps {
  userId: string;
  user: {
    fullName: string;
    jobTitle: string | null;
    phone: string | null;
    hireDate?: string | Date | null;
  };
  balances: Array<{ year: number; totalDays: number; usedDays: number }>;
  leaves: LeaveRow[];
}

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

function toInputDate(value: string | Date) {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toDotDate(value: string | Date) {
  const input = toInputDate(value);
  if (!input) return ".../.../....";
  const [y, m, d] = input.split("-");
  if (!y || !m || !d) return input;
  return `${d}.${m}.${y}`;
}

function formatDateShort(value: string | Date) {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function formatDateLong(value: string | Date) {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

export default function LeaveTable({ userId, user, balances, leaves }: LeaveTableProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [pdfTarget, setPdfTarget] = useState<LeaveRow | null>(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState("");
  const [location, setLocation] = useState("");
  const [reason, setReason] = useState("");
  const [tradedWith, setTradedWith] = useState("");
  const [manager, setManager] = useState("");
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  const [deleteTarget, setDeleteTarget] = useState<LeaveRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (!editingId) return;

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
  }, [editingId]);

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
    if (!pdfTarget) return;
    const updated = leaves.find((item) => item.id === pdfTarget.id);
    if (!updated) return;
    setPdfTarget(updated);
  }, [leaves, pdfTarget]);

  const pdfInitialData = useMemo<LeaveFormInitialData | undefined>(() => {
    if (!pdfTarget) return undefined;

    const sortedBalances = (balances ?? []).slice().sort((a, b) => a.year - b.year);
    let remainingToAddBack = Number(pdfTarget.days) || 0;
    const addBackByYear = new Map<number, number>();

    for (const balance of sortedBalances.slice().reverse()) {
      if (remainingToAddBack <= 0) break;
      const used = Math.max(0, balance.usedDays ?? 0);
      const addBack = Math.min(used, remainingToAddBack);
      if (addBack <= 0) continue;
      addBackByYear.set(balance.year, addBack);
      remainingToAddBack -= addBack;
    }

    const leaveYears = sortedBalances.map((b) => {
      const remainingNow = Math.max(0, (b.totalDays ?? 0) - (b.usedDays ?? 0));
      const addBack = addBackByYear.get(b.year) ?? 0;
      return {
        year: String(b.year),
        days: String(Math.max(0, remainingNow + addBack)),
      };
    });

    return {
      fullName: user.fullName ?? "",
      duty: user.jobTitle ?? "",
      phone: user.phone ?? "",

      hireDate: user.hireDate ? toInputDate(user.hireDate) : undefined,

      leaveYears,
      leaveStartDate: toInputDate(pdfTarget.startDate),
      requestedLeaveDays: String(pdfTarget.days ?? ""),
      leaveAddress: String(pdfTarget.location ?? ""),
      returnDate: toInputDate(pdfTarget.endDate),
      substitutePerson: String(pdfTarget.tradedWith ?? ""),

      staffSignDate: toDotDate(pdfTarget.createdAt),
      managerApprovalDate: toDotDate(pdfTarget.createdAt),
      manager: pdfTarget.manager ?? undefined,
      title: pdfTarget.title ?? undefined,
    };
  }, [balances, pdfTarget, user.fullName, user.hireDate, user.jobTitle, user.phone]);

  const editingRow = useMemo(
    () => leaves.find((item) => item.id === editingId) ?? null,
    [leaves, editingId]
  );

  const handleOpenEdit = (row: LeaveRow) => {
    setEditingId(row.id);
    setStartDate(toInputDate(row.startDate));
    setEndDate(toInputDate(row.endDate));
    setDays(String(row.days));
    setLocation(String(row.location ?? ""));
    setReason(String(row.reason ?? ""));
    setTradedWith(String(row.tradedWith ?? ""));
    setManager(String(row.manager ?? ""));
    setTitle(String(row.title ?? ""));
  };

  const handleCloseEdit = () => {
    if (isSaving) return;
    setEditingId(null);
    setStartDate("");
    setEndDate("");
    setDays("");
    setLocation("");
    setReason("");
    setTradedWith("");
    setManager("");
    setTitle("");

    setIsNameOpen(false);
    setNameSearch("");
    setIsAddPersonModalOpen(false);
    setNewPersonName("");
  };

  const handleSubmitEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingRow) return;

    if (!startDate || !endDate) {
      toast.error("Başlangıç ve bitiş tarihi zorunludur.");
      return;
    }

    const parsedDays = Number(days);
    if (!Number.isFinite(parsedDays) || parsedDays <= 0) {
      toast.error("Geçerli bir izin günü girin.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      toast.error("Tarih formatı geçersiz.");
      return;
    }

    if (start > end) {
      toast.error("Başlangıç tarihi bitiş tarihinden sonra olamaz.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("İzin kaydı güncelleniyor...");

    const normalizeOptional = (value: string) => {
      const trimmed = value.trim();
      return trimmed.length ? trimmed : undefined;
    };
    try {
      const response = await updateLeaveRecordAction(editingRow.id, userId, {
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
        throw new Error(response.message || "İzin kaydı güncellenemedi.");
      }

      toast.success("İzin kaydı güncellendi.", { id: toastId });
      handleCloseEdit();
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message ? String(error.message) : "İzin kaydı güncellenemedi.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (row: LeaveRow) => {
    setDeleteTarget(row);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const toastId = toast.loading("İzin kaydı siliniyor...");
    try {
      const response = await deleteLeaveRecordAction(deleteTarget.id, userId);
      if (!response.success) {
        throw new Error(response.message || "İzin kaydı silinemedi.");
      }

      toast.success("İzin kaydı silindi.", { id: toastId });
      setDeleteTarget(null);
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message ? String(error.message) : "İzin kaydı silinemedi.", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const editModal = editingRow ? (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <button type="button" onClick={handleCloseEdit} className="absolute inset-0" aria-label="Modalı kapat" />

      <div className="relative w-full max-w-md overflow-visible rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(2,6,23,0.75)] dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <p className="text-sm font-black text-slate-900 dark:text-slate-100">İzin Kaydı Düzenle</p>
          <button
            type="button"
            onClick={handleCloseEdit}
            disabled={isSaving}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmitEdit} className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Başlangıç</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Kullanılan Gün</label>
              <input
                type="number"
                min={0}
                step="0.5"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          </div>

          {days && Number(days) > 0 ? (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">İşbaşı (Bitiş)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          ) : null}

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Ek Bilgiler (Opsiyonel)</p>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">İzin Adresi</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">İzin Nedeni</label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

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
                    className={`absolute z-[130] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_-28px_rgba(2,6,23,0.65)] dark:border-slate-700 dark:bg-slate-900 ${
                      openUpward ? "bottom-full mb-2" : "top-full mt-2"
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Onaylayan</label>
                <input
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Ünvan</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleCloseEdit}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-[0_14px_28px_-12px_rgba(2,132,199,0.9)] disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSaving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

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
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="w-full overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-950/40 dark:text-slate-400">
                <th className="px-4 py-3 text-left">Başlangıç</th>
                <th className="px-4 py-3 text-left">Bitiş</th>
                <th className="px-4 py-3 text-left">Kullanılan Gün</th>
                <th className="px-4 py-3 text-left">Sistem Giriş</th>
                <th className="px-4 py-3 text-left">İşlem</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-5 text-center text-sm text-slate-500 dark:text-slate-400">
                    Henüz girilmiş bir izin kaydı yok.
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr
                    key={l.id}
                    className="text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">{formatDateShort(l.startDate)}</td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">{formatDateShort(l.endDate)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-lg bg-emerald-500/10 px-2.5 py-1 font-black text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                        {formatDays(l.days)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{formatDateLong(l.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-start gap-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setPdfTarget(l);
                            setIsPdfOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                          title="Form (PDF)"
                        >
                          <FileIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(l)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(l)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingRow && mounted ? createPortal(editModal, document.body) : null}
      {mounted ? createPortal(addPersonModal, document.body) : null}

      {mounted
        ? createPortal(
            <ConfirmDeleteModal
              isOpen={!!deleteTarget}
              title="İzin Kaydı Silinecek"
              description={
                <>
                  <span className="font-bold text-slate-900 dark:text-white">{deleteTarget ? formatDateShort(deleteTarget.startDate) : "-"}</span>
                  {" - "}
                  <span className="font-bold text-slate-900 dark:text-white">{deleteTarget ? formatDateShort(deleteTarget.endDate) : "-"}</span>
                  {" aralığındaki izin kaydı kalıcı olarak silinecektir. Onaylıyor musunuz?"}
                </>
              }
              isDeleting={isDeleting}
              onConfirm={handleConfirmDelete}
              onCancel={() => setDeleteTarget(null)}
            />,
            document.body
          )
        : null}

      <AdminLeaveRequestFormModal
        isOpen={isPdfOpen}
        initialData={pdfInitialData}
        onClose={() => {
          setIsPdfOpen(false);
          setPdfTarget(null);
        }}
      />
    </>
  );
}
