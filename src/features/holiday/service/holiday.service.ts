import { holidayRepository } from "../repository/holiday.repository";
import { Prisma } from "@prisma/client";

export const holidayService = {
  async getAllHolidays() {
    return await holidayRepository.findAll();
  },

  async getHolidaysByYear(year: number) {
    return await holidayRepository.findByYear(year);
  },

  async calculateTotalHolidayDays(startDate: Date, endDate: Date): Promise<number> {
    const potentialHolidays = await holidayRepository.findBetweenDates(startDate, endDate);
    
    if (!potentialHolidays || potentialHolidays.length === 0) return 0;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const totalHolidayDays = potentialHolidays.reduce((total, holiday) => {
      const holidayYear = holiday.year || start.getFullYear();
      const holidayDate = new Date(holidayYear, holiday.month - 1, holiday.day);
      holidayDate.setHours(0, 0, 0, 0);

      if (holidayDate >= start && holidayDate <= end) {
        return total + holiday.duration;
      }

      if (!holiday.year && start.getFullYear() !== end.getFullYear()) {
         const holidayDateNextYear = new Date(end.getFullYear(), holiday.month - 1, holiday.day);
         holidayDateNextYear.setHours(0, 0, 0, 0);
         if (holidayDateNextYear >= start && holidayDateNextYear <= end) {
            return total + holiday.duration;
         }
      }

      return total;
    }, 0);

    return totalHolidayDays;
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