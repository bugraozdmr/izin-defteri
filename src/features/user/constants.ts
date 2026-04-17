// import { LeaveFormType } from "./types";

// dönen veri tipi
export interface User {
  id: string;
  fullName: string;
  jobTitle: string | null;
  hireDate: Date | null;
  phone: string | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  year?: number;
}

export interface UserTableRow extends User {
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  
  filteredYear?: number | null;
  specificYearTotal?: number;
  specificYearUsed?: number;
  specificYearRemaining?: number;
}

/* export const INITIAL_LEAVE_FORM: LeaveFormType = {
  fullName: "",
  jobTitle: null,
  hireDate: "",
  phone: null,
  leaves: {}, 
};

export const INITIAL_YEAR_ENTRY = {
  year: "",
  days: "",
};*/