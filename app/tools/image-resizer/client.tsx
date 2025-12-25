"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dropzone } from "@/components/ui/dropzone";
import { Loader2, Image as ImageIcon, Download, Trash2, Scaling, Lock, Unlock } from "lucide-react";
import JSZip from "jszip";

export default function ImageResizerClient() {
    const [files, setFiles] = useState<File[]>([]);
    const [width, setWidth] = useState<number | "">("");
    const [height, setHeight] = useState<number | "">("");
    const [maintainAspect, setMaintainAspect] = useState(true);
    const [aspectRatio, setAspectRatio] = useState<number>(1);

    const [resizing, setResizing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [downloadName, setDownloadName] = useState<string>("");

    const handleFilesSelected = (newFiles: File[]) => {
        setFiles((prev) => [...prev, ...newFiles]);
        setDownloadUrl(null);

        // Use the first file to set initial dimensions if empty
        if ((!width || !height) && newFiles.length > 0) {
            const img = new Image();
            img.onload = () => {
                if (!width) setWidth(img.width);
                if (!height) setHeight(img.height);
                setAspectRatio(img.width / img.height);
            };
            img.src = URL.createObjectURL(newFiles[0]);
        }
    };

    const handleWidthChange = (val: string) => {
        const w = parseInt(val);
        setWidth(val === "" ? "" : w);
        if (maintainAspect && w && aspectRatio) {
            setHeight(Math.round(w / aspectRatio));
        }
    };

    const handleHeightChange = (val: string) => {
        const h = parseInt(val);
        setHeight(val === "" ? "" : h);
        if (maintainAspect && h && aspectRatio) {
            setWidth(Math.round(h * aspectRatio));
        }
    };

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        setDownloadUrl(null);
        if (newFiles.length === 0) {
            setWidth("");
            setHeight("");
        }
    };

    const resizeFile = (file: File): Promise<{ name: string, blob: Blob }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    // Use target width/height or default to original if not properly set (safety check)
                    const targetWidth = typeof width === 'number' ? width : img.width;
                    const targetHeight = typeof height === 'number' ? height : img.height;

                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        reject(new Error("Canvas context not supported"));
                        return;
                    }

                    // High quality scaling
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";
                    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            // Append _resized to name or keep same extension
                            const name = file.name;
                            resolve({ name, blob });
                        } else {
                            reject(new Error("Resize failed"));
                        }
                    }, file.type, 0.9);
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleResize = async () => {
        if (files.length === 0 || !width || !height) return;
        setResizing(true);
        setDownloadUrl(null);

        try {
            const resizedFiles = await Promise.all(files.map(f => resizeFile(f)));

            if (resizedFiles.length === 1) {
                const url = URL.createObjectURL(resizedFiles[0].blob);
                setDownloadUrl(url);
                setDownloadName(`resized_${files[0].name}`);
            } else {
                const zip = new JSZip();
                resizedFiles.forEach(f => {
                    zip.file(`resized_${f.name}`, f.blob);
                });
                const content = await zip.generateAsync({ type: "blob" });
                const url = URL.createObjectURL(content);
                setDownloadUrl(url);
                setDownloadName(`resized_images_${new Date().getTime()}.zip`);
            }

        } catch (error) {
            console.error("Resize error:", error);
            alert("Failed to resize images.");
        } finally {
            setResizing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Image Resizer</h1>
                <p className="text-muted-foreground">
                    Resize images by pixels while maintaining quality.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upload Images</CardTitle>
                    <CardDescription>
                        Batch resize JPG, PNG, WEBP images.
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
                                <Button variant="ghost" size="sm" onClick={() => { setFiles([]); setWidth(""); setHeight(""); }} className="text-destructive hover:text-destructive h-auto p-0">Clear All</Button>
                            </div>

                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {files.map((file, i) => (
                                    <div key={`${file.name}-${i}`} className="flex items-center gap-3 p-3 bg-muted/40 border rounded-md">
                                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm font-medium text-muted-foreground flex-1 truncate">{file.name}</p>
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">Resize Options</Label>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                id="aspect"
                                                checked={maintainAspect}
                                                onCheckedChange={setMaintainAspect}
                                            />
                                            <Label htmlFor="aspect" className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
                                                {maintainAspect ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                                                Maintain Aspect Ratio
                                            </Label>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="space-y-2 flex-1">
                                            <Label htmlFor="width">Width (px)</Label>
                                            <Input
                                                id="width"
                                                type="number"
                                                value={width}
                                                onChange={(e) => handleWidthChange(e.target.value)}
                                                placeholder="Width"
                                            />
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            <Label htmlFor="height">Height (px)</Label>
                                            <Input
                                                id="height"
                                                type="number"
                                                value={height}
                                                onChange={(e) => handleHeightChange(e.target.value)}
                                                placeholder="Height"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-end">
                                    {downloadUrl ? (
                                        <Button className="w-full" asChild size="lg">
                                            <a href={downloadUrl} download={downloadName}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download Resized Images
                                            </a>
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleResize}
                                            disabled={resizing || !width || !height}
                                            className="w-full"
                                            size="lg"
                                        >
                                            {resizing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Resizing...
                                                </>
                                            ) : (
                                                <>
                                                    <Scaling className="mr-2 h-4 w-4" />
                                                    Resize Images
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

            {files.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t md:hidden z-50">
                    {downloadUrl ? (
                        <Button className="w-full" asChild size="lg">
                            <a href={downloadUrl} download={downloadName}>
                                <Download className="mr-2 h-4 w-4" />
                                Download Images
                            </a>
                        </Button>
                    ) : (
                        <Button
                            onClick={handleResize}
                            disabled={resizing || !width || !height}
                            className="w-full"
                            size="lg"
                        >
                            {resizing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resizing...
                                </>
                            ) : (
                                <>
                                    <Scaling className="mr-2 h-4 w-4" />
                                    Resize Images
                                </>
                            )}
                        </Button>
                    )}
                </div>
            )}
            {files.length > 0 && <div className="h-24 md:hidden" />}
        </div>
    );
}
