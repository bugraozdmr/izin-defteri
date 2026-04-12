import { sssRepository } from "../repository/sss.repository";
import { Prisma } from "@prisma/client";

export const sssService = {
  async getAllSSS() {
    return await sssRepository.findAll();
  },

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