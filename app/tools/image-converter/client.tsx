"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dropzone } from "@/components/ui/dropzone";
import { Loader2, Image as ImageIcon, Download, Trash2, ArrowRight, RefreshCcw, CheckCircle } from "lucide-react";
import JSZip from "jszip";

export default function ImageConverterClient() {
    const [files, setFiles] = useState<File[]>([]);
    const [targetFormat, setTargetFormat] = useState<"png" | "jpeg" | "webp">("png");
    const [converting, setConverting] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [downloadName, setDownloadName] = useState<string>("");

    const handleFilesSelected = (newFiles: File[]) => {
        setFiles((prev) => [...prev, ...newFiles]);
        setDownloadUrl(null);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setDownloadUrl(null);
    };

    const convertFile = (file: File, format: string): Promise<{ name: string, blob: Blob }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        reject(new Error("Canvas context not supported"));
                        return;
                    }
                    ctx.drawImage(img, 0, 0);

                    // Default quality 0.9 for lossy formats
                    const mimeType = `image/${format}`;
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const name = file.name.replace(/\.[^/.]+$/, "") + "." + (format === 'jpeg' ? 'jpg' : format);
                            resolve({ name, blob });
                        } else {
                            reject(new Error("Conversion failed"));
                        }
                    }, mimeType, 0.9);
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleConvert = async () => {
        if (files.length === 0) return;
        setConverting(true);
        setDownloadUrl(null);

        try {
            const convertedFiles = await Promise.all(files.map(f => convertFile(f, targetFormat)));

            if (convertedFiles.length === 1) {
                const url = URL.createObjectURL(convertedFiles[0].blob);
                setDownloadUrl(url);
                setDownloadName(convertedFiles[0].name);
            } else {
                const zip = new JSZip();
                convertedFiles.forEach(f => {
                    zip.file(f.name, f.blob);
                });
                const content = await zip.generateAsync({ type: "blob" });
                const url = URL.createObjectURL(content);
                setDownloadUrl(url);
                setDownloadName(`converted_images_${new Date().getTime()}.zip`);
            }

        } catch (error) {
            console.error("Conversion error:", error);
            alert("Failed to convert images. Please ensure they are valid image files.");
        } finally {
            setConverting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Image Converter</h1>
                <p className="text-muted-foreground">
                    Convert images between JPG, PNG, and WebP formats securely in your browser.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upload Images</CardTitle>
                    <CardDescription>
                        Select images to convert. Supported formats: JPG, PNG, WEBP, GIF.
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
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Selected Images ({files.length})</h3>
                                <Button variant="ghost" size="sm" onClick={() => setFiles([])} className="text-destructive hover:text-destructive h-auto p-0">Clear All</Button>
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                {files.map((file, i) => (
                                    <div key={`${file.name}-${i}`} className="flex items-center gap-3 p-3 bg-muted/40 border rounded-md group">
                                        <div className="h-8 w-8 bg-background rounded-md flex items-center justify-center border shrink-0 overflow-hidden">
                                            {/* Preview would be nice here using URL.createObjectURL, but keep it simple for now */}
                                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFile(i)}
                                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t">
                                <div className="flex-1 w-full sm:w-auto">
                                    <label className="text-sm font-medium mb-1.5 block">Convert to:</label>
                                    <Select value={targetFormat} onValueChange={(v: any) => { setTargetFormat(v); setDownloadUrl(null); }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select format" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="png">PNG (Lossless)</SelectItem>
                                            <SelectItem value="jpeg">JPG (Small Size)</SelectItem>
                                            <SelectItem value="webp">WebP (Modern)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-full sm:w-auto pt-6 sm:pt-0">
                                    {downloadUrl ? (
                                        <Button className="w-full sm:w-auto min-w-[160px]" asChild size="lg">
                                            <a href={downloadUrl} download={downloadName}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download result
                                            </a>
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleConvert}
                                            disabled={converting}
                                            className="w-full sm:w-auto min-w-[160px]"
                                            size="lg"
                                        >
                                            {converting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Converting...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                                    Convert All
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
