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