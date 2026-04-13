export type LeaveFormType = {
  fullName: string;
  hireDate: string;
  leaves: Record<string, string>;
};

export const INITIAL_LEAVE_FORM: LeaveFormType = {
  fullName: "",
  hireDate: "",
  leaves: {}, 
};

export const INITIAL_YEAR_ENTRY = {
  year: "",
  days: "",
};