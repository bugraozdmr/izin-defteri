import { useState, useEffect, useMemo } from "react";
import { getUpcomingHolidaysAction } from "@/features/holiday/actions";
import { UpcomingHoliday } from "@/features/holiday/constants";

export function useTatiller() {
  const [holidays, setHolidays] = useState<UpcomingHoliday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"thisYear" | "all">("thisYear");

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setIsLoading(true);
        const response = await getUpcomingHolidaysAction();
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
    const currentYear = new Date().getFullYear();

    return holidays.filter((holiday) => {
      if (viewMode === "all") return true;
      
      const hDate = new Date(holiday.nextDate);
      return hDate.getFullYear() === currentYear;
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