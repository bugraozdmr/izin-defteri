export type HolidayType = "PUBLIC" | "CORPORATE";

// TODO move
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

// ADMIN
export type HolidayFormType = {
  name: string;
  day: string;
  month: string;
  year: string;
  duration: string;
  type: "PUBLIC" | "CORPORATE";
  description: string;
};