export interface Leave {
  id: string;
  fullName: string;
  
  leaves: Record<string, number>; 
  
  totalDays: number;
  hireDate: Date | null;
  
  createdAt: Date;
  updatedAt: Date;
}