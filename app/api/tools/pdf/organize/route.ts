import { NextRequest, NextResponse } from "next/server";
import { ensureDir, PROCESSED_DIR } from "@/lib/ffmpeg";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { PDFDocument, degrees } from "pdf-lib";

interface PageConfig {
    index: number;    // Original page index (0-based)
    rotation: number; // Additional rotation to apply (e.g., 0, 90, 180, -90)
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const pageOrderJson = formData.get("pageOrder") as string;

        if (!file || !pageOrderJson) {
            return NextResponse.json({ error: "File and page order are required" }, { status: 400 });
        }

        const pageOrder = JSON.parse(pageOrderJson) as PageConfig[];

        await ensureDir(PROCESSED_DIR);

        const pdfBuffer = await file.arrayBuffer();
        const srcDoc = await PDFDocument.load(pdfBuffer);
        const newDoc = await PDFDocument.create();

        // Copy pages one by one according to the order.
        // We do this individually to handle duplicates or reordering easily.
        // Note: copyPages returns an array of copied pages.

        // Optimization: We can batch copy contiguous ranges if we wanted, 
        // but since users can rotate individual pages freely, copying individually is safer and simpler logic.

        for (const config of pageOrder) {
            if (config.index < 0 || config.index >= srcDoc.getPageCount()) continue;

            const [copiedPage] = await newDoc.copyPages(srcDoc, [config.index]);

            // Apply rotation
            const currentRotation = copiedPage.getRotation().angle;
            const newRotation = (currentRotation + config.rotation) % 360;
            copiedPage.setRotation(degrees(newRotation));

            newDoc.addPage(copiedPage);
        }

        const id = uuidv4();
        const baseName = path.parse(file.name).name.replace(/[^a-zA-Z0-9]/g, "_");
        const outputFileName = `${baseName}_organized_${id}.pdf`;
        const outputPath = path.join(PROCESSED_DIR, outputFileName);

        const pdfBytes = await newDoc.save();
        await fs.writeFile(outputPath, pdfBytes);

        return NextResponse.json({
            url: `/api/download?file=${outputFileName}`
        });

    } catch (error: any) {
        console.error("Organize PDF error:", error);
        return NextResponse.json({ error: error.message || "Organization failed" }, { status: 500 });
    }
}
