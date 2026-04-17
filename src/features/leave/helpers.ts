export const calculateTotalDays = (leavesObj: any): number => {
  if (!leavesObj || typeof leavesObj !== "object") return 0;
  return Object.values(leavesObj).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);
};

export function formatDateLong(value?: Date | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric" }).format(value);
}

export function formatDateShort(value: Date) {
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(value);
}

export function formatDays(value: number) {
  const normalized = Number.isFinite(value) ? value : 0;
  return `${normalized.toFixed(normalized % 1 === 0 ? 0 : 1)} gün`;
}