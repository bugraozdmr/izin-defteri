export type HolidayType = "PUBLIC" | "CORPORATE";

export interface Holiday {
  id: string;
  name: string;
  day: number;
  month: number;
  year: number | null;
  duration: number;
  type: HolidayType;
  description: string | null;
}