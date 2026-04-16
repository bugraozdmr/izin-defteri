import { useMemo, useState } from "react";
import { generatePDF } from "@/lib/pdf";

export type LeaveYearItem = {
  id: string;
  year: string;
  days: string;
};

export type LeaveFormInitialData = {
  fullName?: string;
  duty?: string;
  leaveYears?: Array<{ year: string; days: string | number }>;
  leaveStartDate?: string;
  requestedLeaveDays?: string;
  leaveAddress?: string;
  returnDate?: string;
  phone?: string;
  substitutePerson?: string;
  staffSignDate?: string;
  managerApprovalDate?: string;
  managerName?: string;
  managerTitle?: string;
};

export function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function formatDateDot(value: string, fallback = ".../.../....") {
  if (!value) return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function parseInteger(value: string) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 0;
  return parsed;
}

function parseOptionalInteger(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true as const, value: null as number | null };
  const parsed = Number.parseInt(trimmed, 10);
  if (Number.isNaN(parsed)) return { ok: false as const, value: null as number | null };
  return { ok: true as const, value: parsed };
}

function parseNonNegativeInteger(value: string) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return 0;
  return parsed;
}

function parseLocalDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parts = trimmed.split("-").map((x) => Number.parseInt(x, 10));
  if (parts.length !== 3) return null;
  const [year, month, day] = parts;
  if (!year || !month || !day) return null;
  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function getFullYearsSince(start: Date, now: Date) {
  let years = now.getFullYear() - start.getFullYear();
  const nowMonth = now.getMonth();
  const startMonth = start.getMonth();
  if (nowMonth < startMonth || (nowMonth === startMonth && now.getDate() < start.getDate())) {
    years -= 1;
  }
  return Math.max(0, years);
}

function getEntitlementDays(serviceYears: number) {
  if (serviceYears < 1) return 0;
  if (serviceYears <= 5) return 16;
  if (serviceYears < 15) return 22;
  return 28;
}

function formatYearList(years: string[]) {
  const uniqueYears = Array.from(new Set(years.map((y) => y.trim()).filter(Boolean)));
  if (uniqueYears.length === 0) return "....";
  if (uniqueYears.length === 1) return uniqueYears[0];
  if (uniqueYears.length === 2) return `${uniqueYears[0]} ve ${uniqueYears[1]}`;
  return `${uniqueYears.slice(0, -1).join(", ")} ve ${uniqueYears[uniqueYears.length - 1]}`;
}

export const useLeaveForm = (initialData?: LeaveFormInitialData) => {
  const [fullName, setFullName] = useState(initialData?.fullName ?? "");
  const [duty, setDuty] = useState(initialData?.duty ?? "");
  const [leaveYears, setLeaveYears] = useState<LeaveYearItem[]>(() => {
    const source = initialData?.leaveYears ?? [];
    const mapped = source
      .filter((item) => String(item.year ?? "").trim().length > 0 || String(item.days ?? "").trim().length > 0)
      .map((item) => ({
        id: makeId(),
        year: String(item.year ?? "").trim(),
        days: String(item.days ?? "").trim(),
      }));

    if (mapped.length > 0) return mapped;

    return [
      { id: makeId(), year: "", days: "" },
      { id: makeId(), year: "", days: "" },
    ];
  });
  const [leaveStartDate, setLeaveStartDate] = useState(initialData?.leaveStartDate ?? "");
  const [requestedLeaveDays, setRequestedLeaveDays] = useState(initialData?.requestedLeaveDays ?? "");
  const [leaveAddress, setLeaveAddress] = useState(initialData?.leaveAddress ?? "");
  const [returnDate, setReturnDate] = useState(initialData?.returnDate ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [substitutePerson, setSubstitutePerson] = useState(initialData?.substitutePerson ?? "");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const currentYear = new Date().getFullYear();
  const staffSignDate = initialData?.staffSignDate ?? `.../.../${currentYear}`;
  const managerApprovalDate = initialData?.managerApprovalDate ?? `.../.../${currentYear}`;

  const managerName = initialData?.managerName ?? "M. Kübra KAHRAMAN";
  const managerTitle = initialData?.managerTitle ?? "Müdür";

  const totalLeave = useMemo(() => {
    return leaveYears.reduce((acc, item) => acc + parseInteger(item.days), 0);
  }, [leaveYears]);

  const serviceYears = useMemo(() => {
    const parsed = parseLocalDate(returnDate);
    if (!parsed) return null;
    return getFullYearsSince(parsed, new Date());
  }, [returnDate]);

  const entitlementDays = useMemo(() => {
    if (serviceYears === null) return null;
    return getEntitlementDays(serviceYears);
  }, [serviceYears]);

  const normalizedLeaveYears = useMemo(() => {
    return leaveYears
      .map((item) => ({
        year: item.year.trim(),
        availableDays: parseNonNegativeInteger(item.days),
      }))
      .filter((item) => item.year.length > 0)
      .sort((a, b) => {
        const ay = Number.parseInt(a.year, 10);
        const by = Number.parseInt(b.year, 10);
        const safeAy = Number.isNaN(ay) ? Number.MAX_SAFE_INTEGER : ay;
        const safeBy = Number.isNaN(by) ? Number.MAX_SAFE_INTEGER : by;
        if (safeAy !== safeBy) return safeAy - safeBy;
        return a.year.localeCompare(b.year, "tr");
      });
  }, [leaveYears]);

  const totalAvailableDays = useMemo(() => {
    return normalizedLeaveYears.reduce((acc, item) => acc + item.availableDays, 0);
  }, [normalizedLeaveYears]);

  const allocation = useMemo(() => {
    const parsed = parseOptionalInteger(requestedLeaveDays);
    if (!parsed.ok || parsed.value === null || parsed.value <= 0) {
      return {
        requestedDays: 0,
        items: [] as Array<{ year: string; usedDays: number; availableDays: number; remainingDays: number }>,
        unallocatedDays: 0,
      };
    }

    let remaining = parsed.value;
    const items: Array<{ year: string; usedDays: number; availableDays: number; remainingDays: number }> = [];

    for (const item of normalizedLeaveYears) {
      if (remaining <= 0) break;
      if (item.availableDays <= 0) continue;

      const usedDays = Math.min(item.availableDays, remaining);
      items.push({
        year: item.year,
        usedDays,
        availableDays: item.availableDays,
        remainingDays: item.availableDays - usedDays,
      });
      remaining -= usedDays;
    }

    return {
      requestedDays: parsed.value,
      items,
      unallocatedDays: Math.max(0, remaining),
    };
  }, [requestedLeaveDays, normalizedLeaveYears]);

  const leaveSummary = useMemo(() => {
    if (allocation.requestedDays <= 0) {
      return "Kullanım dağılımı için kullanılacak gün girin.";
    }

    if (allocation.items.length === 0) {
      return "Dağıtılacak uygun izin bakiyesi bulunamadı.";
    }

    const usedTotal = allocation.items.reduce((acc, item) => acc + item.usedDays, 0);
    const parts = allocation.items.map((item) => `${item.year} - ${item.usedDays} gün`);
    const unallocatedText = allocation.unallocatedDays > 0 ? ` (Eksik ${allocation.unallocatedDays} gün)` : "";
    return `${parts.join(" + ")} = Toplam ${usedTotal} gün${unallocatedText}`;
  }, [allocation]);

  const finalRequestText = useMemo(() => {
    const hasStartDate = Boolean(leaveStartDate.trim());
    if (!hasStartDate || allocation.requestedDays <= 0) {
      return "İzin başlangıç tarihi ve kullanılacak gün girildiğinde talep metni oluşacaktır.";
    }

    if (allocation.items.length === 0 || allocation.unallocatedDays > 0) {
      return "Girilen izin günü mevcut bakiyeden fazla olduğu için talep metni oluşturulamadı.";
    }

    if (allocation.items.length === 1) {
      const item = allocation.items[0];
      return `${item.year} yılına ait iznimden ${item.usedDays} gününü ${formatDateDot(
        leaveStartDate,
        ".../.../...."
      )} tarihinden itibaren kullanmam için,`;
    }

    return `${formatYearList(allocation.items.map((item) => item.year))} yıllarına ait izinlerimden toplam ${allocation.requestedDays} gününü ${formatDateDot(
      leaveStartDate,
      ".../.../...."
    )} tarihinden itibaren kullanmam için,`;
  }, [allocation, leaveStartDate]);

  const validation = useMemo(() => {
    const issues: string[] = [];

    const requestedParsed = parseOptionalInteger(requestedLeaveDays);
    if (!requestedLeaveDays.trim()) {
      issues.push("Kullanılacak izin günü girin.");
    } else if (!requestedParsed.ok) {
      issues.push("Kullanılacak izin günü sayısal olmalı.");
    } else if ((requestedParsed.value ?? 0) <= 0) {
      issues.push("Kullanılacak izin günü 0'dan büyük olmalı.");
    }

    if (!leaveStartDate.trim()) {
      issues.push("İzin başlangıç tarihi girin.");
    } else if (!parseLocalDate(leaveStartDate)) {
      issues.push("İzin başlangıç tarihi geçersiz.");
    }

    if (requestedParsed.ok && requestedParsed.value !== null && requestedParsed.value > totalAvailableDays) {
      issues.push("Kullanılacak izin günü toplam izin bakiyesinden fazla olamaz.");
    }

    const hasWorkStartDate = returnDate.trim().length > 0;
    if (hasWorkStartDate) {
      const parsedHire = parseLocalDate(returnDate);
      if (!parsedHire) {
        issues.push("İşe giriş tarihi geçersiz.");
      } else {
        const years = getFullYearsSince(parsedHire, new Date());
        const entitlement = getEntitlementDays(years);

        if (entitlement === 0) {
          issues.push("İşe giriş tarihinize göre henüz yıllık izniniz bulunmuyor (ilk yıl dolmadan izin kullanılamaz).");
        }
      }
    }

    return {
      canDownload: issues.length === 0,
      message: issues[0] || "",
    };
  }, [leaveStartDate, requestedLeaveDays, returnDate, totalAvailableDays]);

  const handleDownloadPDF = async () => {
    if (!validation.canDownload) return;
    setIsGeneratingPdf(true);
    const fileSafeName = fullName.trim() ? fullName.trim().replace(/\s+/g, "_") : "Personel";
    await generatePDF("print-area", `Yillik_Izin_Formu_${fileSafeName}`);
    setIsGeneratingPdf(false);
  };

  const remainingLeaveAfter = useMemo(() => {
    if (allocation.requestedDays <= 0) return null;
    if (allocation.unallocatedDays > 0) return null;
    return Math.max(0, totalAvailableDays - allocation.requestedDays);
  }, [allocation.requestedDays, allocation.unallocatedDays, totalAvailableDays]);

  return {
    formData: {
      fullName, duty, leaveYears, leaveStartDate,
      requestedLeaveDays, leaveAddress, returnDate, phone, substitutePerson,
      staffSignDate, managerApprovalDate, managerName, managerTitle
    },
    handlers: {
      setFullName, setDuty, setLeaveYears,
      setLeaveStartDate, setRequestedLeaveDays, setLeaveAddress, setReturnDate,
      setPhone, setSubstitutePerson,
      handleDownloadPDF
    },
    computed: {
      leaveSummary,
      finalRequestText,
      allocationPlan: allocation.items,
      totalAvailableDays,
      requestedLeaveTotal: allocation.requestedDays,
      remainingLeaveAfter,
      isGeneratingPdf,
      serviceYears,
      entitlementDays,
      canDownloadPdf: validation.canDownload,
      validationMessage: validation.message,
    }
  };
};