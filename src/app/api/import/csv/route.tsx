import { NextResponse } from "next/server";
import { importDataAction } from "@/features/api/actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeHeader(value: unknown) {
	return String(value ?? "")
		.trim()
		.replace(/\s+/g, " ")
		.toLocaleUpperCase("tr-TR");
}

function parseStandardDate(raw: string): Date | null {
    const s = raw.trim();
    if (!s || s === "-") return null;

    const dot = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (dot) {
        const day = Number.parseInt(dot[1], 10);
        const month = Number.parseInt(dot[2], 10);
        const year = Number.parseInt(dot[3], 10);
        if (Number.isFinite(day) && Number.isFinite(month) && Number.isFinite(year)) {
            return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        }
    }

    // fallback mapping if they try to pass old formats
    const parsed = new Date(s);
    if (!Number.isNaN(parsed.getTime())) {
        return parsed;
    }
    
    return null;
}

function parseLeaveDetailsJson(value: unknown): Record<string, number> {
	const s = String(value ?? "").trim();
	if (!s || s === "-") return {};
	try {
        const parsed = JSON.parse(s);
        if(typeof parsed === "object" && parsed !== null) {
            return parsed as Record<string, number>;
        }
    } catch {
        // Fallback for old detail strings like '2024(5 GÜN)+2025(16 GÜN)'
        const map: Record<string, number> = {};
        const parts = s.split("+").map((p) => p.trim()).filter(Boolean);
        for (const part of parts) {
            const m =
                part.match(/^([0-9]{4})\s*\(\s*([0-9]+)\s*G\s*Ü\s*N\s*\)$/iu) ||
                part.match(/^([0-9]{4})\s*\(\s*([0-9]+)\s*GÜN\s*\)$/iu);
            if (!m) continue;
            const year = m[1];
            const days = Number.parseInt(m[2], 10);
            if (Number.isFinite(days)) map[year] = days;
        }
        return map;
    }
    return {};
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
        const idxJobTitle = headerMap.get("ÜNVANI");
        const idxPhone = headerMap.get("TELEFON");
		const idxLeaveDetails = headerMap.get("KALAN İZİNLERİ DETAY") ?? headerMap.get("KALAN İZİNLERİ");
		const idxEntryDate = headerMap.get("GİRİŞ TARİHİ");

		if (idxFullName == null) {
			return NextResponse.json({ error: "ADI SOYADI sütunu bulunamadı." }, { status: 400 });
		}

        const importDataPayload: Array<{ 
            fullName: string; 
            jobTitle?: string | null; 
            phone?: string | null; 
            hireDate: string | null; 
            leavesByYear: Record<string, number>;
            usedLeaves?: Array<{ startDate: string, endDate: string, days: number, reason?: string, location?: string, tradedWith?: string, manager?: string, title?: string }>;
        }> = [];

		for (let i = 1; i < lines.length; i++) {
			const cols = parseCsvLine(lines[i]);
			const rawName = String(cols[idxFullName] ?? "").trim();
			if (!rawName) continue;

            const jobTitle = idxJobTitle != null ? String(cols[idxJobTitle] ?? "").trim() : null;
            const phone = idxPhone != null ? String(cols[idxPhone] ?? "").trim() : null;
			const leavesByYear = idxLeaveDetails != null ? parseLeaveDetailsJson(cols[idxLeaveDetails]) : {};
			const hireDate = idxEntryDate != null ? parseStandardDate(cols[idxEntryDate]) : null;

            let usedLeaves: any[] = [];
            const idxUsedLeaves = headerMap.get("KULLANILAN İZİNLER DETAY");
            if (idxUsedLeaves != null) {
                const usedLeavesStr = String(cols[idxUsedLeaves] ?? "").trim();
                if (usedLeavesStr && usedLeavesStr.startsWith("[")) {
                    try {
                        usedLeaves = JSON.parse(usedLeavesStr);
                    } catch { /* empty */ }
                }
            }

            importDataPayload.push({
                fullName: rawName,
                jobTitle,
                phone,
                hireDate: hireDate ? hireDate.toISOString() : null,
                leavesByYear,
                usedLeaves
            });
		}

        const actionResult = await importDataAction(importDataPayload);

        if (!actionResult.success) {
            throw new Error(actionResult.error || "İçe aktarma servisinde hata.");
        }

		return NextResponse.json(
			{
				message: "İşlem tamamlandı",
				createdCount: actionResult.createdCount,
				updatedCount: actionResult.updatedCount,
				skippedCount: Math.max(0, (lines.length - 1) - (actionResult.createdCount! + actionResult.updatedCount! + actionResult.errorCount!)),
				errorCount: actionResult.errorCount,
				rowErrors: actionResult.rowErrors,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("CSV içe aktarma hatası:", error);
		return NextResponse.json({ error: "Dosya işlenirken sunucu hatası oluştu." }, { status: 500 });
	}
}
