"use server";

import { revalidatePath, revalidateTag } from "next/cache"; 
import { leaveService } from "./services";
import type { Prisma } from "@prisma/client";
import type { LeaveQueryParams } from "@/features/leave/constants";

export async function getPaginatedLeavesAction(params?: LeaveQueryParams) {
  try {
    const response = await leaveService.getPaginatedLeaves(params);
    return { success: true, data: response.data, meta: response.meta };
  } catch (error) {
    console.error("Personel izinleri çekilirken hata:", error);
    return { success: false, message: "Kayıtlar listelenemedi." };
  }
}

export async function getAllLeaveNamesAction() {
  try {
    const response = await leaveService.getAllLeaveNames();
    return { success: true, data: response };
  } catch (error) {
    console.error("Personel isimleri çekilirken hata:", error);
    return { success: false, message: "Personel isimleri alınamadı." };
  }
}

export async function createLeaveAction(data: Prisma.LeaveCreateInput) {
  try {
    const result = await leaveService.createLeave(data);
    
    revalidateTag("leave-data", "max");
    revalidatePath("/admin/izinler");
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Ekleme hatası:", error);
    return { success: false, message: "Yeni personel izni kaydedilemedi." };
  }
}

export async function updateLeaveAction(id: string, data: Prisma.LeaveUpdateInput) {
  try {
    const result = await leaveService.updateLeave(id, data);
    
    revalidateTag("leave-data", "max");
    revalidatePath("/admin/izinler");
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Güncelleme hatası:", error);
    return { success: false, message: "Güncelleme işlemi başarısız." };
  }
}

export async function deleteLeaveAction(id: string) {
  try {
    await leaveService.deleteLeave(id);
    
    revalidateTag("leave-data", "max");
    revalidatePath("/admin/izinler");
    
    return { success: true };
  } catch (error) {
    console.error("Silme hatası:", error);
    return { success: false, message: "Silme işlemi yapılamadı." };
  }
}