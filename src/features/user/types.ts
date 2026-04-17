// Kullanıcı Form Veri Tipi
export type UserFormPayload = {
  fullName: string;
  jobTitle: string | null;
  hireDate: Date | null;
  phone: string | null;
};

export type User = {
  id: string;
  fullName: string;
  jobTitle?: string | null;
  phone?: string | null;
  hireDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/*export type FormLeaveEntry = {
  id: string;
  year: string;
  days: string;
};*/

/*export type LeaveFormType = {
  fullName: string;
  jobTitle: string | null;
  hireDate: string;
  leaves: Record<string, string>;
};*/

