import { useState, useEffect, useMemo } from "react";
import { getHolidaysForYearAction } from "@/features/holiday/actions";
import { UpcomingHoliday } from "@/features/holiday/constants";

export function useTatiller() {
  const [holidays, setHolidays] = useState<UpcomingHoliday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"thisYear" | "all">("thisYear");

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setIsLoading(true);
        const currentYear = new Date().getFullYear();
        const response = await getHolidaysForYearAction(currentYear);
        if (response.success && response.data) {
          setHolidays(response.data as unknown as UpcomingHoliday[]);
        }
      } catch (error) {
        console.error("Tatiller yüklenemedi", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  const filteredHolidays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return holidays.filter((holiday) => {
      if (viewMode === "all") return true;
      
      const hDate = new Date(holiday.nextDate);
      hDate.setHours(0, 0, 0, 0);
      return hDate.getTime() >= today.getTime();
    });
  }, [holidays, viewMode]);

  const formatFriendlyDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      weekday: "long",
    }).format(date);
  };

  return {
    holidays: filteredHolidays,
    isLoading,
    viewMode,
    setViewMode,
    formatFriendlyDate,
  };
}