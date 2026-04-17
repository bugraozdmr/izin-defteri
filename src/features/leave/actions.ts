"use server";

import { revalidatePath } from "next/cache"; 
import { leaveService } from "./services";

export async function initializeBalanceAction(userId: string, year: number, totalDays: number) {
  try {
    const result = await leaveService.initializeYearlyBalance(userId, year, totalDays);
    revalidatePath("/admin/personeller");
    revalidatePath(`/admin/personeller/${userId}`);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, message: error.message || "Bakiye tanımlanamadı." };
  }
}

export async function createLeaveRecordAction(userId: string, data: {
  startDate: Date;
  endDate: Date;
  days: number;

  location?: string;
  reason?: string;
  tradedWith?: string;
  manager?: string;
  title?: string;
}) {
  try {
    const result = await leaveService.createLeaveRecord(userId, data);
    revalidatePath("/admin/personeller");
    revalidatePath(`/admin/personeller/${userId}`);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, message: error.message || "İzin oluşturulamadı." };
  }
}

export async function updateLeaveRecordAction(
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
  try {
    const result = await leaveService.updateLeaveRecord(leaveId, userId, data);
    revalidatePath("/admin/personeller");
    revalidatePath(`/admin/personeller/${userId}`);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, message: error.message || "İzin kaydı güncellenemedi." };
  }
}

export async function initializeMultipleBalancesAction(userId: string, balances: { year: number, totalDays: number }[]) {
  try {
    if (!balances || balances.length === 0) {
      return { success: false, message: "Eklenecek bakiye bulunamadı." };
    }

    const result = await leaveService.initializeMultipleBalances(userId, balances);
    
    revalidatePath("/admin/personeller");
    revalidatePath(`/admin/personeller/${userId}`);
    
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Çoklu Bakiye Ekleme Hatası:", error);
    return { success: false, message: error.message || "Bakiyeler tanımlanırken bir hata oluştu." };
  }
}

export async function updateBalanceAction(balanceId: string, userId: string, year: number, totalDays: number) {
  try {
    const result = await leaveService.updateBalance(balanceId, userId, year, totalDays);

    revalidatePath("/admin/personeller");
    revalidatePath(`/admin/personeller/${userId}`);

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, message: error.message || "Bakiye güncellenemedi." };
  }
}

export async function deleteBalanceAction(balanceId: string, userId: string) {
  try {
    await leaveService.deleteBalance(balanceId, userId);

    revalidatePath("/admin/personeller");
    revalidatePath(`/admin/personeller/${userId}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Bakiye silinemedi." };
  }
}

export async function deleteLeaveRecordAction(leaveId: string, userId: string) {
  try {
    await leaveService.deleteLeaveRecord(leaveId);
    revalidatePath("/admin/personeller");
    revalidatePath(`/admin/personeller/${userId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Silme işlemi yapılamadı." };
  }
}

export async function getPaginatedLeavesAction(page: number = 1, limit: number = 20) {
  try {
    const response = await leaveService.getPaginatedLeaves(page, limit);
    return { success: true, data: response.data, meta: response.meta };
  } catch (error) {
    return { success: false, message: "Kayıtlar listelenemedi." };
  }
}