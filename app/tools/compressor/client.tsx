"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/dropzone";
import { Loader2, CheckCircle, Minimize2, X, FileVideo, AlertTriangle } from "lucide-react";
import { useFFmpeg } from "@/hooks/use-ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export default function CompressorClient() {
    const { ffmpeg, load, loaded, isLoading: isEngineLoading } = useFFmpeg();
    const [file, setFile] = useState<File | null>(null);
    const [level, setLevel] = useState<string>("medium");
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

    const handleCompress = async () => {
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

            let crf = "28"; // Medium
            if (level === "low") crf = "23"; // Better quality
            if (level === "high") crf = "32"; // Lower quality, smaller size

            const outputName = "output.mp4"; // Simplifying to mp4 for now

            // Check if audio or video
            // If it's pure audio, libx264 won't work perfectly, but let's assume video for now or fallback
            // For MVP, we stick to video compression logic.
            // Command: -i input -vcodec libx264 -crf <crf> output.mp4
            await ffmpeg.exec([
                "-i", "input",
                "-vcodec", "libx264",
                "-crf", crf,
                "-preset", "fast", // Faster compression
                outputName
            ]);

            const data = await ffmpeg.readFile(outputName);
            const blob = new Blob([data as any], { type: "video/mp4" });
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);

            await ffmpeg.deleteFile("input");
            await ffmpeg.deleteFile(outputName);

        } catch (err: any) {
            console.error(err);
            setError("Compression failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Media Compressor</h1>
                <p className="text-muted-foreground">
                    Compress audio and video files securely in your browser.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Compression Settings</CardTitle>
                    <CardDescription>Upload media and select compression strength.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!file ? (
                        <Dropzone
                            onFilesSelected={handleFilesSelected}
                            accept="video/*,audio/*"
                        />
                    ) : (
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                                <FileVideo className="h-8 w-8 text-primary" />
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
                        <Label htmlFor="level">Compression Level</Label>
                        <Select onValueChange={setLevel} defaultValue={level}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low Compression (Best Quality)</SelectItem>
                                <SelectItem value="medium">Medium Compression (Balanced)</SelectItem>
                                <SelectItem value="high">High Compression (Smallest Size)</SelectItem>
                            </SelectContent>
                        </Select>
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
                                <p className="text-sm font-medium text-primary mb-2">Compression Complete!</p>
                                <Button asChild variant="outline" className="w-full sm:w-auto border-primary/20 hover:bg-primary/20">
                                    <a
                                        href={downloadUrl}
                                        download={`compressed_${file?.name.split('.')[0]}.mp4`}
                                    >
                                        <Minimize2 className="mr-2 h-4 w-4" /> Download Compressed File
                                    </a>
                                </Button>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleCompress}
                        disabled={!file || loading || isEngineLoading}
                        className="w-full"
                    >
                        {loading || isEngineLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isEngineLoading ? "Loading Engine..." : `Compressing... ${progress > 0 ? `${progress}%` : ""}`}
                            </>
                        ) : (
                            <>
                                <Minimize2 className="mr-2 h-4 w-4" />
                                Compress Media
                            </>
                        )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                        Processed locally in your browser. 100% Private.
                    </p>
                </CardContent>
            </Card>

            {file && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t md:hidden z-50">
                    {downloadUrl ? (
                        <Button className="w-full" size="lg" asChild>
                            <a
                                href={downloadUrl}
                                download={`compressed_${file?.name.split('.')[0]}.mp4`}
                            >
                                <Minimize2 className="mr-2 h-4 w-4" /> Download Video
                            </a>
                        </Button>
                    ) : (
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleCompress}
                            disabled={!file || loading || isEngineLoading}
                        >
                            {loading || isEngineLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Compressing...
                                </>
                            ) : (
                                <>
                                    <Minimize2 className="mr-2 h-4 w-4" />
                                    Compress Media
                                </>
                            )}
                        </Button>
                    )}
                </div>
            )}
            {file && <div className="h-24 md:hidden" />}
        </div>
    );
}
