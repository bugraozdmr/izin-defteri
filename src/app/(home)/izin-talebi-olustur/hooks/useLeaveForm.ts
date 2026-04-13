import { useMemo, useState } from "react";
import { generatePDF } from "@/lib/pdf";

export type LeaveYearItem = {
  id: string;
  year: string;
  days: string;
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

export const useLeaveForm = () => {
  const [fullName, setFullName] = useState("Ayşe DEMİR");
  const [duty, setDuty] = useState("Memur");
  const [leaveYears, setLeaveYears] = useState<LeaveYearItem[]>(() => [
    { id: makeId(), year: "2024", days: "3" },
    { id: makeId(), year: "2025", days: "16" },
  ]);
  const [requestedYear, setRequestedYear] = useState("2024");
  const [requestedDays, setRequestedDays] = useState("2");
  const [leaveStartDate, setLeaveStartDate] = useState("2026-04-11");
  const [requestOverride, setRequestOverride] = useState("");
  const [leaveAddress, setLeaveAddress] = useState("Ankara");
  const [returnDate, setReturnDate] = useState("2026-04-14");
  const [phone, setPhone] = useState("0532 123 45 67");
  const [substitutePerson, setSubstitutePerson] = useState("Mehmet YILMAZ");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const currentYear = new Date().getFullYear();
  const staffSignDate = `.../.../${currentYear}`;
  const managerApprovalDate = `.../.../${currentYear}`;

  const remainingLeave = "17";
  const managerName = "M. Kübra KAHRAMAN";
  const managerTitle = "Müdür";

  const baseYear = useMemo(() => {
    const firstNonEmpty = leaveYears.find((x) => x.year.trim());
    return firstNonEmpty?.year || "2024";
  }, [leaveYears]);

  const totalLeave = useMemo(() => {
    return leaveYears.reduce((acc, item) => acc + parseInteger(item.days), 0);
  }, [leaveYears]);

  const leaveSummary = useMemo(() => {
    const parts = leaveYears.map((item, idx) => {
      const y = item.year.trim() ? item.year.trim() : "....";
      const d = item.days.trim() ? item.days.trim() : "0";
      return idx === 0 ? `${y} - ${d} gün` : `${y} - ${d}`;
    });
    return `${parts.join(" + ")} = Toplam ${totalLeave} gün`;
  }, [leaveYears, totalLeave]);

  const requestText = useMemo(
    () =>
      `${requestedYear || baseYear || "2024"} yılına ait iznimden ${requestedDays || "0"} gününü ${formatDateDot(
        leaveStartDate,
        ".../.../...."
      )} tarihinden itibaren kullanmam için,`,
    [baseYear, leaveStartDate, requestedDays, requestedYear]
  );

  const finalRequestText = requestOverride.trim() || requestText;

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    const fileSafeName = fullName.trim() ? fullName.trim().replace(/\s+/g, "_") : "Personel";
    await generatePDF("print-area", `Yillik_Izin_Formu_${fileSafeName}`);
    setIsGeneratingPdf(false);
  };

  return {
    formData: {
      fullName, duty, leaveYears, requestedYear, requestedDays, leaveStartDate,
      requestOverride, leaveAddress, returnDate, phone, substitutePerson,
      staffSignDate, managerApprovalDate, remainingLeave, managerName, managerTitle
    },
    handlers: {
      setFullName, setDuty, setLeaveYears, setRequestedYear, setRequestedDays,
      setLeaveStartDate, setRequestOverride, setLeaveAddress, setReturnDate,
      setPhone, setSubstitutePerson,
      handleDownloadPDF
    },
    computed: {
      leaveSummary, finalRequestText, isGeneratingPdf
    }
  };
};