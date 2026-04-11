export function GetNextOccurrence(holiday: any, fromDate: Date): Date | null {
  const currentYear = fromDate.getFullYear();

  if (holiday.year) {
    const hDate = new Date(holiday.year, holiday.month - 1, holiday.day);
    return hDate >= fromDate ? hDate : null;
  } else {
    const hDateThisYear = new Date(currentYear, holiday.month - 1, holiday.day);
    
    if (hDateThisYear >= fromDate) {
      return hDateThisYear;
    } else {
      return new Date(currentYear + 1, holiday.month - 1, holiday.day);
    }
  }
}