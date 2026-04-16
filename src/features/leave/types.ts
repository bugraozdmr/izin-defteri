export interface Leave {
  id: string;
  fullName: string;
  jobTitle: string | null;
  
  leaves: Record<string, number>; 
  
  totalDays: number;
  hireDate: Date | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export type FormLeaveEntry = {
  id: string;
  year: string;
  days: string;
};

export type LeaveFormPayload = {
  fullName: string;
  jobTitle: string | null;
  hireDate: Date | null;
  leaves: Record<string, number>;
};

export type LeaveFormType = {
  fullName: string;
  jobTitle: string | null;
  hireDate: string;
  leaves: Record<string, string>;
};