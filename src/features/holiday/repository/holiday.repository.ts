import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export const holidayRepository = {
  async findAll() {
    return await db.holiday.findMany({
      orderBy: [
        { month: "asc" },
        { day: "asc" },
      ],
    });
  },

  async findByYear(year: number) {
    return await db.holiday.findMany({
      where: {
        OR: [
          { year: year },
          { year: null },
        ],
      },
      orderBy: [
        { month: "asc" },
        { day: "asc" },
      ],
    });
  },

  async findBetweenDates(startDate: Date, endDate: Date) {
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    return await db.holiday.findMany({
      where: {
        OR: [
          {
            year: { gte: startYear, lte: endYear },
          },
          {
            year: null,
          },
        ],
      },
    });
  },

  async create(data: Prisma.HolidayCreateInput) {
    return await db.holiday.create({
      data,
    });
  },

  async delete(id: string) {
    return await db.holiday.delete({
      where: { id },
    });
  },

  async update(id: string, data: Prisma.HolidayUpdateInput) {
    return await db.holiday.update({
      where: { id },
      data,
    });
  },
};