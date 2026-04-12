import { useEffect, useState } from "react";
import { Holiday } from "@/features/holiday/types/holiday";
import { getClosestUpcomingHolidayAction } from "@/features/holiday/actions/holiday.action";

export const useHome = () => {
  const [upcomingHoliday, setUpcomingHoliday] = useState<Holiday | null>(null);
  const [isLoadingHoliday, setIsLoadingHoliday] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        setIsLoadingHoliday(true);
        const res = await getClosestUpcomingHolidayAction();
        if (res.success && res.data) {
          setUpcomingHoliday(res.data as unknown as Holiday);
        }
      } catch (error) {
        console.error("Yaklaşan tatil bilgisi alınırken hata oluştu:", error);
      } finally {
        setIsLoadingHoliday(false);
      }
    };

    fetchUpcoming();
  }, []);

  return {
    upcomingHoliday,
    isLoadingHoliday,
  };
};