import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";

export interface FFmpegOptions {
  input: string;
  output: string;
  args?: string[];
}

export async function runFFmpeg({ input, output, args = [] }: FFmpegOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    // Basic args: -i input [custom args] output
    // Note: We might need -y to overwrite if we handle that logic here, or let the caller decide.
    // For safety, let's assume caller handles conflicts or we add -y by default? 
    // Let's add -y by default for now as checking existence is extra work.
    const processArgs = ["-y", "-i", input, ...args, output];
    
    console.log(`Spawning ffmpeg with args: ${processArgs.join(" ")}`);

    const ffmpeg = spawn("ffmpeg", processArgs);

    let stderr = "";

    ffmpeg.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.error(`FFmpeg finished with code ${code}. Stderr: ${stderr}`);
        reject(new Error(`FFmpeg process exited with code ${code}`));
      }
    });

    ffmpeg.on("error", (err) => {
      reject(err);
    });
  });
}

export async function ensureDir(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");
export const PROCESSED_DIR = path.join(process.cwd(), "data", "processed");
