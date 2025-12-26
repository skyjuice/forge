
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import path from "path";
import fs from "fs/promises";
import { PROCESSED_DIR, ensureDir, UPLOADS_DIR } from "@/lib/ffmpeg";
import { v4 as uuidv4 } from "uuid";

// Helper to parse ranges string "1-5, 8" into array of page arrays (0-indexed)
function parseRanges(rangesStr: string, maxPages: number): number[][] {
    const groups: number[][] = [];
    const parts = rangesStr.split(",").map(s => s.trim());

    for (const part of parts) {
        if (part.includes("-")) {
            const [start, end] = part.split("-").map(Number);
            if (!isNaN(start) && !isNaN(end)) {
                // User enters 1-based, we want 0-based
                // Cap at maxPages
                const s = Math.max(0, start - 1);
                const e = Math.min(maxPages - 1, end - 1);
                const range: number[] = [];
                for (let i = s; i <= e; i++) {
                    range.push(i);
                }
                if (range.length > 0) groups.push(range);
            }
        } else {
            const page = Number(part);
            if (!isNaN(page)) {
                const p = Math.max(0, Math.min(maxPages - 1, page - 1));
                groups.push([p]);
            }
        }
    }
    return groups;
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const rangesStr = formData.get("ranges") as string;

        if (!file || !rangesStr) {
            return NextResponse.json({ error: "File and ranges are required" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();

        const rangeGroups = parseRanges(rangesStr, pageCount);

        if (rangeGroups.length === 0) {
            return NextResponse.json({ error: "Invalid page ranges" }, { status: 400 });
        }

        await ensureDir(PROCESSED_DIR);

        const generatedFiles: { name: string, data: Uint8Array }[] = [];

        for (let i = 0; i < rangeGroups.length; i++) {
            const pagesToInclude = rangeGroups[i];
            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(pdfDoc, pagesToInclude);
            copiedPages.forEach((page) => newPdf.addPage(page));
            const pdfBytes = await newPdf.save();

            // Determine checking name name
            // If original is "doc.pdf", output "doc_part1.pdf"
            const originalName = file.name.replace(/\.pdf$/i, "");
            const partName = `${originalName}_part${i + 1}.pdf`;

            generatedFiles.push({
                name: partName,
                data: pdfBytes
            });
        }

        let downloadFilename = "";

        if (generatedFiles.length === 1) {
            // Save single file
            const fileData = generatedFiles[0];
            const uniqueId = uuidv4();
            downloadFilename = `${uniqueId}_${fileData.name}`;
            await fs.writeFile(path.join(PROCESSED_DIR, downloadFilename), fileData.data);
        } else {
            // Zip multiple files
            const zip = new JSZip();
            generatedFiles.forEach(f => {
                zip.file(f.name, f.data);
            });
            const zipContent = await zip.generateAsync({ type: "nodebuffer" });

            const uniqueId = uuidv4();
            const originalName = file.name.replace(/\.pdf$/i, "");
            downloadFilename = `${uniqueId}_${originalName}_split.zip`;
            await fs.writeFile(path.join(PROCESSED_DIR, downloadFilename), zipContent);
        }

        const downloadUrl = `/api/download?file=${encodeURIComponent(downloadFilename)}`;

        return NextResponse.json({ url: downloadUrl });

    } catch (error: any) {
        console.error("PDF Split Error:", error);
        return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 });
    }
}
