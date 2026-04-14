
import { NextResponse } from "next/server";
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

function csvEscape(value: unknown) {
	const s = value === null || value === undefined ? "" : String(value);
	return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
	try {
		const leaves = await db.leave.findMany({
			orderBy: {
				fullName: "asc",
			},
		});

		const delimiter = ";";
		const header = ["NO", "ADI SOYADI", "KALAN İZİNLERİ", "TOPLAM", "GİRİŞ TARİHİ"].map(csvEscape).join(delimiter);

		const rows = leaves.map((leave, index) => {
			const years = normalizeLeaveYears((leave as any).leaves)
				.filter((x) => x.year)
				.sort((a, b) => Number(a.year) - Number(b.year));

			const leaveDetails = years.length
				? years.map((y) => `${y.year}(${y.days} GÜN)`).join("+")
				: "-";

			const totalDays = typeof (leave as any).totalDays === "number"
				? (leave as any).totalDays
				: years.reduce((acc, curr) => acc + (Number(curr.days) || 0), 0);

			const entryDate = formatEntryDate((leave as any).hireDate);

			return [
				index + 1,
				(leave as any).fullName ? String((leave as any).fullName).toUpperCase() : "BİLİNMİYOR",
				leaveDetails,
				totalDays,
				entryDate,
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

