import { db } from "@/lib/db";

function getTotalAvailableDays(balances: Array<{ totalDays: number; usedDays: number }>) {
  return balances.reduce((acc, bal) => acc + Math.max(0, (bal.totalDays ?? 0) - (bal.usedDays ?? 0)), 0);
}

function hasLeaveAllocationDelegate(tx: any): boolean {
  return Boolean(tx?.leaveAllocation && typeof tx.leaveAllocation.create === "function");
}

export const leaveService = {

  async initializeYearlyBalance(userId: string, year: number, totalDays: number) {
    return await db.leaveBalance.upsert({
      where: { userId_year: { userId, year } },
      update: { totalDays },
      create: { userId, year, totalDays, usedDays: 0 }
    });
  },

  async initializeMultipleBalances(userId: string, balances: { year: number, totalDays: number }[]) {
    const yearsToAdd = balances.map(b => b.year);

    const existingBalances = await db.leaveBalance.findMany({
      where: {
        userId: userId,
        year: { in: yearsToAdd }
      }
    });

    if (existingBalances.length > 0) {
      const existingYears = existingBalances.map(b => b.year).join(", ");
      throw new Error(`Şu yıllara ait bakiye zaten mevcut: ${existingYears}. Aynı yılı iki kez ekleyemezsiniz.`);
    }

    const dataToInsert = balances.map(balance => ({
      userId: userId,
      year: balance.year,
      totalDays: balance.totalDays,
      usedDays: 0
    }));

    return await db.leaveBalance.createMany({
      data: dataToInsert
    });
  },

  async updateBalance(balanceId: string, userId: string, year: number, totalDays: number) {
    const existing = await db.leaveBalance.findUnique({ where: { id: balanceId } });
    if (!existing || existing.userId !== userId) {
      throw new Error("Bakiye kaydı bulunamadı.");
    }

    if (totalDays < existing.usedDays) {
      throw new Error("Toplam gün, kullanılan günden küçük olamaz.");
    }

    return await db.leaveBalance.update({
      where: { id: balanceId },
      data: {
        year,
        totalDays,
      },
    });
  },

  async deleteBalance(balanceId: string, userId: string) {
    const existing = await db.leaveBalance.findUnique({ where: { id: balanceId } });
    if (!existing || existing.userId !== userId) {
      throw new Error("Bakiye kaydı bulunamadı.");
    }

    if (existing.usedDays > 0) {
      throw new Error("Kullanılmış gün olan bakiye silinemez.");
    }

    await db.leaveBalance.delete({ where: { id: balanceId } });
    return true;
  },

  async updateLeaveRecord(
    leaveId: string,
    userId: string,
    data: {
      startDate: Date;
      endDate: Date;
      days: number;

      location?: string;
      reason?: string;
      tradedWith?: string;
      manager?: string;
      title?: string;
    }
  ) {
    return await db.$transaction(async (tx) => {
      const allocationEnabled = hasLeaveAllocationDelegate(tx);

      const existingLeave = allocationEnabled
        ? await tx.leave.findUnique({
            where: { id: leaveId },
            include: { allocations: true },
          })
        : await tx.leave.findUnique({ where: { id: leaveId } });

      if (!existingLeave || existingLeave.userId !== userId) {
        throw new Error("İzin kaydı bulunamadı.");
      }

      const refundDaysAcrossBalances = async (daysToRefund: number) => {
        let remainingRefund = daysToRefund;
        const balancesDesc = await tx.leaveBalance.findMany({
          where: { userId },
          orderBy: { year: "desc" },
        });

        for (const balance of balancesDesc) {
          if (remainingRefund <= 0) break;
          const refundable = Math.min(balance.usedDays, remainingRefund);
          if (refundable <= 0) continue;
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: { usedDays: { decrement: refundable } },
          });
          remainingRefund -= refundable;
        }

        if (remainingRefund > 0.000001) {
          throw new Error("Bakiyeler izin iadesi için tutarsız durumda.");
        }
      };

      if (allocationEnabled) {
        const allocations = (existingLeave as any).allocations as Array<{ balanceId: string; days: number }>;

        if (Array.isArray(allocations) && allocations.length > 0) {
          for (const alloc of allocations) {
            await tx.leaveBalance.update({
              where: { id: alloc.balanceId },
              data: { usedDays: { decrement: alloc.days } },
            });
          }
          await tx.leaveAllocation.deleteMany({ where: { leaveId: (existingLeave as any).id } });
        } else {
          await refundDaysAcrossBalances((existingLeave as any).days);
        }
      } else {
        await refundDaysAcrossBalances((existingLeave as any).days);
      }

      const balancesAsc = await tx.leaveBalance.findMany({
        where: { userId },
        orderBy: { year: "asc" },
      });

      const totalAvailable = getTotalAvailableDays(balancesAsc);
      if (totalAvailable < data.days) {
        throw new Error(`Yetersiz bakiye. İstenen: ${data.days} gün, Toplam Kalan: ${totalAvailable} gün.`);
      }

      let remainingDaysToDeduct = data.days;
      const allocationsToCreate: Array<{ balanceId: string; year: number; days: number }> = [];

      for (const balance of balancesAsc) {
        if (remainingDaysToDeduct <= 0) break;
        const availableInThisBalance = Math.max(0, balance.totalDays - balance.usedDays);
        if (availableInThisBalance <= 0) continue;

        const daysToTake = Math.min(availableInThisBalance, remainingDaysToDeduct);
        allocationsToCreate.push({ balanceId: balance.id, year: balance.year, days: daysToTake });
        remainingDaysToDeduct -= daysToTake;
      }

      const updatedLeave = await tx.leave.update({
        where: { id: leaveId },
        data: {
          startDate: data.startDate,
          endDate: data.endDate,
          days: data.days,

          location: data.location || null,
          reason: data.reason || null,
          tradedWith: data.tradedWith || null,
          manager: data.manager || null,
          title: data.title || null,
        },
      });

      for (const alloc of allocationsToCreate) {
        if (allocationEnabled) {
          await tx.leaveAllocation.create({
            data: {
              leaveId: leaveId,
              balanceId: alloc.balanceId,
              year: alloc.year,
              days: alloc.days,
            },
          });
        }

        await tx.leaveBalance.update({
          where: { id: alloc.balanceId },
          data: { usedDays: { increment: alloc.days } },
        });
      }

      return updatedLeave;
    });
  },

  async createLeaveRecord(userId: string, data: {
    startDate: Date;
    endDate: Date;
    days: number;
    location?: string;
    reason?: string;
    tradedWith?: string;
    manager?: string;
    title?: string;
  }) {
    return await db.$transaction(async (tx) => {
      const allocationEnabled = hasLeaveAllocationDelegate(tx);

      const availableBalances = await tx.leaveBalance.findMany({
        where: { userId: userId },
        orderBy: { year: "asc" },
      });

      const totalAvailable = getTotalAvailableDays(availableBalances);
      if (totalAvailable < data.days) {
        throw new Error(`Yetersiz bakiye. İstenen: ${data.days} gün, Toplam Kalan: ${totalAvailable} gün.`);
      }

      let remainingDaysToDeduct = data.days;
      const allocationsToCreate: Array<{ balanceId: string; year: number; days: number }> = [];

      for (const balance of availableBalances) {
        if (remainingDaysToDeduct <= 0) break;
        const availableInThisBalance = Math.max(0, balance.totalDays - balance.usedDays);
        if (availableInThisBalance <= 0) continue;

        const daysToTakeFromThisBalance = Math.min(availableInThisBalance, remainingDaysToDeduct);
        allocationsToCreate.push({
          balanceId: balance.id,
          year: balance.year,
          days: daysToTakeFromThisBalance,
        });
        remainingDaysToDeduct -= daysToTakeFromThisBalance;
      }

      const leave = await tx.leave.create({
        data: {
          userId,
          startDate: data.startDate,
          endDate: data.endDate,
          days: data.days,
          location: data.location || null,
          reason: data.reason || null,
          tradedWith: data.tradedWith || null,
          manager: data.manager || null,
          title: data.title || null,
        },
      });

      for (const alloc of allocationsToCreate) {
        if (allocationEnabled) {
          await tx.leaveAllocation.create({
            data: {
              leaveId: leave.id,
              balanceId: alloc.balanceId,
              year: alloc.year,
              days: alloc.days,
            },
          });
        }

        await tx.leaveBalance.update({
          where: { id: alloc.balanceId },
          data: { usedDays: { increment: alloc.days } },
        });
      }

      return leave;
    });
  },

  async deleteLeaveRecord(leaveId: string) {
    return await db.$transaction(async (tx) => {
      const allocationEnabled = hasLeaveAllocationDelegate(tx);

      const leave = allocationEnabled
        ? await tx.leave.findUnique({
            where: { id: leaveId },
            include: { allocations: true },
          })
        : await tx.leave.findUnique({ where: { id: leaveId } });
      if (!leave) throw new Error("İzin kaydı bulunamadı.");

      if (allocationEnabled) {
        const allocations = (leave as any).allocations as Array<{ balanceId: string; days: number }>;

        if (Array.isArray(allocations) && allocations.length > 0) {
          for (const alloc of allocations) {
            await tx.leaveBalance.update({
              where: { id: alloc.balanceId },
              data: { usedDays: { decrement: alloc.days } },
            });
          }

          await tx.leave.delete({ where: { id: leaveId } });
          return true;
        }
      }

      let remainingRefund = (leave as any).days;
      const balancesDesc = await tx.leaveBalance.findMany({
        where: { userId: (leave as any).userId },
        orderBy: { year: "desc" },
      });

      for (const balance of balancesDesc) {
        if (remainingRefund <= 0) break;
        const refundable = Math.min(balance.usedDays, remainingRefund);
        if (refundable <= 0) continue;

        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: { usedDays: { decrement: refundable } },
        });
        remainingRefund -= refundable;
      }

      if (remainingRefund > 0.000001) {
        throw new Error("Bakiyeler izin iadesi için tutarsız durumda.");
      }

      await tx.leave.delete({ where: { id: leaveId } });
      return true;
    });
  },

  async getPaginatedLeaves(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, totalCount] = await db.$transaction([
      db.leave.findMany({
        skip,
        take: limit,
        orderBy: { startDate: "desc" },
        include: { user: { select: { fullName: true, jobTitle: true } } }
      }),
      db.leave.count()
    ]);

    return { data, meta: { totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) } };
  }
};