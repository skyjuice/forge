import { NextRequest, NextResponse } from "next/server";
import { PROCESSED_DIR } from "@/lib/ffmpeg";
import path from "path";
import fs from "fs/promises";
import { createReadStream } from "fs";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const filename = searchParams.get("file");

    if (!filename) {
        return NextResponse.json({ error: "File parameter required" }, { status: 400 });
    }

    // Basic security check to prevent directory traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(PROCESSED_DIR, safeFilename);

    try {
        await fs.access(filePath);

        // We can use node streams to return the file
        // Ideally we set headers (Content-Type, Content-Disposition)
        const stats = await fs.stat(filePath);
        const data = createReadStream(filePath);

        // @ts-ignore
        return new NextResponse(data, {
            headers: {
                "Content-Length": stats.size.toString(),
                "Content-Disposition": `attachment; filename="${safeFilename}"`,
                "Content-Type": "application/octet-stream", // Or try to guess mime type
            },
        });

    } catch (err) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
}
