import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export const sssRepository = {
  async findAll() {
    return await db.sSS.findMany({
      orderBy: [
        { createdAt: "asc" },
      ],
    });
  },

  async create(data: Prisma.SSSCreateInput) {
    return await db.sSS.create({
      data,
    });
  },

  async delete(id: string) {
    return await db.sSS.delete({
      where: { id },
    });
  },

  async update(id: string, data: Prisma.SSSUpdateInput) {
    return await db.sSS.update({
      where: { id },
      data,
    });
  },
};