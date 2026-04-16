import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import type { LeaveQueryParams } from "@/features/leave/constants";
import { calculateTotalDays } from "@/features/leave/helpers";

export const leaveService = {
  async getPaginatedLeaves(params: LeaveQueryParams = {}) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const searchTerm = params.searchTerm || "";

    const cacheKey = `leave-paginated-p${page}-l${limit}-s${searchTerm}`;

    const fetchCachedPaginated = unstable_cache(
      async () => {
        console.log(`🔴 CACHE MISS: Veritabanından çekiliyor -> Sayfa: ${page}, Limit: ${limit}`);
        
        const skip = (page - 1) * limit;
        const where: Prisma.LeaveWhereInput = searchTerm
          ? {
              OR: [
                { fullName: { contains: searchTerm, mode: "insensitive" } },
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
      [cacheKey],
      {
        tags: ["leave-data"],
        revalidate: 86400, 
      }
    );

    return await fetchCachedPaginated();
  },

  async getAllLeaveNames() {
    return await db.leave.findMany({
      select: {
        id: true,
        fullName: true,
      },
      orderBy: { fullName: "asc" },
    });
  },

  async getLeaveById(id: string) {
    return await db.leave.findUnique({ where: { id } });
  },

  async createLeave(data: Prisma.LeaveCreateInput) {
    const totalDays = calculateTotalDays(data.leaves);
    return await db.leave.create({
      data: { ...data, totalDays }
    });
  },

  async updateLeave(id: string, data: Prisma.LeaveUpdateInput) {
    let updateData = { ...data };
    
    if (data.leaves !== undefined) {
      updateData.totalDays = calculateTotalDays(data.leaves);
    }
    
    return await db.leave.update({
      where: { id },
      data: updateData,
    });
  },

  async deleteLeave(id: string) {
    return await db.leave.delete({
      where: { id },
    });
  }
};