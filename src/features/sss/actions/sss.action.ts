"use server";

import { revalidatePath } from "next/cache";
import { sssService } from "../service/sss.service";
// import { Prisma } from "@prisma/client";
import type { Prisma } from "@prisma/client";

export async function getAllSssAction() {
  try {
    const sss = await sssService.getAllSSS();
    return { success: true, data: sss };
  } catch (error) {
    console.error("SSS kayıtları çekilirken hata:", error);
    return { success: false, message: "SSS kayıtları listelenemedi." };
  }
}

export async function createSssAction(data: Prisma.SSSCreateInput) {
  try {
    const result = await sssService.createSSS(data);
    
    revalidatePath("/sss");
    revalidatePath("/admin/sss");
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Ekleme hatası:", error);
    return { success: false, message: "Yeni SSS kaydedilemedi." };
  }
}

export async function updateSssAction(id: string, data: Prisma.SSSUpdateInput) {
  try {
    const result = await sssService.updateSSS(id, data);
    
    revalidatePath("/sss");
    revalidatePath("/admin/sss");
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Güncelleme hatası:", error);
    return { success: false, message: "Güncelleme işlemi başarısız." };
  }
}

export async function deleteSssAction(id: string) {
  try {
    await sssService.deleteSSS(id);
    
    revalidatePath("/sss");
    revalidatePath("/admin/sss");
    
    return { success: true };
  } catch (error) {
    console.error("Silme hatası:", error);
    return { success: false, message: "Silme işlemi yapılamadı." };
  }
}