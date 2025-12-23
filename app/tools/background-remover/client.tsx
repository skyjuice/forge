"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dropzone } from "@/components/ui/dropzone";
import { Loader2, Image as ImageIcon, Download, Trash2, Eraser, RefreshCw, AlertCircle } from "lucide-react";
import { removeBackground } from "@imgly/background-removal";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ProcessedImage {
    original: File;
    processedBlob: Blob;
    previewUrl: string;
}

export default function BackgroundRemoverClient() {
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<ProcessedImage | null>(null);
    const [bgOption, setBgOption] = useState<"transparent" | "white">("transparent");
    const [error, setError] = useState<string | null>(null);

    // Effect to handle composite when option changes or result is ready
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!result) {
            setDownloadUrl(null);
            return;
        }

        const compositeImage = async () => {
            if (bgOption === "transparent") {
                setDownloadUrl(result.previewUrl);
                return;
            }

            // Composite on white background
            try {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return;

                    // Fill white
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Draw image
                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            setDownloadUrl(URL.createObjectURL(blob));
                        }
                    }, "image/jpeg", 0.9); // Use JPEG for white background to save size, or PNG? PNG allows reverting. Let's use PNG to be safe or JPG for white? JPG is standard for white bg product photos.
                };
                img.src = result.previewUrl;
            } catch (e) {
                console.error("Composite error", e);
            }
        };

        compositeImage();
    }, [result, bgOption]);


    const handleFileSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setResult(null);
            setError(null);
            setDownloadUrl(null);
        }
    };

    const handleRemoveBackground = async () => {
        if (!file) return;
        setProcessing(true);
        setError(null);

        try {
            // Processing
            // Note: This downloads ~100MB of models on first run, might take time.
            const blob = await removeBackground(file, {
                progress: (key: string, current: number, total: number) => {
                    // console.log(`Downloading ${key}: ${current} of ${total}`);
                }
            });
            const url = URL.createObjectURL(blob);
            setResult({
                original: file,
                processedBlob: blob,
                previewUrl: url
            });

        } catch (err: any) {
            console.error("Background removal error:", err);
            setError("Failed to remove background. Please try another image.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Background Remover</h1>
                <p className="text-muted-foreground">
                    Remove image backgrounds instantly or replace them with white.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upload Image</CardTitle>
                    <CardDescription>
                        Select an image to process. First time usage may take a moment to load AI models.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!file && !result && (
                        <Dropzone
                            onFilesSelected={handleFileSelected}
                            accept="image/*"
                            maxFiles={1}
                            className="h-64"
                        />
                    )}

                    {(file || result) && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                {/* Preview Area */}
                                <div className="w-full md:w-1/2 space-y-2">
                                    <Label>Original</Label>
                                    <div className="border rounded-lg overflow-hidden bg-muted/20 aspect-video flex items-center justify-center relative">
                                        {file && (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="Original"
                                                className="max-full max-h-full object-contain"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="w-full md:w-1/2 space-y-2">
                                    <Label>Result</Label>
                                    <div className="border rounded-lg overflow-hidden bg-[url('/transparent-grid.png')] bg-repeat bg-center aspect-video flex items-center justify-center relative bg-white/5">
                                        {processing ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <p className="text-sm text-muted-foreground">AI Processing...</p>
                                            </div>
                                        ) : downloadUrl ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={downloadUrl}
                                                alt="Result"
                                                className="max-full max-h-full object-contain"
                                            />
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Waiting to process...</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-4 border-t">
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" onClick={() => { setFile(null); setResult(null); }}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Reset
                                    </Button>

                                    {result && (
                                        <div className="flex items-center gap-2 border px-3 py-2 rounded-md">
                                            <span className="text-sm font-medium mr-2">Background:</span>
                                            <RadioGroup value={bgOption} onValueChange={(v: any) => setBgOption(v)} className="flex items-center gap-4">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="transparent" id="transparent" />
                                                    <Label htmlFor="transparent">Transparent</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="white" id="white" />
                                                    <Label htmlFor="white">White</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full sm:w-auto">
                                    {result && downloadUrl ? (
                                        <Button className="w-full sm:w-auto min-w-[160px]" asChild size="lg">
                                            <a href={downloadUrl} download={`removed_bg_${file?.name.split('.')[0]}.${bgOption === 'white' ? 'jpg' : 'png'}`}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download Image
                                            </a>
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleRemoveBackground}
                                            disabled={processing || !file}
                                            className="w-full sm:w-auto min-w-[160px]"
                                            size="lg"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Eraser className="mr-2 h-4 w-4" />
                                                    Remove Background
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
