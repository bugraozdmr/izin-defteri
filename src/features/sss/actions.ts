"use server";

import { revalidateTag } from "next/cache";
import { sssService } from "./services";
import type { Prisma } from "@prisma/client";

// MAX'ta cache'i temizliyoruz

export async function getAllSssAction() {
  try {
    const sss = await sssService.getCachedSSS();
    return { success: true, data: sss };
  } catch (error) {
    console.error("SSS kayıtları çekilirken hata:", error);
    return { success: false, message: "SSS kayıtları listelenemedi." };
  }
}

export async function getAllSssFreshAction() {
  try {
    const sss = await sssService.getAllSSSFromDb();
    return { success: true, data: sss };
  } catch (error) {
    console.error("SSS (fresh) çekilirken hata:", error);
    return { success: false, message: "SSS kayıtları listelenemedi." };
  }
}

export async function createSssAction(data: Prisma.SSSCreateInput) {
  try {
    const result = await sssService.createSSS(data);
    
    revalidateTag("sss-data", "max"); 
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Ekleme hatası:", error);
    return { success: false, message: "Yeni SSS kaydedilemedi." };
  }
}

export async function updateSssAction(id: string, data: Prisma.SSSUpdateInput) {
  try {
    const result = await sssService.updateSSS(id, data);
    
    revalidateTag("sss-data", "max");
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Güncelleme hatası:", error);
    return { success: false, message: "Güncelleme işlemi başarısız." };
  }
}

export async function deleteSssAction(id: string) {
  try {
    await sssService.deleteSSS(id);
    
    revalidateTag("sss-data", "max");
    
    return { success: true };
  } catch (error) {
    console.error("Silme hatası:", error);
    return { success: false, message: "Silme işlemi yapılamadı." };
  }
}