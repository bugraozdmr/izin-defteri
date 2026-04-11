"use server";

import { revalidatePath } from "next/cache";
import { holidayService } from "../service/holiday.service";
import { Prisma } from "@prisma/client";

export async function getHolidaysAction(year: number) {
  try {
    const holidays = await holidayService.getHolidaysByYear(year);
    return { success: true, data: holidays };
  } catch (error) {
    console.error("Tatiller çekilirken hata:", error);
    return { success: false, message: "Tatiller listelenemedi." };
  }
}

export async function createHolidayAction(data: Prisma.HolidayCreateInput) {
  try {
    const result = await holidayService.createHoliday(data);
    
    revalidatePath("/resmi-tatiller");
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Ekleme hatası:", error);
    return { success: false, message: "Yeni tatil kaydedilemedi." };
  }
}

export async function updateHolidayAction(id: string, data: Prisma.HolidayUpdateInput) {
  try {
    const result = await holidayService.updateHoliday(id, data);
    
    revalidatePath("/resmi-tatiller");
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Güncelleme hatası:", error);
    return { success: false, message: "Güncelleme işlemi başarısız." };
  }
}

export async function deleteHolidayAction(id: string) {
  try {
    await holidayService.deleteHoliday(id);
    
    revalidatePath("/resmi-tatiller");
    
    return { success: true };
  } catch (error) {
    console.error("Silme hatası:", error);
    return { success: false, message: "Silme işlemi yapılamadı." };
  }
}

export async function calculateHolidaysAction(startDate: string, endDate: string) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const count = await holidayService.calculateTotalHolidayDays(start, end);
    return { success: true, count };
  } catch (error) {
    return { success: false, count: 0 };
  }
}