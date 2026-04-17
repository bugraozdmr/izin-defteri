"use server";

import { revalidatePath } from "next/cache";
import { userService } from "./services";
import type { Prisma } from "@prisma/client";

export async function createUserAction(data: Prisma.UserCreateInput) {
  try {
    const result = await userService.createUser(data);
    
    revalidatePath("/admin/personeller");
    
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Personel ekleme hatası:", error);
    return { success: false, message: error.message || "Yeni personel kaydedilemedi." };
  }
}

export async function updateUserAction(id: string, data: Prisma.UserUpdateInput) {
  try {
    const result = await userService.updateUser(id, data);
    
    revalidatePath("/admin/personeller");
    revalidatePath(`/admin/personeller/${id}`);
    
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Personel güncelleme hatası:", error);
    return { success: false, message: error.message || "Personel bilgileri güncellenemedi." };
  }
}

export async function getUserNamesAction() {
  try {
    const users = await userService.getAllUserNames();
    return { success: true, data: users };
  }
  catch (error) {
    console.error("Personel isimleri çekilirken hata:", error);
    return { success: false, message: "Personel isimleri alınamadı." };
   }
}

export async function getPaginatedUsersAction(params?: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  year?: number;
}) {
  try {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const searchTerm = params?.searchTerm || "";
    const targetYear = params?.year; 

    const response = await userService.getPaginatedUsers(page, limit, searchTerm, targetYear);
    
    return { success: true, data: response.data, meta: response.meta };
  } catch (error) {
    console.error("Personeller çekilirken hata:", error);
    return { success: false, message: "Personel listesi alınamadı." };
  }
}

export async function deleteUserAction(id: string) {
  try {
    await userService.deleteUser(id);
    
    revalidatePath("/admin/personeller");
    
    return { success: true, message: "Personel ve tüm izin kayıtları sistemden silindi." };
  } catch (error: any) {
    console.error("Personel silme hatası:", error);
    return { success: false, message: error.message || "Personel silinemedi." };
  }
}

export async function getAllUsersAction(year?: number) {
  try {
    const targetYear = year || new Date().getFullYear();
    const users = await userService.getAllUsers(targetYear);
    return { success: true, data: users };
  } catch (error) {
    console.error("Personeller çekilirken hata:", error);
    return { success: false, message: "Personel listesi alınamadı." };
  }
}

export async function getUserDetailsAction(id: string) {
  try {
    const userDetails = await userService.getUserDetails(id);
    if (!userDetails) {
      return { success: false, message: "Personel bulunamadı." };
    }
    return { success: true, data: userDetails };
  } catch (error) {
    console.error("Personel detayı çekilirken hata:", error);
    return { success: false, message: "Personel bilgileri yüklenemedi." };
  }
}