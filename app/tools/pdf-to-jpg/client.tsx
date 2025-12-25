"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Download, X, FileType2, FileImage, CheckCircle2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import JSZip from "jszip";
import { cn } from "@/lib/utils";


// Set worker source to CDN to avoid build issues with Next.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfToJpgClient() {
    const [file, setFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // We keep a reference to the PDF document to render pages manually for conversion
    const [pdfDocument, setPdfDocument] = useState<any>(null);

    const onDocumentLoadSuccess = (pdf: any) => {
        setNumPages(pdf.numPages);
        setPdfDocument(pdf);
        // Select all pages by default
        const all = new Set<number>();
        for (let i = 0; i < pdf.numPages; i++) {
            all.add(i);
        }
        setSelectedPages(all);
    };

    const togglePageCall = (index: number) => {
        setSelectedPages(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const toggleAll = () => {
        if (selectedPages.size === numPages) {
            setSelectedPages(new Set());
        } else {
            const all = new Set<number>();
            for (let i = 0; i < numPages; i++) {
                all.add(i);
            }
            setSelectedPages(all);
        }
    };

    const handleConvert = async () => {
        if (!pdfDocument || selectedPages.size === 0) return;

        setLoading(true);
        setStatusText("Initializing...");
        setProgress(0);
        setError(null);
        setDownloadUrl(null);

        try {
            const zip = new JSZip();
            const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
            const total = sortedPages.length;

            for (let i = 0; i < total; i++) {
                const pageIndex = sortedPages[i];
                const pageNumber = pageIndex + 1;

                setStatusText(`Rendering page ${pageNumber} (${i + 1}/${total})...`);

                // Fetch the page
                const page = await pdfDocument.getPage(pageNumber);

                // Render to canvas
                const viewport = page.getViewport({ scale: 2.0 }); // High quality scale
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (!context) throw new Error("Canvas context not available");

                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                }).promise;

                // Convert to blob
                const blob = await new Promise<Blob | null>(resolve =>
                    canvas.toBlob(resolve, 'image/jpeg', 0.85)
                );

                if (blob) {
                    const fileName = `page_${pageNumber.toString().padStart(3, '0')}.jpg`;
                    zip.file(fileName, blob);
                }

                setProgress(Math.round(((i + 1) / total) * 90));
            }

            setStatusText("Zipping images...");
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            setDownloadUrl(url);
            setProgress(100);
            setStatusText("Complete!");

        } catch (err: any) {
            console.error(err);
            setError("Failed to convert PDF. " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-6xl mx-auto py-12 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">PDF to JPG</h1>
                <p className="text-muted-foreground">
                    Convert PDF pages to high-quality JPG images instantly in your browser.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>PDF to JPG Converter</CardTitle>
                    <CardDescription>Upload a PDF to extract pages as images.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!file ? (
                        <Dropzone
                            accept=".pdf"
                            maxFiles={1}
                            onFilesSelected={(files) => {
                                if (files.length > 0) {
                                    setFile(files[0]);
                                    setDownloadUrl(null);
                                    setError(null);
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
                                        <p className="text-xs text-muted-foreground">{numPages} total pages</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="select-all"
                                            checked={selectedPages.size === numPages && numPages > 0}
                                            onCheckedChange={toggleAll}
                                        />
                                        <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                                            Select All
                                        </label>
                                    </div>
                                    <div className="w-px h-6 bg-border mx-2" />
                                    <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-destructive hover:text-destructive">
                                        Remove
                                    </Button>
                                </div>
                            </div>

                            {/* Pages Grid */}
                            <div className="bg-slate-100/50 dark:bg-slate-900/50 p-6 rounded-xl border min-h-[300px]">
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
                                >
                                    {Array.from(new Array(numPages), (_, index) => (
                                        <div
                                            key={index}
                                            className={cn(
                                                "relative group cursor-pointer transition-all duration-200",
                                                selectedPages.has(index) ? "ring-2 ring-primary ring-offset-2 rounded" : "opacity-80 hover:opacity-100"
                                            )}
                                            onClick={() => togglePageCall(index)}
                                        >
                                            <div className="shadow-md rounded overflow-hidden bg-white select-none pointer-events-none">
                                                <Page
                                                    pageNumber={index + 1}
                                                    width={150}
                                                    renderTextLayer={false}
                                                    renderAnnotationLayer={false}
                                                />
                                            </div>

                                            {/* Selection Overlay */}
                                            <div className="absolute top-2 right-2 z-10">
                                                <div className={cn(
                                                    "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm",
                                                    selectedPages.has(index)
                                                        ? "bg-primary border-primary text-primary-foreground"
                                                        : "bg-white/80 border-slate-300"
                                                )}>
                                                    {selectedPages.has(index) && <CheckCircle2 className="h-4 w-4" />}
                                                </div>
                                            </div>

                                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                                                {index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </Document>
                            </div>

                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                                    <X className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            {downloadUrl ? (
                                <Button className="w-full" size="lg" asChild>
                                    <a href={downloadUrl} download={`${file.name.replace('.pdf', '')}_images.zip`}>
                                        <Download className="mr-2 h-4 w-4" /> Download Images (ZIP)
                                    </a>
                                </Button>
                            ) : (
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleConvert}
                                    disabled={loading || selectedPages.size === 0}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {statusText} {progress > 0 && `(${progress}%)`}
                                        </>
                                    ) : (
                                        <>
                                            Convert to JPG <FileImage className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {file && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t md:hidden z-50">
                    {downloadUrl ? (
                        <Button className="w-full" size="lg" asChild>
                            <a href={downloadUrl} download={`${file.name.replace('.pdf', '')}_images.zip`}>
                                <Download className="mr-2 h-4 w-4" /> Download Images (ZIP)
                            </a>
                        </Button>
                    ) : (
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleConvert}
                            disabled={loading || selectedPages.size === 0}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {statusText} {progress > 0 && `(${progress}%)`}
                                </>
                            ) : (
                                <>
                                    Convert to JPG <FileImage className="ml-2 h-4 w-4" />
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
