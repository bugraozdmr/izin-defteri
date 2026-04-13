import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { LeaveQueryParams } from "../types/queryParams";

export const leaveRepository = {
  async findAll({ page = 1, limit = 10, searchTerm = "" }: LeaveQueryParams = {}) {
    const skip = (page - 1) * limit;

    const where: Prisma.LeaveWhereInput = searchTerm
      ? {
          OR: [
            { fullName: { contains: searchTerm, mode: "insensitive" } },
            // { registryNumber: { contains: searchTerm, mode: "insensitive" } },
          ],
        }
      : {};

    const [data, totalCount] = await db.$transaction([
      db.leave.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fullName: "asc" },
      }),
      db.leave.count({ where }),
    ]);

    return {
      data,
      meta: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  },

  async findById(id: string) {
    return await db.leave.findUnique({ where: { id } });
  },

  async create(data: Prisma.LeaveCreateInput) {
    return await db.leave.create({ data });
  },

  async update(id: string, data: Prisma.LeaveUpdateInput) {
    return await db.leave.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return await db.leave.delete({
      where: { id },
    });
  },
};