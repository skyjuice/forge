import { NextRequest, NextResponse } from "next/server";
import { runFFmpeg, ensureDir, UPLOADS_DIR, PROCESSED_DIR } from "@/lib/ffmpeg";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

// We need to disable built-in body parsing to handle FormData with files specially if needed?
// Next.js App Router handles FormData well natively with request.formData()

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const format = formData.get("format") as string;

        if (!file || !format) {
            return NextResponse.json({ error: "File and format are required" }, { status: 400 });
        }

        await ensureDir(UPLOADS_DIR);
        await ensureDir(PROCESSED_DIR);

        const buffer = Buffer.from(await file.arrayBuffer());
        const inputExt = path.extname(file.name);
        const id = uuidv4();
        const inputFilename = `${id}${inputExt}`;
        const inputPath = path.join(UPLOADS_DIR, inputFilename);

        await fs.writeFile(inputPath, buffer);

        const outputFilename = `${id}.${format}`;
        const outputPath = path.join(PROCESSED_DIR, outputFilename);

        // FFmpeg arguments based on format
        // Simple conversion: -i input output
        // We might want to be more specific for some formats to ensure compatibility
        // e.g. mp4 needs aac audio and h264 video usually.
        const args: string[] = [];

        // Auto-select codec might be okay for MVP, but let's be safe for common ones:
        // This logic can be expanded.
        // ffmpeg usually picks reasonable defaults.

        await runFFmpeg({
            input: inputPath,
            output: outputPath,
            args,
        });

        // Cleanup input file? Maybe keep for debug for now, or delete.
        // await fs.unlink(inputPath);

        return NextResponse.json({
            url: `/api/download?file=${outputFilename}`
        });

    } catch (error: any) {
        console.error("Conversion error:", error);
        return NextResponse.json({ error: error.message || "Conversion failed" }, { status: 500 });
    }
}
