import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export const userService = {

  async createUser(data: Prisma.UserCreateInput) {
    return await db.user.create({ data });
  },

  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    return await db.user.update({
      where: { id },
      data
    });
  },

  async deleteUser(id: string) {
    return await db.user.delete({
      where: { id }
    });
  },

  async getAllUsers(year: number = new Date().getFullYear()) {
    return await db.user.findMany({
      orderBy: { fullName: "asc" },
      include: {
        balances: {
          where: { year }
        }
      }
    });
  },

  async getPaginatedUsers(
    page: number = 1,
    limit: number = 20,
    searchTerm: string = "",
    year?: number
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = searchTerm
      ? {
          fullName: { contains: searchTerm, mode: "insensitive" }
        }
      : {};

    const [users, totalCount] = await db.$transaction([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fullName: "asc" },
        include: {
          balances: true,
        }
      }),
      db.user.count({ where })
    ]);

    const formattedData = users.map(user => {
      const totalAllTime = user.balances.reduce((acc, b) => acc + b.totalDays, 0);
      const usedAllTime = user.balances.reduce((acc, b) => acc + b.usedDays, 0);
      const remainingAllTime = Math.max(0, totalAllTime - usedAllTime);

      let specificYearBalance = null;
      let remainingForSpecificYear = null;

      if (year) {
        const targetBalance = user.balances.find(b => b.year === year);
        if (targetBalance) {
          specificYearBalance = targetBalance;
          remainingForSpecificYear = Math.max(0, targetBalance.totalDays - targetBalance.usedDays);
        }
      }

      return {
        id: user.id,
        fullName: user.fullName,
        jobTitle: user.jobTitle,
        hireDate: user.hireDate,
        phone: user.phone,
        
        totalDays: totalAllTime,
        usedDays: usedAllTime,
        remainingDays: remainingAllTime,

        filteredYear: year || null,
        specificYearTotal: specificYearBalance?.totalDays || 0,
        specificYearUsed: specificYearBalance?.usedDays || 0,
        specificYearRemaining: remainingForSpecificYear !== null ? remainingForSpecificYear : 0,
        
        balances: user.balances,
      };
    });

    return {
      data: formattedData,
      meta: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      }
    };
  },

  async getAllUserNames() {
    return await db.user.findMany({
      select: {
        id: true,
        fullName: true,
      },
      orderBy: { fullName: "asc" },
    });
  },

  async getUserDetails(id: string) {
    return await db.user.findUnique({
      where: { id },
      include: {
        leaves: { 
          orderBy: { startDate: "desc" } 
        },
        balances: { 
          orderBy: { year: "desc" } 
        }
      }
    });
  }
};