import { NextRequest, NextResponse } from "next/server";
import { runFFmpeg, ensureDir, UPLOADS_DIR, PROCESSED_DIR } from "@/lib/ffmpeg";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

// We need to disable built-in body parsing to handle FormData with files specially if needed?
// Next.js App Router handles FormData well natively with request.formData()

export async function POST(req: NextRequest) {
    let inputPath: string | null = null;
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const format = formData.get("format") as string;

        if (!file || !format) {
            return NextResponse.json({ error: "File and format are required" }, { status: 400 });
        }

        await ensureDir(UPLOADS_DIR);
        await ensureDir(PROCESSED_DIR);

        const inputExt = path.extname(file.name);
        const id = uuidv4();
        const inputFilename = `${id}${inputExt}`;
        inputPath = path.join(UPLOADS_DIR, inputFilename);

        // Stream file to disk
        const { pipeline } = await import("stream/promises");
        const { createWriteStream } = await import("fs");
        await pipeline(
            file.stream() as unknown as NodeJS.ReadableStream,
            createWriteStream(inputPath)
        );

        // Enhance filename: original_name + id
        const originalName = path.parse(file.name).name;
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9]/g, "_"); // Remove special chars
        const outputFilename = `${sanitizedName}_${id}.${format}`;
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

        return NextResponse.json({
            url: `/api/download?file=${outputFilename}`
        });

    } catch (error: any) {
        console.error("Conversion error:", error);
        return NextResponse.json({ error: error.message || "Conversion failed" }, { status: 500 });
    } finally {
        if (inputPath) {
            await fs.unlink(inputPath).catch((err) => console.error("Input cleanup error:", err));
        }
    }
}
