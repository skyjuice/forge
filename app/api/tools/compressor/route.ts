import { NextRequest, NextResponse } from "next/server";
import { runFFmpeg, ensureDir, UPLOADS_DIR, PROCESSED_DIR } from "@/lib/ffmpeg";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    let inputPath: string | null = null;
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const level = formData.get("level") as string; // low, medium, high

        if (!file || !level) {
            return NextResponse.json({ error: "File and level are required" }, { status: 400 });
        }

        await ensureDir(UPLOADS_DIR);
        await ensureDir(PROCESSED_DIR);

        const buffer = Buffer.from(await file.arrayBuffer());
        const inputExt = path.extname(file.name);
        const id = uuidv4();
        const inputFilename = `${id}${inputExt}`;
        inputPath = path.join(UPLOADS_DIR, inputFilename);

        await fs.writeFile(inputPath, buffer);

        // Enhance filename: original_name + _compressed + id
        const originalName = path.parse(file.name).name;
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9]/g, "_");
        const outputFilename = `${sanitizedName}_compressed_${id}${inputExt}`; // Keep same extension
        const outputPath = path.join(PROCESSED_DIR, outputFilename);

        // Map level to CRF (Constant Rate Factor) or Preset
        // Lower CRF = Higher Quality/Larger Size
        // Higher CRF = Lower Quality/Smaller Size
        // 23 is default.
        let crf = "23";
        let preset = "medium";

        switch (level) {
            case "low": // Low Compression -> High Quality
                crf = "23";
                preset = "slow";
                break;
            case "medium": // Balanced
                crf = "28";
                preset = "medium";
                break;
            case "high": // High Compression -> Low Quality
                crf = "35";
                preset = "fast";
                break;
            default:
                crf = "28";
        }

        // Determine if audio or video.
        // Basic heuristics: if mp3/wav/etc -> audio logic (bitrate), if video -> crf
        // For MVP transparency, assume it's mostly for Video (CRF) or we use generous args.
        // If it's audio only, CRF might fail or be ignored.
        // Let's check extension roughly.
        const isAudio = ['.mp3', '.wav', '.m4a', '.aac'].includes(inputExt.toLowerCase());

        const args = [];
        if (isAudio) {
            // Audio compression logic (bitrate adjustment)
            // low: 320k, medium: 128k, high: 64k
            let audioBitrate = "128k";
            if (level === "low") audioBitrate = "320k";
            if (level === "medium") audioBitrate = "128k";
            if (level === "high") audioBitrate = "64k";
            args.push("-b:a", audioBitrate);
        } else {
            // Video compression
            args.push("-vcodec", "libx264"); // Force h264 for compatibility
            args.push("-crf", crf);
            args.push("-preset", preset);
            // Also compress audio track in video
            args.push("-c:a", "aac", "-b:a", "128k");
        }

        await runFFmpeg({
            input: inputPath,
            output: outputPath,
            args,
        });

        return NextResponse.json({
            url: `/api/download?file=${outputFilename}`
        });

    } catch (error: any) {
        console.error("Compression error:", error);
        return NextResponse.json({ error: error.message || "Compression failed" }, { status: 500 });
    } finally {
        if (inputPath) {
            await fs.unlink(inputPath).catch((err) => console.error("Input cleanup error:", err));
        }
    }
}
