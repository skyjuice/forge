
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";
import path from "path";
import fs from "fs/promises";
import { PROCESSED_DIR, ensureDir, UPLOADS_DIR } from "@/lib/ffmpeg";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const rotationsJson = formData.get("rotations") as string;

        if (!file || !rotationsJson) {
            return NextResponse.json({ error: "File and rotations are required" }, { status: 400 });
        }

        const rotations = JSON.parse(rotationsJson) as Record<string, number>;

        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();

        // Apply rotations
        // rotations key is page index (string), value is angle
        for (const [pageIndexStr, angle] of Object.entries(rotations)) {
            const pageIndex = parseInt(pageIndexStr);
            if (!isNaN(pageIndex) && pageIndex >= 0 && pageIndex < pages.length) {
                const page = pages[pageIndex];
                const currentRotation = page.getRotation().angle;
                // Add new rotation to existing
                page.setRotation(degrees((currentRotation + angle) % 360));
            }
        }

        const pdfBytes = await pdfDoc.save();

        await ensureDir(PROCESSED_DIR);

        const uniqueId = uuidv4();
        const originalName = file.name.replace(/\.pdf$/i, "");
        const downloadFilename = `${uniqueId}_${originalName}_rotated.pdf`;

        await fs.writeFile(path.join(PROCESSED_DIR, downloadFilename), pdfBytes);

        const downloadUrl = `/api/download?file=${encodeURIComponent(downloadFilename)}`;

        return NextResponse.json({ url: downloadUrl });

    } catch (error: any) {
        console.error("PDF Rotate Error:", error);
        return NextResponse.json({ error: "Failed to rotate PDF" }, { status: 500 });
    }
}
