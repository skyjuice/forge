"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Dropzone } from "@/components/ui/dropzone";
import { Loader2, Minimize2, Download, Trash2, ArrowRight } from "lucide-react";
import imageCompression from 'browser-image-compression';
import JSZip from "jszip";

interface CompressedFile {
    original: File;
    compressedBlob: Blob;
    compressedSize: number;
}

export default function ImageCompressorClient() {
    const [files, setFiles] = useState<File[]>([]);
    const [quality, setQuality] = useState([0.8]); // 0 to 1
    const [compressing, setCompressing] = useState(false);
    const [results, setResults] = useState<CompressedFile[]>([]);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const handleFilesSelected = (newFiles: File[]) => {
        setFiles((prev) => [...prev, ...newFiles]);
        setResults([]);
        setDownloadUrl(null);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setResults([]);
        setDownloadUrl(null);
    };

    const handleCompress = async () => {
        if (files.length === 0) return;
        setCompressing(true);
        setResults([]);
        setDownloadUrl(null);

        try {
            const options = {
                maxSizeMB: 1, // Default constraint, but maxIteration drives quality mostly
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                initialQuality: quality[0], // Use slider value
            };

            const compressed = await Promise.all(
                files.map(async (file) => {
                    // browser-image-compression options
                    // If file is larger than 1MB, try to bring it down, but respect quality essentially
                    const compressedBlob = await imageCompression(file, options);
                    return {
                        original: file,
                        compressedBlob,
                        compressedSize: compressedBlob.size
                    };
                })
            );

            setResults(compressed);

            // Generate Download URL
            if (compressed.length === 1) {
                const url = URL.createObjectURL(compressed[0].compressedBlob);
                setDownloadUrl(url);
            } else {
                const zip = new JSZip();
                compressed.forEach(item => {
                    zip.file(`min_${item.original.name}`, item.compressedBlob);
                });
                const content = await zip.generateAsync({ type: "blob" });
                const url = URL.createObjectURL(content);
                setDownloadUrl(url);
            }

        } catch (error) {
            console.error("Compression error:", error);
            alert("Failed to compress images.");
        } finally {
            setCompressing(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Image Compressor</h1>
                <p className="text-muted-foreground">
                    Reduce image file size efficiently in your browser.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upload Images</CardTitle>
                    <CardDescription>
                        Optimize JPG, PNG, WEBP images.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Dropzone
                        onFilesSelected={handleFilesSelected}
                        accept="image/*"
                        multiple={true}
                        className="h-48"
                    />

                    {files.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Selected Images ({files.length})</h3>
                                <Button variant="ghost" size="sm" onClick={() => { setFiles([]); setResults([]); }} className="text-destructive hover:text-destructive h-auto p-0">Clear All</Button>
                            </div>

                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {files.map((file, i) => {
                                    const result = results.find(r => r.original === file);
                                    return (
                                        <div key={`${file.name}-${i}`} className="flex items-center gap-3 p-3 bg-muted/40 border rounded-md">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{file.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>Original: {formatSize(file.size)}</span>
                                                    {result && (
                                                        <>
                                                            <ArrowRight className="h-3 w-3" />
                                                            <span className="text-green-600 font-bold">
                                                                {formatSize(result.compressedSize)}
                                                                (-{Math.round(((file.size - result.compressedSize) / file.size) * 100)}%)
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {!result && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeFile(i)}
                                                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-6 pt-4 border-t">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">Compression Level</span>
                                        <span className="text-sm text-muted-foreground">{Math.round(quality[0] * 100)}% Quality</span>
                                    </div>
                                    <Slider
                                        value={quality}
                                        onValueChange={(v) => { setQuality(v); setResults([]); setDownloadUrl(null); }}
                                        max={1}
                                        step={0.1}
                                        min={0.1}
                                    />
                                    <p className="text-xs text-muted-foreground">Lower quality = smaller file size.</p>
                                </div>

                                {downloadUrl ? (
                                    <Button className="w-full" asChild size="lg">
                                        <a href={downloadUrl} download={files.length === 1 ? `min_${files[0].name}` : `compressed_images.zip`}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download Compressed Images
                                        </a>
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleCompress}
                                        disabled={compressing}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {compressing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Compressing...
                                            </>
                                        ) : (
                                            <>
                                                <Minimize2 className="mr-2 h-4 w-4" />
                                                Compress Images
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
