import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
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

function parseLeaveDetails(value: unknown): LeaveYearMap {
	const s = String(value ?? "").trim();
	if (!s || s === "-") return {};

	const map: LeaveYearMap = {};
	const parts = s
		.split("+")
		.map((p) => p.trim())
		.filter(Boolean);

	for (const part of parts) {
		const m =
			part.match(/^([0-9]{4})\s*\(\s*([0-9]+)\s*G\s*Ü\s*N\s*\)$/iu) ||
			part.match(/^([0-9]{4})\s*\(\s*([0-9]+)\s*GÜN\s*\)$/iu);
		if (!m) continue;
		const year = m[1];
		const days = Number.parseInt(m[2], 10);
		if (!Number.isFinite(days)) continue;
		map[year] = days;
	}

	return map;
}

function sumLeaveMap(map: LeaveYearMap) {
	return Object.values(map).reduce((acc, v) => acc + (Number(v) || 0), 0);
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

	const parsed = new Date(raw);
	if (!Number.isNaN(parsed.getTime()) && /\d{4}-\d{2}-\d{2}/.test(raw)) {
		return normalizeToFirstDayOfMonth(parsed);
	}

	const upper = raw.toLocaleUpperCase("tr-TR");

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

function parseNumberLike(value: string) {
	const s = String(value ?? "")
		.trim()
		.replace(/\s+/g, "")
		.replace(/,/g, ".");
	const n = Number(s);
	return Number.isFinite(n) ? n : NaN;
}

function stripBom(s: string) {
	return s.replace(/^\uFEFF/, "");
}

function parseCsvLine(line: string, delimiter = ";") {
	const out: string[] = [];
	let curr = "";
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const ch = line[i];

		if (inQuotes) {
			if (ch === '"') {
				const next = line[i + 1];
				if (next === '"') {
					curr += '"';
					i++;
				} else {
					inQuotes = false;
				}
			} else {
				curr += ch;
			}
			continue;
		}

		if (ch === '"') {
			inQuotes = true;
			continue;
		}

		if (ch === delimiter) {
			out.push(curr);
			curr = "";
			continue;
		}

		curr += ch;
	}

	out.push(curr);
	return out.map((x) => x.trim());
}

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json({ error: "Lütfen bir dosya yükleyin." }, { status: 400 });
		}

		const bytes = await file.arrayBuffer();
		const text = stripBom(Buffer.from(bytes).toString("utf-8"));
		const lines = text
			.split(/\r?\n/)
			.map((l) => l.trim())
			.filter(Boolean);

		if (lines.length < 2) {
			return NextResponse.json({ error: "CSV boş veya geçersiz." }, { status: 400 });
		}

		const header = parseCsvLine(lines[0]);
		const headerMap = new Map<string, number>();
		header.forEach((h, idx) => {
			const key = normalizeHeader(h);
			if (key) headerMap.set(key, idx);
		});

		const idxFullName = headerMap.get("ADI SOYADI");
		const idxLeaveDetails = headerMap.get("KALAN İZİNLERİ");
		const idxTotal = headerMap.get("TOPLAM");
		const idxEntryDate = headerMap.get("GİRİŞ TARİHİ");

		if (idxFullName == null) {
			return NextResponse.json({ error: "ADI SOYADI sütunu bulunamadı." }, { status: 400 });
		}

		let createdCount = 0;
		let updatedCount = 0;
		let skippedCount = 0;
		let conflictCount = 0;
		const rowErrors: Array<{ row: number; error: string }> = [];

		for (let i = 1; i < lines.length; i++) {
			const rowNumber = i + 1; // 1-based line number in CSV
			const cols = parseCsvLine(lines[i]);

			const rawName = String(cols[idxFullName] ?? "").trim();
			if (!rawName) {
				skippedCount++;
				continue;
			}

			try {
				const leaveMap = idxLeaveDetails != null ? parseLeaveDetails(cols[idxLeaveDetails]) : {};

				const computedTotal = sumLeaveMap(leaveMap);
				const totalFromCell = idxTotal != null ? parseNumberLike(String(cols[idxTotal] ?? "")) : NaN;
				const totalDays = Number.isFinite(totalFromCell) ? totalFromCell : computedTotal;

				const hireDate = idxEntryDate != null ? parseTurkishEntryDate(cols[idxEntryDate]) : null;

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
				rowErrors.push({ row: rowNumber, error: err?.message ? String(err.message) : "Bilinmeyen hata" });
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
		console.error("CSV içe aktarma hatası:", error);
		return NextResponse.json({ error: "Dosya işlenirken sunucu hatası oluştu." }, { status: 500 });
	}
}
