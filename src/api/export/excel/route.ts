import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LeaveYearRow = { year: string; days: number };

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

function formatEntryDate(value: unknown) {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return "-";
  const month = TR_MONTHS_UPPER[d.getMonth()] ?? "";
  const year = d.getFullYear();
  return `${month} ${year} GİRİŞ`.trim();
}

function normalizeLeaveYears(value: unknown): LeaveYearRow[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .map((item: any) => ({
        year: String(item?.year ?? "").trim(),
        days: Number(item?.days ?? 0) || 0,
      }))
      .filter((x) => x.year);
  }

  if (typeof value === "object") {
    const obj: any = value;
    const candidate = obj.leaveYears ?? obj.leaves ?? obj.years ?? obj.items ?? obj;
    if (Array.isArray(candidate)) return normalizeLeaveYears(candidate);
    if (candidate && typeof candidate === "object") {
      return Object.entries(candidate)
        .map(([year, days]) => ({ year: String(year).trim(), days: Number(days) || 0 }))
        .filter((x) => x.year);
    }
    return [];
  }

  if (typeof value === "string") {
    try {
      return normalizeLeaveYears(JSON.parse(value));
    } catch {
      return [];
    }
  }

  return [];
}

export async function GET() {
  try {
    const leaves = await db.leave.findMany({
      orderBy: {
        fullName: "asc",
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Personel İzinleri");

    worksheet.views = [{ state: "frozen", ySplit: 2 }];

    worksheet.columns = [
      { header: "NO", key: "no", width: 8 },
      { header: "ADI SOYADI", key: "fullName", width: 30 },
      { header: "KALAN İZİNLERİ", key: "leaveDetails", width: 45 },
      { header: "TOPLAM", key: "total", width: 15 },
      { header: "GİRİŞ TARİHİ", key: "entryDate", width: 25 },
    ];

    worksheet.insertRow(1, []);
    worksheet.mergeCells("A1:E1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "KÜLTÜR VE SOSYAL İŞLER MÜDÜRLÜĞÜ PERSONEL KALAN İZİN GÜNLERİ";
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEFEFEF" },
    };
    worksheet.getRow(1).height = 26;

    const headerRow = worksheet.getRow(2);
    headerRow.font = { bold: true, size: 12 };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 20;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9E1F2" },
      };
    });

    leaves.forEach((leave, index) => {
      const years = normalizeLeaveYears((leave as any).leaves)
        .filter((x) => x.year)
        .sort((a, b) => Number(a.year) - Number(b.year));

      const formattedLeaveDetails = years
        .map((y) => `${y.year}(${y.days} GÜN)`)
        .join("+");

      const totalDays = typeof (leave as any).totalDays === "number"
        ? (leave as any).totalDays
        : years.reduce((acc, curr) => acc + (Number(curr.days) || 0), 0);

      worksheet.addRow({
        no: index + 1,
        fullName: leave.fullName?.toUpperCase() || "BİLİNMİYOR",
        leaveDetails: formattedLeaveDetails || "-",
        total: totalDays,
        entryDate: formatEntryDate(leave.hireDate),
      });
    });

    const dataStartRow = 3;

    worksheet.getColumn(1).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getColumn(2).alignment = { vertical: "middle", horizontal: "left" };
    worksheet.getColumn(3).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    worksheet.getColumn(4).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getColumn(5).alignment = { vertical: "middle", horizontal: "center" };

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        const isHeaderBlock = rowNumber === 1 || rowNumber === 2;
        const style = isHeaderBlock ? "medium" : "thin";
        cell.border = {
          top: { style },
          left: { style },
          bottom: { style },
          right: { style },
        };
      });

      if (rowNumber >= dataStartRow) {
        row.height = 18;
        const isStriped = (rowNumber - dataStartRow) % 2 === 1;
        if (isStriped) {
          row.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF7F7F7" },
            };
          });
        }

        const totalCell = row.getCell(4);
        totalCell.numFmt = "0";
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer as ArrayBuffer);

    return new NextResponse(nodeBuffer, {
      status: 200,
      headers: {
        "Content-Disposition":
          'attachment; filename="Kultur_Sosyal_Isler_Izinler.xlsx"; filename*=UTF-8\'\'Kultur_Sosyal_Isler_Izinler.xlsx',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Cache-Control": "no-store, max-age=0",
      },
    });

  } catch (error) {
    console.error("Excel oluşturma hatası:", error);
    return NextResponse.json({ error: "Dosya oluşturulamadı." }, { status: 500 });
  }
}