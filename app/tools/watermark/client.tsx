"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { Loader2, Download, FileType2, Stamp, Settings2, Image as ImageIcon, Type, X } from "lucide-react";
import { PDFDocument, rgb, StandardFonts, degrees, PDFImage } from "pdf-lib";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Position =
    | "top-left" | "top-center" | "top-right"
    | "middle-left" | "middle-center" | "middle-right"
    | "bottom-left" | "bottom-center" | "bottom-right";

export default function WatermarkClient() {
    const [file, setFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Watermark Settings
    const [mode, setMode] = useState<"text" | "image">("text");
    const [text, setText] = useState("CONFIDENTIAL");
    const [opacity, setOpacity] = useState(0.5); // 0-1
    const [rotation, setRotation] = useState(45); // degrees
    const [fontSize, setFontSize] = useState(48);
    const [scale, setScale] = useState(0.5); // Image scale
    const [position, setPosition] = useState<Position>("middle-center");

    const handleFileSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setDownloadUrl(null);
            setError(null);
        }
    };

    const handleImageSelected = (files: File[]) => {
        if (files.length > 0) {
            setImageFile(files[0]);
        }
    };

    const handleProcess = async () => {
        if (!file) return;
        setLoading(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            const pages = pdfDoc.getPages();

            // Prepare Image if needed
            let pdfImage: PDFImage | undefined;
            if (mode === "image" && imageFile) {
                const imgBuffer = await imageFile.arrayBuffer();
                if (imageFile.type === "image/png") {
                    pdfImage = await pdfDoc.embedPng(imgBuffer);
                } else {
                    pdfImage = await pdfDoc.embedJpg(imgBuffer);
                }
            }

            pages.forEach((page) => {
                const { width, height } = page.getSize();
                let x = 0;
                let y = 0;
                let objectWidth = 0;
                let objectHeight = 0;

                if (mode === "text") {
                    objectWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
                    objectHeight = helveticaFont.heightAtSize(fontSize);
                } else if (mode === "image" && pdfImage) {
                    objectWidth = pdfImage.width * scale;
                    objectHeight = pdfImage.height * scale;
                }

                // Calculate Position (Generic 9-grid logic)
                // Left/Center/Right
                if (position.includes("left")) x = 20;
                else if (position.includes("center")) x = (width / 2) - (objectWidth / 2);
                else if (position.includes("right")) x = width - objectWidth - 20;

                // Top/Middle/Bottom
                if (position.includes("top")) y = height - objectHeight - 20;
                else if (position.includes("middle")) y = (height / 2) - (objectHeight / 2);
                else if (position.includes("bottom")) y = 20;

                // Draw
                if (mode === "text") {
                    page.drawText(text, {
                        x,
                        y,
                        size: fontSize,
                        font: helveticaFont,
                        color: rgb(0.7, 0.7, 0.7), // Grey
                        opacity: opacity,
                        rotate: degrees(rotation),
                    });
                } else if (mode === "image" && pdfImage) {
                    page.drawImage(pdfImage, {
                        x,
                        y,
                        width: objectWidth,
                        height: objectHeight,
                        opacity: opacity,
                        rotate: degrees(rotation),
                    });
                }
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);

        } catch (error: any) {
            console.error("Error adding watermark:", error);
            if (error.message?.includes("encrypted")) {
                setError("This PDF is password protected. Please unlock it before uploading.");
            } else {
                setError("Failed to create watermark. Please try a valid PDF.");
            }
        } finally {
            setLoading(false);
        }
    };

    const PositionButton = ({ pos }: { pos: Position }) => (
        <button
            onClick={() => setPosition(pos)}
            className={cn(
                "h-10 w-full border rounded flex items-center justify-center hover:bg-muted transition-colors",
                position === pos ? "bg-primary text-primary-foreground border-primary" : "bg-background"
            )}
        >
            <div className={cn(
                "w-2 h-2 rounded-full",
                position === pos ? "bg-white" : "bg-foreground/20"
            )} />
        </button>
    );

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Add Watermark</h1>
                <p className="text-muted-foreground">
                    Stamp your documents with text or images to protect your intellectual property.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Watermark Settings</CardTitle>
                    <CardDescription>Customize position, style, and opacity.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!file ? (
                        <Dropzone
                            accept=".pdf"
                            maxFiles={1}
                            onFilesSelected={handleFileSelected}
                        />
                    ) : (
                        <div className="space-y-8">
                            {/* File Info */}
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded">
                                        <FileType2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <p className="font-medium">{file.name}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-destructive hover:text-destructive">
                                    Remove File
                                </Button>
                            </div>

                            {error && (
                                <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm flex items-center gap-2">
                                    <X className="h-4 w-4" /> {error}
                                </div>
                            )}

                            <Tabs defaultValue="text" onValueChange={(v) => setMode(v as any)} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="text"><Type className="w-4 h-4 mr-2" /> Text Watermark</TabsTrigger>
                                    <TabsTrigger value="image"><ImageIcon className="w-4 h-4 mr-2" /> Image Watermark</TabsTrigger>
                                </TabsList>

                                <div className="grid md:grid-cols-2 gap-8 mt-6">
                                    {/* Settings Column */}
                                    <div className="space-y-6">
                                        <TabsContent value="text" className="space-y-4 mt-0">
                                            <div className="space-y-2">
                                                <Label>Watermark Text</Label>
                                                <Input value={text} onChange={(e) => setText(e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Font Size: {fontSize}px</Label>
                                                <Slider value={[fontSize]} min={12} max={120} step={1} onValueChange={([v]: number[]) => setFontSize(v)} />
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="image" className="space-y-4 mt-0">
                                            <div className="space-y-2">
                                                <Label>Upload Image</Label>
                                                {!imageFile ? (
                                                    <Dropzone accept=".png,.jpg,.jpeg" maxFiles={1} onFilesSelected={handleImageSelected} className="h-32" />
                                                ) : (
                                                    <div className="flex items-center gap-2 p-2 border rounded">
                                                        <img src={URL.createObjectURL(imageFile)} className="h-10 w-10 object-cover rounded" />
                                                        <span className="text-sm truncate flex-1">{imageFile.name}</span>
                                                        <Button variant="ghost" size="icon" onClick={() => setImageFile(null)}><X className="w-4 h-4" /></Button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Scale: {scale}x</Label>
                                                <Slider value={[scale]} min={0.1} max={2.0} step={0.1} onValueChange={([v]: number[]) => setScale(v)} />
                                            </div>
                                        </TabsContent>

                                        {/* Common Settings */}
                                        <div className="space-y-6 pt-4 border-t">
                                            <div className="space-y-2">
                                                <Label>Opacity: {Math.round(opacity * 100)}%</Label>
                                                <Slider value={[opacity]} min={0.1} max={1} step={0.1} onValueChange={([v]: number[]) => setOpacity(v)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Rotation: {rotation}°</Label>
                                                <Slider value={[rotation]} min={0} max={360} step={45} onValueChange={([v]: number[]) => setRotation(v)} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Position & Preview Column (Conceptual) */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>Position</Label>
                                            <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
                                                <PositionButton pos="top-left" />
                                                <PositionButton pos="top-center" />
                                                <PositionButton pos="top-right" />
                                                <PositionButton pos="middle-left" />
                                                <PositionButton pos="middle-center" />
                                                <PositionButton pos="middle-right" />
                                                <PositionButton pos="bottom-left" />
                                                <PositionButton pos="bottom-center" />
                                                <PositionButton pos="bottom-right" />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center h-40 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed">
                                            <div className="text-center p-4">
                                                <p className="text-sm font-medium text-muted-foreground mb-1">Preview not available</p>
                                                <p className="text-xs text-muted-foreground">Download to see result</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Tabs>

                            {downloadUrl ? (
                                <Button className="w-full" size="lg" asChild>
                                    <a href={downloadUrl} download={`watermarked_${file.name.replace('.pdf', '')}.pdf`}>
                                        <Download className="mr-2 h-4 w-4" /> Download Watermarked PDF
                                    </a>
                                </Button>
                            ) : (
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleProcess}
                                    disabled={loading || (mode === "image" && !imageFile)}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Stamping Document...
                                        </>
                                    ) : (
                                        <>
                                            Add Watermark <Stamp className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
