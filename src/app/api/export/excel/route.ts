import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getExportDataAction } from "@/features/api/actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const actionResult = await getExportDataAction();
    if (!actionResult.success) {
      throw new Error("Veri çekilemedi.");
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Personel İzinleri");

    worksheet.views = [{ state: "frozen", ySplit: 2 }];

    worksheet.columns = [
      { header: "NO", key: "no", width: 8 },
      { header: "ADI SOYADI", key: "fullName", width: 30 },
      { header: "ÜNVANI", key: "jobTitle", width: 25 },
      { header: "TELEFON", key: "phone", width: 18 },
      { header: "KALAN GÜN SAYISI", key: "totalDays", width: 20 },
      { header: "GİRİŞ TARİHİ", key: "entryDate", width: 25 },
    ];

    worksheet.insertRow(1, []);
    worksheet.mergeCells("A1:F1");
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

    actionResult.data.forEach((item: any) => {
      worksheet.addRow({
        no: item.no,
        fullName: item.fullName,
        jobTitle: item.jobTitle,
        phone: item.phone,
        totalDays: item.totalDays,
        entryDate: item.entryDateText, // Since user says 'excel only' using entryDateText keeps EXCEL layout matching previous request
      });
    });

    const dataStartRow = 3;

    worksheet.getColumn(1).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getColumn(2).alignment = { vertical: "middle", horizontal: "left" };
    worksheet.getColumn(3).alignment = { vertical: "middle", horizontal: "left" };
    worksheet.getColumn(4).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getColumn(5).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getColumn(6).alignment = { vertical: "middle", horizontal: "center" };

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

        const totalCell = row.getCell(3);
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