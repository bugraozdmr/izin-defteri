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
  requestOverride?: string;
  leaveAddress?: string;
  returnDate?: string;
  phone?: string;
  substitutePerson?: string;
  remainingLeave?: string;
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
  const [requestOverride, setRequestOverride] = useState(initialData?.requestOverride ?? "");
  const [leaveAddress, setLeaveAddress] = useState(initialData?.leaveAddress ?? "");
  const [returnDate, setReturnDate] = useState(initialData?.returnDate ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [substitutePerson, setSubstitutePerson] = useState(initialData?.substitutePerson ?? "");
  const [remainingLeave, setRemainingLeave] = useState(initialData?.remainingLeave ?? "");
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

  const leaveSummary = useMemo(() => {
    const parts = leaveYears.map((item, idx) => {
      const y = item.year.trim() ? item.year.trim() : "....";
      const d = item.days.trim() ? item.days.trim() : "0";
      return idx === 0 ? `${y} - ${d} gün` : `${y} - ${d}`;
    });
    return `${parts.join(" + ")} = Toplam ${totalLeave} gün`;
  }, [leaveYears, totalLeave]);

  const requestText = useMemo(
    () => {
      const hasAnyYear = leaveYears.some((x) => x.year.trim());
      const hasAnyDays = totalLeave > 0;
      const hasStartDate = Boolean(leaveStartDate.trim());

      if (!hasAnyYear || !hasAnyDays || !hasStartDate) {
        return "Buraya talep metni gelecek.";
      }

      const yearCount = leaveYears.filter((x) => x.year.trim()).length;
      const yearsLabel = yearCount > 1 ? "yıllarına" : "yılına";
      const fromLabel = yearCount > 1 ? "izinlerimden" : "iznimden";
      return `${formatYearList(leaveYears.map((x) => x.year))} ${yearsLabel} ait ${fromLabel} ${totalLeave} gününü ${formatDateDot(
        leaveStartDate,
        ".../.../...."
      )} tarihinden itibaren kullanmam için,`;
    },
    [leaveStartDate, leaveYears, totalLeave]
  );

  const finalRequestText = requestOverride.trim() || requestText;

  const validation = useMemo(() => {
    const issues: string[] = [];

    const remainingParsed = parseOptionalInteger(remainingLeave);
    if (!remainingParsed.ok) {
      issues.push("Kalan izin sayısal olmalı.");
    } else if (remainingParsed.value !== null && remainingParsed.value < 0) {
      issues.push("Kalan izin 0'dan küçük olamaz.");
    }

    const remainingValue = remainingParsed.ok ? remainingParsed.value : null;
    if (remainingValue !== null && totalLeave > remainingValue) {
      issues.push("Talep edilen toplam gün, kalan izni aşıyor.");
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
  }, [remainingLeave, returnDate, totalLeave]);

  const handleDownloadPDF = async () => {
    if (!validation.canDownload) return;
    setIsGeneratingPdf(true);
    const fileSafeName = fullName.trim() ? fullName.trim().replace(/\s+/g, "_") : "Personel";
    await generatePDF("print-area", `Yillik_Izin_Formu_${fileSafeName}`);
    setIsGeneratingPdf(false);
  };

  return {
    formData: {
      fullName, duty, leaveYears, leaveStartDate,
      requestOverride, leaveAddress, returnDate, phone, substitutePerson,
      staffSignDate, managerApprovalDate, remainingLeave, managerName, managerTitle
    },
    handlers: {
      setFullName, setDuty, setLeaveYears,
      setLeaveStartDate, setRequestOverride, setLeaveAddress, setReturnDate,
      setPhone, setSubstitutePerson, setRemainingLeave,
      handleDownloadPDF
    },
    computed: {
      leaveSummary,
      finalRequestText,
      isGeneratingPdf,
      serviceYears,
      entitlementDays,
      canDownloadPdf: validation.canDownload,
      validationMessage: validation.message,
    }
  };
};