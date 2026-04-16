import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { GetNextOccurrence } from "./helpers";
import { unstable_cache } from "next/cache";

export const holidayService = {
  getCachedAllHolidays: unstable_cache(
    async () => {
      console.log("🔴 CACHE MISS: Tatiller veritabanından çekiliyor...");
      return await db.holiday.findMany({
        orderBy: [{ month: "asc" }, { day: "asc" }],
      });
    },
    ["holiday-all-cache-key"],
    {
      tags: ["holiday-data"],
      revalidate: 86400,
    }
  ),

  async getAllHolidays() {
    return await this.getCachedAllHolidays();
  },

  async getUpcomingHolidays(fromDate: Date = new Date(), limit?: number) {
    fromDate.setHours(0, 0, 0, 0); 
    
    const allHolidays = await this.getCachedAllHolidays();

    const upcoming = allHolidays
      .map(holiday => {
        const nextDate = GetNextOccurrence(holiday, fromDate);
        return { ...holiday, nextDate }; 
      })
      .filter(holiday => holiday.nextDate !== null)
      // @ts-ignore
      .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());

    return limit ? upcoming.slice(0, limit) : upcoming;
  },

  async getClosestUpcomingHoliday(fromDate: Date = new Date()) {
    const upcoming = await this.getUpcomingHolidays(fromDate, 1);
    return upcoming && upcoming.length > 0 ? upcoming[0] : null;
  },

  async calculateTotalHolidayDays(startDate: Date, endDate: Date): Promise<number> {
    const allHolidays = await this.getCachedAllHolidays();
    if (!allHolidays || allHolidays.length === 0) return 0;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    return allHolidays.reduce((total, holiday) => {
      const currentYear = start.getFullYear();
      const endYear = end.getFullYear();
      let count = 0;

      for (let y = currentYear; y <= endYear; y++) {
        if (holiday.year && holiday.year !== y) continue;

        const holidayDate = new Date(y, holiday.month - 1, holiday.day);
        holidayDate.setHours(0, 0, 0, 0);

        if (holidayDate >= start && holidayDate <= end) {
          count += holiday.duration;
        }
      }
      return total + count;
    }, 0);
  },

  async createHoliday(data: Prisma.HolidayCreateInput) {
    return await db.holiday.create({ data });
  },

  async updateHoliday(id: string, data: Prisma.HolidayUpdateInput) {
    return await db.holiday.update({
      where: { id },
      data,
    });
  },

  async deleteHoliday(id: string) {
    return await db.holiday.delete({
      where: { id },
    });
  }
};