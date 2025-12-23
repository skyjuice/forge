"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { Loader2, Download, FileType2, ArrowRight, LayoutTemplate, X, Hash } from "lucide-react";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

type Position =
    | "top-left" | "top-center" | "top-right"
    | "bottom-left" | "bottom-center" | "bottom-right";

export default function PageNumbersClient() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [position, setPosition] = useState<Position>("bottom-center");
    const [pageCount, setPageCount] = useState<number | null>(null);

    const handleFileSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setDownloadUrl(null);
            // Optional: Load PDF to get page count preview if needed, 
            // but for now we just show the filename.
        }
    };

    const handleProcess = async () => {
        if (!file) return;
        setLoading(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

            const pages = pdfDoc.getPages();
            const totalPages = pages.length;

            pages.forEach((page, index) => {
                const { width, height } = page.getSize();
                const fontSize = 12;
                const margin = 20;
                const text = `${index + 1}`;
                const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
                const textHeight = helveticaFont.heightAtSize(fontSize);

                let x = 0;
                let y = 0;

                // Calculate X position
                if (position.includes("left")) {
                    x = margin;
                } else if (position.includes("center")) {
                    x = (width / 2) - (textWidth / 2);
                } else if (position.includes("right")) {
                    x = width - textWidth - margin;
                }

                // Calculate Y position
                if (position.includes("top")) {
                    y = height - margin - textHeight;
                } else if (position.includes("bottom")) {
                    y = margin;
                }

                page.drawText(text, {
                    x,
                    y,
                    size: fontSize,
                    font: helveticaFont,
                    color: rgb(0, 0, 0),
                });
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);

        } catch (error) {
            console.error("Error adding page numbers:", error);
        } finally {
            setLoading(false);
        }
    };

    const PositionButton = ({ pos, label }: { pos: Position, label?: string }) => (
        <button
            onClick={() => setPosition(pos)}
            className={cn(
                "h-20 w-full border rounded-md flex items-center justify-center hover:bg-muted transition-colors relative",
                position === pos ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
            )}
        >
            <div className={cn(
                "absolute w-3 h-3 bg-foreground/20 rounded-sm",
                pos.includes("top") ? "top-3" : "bottom-3",
                pos.includes("left") ? "left-3" :
                    pos.includes("right") ? "right-3" : "left-1/2 -translate-x-1/2"
            )} />
            {position === pos && <div className="absolute inset-0 border-2 border-primary rounded-md pointer-events-none" />}
        </button>
    );

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Add Page Numbers</h1>
                <p className="text-muted-foreground">
                    Add page numbers to your PDF document with ease.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Page Number Options</CardTitle>
                    <CardDescription>Upload a PDF and choose where to place the numbers.</CardDescription>
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
                            {/* Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="bg-primary/10 p-2 rounded">
                                        <FileType2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium truncate max-w-[150px] sm:max-w-xs">{file.name}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-destructive hover:text-destructive">
                                    Remove File
                                </Button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-base">Position</Label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <PositionButton pos="top-left" />
                                        <PositionButton pos="top-center" />
                                        <PositionButton pos="top-right" />
                                        <PositionButton pos="bottom-left" />
                                        <PositionButton pos="bottom-center" />
                                        <PositionButton pos="bottom-right" />
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center pt-2">
                                        Click a box to select position
                                    </p>
                                </div>

                                <div className="space-y-4 border rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50">
                                    <div className="w-[140px] h-[200px] bg-white border shadow-sm relative relative">
                                        <div className="absolute inset-4 border-dashed border border-slate-200"></div>
                                        {/* Preview Dot */}
                                        <div className={cn(
                                            "absolute w-6 h-6 flex items-center justify-center text-[10px] font-bold text-primary bg-primary/10 rounded",
                                            position.includes("top") ? "top-2" : "bottom-2",
                                            position.includes("left") ? "left-2" :
                                                position.includes("right") ? "right-2" : "left-1/2 -translate-x-1/2"
                                        )}>
                                            1
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium mt-4">Preview</p>
                                </div>
                            </div>

                            {downloadUrl ? (
                                <Button className="w-full" size="lg" asChild>
                                    <a href={downloadUrl} download={`numbered_${file.name}`}>
                                        <Download className="mr-2 h-4 w-4" /> Download Numbered PDF
                                    </a>
                                </Button>
                            ) : (
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleProcess}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Add Page Numbers <Hash className="ml-2 h-4 w-4" />
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
