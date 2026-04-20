"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { apiService } from "./services";
import type { Prisma } from "@prisma/client";

export async function getExportDataAction() {
    try {
        const data = await apiService.getExportData();
        return { success: true, data };
    } catch (error) {
        console.error("Export verisi alınırken hata:", error);
        return { success: false, data: [] };
    }
}

export async function importDataAction(importedUsers: Array<{ 
    fullName: string; 
    jobTitle?: string | null; 
    phone?: string | null; 
    hireDate: string | null; 
    leavesByYear: Record<string, number>;
    usedLeaves?: Array<{ startDate: string, endDate: string, days: number, reason?: string, location?: string, tradedWith?: string, manager?: string, title?: string }>;
}>) {
    try {
        const result = await apiService.importData(importedUsers);
        if (result.createdCount > 0 || result.updatedCount > 0) {
            revalidateTag("leave-data", "max");
            revalidateTag("user-data", "max");
            revalidatePath("/admin/personeller");
            revalidatePath("/admin/izinler");
        }
        return { success: true, ...result };
    } catch (error: any) {
        console.error("İçe aktarma hatası:", error);
        return { success: false, error: error.message, createdCount: 0, updatedCount: 0, errorCount: 1, rowErrors: [] };
    }
}
