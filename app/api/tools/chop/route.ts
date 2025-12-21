import { NextRequest, NextResponse } from "next/server";
import { runFFmpeg, ensureDir, UPLOADS_DIR, PROCESSED_DIR } from "@/lib/ffmpeg";
import path from "path";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import { v4 as uuidv4 } from "uuid";
import archiver from "archiver";

export async function POST(req: NextRequest) {
    let inputPath: string | null = null;
    let segmentsDir: string | null = null;

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
        inputPath = path.join(UPLOADS_DIR, inputFilename);

        await fs.writeFile(inputPath, buffer);

        // Create a temporary directory for segments
        segmentsDir = path.join(PROCESSED_DIR, `${id}_segments`);
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
        const originalName = path.parse(file.name).name;
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9]/g, "_");
        const zipFilename = `${sanitizedName}_chopped_${id}.zip`;
        const zipPath = path.join(PROCESSED_DIR, zipFilename);
        const output = createWriteStream(zipPath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        await new Promise<void>((resolve, reject) => {
            output.on("close", () => resolve());
            archive.on("error", (err) => reject(err));

            archive.pipe(output);
            archive.directory(segmentsDir!, false);
            archive.finalize();
        });

        return NextResponse.json({
            url: `/api/download?file=${zipFilename}`
        });

    } catch (error: any) {
        console.error("Chopping error:", error);
        return NextResponse.json({ error: error.message || "Chopping failed" }, { status: 500 });
    } finally {
        // Cleanup segments directory
        if (segmentsDir) {
            await fs.rm(segmentsDir, { recursive: true, force: true }).catch((err) => console.error("Segments cleanup error:", err));
        }
        // Cleanup input file
        if (inputPath) {
            await fs.unlink(inputPath).catch((err) => console.error("Input cleanup error:", err));
        }
    }
}
