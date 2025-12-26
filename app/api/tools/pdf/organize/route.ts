
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, RotationTypes, degrees } from "pdf-lib";
import path from "path";
import fs from "fs/promises";
import { PROCESSED_DIR, ensureDir, UPLOADS_DIR } from "@/lib/ffmpeg";
import { v4 as uuidv4 } from "uuid";

interface PageOrder {
    index: number;
    rotation: number;
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const pageOrderJson = formData.get("pageOrder") as string;

        if (!file || !pageOrderJson) {
            return NextResponse.json({ error: "File and page order are required" }, { status: 400 });
        }

        const pageOrder = JSON.parse(pageOrderJson) as PageOrder[];

        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        // Create new PDF
        const newPdf = await PDFDocument.create();

        // Copy pages based on the order
        // We can copy all at once if we map indices, but here we might have duplicates or reordering
        // copyPages takes an array of indices.
        // But we also need to handle rotation per page.

        const indicesToCopy = pageOrder.map(p => p.index);
        const copiedPages = await newPdf.copyPages(pdfDoc, indicesToCopy);

        // Add pages to new PDF and apply rotation
        for (let i = 0; i < copiedPages.length; i++) {
            const page = copiedPages[i];
            const orderInfo = pageOrder[i];

            // Check if we need to rotate
            if (orderInfo.rotation !== 0) {
                const currentRotation = page.getRotation().angle;
                page.setRotation(degrees((currentRotation + orderInfo.rotation) % 360));
            }

            newPdf.addPage(page);
        }

        const pdfBytes = await newPdf.save();

        await ensureDir(PROCESSED_DIR);

        const uniqueId = uuidv4();
        const originalName = file.name.replace(/\.pdf$/i, "");
        const downloadFilename = `${uniqueId}_${originalName}_organized.pdf`;

        await fs.writeFile(path.join(PROCESSED_DIR, downloadFilename), pdfBytes);

        const downloadUrl = `/api/download?file=${encodeURIComponent(downloadFilename)}`;

        return NextResponse.json({ url: downloadUrl });

    } catch (error: any) {
        console.error("PDF Organize Error:", error);
        return NextResponse.json({ error: "Failed to organize PDF" }, { status: 500 });
    }
}
