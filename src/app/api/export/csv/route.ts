import { NextResponse } from "next/server";
import { getExportDataAction } from "@/features/api/actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(value: unknown) {
	const s = value === null || value === undefined ? "" : String(value);
	return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
	try {
		const actionResult = await getExportDataAction();
		if (!actionResult.success) {
			throw new Error("Veri çekilemedi.");
		}

		const delimiter = ";";
		const header = ["NO", "ADI SOYADI", "ÜNVANI", "TELEFON", "KALAN İZİNLERİ DETAY", "TOPLAM GÜN", "GİRİŞ TARİHİ", "KULLANILAN İZİNLER DETAY"].map(csvEscape).join(delimiter);

		const rows = actionResult.data.map((item: any) => {
			return [
				item.no,
				item.fullName,
                item.jobTitle,
                item.phone,
				item.leaveDetails,
				item.totalDays,
				item.entryDate,
                item.usedLeavesJson,
			]
				.map(csvEscape)
				.join(delimiter);
		});

		const csv = `\uFEFF${header}\n${rows.join("\n")}`;

		return new NextResponse(csv, {
			status: 200,
			headers: {
				"Content-Disposition":
					'attachment; filename="Kultur_Sosyal_Isler_Izinler.csv"; filename*=UTF-8\'\'Kultur_Sosyal_Isler_Izinler.csv',
				"Content-Type": "text/csv; charset=utf-8",
				"Cache-Control": "no-store, max-age=0",
			},
		});
	} catch (error) {
		console.error("CSV oluşturma hatası:", error);
		return NextResponse.json({ error: "Dosya oluşturulamadı." }, { status: 500 });
	}
}
