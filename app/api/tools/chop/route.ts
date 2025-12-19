import { NextRequest, NextResponse } from "next/server";
import { runFFmpeg, ensureDir, UPLOADS_DIR, PROCESSED_DIR } from "@/lib/ffmpeg";
import path from "path";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import { v4 as uuidv4 } from "uuid";
import archiver from "archiver";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const minutes = formData.get("minutes") as string;

        if (!file || !minutes) {
            return NextResponse.json({ error: "File and minutes are required" }, { status: 400 });
        }

        await ensureDir(UPLOADS_DIR);
        await ensureDir(PROCESSED_DIR);

        const buffer = Buffer.from(await file.arrayBuffer());
        const inputExt = path.extname(file.name);
        const id = uuidv4();
        const inputFilename = `${id}${inputExt}`;
        const inputPath = path.join(UPLOADS_DIR, inputFilename);

        await fs.writeFile(inputPath, buffer);

        // Create a temporary directory for segments
        const segmentsDir = path.join(PROCESSED_DIR, `${id}_segments`);
        await ensureDir(segmentsDir);

        const segmentTime = parseInt(minutes) * 60;

        // FFmpeg segmenting
        // -f segment -segment_time X -c copy -reset_timestamps 1 output%03d.ext
        const outputPattern = path.join(segmentsDir, `segment_%03d${inputExt}`);

        await runFFmpeg({
            input: inputPath,
            output: outputPattern,
            args: [
                "-c", "copy",
                "-map", "0",
                "-f", "segment",
                "-segment_time", segmentTime.toString(),
                "-reset_timestamps", "1",
            ],
        });

        // Zip the segments
        const zipFilename = `${id}_chopped.zip`;
        const zipPath = path.join(PROCESSED_DIR, zipFilename);
        const output = createWriteStream(zipPath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        await new Promise<void>((resolve, reject) => {
            output.on("close", () => resolve());
            archive.on("error", (err) => reject(err));

            archive.pipe(output);
            archive.directory(segmentsDir, false);
            archive.finalize();
        });

        // Cleanup segments directory? 
        // Usually good to cleanup to save space.
        await fs.rm(segmentsDir, { recursive: true, force: true });

        return NextResponse.json({
            url: `/api/download?file=${zipFilename}`
        });

    } catch (error: any) {
        console.error("Chopping error:", error);
        return NextResponse.json({ error: error.message || "Chopping failed" }, { status: 500 });
    }
}
