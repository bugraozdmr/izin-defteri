export type LeaveBalance = {
  id: string;
  userId: string;
  year: number;
  totalDays: number;
  usedDays: number;
  createdAt: Date;
};

export type Leave = {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;

  location?: string | null;
  reason?: string | null;
  tradedWith?: string | null;
  manager?: string | null;
  title?: string | null;

  days: number;
  createdAt: Date;
};

export type LeaveFormPayload = {
  fullName: string;
  jobTitle: string | null;
  hireDate: Date | null;

  
};

/*export type FormLeaveEntry = {
  id: string;
  year: string;
  days: string;
};



export type LeaveFormType = {
  fullName: string;
  jobTitle: string | null;
  hireDate: string;
  leaves: Record<string, string>;
};*/