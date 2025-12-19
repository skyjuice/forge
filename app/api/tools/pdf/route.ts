import { NextRequest, NextResponse } from "next/server";
import { ensureDir, PROCESSED_DIR } from "@/lib/ffmpeg";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { PDFDocument } from "pdf-lib";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }

        await ensureDir(PROCESSED_DIR);

        const pdfDoc = await PDFDocument.create();

        for (const file of files) {
            const buffer = await file.arrayBuffer();
            let image;

            if (file.type === "image/jpeg" || file.name.endsWith(".jpg") || file.name.endsWith(".jpeg")) {
                image = await pdfDoc.embedJpg(buffer);
            } else if (file.type === "image/png" || file.name.endsWith(".png")) {
                image = await pdfDoc.embedPng(buffer);
            } else {
                continue; // Skip unsupported files
            }

            const { width, height } = image.scale(1);
            // Create a page with the image dimensions (or standard A4 and scale image? Let's fit image for now)
            const page = pdfDoc.addPage([width, height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width,
                height,
            });
        }

        const pdfBytes = await pdfDoc.save();
        const id = uuidv4();
        const outputFilename = `${id}.pdf`;
        const outputPath = path.join(PROCESSED_DIR, outputFilename);

        await fs.writeFile(outputPath, pdfBytes);

        return NextResponse.json({
            url: `/api/download?file=${outputFilename}`
        });

    } catch (error: any) {
        console.error("PDF creation error:", error);
        return NextResponse.json({ error: error.message || "PDF creation failed" }, { status: 500 });
    }
}
