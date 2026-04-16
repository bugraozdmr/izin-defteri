
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

function toYearMap(rows: LeaveYearRow[]) {
	return rows.reduce<Record<string, number>>((acc, curr) => {
		acc[curr.year] = curr.days;
		return acc;
	}, {});
}

export async function GET() {
	try {
		const leaves = await db.leave.findMany({
			orderBy: {
				fullName: "asc",
			},
		});

		const data = leaves.map((leave, index) => {
			const years = normalizeLeaveYears((leave as any).leaves)
				.filter((x) => x.year)
				.sort((a, b) => Number(a.year) - Number(b.year));

			const leaveDetails = years.length ? years.map((y) => `${y.year}(${y.days} GÜN)`).join("+") : "-";

			const totalDays = typeof (leave as any).totalDays === "number"
				? (leave as any).totalDays
				: years.reduce((acc, curr) => acc + (Number(curr.days) || 0), 0);

			return {
				no: index + 1,
				fullName: (leave as any).fullName ? String((leave as any).fullName).toUpperCase() : "BİLİNMİYOR",
				leaveDetails,
				leavesByYear: toYearMap(years),
				total: totalDays,
				entryDate: formatEntryDate((leave as any).hireDate),
			};
		});

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

