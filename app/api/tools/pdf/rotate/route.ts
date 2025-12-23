import { NextRequest, NextResponse } from "next/server";
import { ensureDir, PROCESSED_DIR } from "@/lib/ffmpeg";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { PDFDocument, degrees } from "pdf-lib";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const rotationsJson = formData.get("rotations") as string; // JSON: { "0": 90, "1": 180 } (pageIndex: degrees)

        if (!file || !rotationsJson) {
            return NextResponse.json({ error: "File and rotations are required" }, { status: 400 });
        }

        const rotations = JSON.parse(rotationsJson) as Record<string, number>;

        await ensureDir(PROCESSED_DIR);

        const pdfBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pages = pdfDoc.getPages();

        // Apply rotations
        // The frontend sends the absolute desired rotation for each page that changed.
        // Or we can iterate all pages if the frontend sends a full map.
        // Let's assume the frontend sends a map of "pageIndex" -> "added rotation" or "absolute rotation"?
        // Better: Absolute rotation.
        // But wait, existing PDF pages might already have rotation.
        // If user sees a page is upside down (180), and wants to fix it (rotate 180 more to 360/0).
        // Frontend rendering honors existing rotation.
        // So if user clicks "rotate right", frontend adds 90.
        // So we should receive the *additive* rotation or the *final* rotation?
        // Let's stick to: Frontend sends the *final desired absolute rotation* for that page?
        // No, `react-pdf` renders visual rotation.
        // Simplest: Frontend sends "add 90" to page 0.
        // But users might click multiple times.
        // Let's say frontend tracks `userRotation` (initially 0).
        // When sending to backend:
        // Backend takes existing page rotation + userRotation.

        Object.entries(rotations).forEach(([pageIdxStr, userRotation]) => {
            const pageIndex = parseInt(pageIdxStr);
            if (pageIndex >= 0 && pageIndex < pages.length) {
                const page = pages[pageIndex];
                const currentRotation = page.getRotation().angle;
                const newRotation = (currentRotation + userRotation) % 360;
                page.setRotation(degrees(newRotation));
            }
        });

        const id = uuidv4();
        const baseName = path.parse(file.name).name.replace(/[^a-zA-Z0-9]/g, "_");
        const outputFileName = `${baseName}_rotated_${id}.pdf`;
        const outputPath = path.join(PROCESSED_DIR, outputFileName);

        const pdfBytes = await pdfDoc.save();
        await fs.writeFile(outputPath, pdfBytes);

        return NextResponse.json({
            url: `/api/download?file=${outputFileName}`
        });

    } catch (error: any) {
        console.error("Rotate PDF error:", error);
        return NextResponse.json({ error: error.message || "Rotation failed" }, { status: 500 });
    }
}
