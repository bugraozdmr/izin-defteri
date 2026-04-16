import { HolidayFormType } from "./types";

export type UpcomingHoliday = {
  id: string;
  name: string;
  day: number;
  month: number;
  year: number | null;
  duration: number;
  type: "PUBLIC" | "CORPORATE";
  description: string | null;
  nextDate: string | Date;
};

export interface HolidayCardProps {
  holiday: UpcomingHoliday;
  isClosest: boolean;
  formatFriendlyDate: (date: string | Date) => string;
}

// ADMIN
export const INITIAL_HOLIDAY_FORM: HolidayFormType = {
  name: "",
  day: "",
  month: "",
  year: "",
  duration: "1",
  type: "PUBLIC",
  description: "",
};

export const DAY_OPTIONS = Array.from({ length: 31 }, (_, index) => String(index + 1));

export const MONTH_OPTIONS = [
  { value: "1", label: "Ocak" },
  { value: "2", label: "Şubat" },
  { value: "3", label: "Mart" },
  { value: "4", label: "Nisan" },
  { value: "5", label: "Mayıs" },
  { value: "6", label: "Haziran" },
  { value: "7", label: "Temmuz" },
  { value: "8", label: "Ağustos" },
  { value: "9", label: "Eylül" },
  { value: "10", label: "Ekim" },
  { value: "11", label: "Kasım" },
  { value: "12", label: "Aralık" },
];