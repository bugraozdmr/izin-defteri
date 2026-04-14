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

function formatYearList(years: string[]) {
  const uniqueYears = Array.from(new Set(years.map((y) => y.trim()).filter(Boolean)));
  if (uniqueYears.length === 0) return "....";
  if (uniqueYears.length === 1) return uniqueYears[0];
  if (uniqueYears.length === 2) return `${uniqueYears[0]} ve ${uniqueYears[1]}`;
  return `${uniqueYears.slice(0, -1).join(", ")} ve ${uniqueYears[uniqueYears.length - 1]}`;
}

export const useLeaveForm = () => {
  const [fullName, setFullName] = useState("");
  const [duty, setDuty] = useState("");
  const [leaveYears, setLeaveYears] = useState<LeaveYearItem[]>(() => [
    { id: makeId(), year: "", days: "" },
    { id: makeId(), year: "", days: "" },
  ]);
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [requestOverride, setRequestOverride] = useState("");
  const [leaveAddress, setLeaveAddress] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [phone, setPhone] = useState("");
  const [substitutePerson, setSubstitutePerson] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const currentYear = new Date().getFullYear();
  const staffSignDate = `.../.../${currentYear}`;
  const managerApprovalDate = `.../.../${currentYear}`;

  const remainingLeave = "";
  const managerName = "M. Kübra KAHRAMAN";
  const managerTitle = "Müdür";

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
      `${formatYearList(leaveYears.map((x) => x.year))} ${
        leaveYears.filter((x) => x.year.trim()).length > 1 ? "yıllarına" : "yılına"
      } ait izin${leaveYears.filter((x) => x.year.trim()).length > 1 ? "lerimden" : "imden"} ${totalLeave} gününü ${formatDateDot(
        leaveStartDate,
        ".../.../...."
      )} tarihinden itibaren kullanmam için,`,
    [leaveYears, leaveStartDate, totalLeave]
  );

  // const finalRequestText = requestOverride.trim() || requestText;
  const finalRequestText = "Buraya talep metni gelecek.";

  const handleDownloadPDF = async () => {
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
      setPhone, setSubstitutePerson,
      handleDownloadPDF
    },
    computed: {
      leaveSummary, finalRequestText, isGeneratingPdf
    }
  };
};