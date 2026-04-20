import { NextResponse } from "next/server";
import { importDataAction } from "@/features/api/actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const parsed = new Date(s);
    if (!Number.isNaN(parsed.getTime())) {
        return parsed;
    }

    return null;
}

function stripBom(s: string) {
	return s.replace(/^\uFEFF/, "");
}

export async function POST(request: Request) {
	try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "Lütfen bir dosya yükleyin." }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const text = stripBom(Buffer.from(bytes).toString("utf-8"));
        const json = JSON.parse(text);

        if (!json || !json.data || !Array.isArray(json.data)) {
            return NextResponse.json({ error: "Geçersiz JSON formatı. 'data' dizisi gereklidir." }, { status: 400 });
        }

        const importDataPayload: Array<{ 
            fullName: string; 
            jobTitle?: string | null; 
            phone?: string | null; 
            hireDate: string | null; 
            leavesByYear: Record<string, number>;
            usedLeaves?: Array<{ startDate: string, endDate: string, days: number, reason?: string, location?: string, tradedWith?: string, manager?: string, title?: string }>;
        }> = [];

        for (const item of json.data) {
            const rawName = String(item.fullName ?? "").trim();
            if (!rawName || rawName === "BİLİNMİYOR") continue;

            const jobTitle = item.jobTitle ? String(item.jobTitle).trim() : null;
            const phone = item.phone ? String(item.phone).trim() : null;

            let leavesByYear: Record<string, number> = {};
            if (typeof item.leaveDetails === "string" && item.leaveDetails.startsWith("{")) {
                try {
                    leavesByYear = JSON.parse(item.leaveDetails);
                } catch { /* empty */ }
            } else if (typeof item.leavesByYear === "object" && item.leavesByYear !== null) {
                leavesByYear = item.leavesByYear;
            }

            let usedLeaves: any[] = [];
            if (typeof item.usedLeavesJson === "string" && item.usedLeavesJson.startsWith("[")) {
                try {
                    usedLeaves = JSON.parse(item.usedLeavesJson);
                } catch { /* empty */ }
            } else if (Array.isArray(item.usedLeaves)) {
                usedLeaves = item.usedLeaves;
            }

            const hireDate = item.entryDate ? parseStandardDate(String(item.entryDate)) : null;

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
                skippedCount: Math.max(0, json.data.length - (actionResult.createdCount! + actionResult.updatedCount! + actionResult.errorCount!)),
                errorCount: actionResult.errorCount,
                rowErrors: actionResult.rowErrors,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("JSON içe aktarma hatası:", error);
        return NextResponse.json({ error: "Dosya işlenirken sunucu hatası oluştu." }, { status: 500 });
    }
}
