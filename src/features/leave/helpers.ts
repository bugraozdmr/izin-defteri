export const calculateTotalDays = (leavesObj: any): number => {
  if (!leavesObj || typeof leavesObj !== "object") return 0;
  return Object.values(leavesObj).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);
};

export function formatDateLong(value?: Date | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric" }).format(value);
}

export function formatDateShort(value: Date) {
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(value);
}

export function formatDays(value: number) {
  const normalized = Number.isFinite(value) ? value : 0;
  return `${normalized.toFixed(normalized % 1 === 0 ? 0 : 1)} gün`;
}

export function calculateEndDateSkippingHolidays(startStr: string, requiredDays: number, holidays: any[]) {
  const start = new Date(startStr);
  if (Number.isNaN(start.getTime()) || requiredDays <= 0) return "";

  let currentDate = new Date(start);
  let accumulatedDays = 0;

  const MAX_DAYS = 365;
  let loops = 0;

  console.log(`\n--- İzin Hesaplama Başladı ---`);
  console.log(`Başlangıç: ${startStr}, İstenen Gün: ${requiredDays}`);

  // 1. İzinli olunan ardışık takvim listesini tüket:
  while (accumulatedDays < requiredDays && loops < MAX_DAYS) {
    loops++;
    const dayOfWeek = currentDate.getDay();
    const isRestDay = dayOfWeek === 0;

    const printDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

    if (isRestDay) {
      console.log(`[ATLANDI] ${printDate} - Pazar günü izinden düşülmüyor.`);
    } else {
      const y = currentDate.getFullYear();
      const m = currentDate.getMonth() + 1;
      const d = currentDate.getDate();

      const holiday = holidays.find((h: any) => 
        h.month === m && h.day === d && (h.year === null || h.year === y)
      );

      if (!holiday) {
        accumulatedDays += 1;
        console.log(`[EKLENDİ] ${printDate} - Normal gün, kalan izinden 1 gün düşüldü. (Kullanılan: ${accumulatedDays}/${requiredDays})`);
      } else {
        if (holiday.duration && holiday.duration < 1) {
          const used = 1 - holiday.duration;
          accumulatedDays += used;
          console.log(`[YARIM GÜN] ${printDate} - ${holiday.name} (${holiday.duration} gün tatil). Kalan izinden ${used} gün düşüldü. (Kullanılan: ${accumulatedDays}/${requiredDays})`);
        } else {
          console.log(`[ATLANDI] ${printDate} - ${holiday.name} (Tam gün resmi tatil, izinden düşülmüyor.)`);
        }
      }
    }

    if (accumulatedDays >= requiredDays) {
      console.log(`[HEDEF GÜN DOLDU] İstirahat/İzindeki son gün: ${printDate}`);
      break;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // 2. İzin bitti, "Bitiş Tarihi"ni yani İşbaşı yapılacak ERTESİ ERTESİ GÜN'ü bul:
  currentDate.setDate(currentDate.getDate() + 1);

  let nextLoops = 0;
  while (nextLoops < MAX_DAYS) {
    nextLoops++;
    const dayOfWeek = currentDate.getDay();
    const isRestDay = dayOfWeek === 0;

    const y = currentDate.getFullYear();
    const m = currentDate.getMonth() + 1;
    const d = currentDate.getDate();

    const holiday = holidays.find((h: any) => 
      h.month === m && h.day === d && (h.year === null || h.year === y)
    );

    const isFullHoliday = holiday && holiday.duration >= 1;
    const testDate = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    if (isRestDay) {
      console.log(`[İŞBAŞI ATLANDI] ${testDate} - Pazar. İşbaşı yapılamaz.`);
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }
    
    if (isFullHoliday) {
      console.log(`[İŞBAŞI ATLANDI] ${testDate} - ${holiday.name} (Resmi Tatil). İşbaşı yapılamaz.`);
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Pazar değilsen, tam boy resmi tatil değilsen, işbaşı yap!
    console.log(`[İŞBAŞI TARİHİ] ${testDate} - Bitiş (İşbaşı) tarihi olarak atandı.\n`);
    break;
  }

  const resY = currentDate.getFullYear();
  const resM = String(currentDate.getMonth() + 1).padStart(2, "0");
  const resD = String(currentDate.getDate()).padStart(2, "0");
  return `${resY}-${resM}-${resD}`;
}