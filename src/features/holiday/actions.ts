"use server";

import { revalidateTag } from "next/cache";
import { holidayService } from "./services";
import type { Prisma } from "@prisma/client";

export async function getUpcomingHolidaysAction(fromDateStr?: string) {
  try {
    const fromDate = fromDateStr ? new Date(fromDateStr) : new Date();
    const holidays = await holidayService.getUpcomingHolidays(fromDate);
    return { success: true, data: holidays };
  } catch (error) {
    console.error("Yaklaşan tatiller çekilirken hata:", error);
    return { success: false, message: "Yaklaşan tatiller listelenemedi." };
  }
}

export async function getAllHolidaysAction() {
  try {
    const holidays = await holidayService.getAllHolidays();
    return { success: true, data: holidays };
  } catch (error) {
    console.error("Tatiller çekilirken hata:", error);
    return { success: false, message: "Tatiller listelenemedi." };
  }
}

export async function createHolidayAction(data: Prisma.HolidayCreateInput) {
  try {
    const result = await holidayService.createHoliday(data);
    revalidateTag("holiday-data", "max");
    return { success: true, data: result };
  } catch (error) {
    console.error("Ekleme hatası:", error);
    return { success: false, message: "Yeni tatil kaydedilemedi." };
  }
}

export async function updateHolidayAction(id: string, data: Prisma.HolidayUpdateInput) {
  try {
    const result = await holidayService.updateHoliday(id, data);
    revalidateTag("holiday-data", "max");
    return { success: true, data: result };
  } catch (error) {
    console.error("Güncelleme hatası:", error);
    return { success: false, message: "Güncelleme işlemi başarısız." };
  }
}

export async function deleteHolidayAction(id: string) {
  try {
    await holidayService.deleteHoliday(id);
    revalidateTag("holiday-data", "max");
    return { success: true };
  } catch (error) {
    console.error("Silme hatası:", error);
    return { success: false, message: "Silme işlemi yapılamadı." };
  }
}

export async function getClosestUpcomingHolidayAction(fromDateStr?: string) {
  try {
    const fromDate = fromDateStr ? new Date(fromDateStr) : new Date();
    const closestHoliday = await holidayService.getClosestUpcomingHoliday(fromDate);
    return { success: true, data: closestHoliday };
  } catch (error) {
    console.error("En yakın tatil çekilirken hata:", error);
    return { success: false, message: "En yakın tatil bulunamadı." };
  }
}

export async function calculateHolidaysAction(startDate: string, endDate: string) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const count = await holidayService.calculateTotalHolidayDays(start, end);
    return { success: true, count };
  } catch (error) {
    console.error("Hesaplama hatası:", error);
    return { success: false, count: 0 };
  }
}