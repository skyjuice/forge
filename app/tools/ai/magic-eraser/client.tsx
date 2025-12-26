
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { Loader2, Download, Eraser, Undo, RefreshCw, AlertCircle, Brush } from "lucide-react";
import { useAIWorker } from "@/hooks/use-ai-worker";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function MagicEraserClient() {
    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
    const [brushSize, setBrushSize] = useState(20);
    const [isDrawing, setIsDrawing] = useState(false);

    // Canvas refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // const { status, process } = useAIWorker(); // Disabled to use local algorithm
    const [status, setStatus] = useState<{ status: string; progress?: number; error?: string; output?: any }>({ status: 'idle' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    // Initialize canvas when image loads
    useEffect(() => {
        if (!file) return;

        const url = URL.createObjectURL(file);
        setImageUrl(url);

        const img = new Image();
        img.src = url;
        img.onload = () => {
            setOriginalImage(img);
            initializeCanvas(img);
        };

        return () => URL.revokeObjectURL(url);
    }, [file]);

    const initializeCanvas = (img: HTMLImageElement) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Container width for responsive scaling (max-width: 100%)
        // Actually, for simplicity in MVP, we might fix the canvas size to the image size 
        // but display it scaled via CSS.
        // However, painting coordinates need to match.
        // Let's set canvas internal resolution to image size.

        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"; // Red transparent brush
            ctx.lineWidth = brushSize;
            contextRef.current = ctx;
        }
    };

    // Update brush size
    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.lineWidth = brushSize;
        }
    }, [brushSize]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!contextRef.current) return;
        setIsDrawing(true);

        const { x, y } = getCoordinates(e);
        contextRef.current.beginPath();
        contextRef.current.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !contextRef.current) return;

        const { x, y } = getCoordinates(e);
        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
    };

    const stopDrawing = () => {
        if (!contextRef.current) return;
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };

    const clearMask = () => {
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    // ALGORITHMIC INPAINTING (Client-Side Fallback)
    const handleErase = async () => {
        if (!file || !canvasRef.current || !imageUrl || !originalImage) return;

        setIsProcessing(true);
        setStatus({ status: 'processing', progress: 0 });

        // Use setTimeout to allow UI to update before heavy calculation
        setTimeout(() => {
            try {
                const canvas = canvasRef.current!;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (!ctx) return;

                const width = canvas.width;
                const height = canvas.height;

                // 1. Get Mask Data (Red pixels)
                const maskData = ctx.getImageData(0, 0, width, height);

                // 2. We need the ORIGINAL image data to modify
                const imgCanvas = document.createElement('canvas');
                imgCanvas.width = width;
                imgCanvas.height = height;
                const imgCtx = imgCanvas.getContext('2d', { willReadFrequently: true });
                if (!imgCtx) return;
                imgCtx.drawImage(originalImage, 0, 0, width, height);
                const imageData = imgCtx.getImageData(0, 0, width, height);

                const data = imageData.data;
                const mask = maskData.data;

                // Identify mask indices
                const maskIndices: number[] = [];
                for (let i = 0; i < mask.length; i += 4) {
                    // Check if this pixel is part of the mask (red brush)
                    if (mask[i] > 100 && mask[i + 3] > 10) {
                        maskIndices.push(i);
                    }
                }

                if (maskIndices.length === 0) {
                    setIsProcessing(false);
                    setStatus({ status: 'idle' });
                    return;
                }

                // Diffusion Inpainting: Run multiple passes
                const passes = 20;
                for (let p = 0; p < passes; p++) {
                    for (const idx of maskIndices) {
                        const x = (idx / 4) % width;
                        const y = Math.floor((idx / 4) / width);

                        let rSum = 0, gSum = 0, bSum = 0, count = 0;

                        // Check 8 neighbors
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                if (dx === 0 && dy === 0) continue;
                                const nx = x + dx;
                                const ny = y + dy;

                                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                    const nIdx = (ny * width + nx) * 4;
                                    rSum += data[nIdx];
                                    gSum += data[nIdx + 1];
                                    bSum += data[nIdx + 2];
                                    count++;
                                }
                            }
                        }

                        if (count > 0) {
                            data[idx] = rSum / count;
                            data[idx + 1] = gSum / count;
                            data[idx + 2] = bSum / count;
                            data[idx + 3] = 255;
                        }
                    }

                    setStatus({ status: 'processing', progress: Math.min(99, (p / passes) * 100) });
                }

                imgCtx.putImageData(imageData, 0, 0);

                setResultUrl(imgCanvas.toDataURL());
                setStatus({ status: 'complete', progress: 100 });
                setIsProcessing(false);

            } catch (e) {
                console.error("Inpainting error", e);
                setStatus({ status: 'error', error: "Failed to erase object." });
                setIsProcessing(false);
            }
        }, 100);
    };

    // Update result when complete
    /*
    useEffect(() => {
        if (status.status === 'complete' && status.output) {
            // Output is usually an Image object or Blob?
            // Transformers.js image output looks like { data, width, height, channels }.
            // Need to convert to canvas/url.
            const { output } = status;
            try {
                // Assuming output is a RawImage or similar from transformers.js
                // We can use `.save()` logic if available or convert buffer.
                // Or if the worker returns a Blob/DataURL (we need to check worker output serialization).
                // Pure transformers pipeline usually returns a `RawImage` object.
                // We need to handle this in client or worker.
                // Let's assume worker just returns it. 
                // We will add logic in client to parse it.
                // OR, update worker to return blob url?
                // `classifier` output for inpainting is usually a `RawImage`.
                // We can use `RawImage.save()` to get a canvas or blob.
                // But `RawImage` is a class instantiation. Since we pass message, it's serialized.
                // It will be a plain object { data: ..., width: ..., height: ..., channels: ... }.

                // We need to convert this pixel data to a canvas.
                const canvas = document.createElement('canvas');
                canvas.width = output.width;
                canvas.height = output.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const pixelCount = output.width * output.height;
                    const channels = output.data.length / pixelCount;

                    let rgbaData;

                    if (channels === 4) {
                        rgbaData = new Uint8ClampedArray(output.data);
                    } else if (channels === 3) {
                        // RGB to RGBA
                        rgbaData = new Uint8ClampedArray(pixelCount * 4);
                        for (let i = 0; i < pixelCount; i++) {
                            rgbaData[i * 4] = output.data[i * 3];     // R
                            rgbaData[i * 4 + 1] = output.data[i * 3 + 1]; // G
                            rgbaData[i * 4 + 2] = output.data[i * 3 + 2]; // B
                            rgbaData[i * 4 + 3] = 255;                // A
                        }
                    } else if (channels === 1) {
                        // Grayscale to RGBA
                        rgbaData = new Uint8ClampedArray(pixelCount * 4);
                        for (let i = 0; i < pixelCount; i++) {
                            const val = output.data[i];
                            rgbaData[i * 4] = val; // R
                            rgbaData[i * 4 + 1] = val; // G
                            rgbaData[i * 4 + 2] = val; // B
                            rgbaData[i * 4 + 3] = 255; // A
                        }
                    } else {
                        console.error("Unsupported channel count:", channels);
                        return;
                    }

                    const imageData = new ImageData(
                        rgbaData,
                        output.width,
                        output.height
                    );
                    ctx.putImageData(imageData, 0, 0);
                    setResultUrl(canvas.toDataURL());
                }
            } catch (e) {
                console.error("Error parsing output", e);
            }
        }
    }, [status]);
    */


    const handleFiles = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setResultUrl(null);
            // Clear canvas
            if (canvasRef.current && contextRef.current) {
                contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Magic Eraser</h1>
                <p className="text-muted-foreground">
                    Highlight unwanted objects to remove them using AI.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Editor</CardTitle>
                    <CardDescription>Upload an image and paint over the object you want to remove.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-md flex items-start gap-3 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">Experimental Feature (Beta)</p>
                            <p className="opacity-90">
                                This tool runs entirely in your browser using a lightweight algorithm.
                                Complex objects may not be erased perfectly and results might appear blurry.
                            </p>
                        </div>
                    </div>

                    {!file ? (
                        <Dropzone onFilesSelected={handleFiles} accept="image/*" maxFiles={1} className="h-64" />
                    ) : (
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                                {/* Editor Area */}
                                <div className="relative border rounded-lg overflow-hidden shrink-0" style={{ maxWidth: '100%' }}>
                                    {/* Background Image */}
                                    {/* Background Image */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    {imageUrl && (
                                        <img
                                            src={imageUrl}
                                            alt="Original"
                                            className="max-w-full max-h-[60vh] object-contain block"
                                            onLoad={(e) => {
                                                // Ensure canvas matches this size if we haven't already
                                            }}
                                        />
                                    )}

                                    {/* Canvas Overlay - Must match image size exactly */}
                                    <canvas
                                        ref={canvasRef}
                                        className="absolute top-0 left-0 cursor-crosshair touch-none"
                                        style={{ width: '100%', height: '100%' }}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                    />
                                </div>
                            </div>

                            {/* Toolbar */}
                            <div className="flex flex-wrap items-center justify-center gap-4 p-4 bg-secondary/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Brush className="w-4 h-4 text-muted-foreground" />
                                    <Label className="w-20 text-xs">Brush Size</Label>
                                    <Slider
                                        value={[brushSize]}
                                        onValueChange={(v) => setBrushSize(v[0])}
                                        min={5}
                                        max={100}
                                        step={1}
                                        className="w-32"
                                    />
                                </div>
                                <Button variant="outline" size="sm" onClick={clearMask}>
                                    <RefreshCw className="mr-2 h-4 w-4" /> Clear Mask
                                </Button>

                                <Button
                                    onClick={handleErase}
                                    disabled={status.status === 'processing' || status.status === 'loading'}
                                >
                                    {status.status === 'processing' || status.status === 'loading' ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {status.status === 'loading' ? 'Loading AI...' : 'Erasing...'}
                                        </>
                                    ) : (
                                        <>
                                            <Eraser className="mr-2 h-4 w-4" /> Erase Object
                                        </>
                                    )}
                                </Button>

                                <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                                    <Eraser className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Status Info */}
                            {status.status === 'loading' && (
                                <p className="text-center text-xs text-muted-foreground animate-pulse">
                                    Downloading model resources... ({status.progress ? Math.round(status.progress) : 0}%)
                                </p>
                            )}
                            {status.status === 'error' && (
                                <div className="text-center p-2 bg-destructive/10 text-destructive rounded text-sm">
                                    Error: {status.error}
                                </div>
                            )}

                        </div>
                    )}
                </CardContent>
            </Card>

            {resultUrl && (
                <Card>
                    <CardHeader>
                        <CardTitle>Result</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="border rounded-lg overflow-hidden max-h-[60vh]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={resultUrl} alt="Result" className="w-full h-full object-contain" />
                        </div>
                        <Button asChild size="lg">
                            <a href={resultUrl} download="erased_result.png">
                                <Download className="mr-2 h-4 w-4" /> Download Result
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
