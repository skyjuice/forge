"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { Document, Page, pdfjs } from "react-pdf";
import { Loader2, RotateCw, RotateCcw, Download, X, FileType2, ArrowRight } from "lucide-react";


// Set worker source to CDN to avoid build issues with Next.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function RotatePdfClient() {
    const [file, setFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [rotations, setRotations] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        // Initialize rotations to 0 for all pages
        const folder: Record<number, number> = {};
        for (let i = 0; i < numPages; i++) {
            folder[i] = 0;
        }
        setRotations(folder);
    };

    const rotatePage = (pageIndex: number, direction: 'left' | 'right') => {
        setRotations(prev => ({
            ...prev,
            [pageIndex]: (prev[pageIndex] || 0) + (direction === 'right' ? 90 : -90)
        }));
    };

    const rotateAll = (direction: 'left' | 'right') => {
        setRotations(prev => {
            const next = { ...prev };
            for (let i = 0; i < numPages; i++) {
                next[i] = (next[i] || 0) + (direction === 'right' ? 90 : -90);
            }
            return next;
        });
    };

    const handleProcess = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setDownloadUrl(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("rotations", JSON.stringify(rotations));

        try {
            const res = await fetch("/api/tools/pdf/rotate", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Rotation failed");
            }

            const data = await res.json();
            setDownloadUrl(data.url);
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-5xl mx-auto py-12 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Rotate PDF</h1>
                <p className="text-muted-foreground">
                    Rotate specific pages or the entire document permanently.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Rotate PDF Pages</CardTitle>
                    <CardDescription>Upload a PDF to view and rotate pages.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* File Upload / View Toggle */}
                    {!file ? (
                        <Dropzone
                            accept=".pdf"
                            maxFiles={1}
                            onFilesSelected={(files) => {
                                if (files.length > 0) {
                                    setFile(files[0]);
                                    setDownloadUrl(null);
                                    setError(null);
                                    setNumPages(0);
                                }
                            }}
                        />
                    ) : (
                        <div className="space-y-6">
                            {/* Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="bg-primary/10 p-2 rounded">
                                        <FileType2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium truncate max-w-[150px] sm:max-w-xs">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{numPages} pages</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => rotateAll('left')}>
                                        <RotateCcw className="mr-2 h-3 w-3" /> All Left
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => rotateAll('right')}>
                                        <RotateCw className="mr-2 h-3 w-3" /> All Right
                                    </Button>
                                    <div className="w-px h-6 bg-border mx-2" />
                                    <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-destructive hover:text-destructive">
                                        Remove
                                    </Button>
                                </div>
                            </div>

                            {/* PDF Preview Grid */}
                            <div className="bg-slate-100/50 dark:bg-slate-900/50 p-6 rounded-xl border min-h-[300px] flex justify-center">
                                <Document
                                    file={file}
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    className="flex flex-wrap justify-center gap-6"
                                    loading={
                                        <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                            <p>Loading PDF...</p>
                                        </div>
                                    }
                                    error={
                                        <div className="flex flex-col items-center gap-3 py-20 text-destructive">
                                            <p>Failed to load PDF.</p>
                                            <Button variant="outline" onClick={() => setFile(null)}>Try Another File</Button>
                                        </div>
                                    }
                                >
                                    {Array.from(new Array(numPages), (_, index) => (
                                        <div key={index} className="relative group">
                                            <div
                                                className="shadow-md rounded overflow-hidden bg-white transition-transform duration-300 ease-out"
                                                style={{ transform: `rotate(${rotations[index] || 0}deg)` }}
                                            >
                                                <Page
                                                    pageNumber={index + 1}
                                                    width={200}
                                                    renderTextLayer={false}
                                                    renderAnnotationLayer={false}
                                                />
                                            </div>

                                            {/* Hover Overlay Controls */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded">
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="rounded-full shadow-lg"
                                                    onClick={() => rotatePage(index, 'left')}
                                                    title="Rotate Left"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="rounded-full shadow-lg"
                                                    onClick={() => rotatePage(index, 'right')}
                                                    title="Rotate Right"
                                                >
                                                    <RotateCw className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                                                {index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </Document>
                            </div>

                            {/* Action Area */}
                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                                    <X className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            {downloadUrl ? (
                                <Button className="w-full" size="lg" asChild>
                                    <a href={downloadUrl} download>
                                        <Download className="mr-2 h-4 w-4" /> Download Rotated PDF
                                    </a>
                                </Button>
                            ) : (
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleProcess}
                                    disabled={loading || numPages === 0}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Rotate PDF <ArrowRight className="ml-2 h-4 w-4" />
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
