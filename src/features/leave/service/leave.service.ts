import { leaveRepository } from "../repository/leave.repository";
import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import type { LeaveQueryParams } from "../types/queryParams";
import { calculateTotalDays } from "../utils/helpers";

export const leaveService = {
  async getPaginatedLeaves(params: LeaveQueryParams = {}) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const searchTerm = params.searchTerm || "";

    const cacheKey = `leave-paginated-p${page}-l${limit}-s${searchTerm}`;

    const fetchCachedPaginated = unstable_cache(
      async () => {
        console.log(`🔴 CACHE MISS: Veritabanından çekiliyor -> Sayfa: ${page}, Limit: ${limit}`);
        return await leaveRepository.findAll({ page, limit, searchTerm });
      },
      [cacheKey],
      {
        tags: ["leave-data"],
        revalidate: 86400, 
      }
    );

    return await fetchCachedPaginated();
  },

  async getLeaveById(id: string) {
    return await leaveRepository.findById(id);
  },

  async createLeave(data: Prisma.LeaveCreateInput) {
    const totalDays = calculateTotalDays(data.leaves);
    return await leaveRepository.create({ ...data, totalDays });
  },

  async updateLeave(id: string, data: Prisma.LeaveUpdateInput) {
    let updateData = { ...data };
    if (data.leaves !== undefined) {
      updateData.totalDays = calculateTotalDays(data.leaves);
    }
    return await leaveRepository.update(id, updateData);
  },

  async deleteLeave(id: string) {
    return await leaveRepository.delete(id);
  }
};