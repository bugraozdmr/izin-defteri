import { holidayRepository } from "../repository/holiday.repository";
import { Prisma } from "@prisma/client";
import { GetNextOccurrence } from "../utils/helpers";

export const holidayService = {
  async getAllHolidays() {
    return await holidayRepository.findAll();
  },

  async getUpcomingHolidays(fromDate: Date = new Date(), limit?: number) {
    fromDate.setHours(0, 0, 0, 0); 
    
    const allHolidays = await holidayRepository.findAll();

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
    const potentialHolidays = await holidayRepository.findBetweenDates(startDate, endDate);
    
    if (!potentialHolidays || potentialHolidays.length === 0) return 0;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    return potentialHolidays.reduce((total, holiday) => {
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
    return await holidayRepository.create(data);
  },

  async updateHoliday(id: string, data: Prisma.HolidayUpdateInput) {
    return await holidayRepository.update(id, data);
  },

  async deleteHoliday(id: string) {
    return await holidayRepository.delete(id);
  }
};