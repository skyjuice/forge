import { NextRequest, NextResponse } from "next/server";
import { ensureDir, PROCESSED_DIR } from "@/lib/ffmpeg";
import path from "path";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import { v4 as uuidv4 } from "uuid";
import { PDFDocument } from "pdf-lib";
import archiver from "archiver";

// Helper to parse page ranges string (e.g., "1-3, 5, 8-10")
// Returns array of arrays of 0-based page indices
function parseRanges(rangeStr: string, totalPages: number): number[][] {
    const groups: number[][] = [];
    const parts = rangeStr.split(",").map(s => s.trim());

    for (const part of parts) {
        if (!part) continue;
        const subPages: number[] = [];

        if (part.includes("-")) {
            const [start, end] = part.split("-").map(n => parseInt(n));
            if (isNaN(start) || isNaN(end)) continue;

            // Handle valid ranges, adjust for 1-based input
            const s = Math.max(1, Math.min(start, end));
            const e = Math.min(totalPages, Math.max(start, end));

            for (let i = s; i <= e; i++) {
                subPages.push(i - 1);
            }
        } else {
            const p = parseInt(part);
            if (!isNaN(p) && p >= 1 && p <= totalPages) {
                subPages.push(p - 1);
            }
        }

        if (subPages.length > 0) {
            groups.push(subPages);
        }
    }
    return groups;
}

export async function POST(req: NextRequest) {
    let zipPath: string | null = null;
    let tempFiles: string[] = [];

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const rangesParam = formData.get("ranges") as string; // "1-5, 8"

        if (!file || !rangesParam) {
            return NextResponse.json({ error: "File and ranges are required" }, { status: 400 });
        }

        await ensureDir(PROCESSED_DIR);

        // Load the PDF
        const pdfBuffer = await file.arrayBuffer();
        const srcDoc = await PDFDocument.load(pdfBuffer);
        const totalPages = srcDoc.getPageCount();

        // Parse ranges
        const rangeGroups = parseRanges(rangesParam, totalPages);
        if (rangeGroups.length === 0) {
            return NextResponse.json({ error: "Invalid page ranges" }, { status: 400 });
        }

        const id = uuidv4();
        const baseName = path.parse(file.name).name.replace(/[^a-zA-Z0-9]/g, "_");

        // If only one range resulted (e.g. user just said "1-5"), return single PDF
        // If multiple ranges (e.g. "1-2, 5-6"), return ZIP?
        // Let's decide: If user provides multiple comma separated ranges, we create separate files.
        // If they provide just one range, we create one file.

        const createdFiles: { path: string, name: string }[] = [];

        for (let i = 0; i < rangeGroups.length; i++) {
            const pageIndices = rangeGroups[i];
            const subDoc = await PDFDocument.create();
            const copiedPages = await subDoc.copyPages(srcDoc, pageIndices);
            copiedPages.forEach(page => subDoc.addPage(page));

            const bytes = await subDoc.save();
            const fileName = `${baseName}_split_${i + 1}_${id}.pdf`;
            const filePath = path.join(PROCESSED_DIR, fileName);

            await fs.writeFile(filePath, bytes);
            createdFiles.push({ path: filePath, name: fileName });
            tempFiles.push(filePath);
        }

        // Response
        if (createdFiles.length === 1) {
            return NextResponse.json({
                url: `/api/download?file=${createdFiles[0].name}`
            });
        } else {
            // Zip them
            const zipName = `${baseName}_split_${id}.zip`;
            zipPath = path.join(PROCESSED_DIR, zipName);
            const output = createWriteStream(zipPath);
            const archive = archiver("zip", { zlib: { level: 9 } });

            await new Promise<void>((resolve, reject) => {
                output.on("close", resolve);
                archive.on("error", reject);
                archive.pipe(output);

                createdFiles.forEach(f => {
                    archive.file(f.path, { name: f.name });
                });

                archive.finalize();
            });

            // Clean up individual split files after zipping
            for (const f of tempFiles) {
                await fs.unlink(f).catch(() => { });
            }
            tempFiles = []; // Cleared

            return NextResponse.json({
                url: `/api/download?file=${zipName}`
            });
        }

    } catch (error: any) {
        console.error("Split PDF error:", error);
        return NextResponse.json({ error: error.message || "Split failed" }, { status: 500 });
    } finally {
        // Cleanup input if we wrote it (we didn't write input to disk here, loaded buffer directly)
        // Cleanup temp files if error occurred
    }
}
