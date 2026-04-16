import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import ExcelJS from "exceljs";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LeaveYearMap = Record<string, number>;

const TR_MONTHS_UPPER = [
  "OCAK",
  "ŞUBAT",
  "MART",
  "NİSAN",
  "MAYIS",
  "HAZİRAN",
  "TEMMUZ",
  "AĞUSTOS",
  "EYLÜL",
  "EKİM",
  "KASIM",
  "ARALIK",
];

const TR_MONTHS_ASCII = [
  "OCAK",
  "SUBAT",
  "MART",
  "NISAN",
  "MAYIS",
  "HAZIRAN",
  "TEMMUZ",
  "AGUSTOS",
  "EYLUL",
  "EKIM",
  "KASIM",
  "ARALIK",
];

function toAsciiUpperTR(input: string) {
  return input
    .toLocaleUpperCase("tr-TR")
    .replace(/Ç/g, "C")
    .replace(/Ğ/g, "G")
    .replace(/İ/g, "I")
    .replace(/Ö/g, "O")
    .replace(/Ş/g, "S")
    .replace(/Ü/g, "U");
}

function monthTokenToIndex(token: string) {
  const upperTR = token.toLocaleUpperCase("tr-TR");
  const idxTR = TR_MONTHS_UPPER.indexOf(upperTR);
  if (idxTR >= 0) return idxTR;

  const ascii = toAsciiUpperTR(token);
  const idxAscii = TR_MONTHS_ASCII.indexOf(ascii);
  if (idxAscii >= 0) return idxAscii;

  return -1;
}

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleUpperCase("tr-TR");
}

function cellText(cell: ExcelJS.Cell | undefined) {
  if (!cell) return "";
  const v: any = cell.value;
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    if (v.text) return String(v.text);
    if (Array.isArray(v.richText)) return v.richText.map((x: any) => x.text).join("");
    if (v.result != null) return String(v.result);
  }
  return String(v);
}

function parseLeaveDetails(value: unknown): LeaveYearMap {
  const s = String(value ?? "").trim();
  if (!s || s === "-") return {};

  const map: LeaveYearMap = {};
  const parts = s.split("+").map((p) => p.trim()).filter(Boolean);
  for (const part of parts) {
    const m = part.match(/^(\d{4})\s*\(\s*(\d+)\s*G\s*Ü\s*N\s*\)$/iu) || part.match(/^(\d{4})\s*\(\s*(\d+)\s*GÜN\s*\)$/iu);
    if (!m) continue;
    const year = m[1];
    const days = Number.parseInt(m[2], 10);
    if (!Number.isFinite(days)) continue;
    map[year] = days;
  }
  return map;
}

function firstDayOfMonthUTC(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
}

function normalizeToFirstDayOfMonth(value: Date) {
  return firstDayOfMonthUTC(value.getUTCFullYear(), value.getUTCMonth());
}

function parseTurkishEntryDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return normalizeToFirstDayOfMonth(value);

  const raw = String(value).trim();
  if (!raw || raw === "-") return null;

  const iso = new Date(raw);
  if (!Number.isNaN(iso.getTime()) && /\d{4}-\d{2}-\d{2}/.test(raw)) return normalizeToFirstDayOfMonth(iso);

  const upper = raw.toLocaleUpperCase("tr-TR");

  // const monthYear = upper.match(/\b(\p{L}+)\b\s+(\d{4})/u);
  const monthYear = upper.match(/(\p{L}+)\s+(\d{4})/u);
  if (monthYear) {
    const monthIdx = monthTokenToIndex(monthYear[1]);
    const year = Number.parseInt(monthYear[2], 10);
    if (monthIdx >= 0 && Number.isFinite(year)) {
      return firstDayOfMonthUTC(year, monthIdx);
    }
  }

  const dmy = raw.match(/(\d{1,2})\s+([A-Za-zÇĞİÖŞÜçğıöşü]+)\s+(\d{4})/u);
  if (dmy) {
    const monthName = dmy[2];
    const year = Number.parseInt(dmy[3], 10);
    const monthIdx = monthTokenToIndex(monthName);
    if (monthIdx >= 0 && Number.isFinite(year)) {
      return firstDayOfMonthUTC(year, monthIdx);
    }
  }

  const dot = raw.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (dot) {
    const month = Number.parseInt(dot[2], 10);
    const year = Number.parseInt(dot[3], 10);
    if (Number.isFinite(month) && Number.isFinite(year)) {
      return firstDayOfMonthUTC(year, month - 1);
    }
  }

  return null;
}

function sumLeaveMap(map: LeaveYearMap) {
  return Object.values(map).reduce((acc, v) => acc + (Number(v) || 0), 0);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Lütfen bir dosya yükleyin." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(bytes));

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return NextResponse.json({ error: "Çalışma sayfası bulunamadı." }, { status: 400 });
    }

    let headerRowNumber = 0;
    worksheet.eachRow((row, rowNumber) => {
      if (headerRowNumber) return;
      const values = row.values as any[];
      const normalized = values.map(normalizeHeader);
      if (normalized.includes("ADI SOYADI") && (normalized.includes("KALAN İZİNLERİ") || normalized.includes("KALAN İZİNLERİ"))) {
        headerRowNumber = rowNumber;
      }
      if (normalized.includes("ADI SOYADI") && normalized.includes("KALAN İZİNLERİ")) {
        headerRowNumber = rowNumber;
      }
    });

    if (!headerRowNumber) {
      worksheet.eachRow((row, rowNumber) => {
        if (headerRowNumber) return;
        const values = row.values as any[];
        const normalized = values.map(normalizeHeader);
        if (normalized.includes("ADI SOYADI") && normalized.includes("İZİN YILI") && normalized.includes("İZİN GÜNÜ")) {
          headerRowNumber = rowNumber;
        }
      });
    }

    if (!headerRowNumber) {
      return NextResponse.json({ error: "Başlık satırı bulunamadı (ADI SOYADI sütunu gerekli)." }, { status: 400 });
    }

    const headerRow = worksheet.getRow(headerRowNumber);
    const headerMap = new Map<string, number>();
    headerRow.eachCell((cell, colNumber) => {
      const h = normalizeHeader(cellText(cell));
      if (h) headerMap.set(h, colNumber);
    });

    const colFullName = headerMap.get("ADI SOYADI") ?? 0;
    const colLeaveDetails = headerMap.get("KALAN İZİNLERİ") ?? 0;
    const colTotal = headerMap.get("TOPLAM") ?? 0;
    const colEntryDate = headerMap.get("GİRİŞ TARİHİ") ?? 0;

    const colYear = headerMap.get("İZİN YILI") ?? 0;
    const colDays = headerMap.get("İZİN GÜNÜ") ?? 0;

    if (!colFullName) {
      return NextResponse.json({ error: "ADI SOYADI sütunu bulunamadı." }, { status: 400 });
    }

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let conflictCount = 0;
    const rowErrors: Array<{ row: number; error: string }> = [];

    for (let r = headerRowNumber + 1; r <= worksheet.rowCount; r++) {
      const row = worksheet.getRow(r);
      const rawName = String(cellText(row.getCell(colFullName)) || "").trim();
      if (!rawName) continue;

      try {
        let leaveMap: LeaveYearMap = {};

        if (colLeaveDetails) {
          leaveMap = parseLeaveDetails(cellText(row.getCell(colLeaveDetails)));
        } else if (colYear && colDays) {
          const y = String(cellText(row.getCell(colYear)) || "").trim();
          const d = Number.parseInt(String(cellText(row.getCell(colDays)) || "0"), 10);
          if (y && Number.isFinite(d)) leaveMap = { [y]: d };
        }

        const computedTotal = sumLeaveMap(leaveMap);
        const totalFromCell = colTotal ? Number(cellText(row.getCell(colTotal))) : NaN;
        const totalDays = Number.isFinite(totalFromCell) ? totalFromCell : computedTotal;

        const hireDate = colEntryDate ? parseTurkishEntryDate((row.getCell(colEntryDate).value as any) ?? cellText(row.getCell(colEntryDate))) : null;

        const matched = await db.leave.findMany({
          where: {
            fullName: {
              equals: rawName,
              mode: "insensitive",
            },
          },
        });

        if (matched.length > 1) {
          conflictCount++;
          continue;
        }

        if (matched.length === 0) {
          await db.leave.create({
            data: {
              fullName: rawName.toUpperCase(),
              leaves: leaveMap,
              totalDays,
              hireDate: hireDate ?? undefined,
            },
          });
          createdCount++;
        } else {
          await db.leave.update({
            where: { id: matched[0].id },
            data: {
              fullName: rawName.toUpperCase(),
              leaves: leaveMap,
              totalDays,
              ...(hireDate ? { hireDate } : {}),
            },
          });
          updatedCount++;
        }
      } catch (err: any) {
        rowErrors.push({ row: r, error: err?.message ? String(err.message) : "Bilinmeyen hata" });
      }
    }

    if (createdCount > 0 || updatedCount > 0) {
      revalidateTag("leave-data", "max");
      revalidatePath("/admin/izinler");
    }

    return NextResponse.json(
      {
        message: "İşlem tamamlandı",
        createdCount,
        updatedCount,
        skippedCount,
        conflictCount,
        errorCount: rowErrors.length,
        rowErrors: rowErrors.slice(0, 25),
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("İçe aktarma hatası:", error);
    return NextResponse.json({ error: "Dosya işlenirken sunucu hatası oluştu." }, { status: 500 });
  }
}