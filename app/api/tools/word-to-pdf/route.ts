import { NextRequest, NextResponse } from "next/server";
import { ensureDir, PROCESSED_DIR } from "@/lib/ffmpeg";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import mammoth from "mammoth";
import puppeteer from "puppeteer";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    await ensureDir(PROCESSED_DIR);

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Convert DOCX to HTML using Mammoth
    const { value: html } = await mammoth.convertToHtml({ buffer });

    // 2. Wrap HTML in a basic template for better rendering
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
            h1, h2, h3 { color: #333; }
            p { margin-bottom: 1em; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
            td, th { border: 1px solid #ddd; padding: 8px; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    // 3. Use Puppeteer to generate PDF from HTML
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Safer for containerized envs if needed
    });
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });

    await browser.close();

    // 4. Save PDF
    const id = uuidv4();

    const originalName = path.parse(file.name).name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9]/g, "_");
    const outputFilename = `${sanitizedName}_${id}.pdf`;

    const outputPath = path.join(PROCESSED_DIR, outputFilename);

    await fs.writeFile(outputPath, pdfBuffer);

    return NextResponse.json({
      url: `/api/download?file=${outputFilename}`
    });

  } catch (error: any) {
    console.error("Word to PDF error:", error);
    return NextResponse.json({ error: error.message || "Conversion failed" }, { status: 500 });
  }
}
