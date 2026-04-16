export const calculateTotalDays = (leavesObj: any): number => {
  if (!leavesObj || typeof leavesObj !== "object") return 0;
  return Object.values(leavesObj).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);
};