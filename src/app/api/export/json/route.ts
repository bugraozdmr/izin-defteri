import { NextResponse } from "next/server";
import { getExportDataAction } from "@/features/api/actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const actionResult = await getExportDataAction();
		if (!actionResult.success) {
			throw new Error("Veri çekilemedi.");
		}

		const data = actionResult.data.map((item: any) => ({
			no: item.no,
			fullName: item.fullName,
            jobTitle: item.jobTitle,
            phone: item.phone,
			leaveDetails: item.leaveDetails,
			leavesByYear: item.leavesByYear,
			usedLeaves: item.usedLeaves,
			total: item.totalDays,
			entryDate: item.entryDate,
		}));

		const payload = {
			title: "KÜLTÜR VE SOSYAL İŞLER MÜDÜRLÜĞÜ PERSONEL KALAN İZİN GÜNLERİ",
			exportedAt: new Date().toISOString(),
			count: data.length,
			data,
		};

		const json = JSON.stringify(payload, null, 2);

		return new NextResponse(json, {
			status: 200,
			headers: {
				"Content-Disposition":
					'attachment; filename="Kultur_Sosyal_Isler_Izinler.json"; filename*=UTF-8\'\'Kultur_Sosyal_Isler_Izinler.json',
				"Content-Type": "application/json; charset=utf-8",
				"Cache-Control": "no-store, max-age=0",
			},
		});
	} catch (error) {
		console.error("JSON oluşturma hatası:", error);
		return NextResponse.json({ error: "Dosya oluşturulamadı." }, { status: 500 });
	}
}
