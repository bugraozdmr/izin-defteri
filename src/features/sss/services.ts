import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

export const sssService = {
  async getAllSSSFromDb() {
    return await db.sSS.findMany({
      orderBy: [{ createdAt: "asc" }],
    });
  },

  getCachedSSS: unstable_cache(
    async () => {
      console.log("🔴 CACHE MISS: SSS veritabanından çekiliyor...");
      return await db.sSS.findMany({
        orderBy: [{ createdAt: "asc" }],
      });
    },
    ["sss-all-cache-key"],
    {
      tags: ["sss-data"],
      revalidate: 86400, // 24 saat
    }
  ),

  async createSSS(data: Prisma.SSSCreateInput) {
    return await db.sSS.create({
      data,
    });
  },

  async updateSSS(id: string, data: Prisma.SSSUpdateInput) {
    return await db.sSS.update({
      where: { id },
      data,
    });
  },

  async deleteSSS(id: string) {
    return await db.sSS.delete({
      where: { id },
    });
  }
};