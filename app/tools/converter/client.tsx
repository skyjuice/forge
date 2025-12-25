"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/dropzone";
import { Loader2, Upload, CheckCircle, FileMusic, X, AlertTriangle, Download } from "lucide-react";
import { useFFmpeg } from "@/hooks/use-ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export default function ConverterClient() {
    const { ffmpeg, load, loaded, isLoading: isEngineLoading } = useFFmpeg();
    const [file, setFile] = useState<File | null>(null);
    const [format, setFormat] = useState<string>("mp4");
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

    const handleConvert = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setDownloadUrl(null);
        setProgress(0);

        try {
            if (!loaded) {
                await load();
            }

            ffmpeg.on("progress", ({ progress, time }) => {
                setProgress(Math.round(progress * 100));
            });

            await ffmpeg.writeFile("input", await fetchFile(file));

            const outputName = `output.${format}`;
            // Basic args: -i input output.ext
            // You can add more specific args based on format here if needed
            await ffmpeg.exec(["-i", "input", outputName]);

            const data = await ffmpeg.readFile(outputName);
            const blob = new Blob([data as any], { type: `video/${format}` }); // Approximate mime type
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);

            // Clean up
            await ffmpeg.deleteFile("input");
            await ffmpeg.deleteFile(outputName);

        } catch (err: any) {
            console.error(err);
            setError("Conversion failed. Your browser might not support this operation.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Media Converter</h1>
                <p className="text-muted-foreground">
                    Convert audio and video files securely in your browser. No upload required.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upload & Settings</CardTitle>
                    <CardDescription>Select your source file and target format.</CardDescription>
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
                                <FileMusic className="h-8 w-8 text-primary" />
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
                        <Label htmlFor="format">Target Format</Label>
                        <Select onValueChange={setFormat} defaultValue={format}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mp4">MP4 (Video)</SelectItem>
                                <SelectItem value="mp3">MP3 (Audio)</SelectItem>
                                <SelectItem value="wav">WAV (Audio)</SelectItem>
                                <SelectItem value="webm">WebM (Video)</SelectItem>
                                <SelectItem value="m4a">M4A (Audio)</SelectItem>
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
                                <p className="text-sm font-medium text-primary mb-2">Conversion Complete!</p>
                                <Button asChild size="sm" variant="default" className="w-full sm:w-auto">
                                    <a
                                        href={downloadUrl}
                                        download={`converted_${file?.name.split('.')[0]}.${format}`}
                                    >
                                        <Upload className="mr-2 h-4 w-4 rotate-180" /> Download {format.toUpperCase()}
                                    </a>
                                </Button>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleConvert}
                        disabled={!file || loading || isEngineLoading}
                        className="w-full"
                    >
                        {loading || isEngineLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isEngineLoading ? "Loading Engine..." : `Converting... ${progress > 0 ? `${progress}%` : ""}`}
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Convert
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
                    <Button
                        onClick={handleConvert}
                        disabled={!file || loading || isEngineLoading}
                        className="w-full"
                        size="lg"
                    >
                        {loading || isEngineLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isEngineLoading ? "Loading..." : "Converting..."}
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Convert
                            </>
                        )}
                    </Button>
                </div>
            )}
            {file && <div className="h-24 md:hidden" />}
        </div>
    );
}
