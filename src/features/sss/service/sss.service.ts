import { sssRepository } from "../repository/sss.repository";
import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

export const sssService = {
  async getAllSSSFromDb() {
    return await sssRepository.findAll();
  },

  getCachedSSS: unstable_cache(
    async () => {
      console.log("🔴 CACHE MISS: Veritabanına sorgu atılıyor...");
      return await sssRepository.findAll();
    },
    ["sss-all-cache-key"],
    {
      tags: ["sss-data"],
      revalidate: 86400, // 24 saat
    }
  ),

  async createSSS(data: Prisma.SSSCreateInput) {
    return await sssRepository.create(data);
  },

  async updateSSS(id: string, data: Prisma.SSSUpdateInput) {
    return await sssRepository.update(id, data);
  },

  async deleteSSS(id: string) {
    return await sssRepository.delete(id);
  }
};