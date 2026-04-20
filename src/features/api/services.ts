import { db } from "@/lib/db";

const TR_MONTHS_UPPER = [
	"OCAK", "ŞUBAT", "MART", "NİSAN", "MAYIS", "HAZİRAN",
	"TEMMUZ", "AĞUSTOS", "EYLÜL", "EKİM", "KASIM", "ARALIK",
];

function formatEntryDateNumeric(value: Date | null | undefined) {
	if (!value) return "-";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "-";
	const day = String(d.getDate()).padStart(2, "0");
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const year = d.getFullYear();
	return `${day}.${month}.${year}`;
}

function formatEntryDateText(value: Date | null | undefined) {
	if (!value) return "-";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "-";
	const month = TR_MONTHS_UPPER[d.getMonth()] ?? "";
	const year = d.getFullYear();
	return `${month} ${year} GİRİŞ`.trim();
}

export const apiService = {
  async getExportData() {
    const users = await db.user.findMany({
      orderBy: {
        fullName: "asc",
      },
      include: {
        balances: true
      }
    });

    const data = users.map((user, index) => {
      const years = user.balances
        .map(balance => {
            const remaining = (balance.totalDays || 0) - (balance.usedDays || 0);
            return {
                year: String(balance.year),
                days: remaining > 0 ? remaining : 0
            };
        })
        .filter(x => x.days > 0)
        .sort((a, b) => Number(a.year) - Number(b.year));

      const leaveDetailsText = years.length ? years.map((y) => `${y.year}(${y.days} GÜN)`).join("+") : "-";
      
      const leavesByYear = years.reduce((acc, curr) => {
        acc[curr.year] = curr.days;
        return acc;
      }, {} as Record<string, number>);
      
      const leaveDetailsJson = JSON.stringify(leavesByYear);

      const totalDays = years.reduce((acc, curr) => acc + curr.days, 0);
      
      return {
        no: index + 1,
        fullName: user.fullName ? user.fullName.toUpperCase() : "BİLİNMİYOR",
        jobTitle: user.jobTitle || "-",
        phone: user.phone || "-",
        leaveDetails: leaveDetailsJson !== "{}" ? leaveDetailsJson : "-", // Standard JSON format string for easily parsing
        leaveDetailsText, // Human readable text format for Excel if needed
        leavesByYear,
        totalDays,
        entryDate: formatEntryDateNumeric(user.hireDate),
        entryDateText: formatEntryDateText(user.hireDate)
      };
    });

    return data;
  },

  async importData(importedUsers: Array<{ fullName: string; jobTitle?: string | null; phone?: string | null; hireDate: string | null; leavesByYear: Record<string, number> }>) {
    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const rowErrors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < importedUsers.length; i++) {
        const row = importedUsers[i];
        try {
            const rawName = row.fullName.trim();
            if(!rawName) continue;

            const existingUsers = await db.user.findMany({
                where: { fullName: { equals: rawName, mode: "insensitive" } }
            });

            const parsedHireDate = row.hireDate ? new Date(row.hireDate) : undefined;

            let user;
            if (existingUsers.length > 0) {
                user = existingUsers[0];
                await db.user.update({
                    where: { id: user.id },
                    data: {
                        fullName: rawName.toUpperCase(),
                        ...(row.jobTitle && row.jobTitle !== "-" ? { jobTitle: row.jobTitle } : {}),
                        ...(row.phone && row.phone !== "-" ? { phone: row.phone } : {}),
                        ...(parsedHireDate ? { hireDate: parsedHireDate } : {})
                    }
                });
                updatedCount++;
            } else {
                user = await db.user.create({
                    data: {
                        fullName: rawName.toUpperCase(),
                        jobTitle: row.jobTitle && row.jobTitle !== "-" ? row.jobTitle : null,
                        phone: row.phone && row.phone !== "-" ? row.phone : null,
                        hireDate: parsedHireDate
                    }
                });
                createdCount++;
            }

            for (const [yearStr, remainingDays] of Object.entries(row.leavesByYear)) {
                const year = parseInt(yearStr, 10);
                if (isNaN(year)) continue;

                await db.leaveBalance.upsert({
                    where: {
                        userId_year: {
                            userId: user.id,
                            year: year
                        }
                    },
                    create: {
                        userId: user.id,
                        year: year,
                        totalDays: remainingDays,
                        usedDays: 0
                    },
                    update: {
                        totalDays: remainingDays,
                        usedDays: 0
                    }
                });
            }
        } catch (e: any) {
            errorCount++;
            rowErrors.push({ index: i, error: e.message || "Bilinmeyen hata" });
        }
    }

    return { createdCount, updatedCount, errorCount, rowErrors };
  }
};