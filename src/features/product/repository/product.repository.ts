import { db } from "@/lib/db";

export const getAllProducts = async () => {
  return await db.product.findMany({
    orderBy: { createdAt: "desc" },
  });
};