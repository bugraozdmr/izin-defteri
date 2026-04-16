import { LeaveFormType } from "./types";

export interface LeaveQueryParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export const INITIAL_LEAVE_FORM: LeaveFormType = {
  fullName: "",
  jobTitle: null,
  hireDate: "",
  leaves: {}, 
};

export const INITIAL_YEAR_ENTRY = {
  year: "",
  days: "",
};