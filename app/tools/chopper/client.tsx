"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/dropzone";
import { Loader2, Scissors, CheckCircle, Package, X, AlertTriangle } from "lucide-react";
import { useFFmpeg } from "@/hooks/use-ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import JSZip from "jszip";

export default function ChopperClient() {
    const { ffmpeg, load, loaded, isLoading: isEngineLoading } = useFFmpeg();
    const [file, setFile] = useState<File | null>(null);
    const [minutes, setMinutes] = useState<number>(60);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFilesSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
            setDownloadUrl(null);
            setProgress(0);
        }
    };

    const removeFile = () => {
        setFile(null);
        setDownloadUrl(null);
        setProgress(0);
    };

    const handleChop = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setDownloadUrl(null);
        setProgress(0);

        try {
            if (!loaded) {
                await load();
            }

            ffmpeg.on("progress", ({ progress }) => {
                setProgress(Math.round(progress * 100));
            });

            await ffmpeg.writeFile("input", await fetchFile(file));

            const segmentSeconds = minutes * 60;
            const outputPattern = "out%03d"; // out000, out001...
            // Use original extension if possible or default to source type container
            // Simpler to just assume mp4/mkv/mp3 for now or detect from file name
            const ext = file.name.split('.').pop() || "mp4";
            const patternWithExt = `${outputPattern}.${ext}`;

            // Segment command: -i input -f segment -segment_time 60 -c copy -reset_timestamps 1 out%03d.mp4
            // -c copy is fast and lossless
            await ffmpeg.exec([
                "-i", "input",
                "-f", "segment",
                "-segment_time", segmentSeconds.toString(),
                "-c", "copy",
                "-reset_timestamps", "1",
                patternWithExt
            ]);

            // Read directory to find output files
            const files = await ffmpeg.listDir(".");
            const segmentFiles = files.filter((f) => f.name.startsWith("out") && !f.isDir);

            if (segmentFiles.length === 0) {
                throw new Error("No segments were created. Check settings.");
            }

            // Create ZIP
            const zip = new JSZip();
            for (const seg of segmentFiles) {
                const data = await ffmpeg.readFile(seg.name);
                zip.file(seg.name, data as any);
                // Cleanup
                await ffmpeg.deleteFile(seg.name);
            }
            await ffmpeg.deleteFile("input");

            const zipContent = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(zipContent);
            setDownloadUrl(url);

        } catch (err: any) {
            console.error(err);
            setError("Processing failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Media Chopper</h1>
                <p className="text-muted-foreground">
                    Split long audio and video recordings into segments securely in your browser.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Split Settings</CardTitle>
                    <CardDescription>Upload your media file and specify the chunk duration.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!file ? (
                        <Dropzone
                            onFilesSelected={handleFilesSelected}
                            accept="audio/*,video/*"
                        />
                    ) : (
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                                <Scissors className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="font-medium truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={removeFile}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="minutes">Segment Duration (Minutes)</Label>
                        <Input
                            id="minutes"
                            type="number"
                            min="1"
                            value={minutes}
                            onChange={(e) => setMinutes(parseInt(e.target.value) || 1)}
                        />
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                            {error}
                        </div>
                    )}

                    {downloadUrl && (
                        <div className="p-4 bg-primary/10 border border-primary/20 rounded-md flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-primary">Processing Complete!</p>
                                <a
                                    href={downloadUrl}
                                    download={`segments_${file?.name.split('.')[0]}.zip`}
                                    className="text-sm text-foreground/80 hover:text-foreground hover:underline flex items-center gap-1 mt-1"
                                >
                                    <Package className="h-4 w-4" /> Download Zip (Segments)
                                </a>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleChop}
                        disabled={!file || loading || isEngineLoading}
                        className="w-full"
                    >
                        {loading || isEngineLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isEngineLoading ? "Loading Engine..." : `Chopping... ${progress > 0 ? `${progress}%` : ""}`}
                            </>
                        ) : (
                            <>
                                <Scissors className="mr-2 h-4 w-4" />
                                Process File
                            </>
                        )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                        Processed locally in your browser. 100% Private.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
