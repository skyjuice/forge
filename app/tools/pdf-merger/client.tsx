"use client";

import { useState } from "react";
import { Dropzone } from "@/components/ui/dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PDFDocument } from "pdf-lib";
import { Loader2, FileType2, X, ArrowUp, ArrowDown, FileText, CheckCircle } from "lucide-react";


export default function PdfMergerClient() {
    const [files, setFiles] = useState<File[]>([]);
    const [merging, setMerging] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFilesSelected = (newFiles: File[]) => {
        setFiles((prev) => [...prev, ...newFiles]);
        setDownloadUrl(null);
        setError(null);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setDownloadUrl(null);
    };

    const moveFile = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === files.length - 1) return;

        setFiles((prev) => {
            const newFiles = [...prev];
            const swapIndex = direction === 'up' ? index - 1 : index + 1;
            [newFiles[index], newFiles[swapIndex]] = [newFiles[swapIndex], newFiles[index]];
            return newFiles;
        });
        setDownloadUrl(null);
    };

    const handleMerge = async () => {
        if (files.length < 2) return;
        setMerging(true);
        setDownloadUrl(null);

        try {
            const mergedPdf = await PDFDocument.create();

            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);

        } catch (error: any) {
            console.error("Merge failed:", error);
            if (error.message?.includes("encrypted")) {
                setError("One or more PDFs are password protected. Please unlock them before merging.");
            } else {
                setError("Failed to merge PDFs. Please ensure all files are valid.");
            }
        } finally {
            setMerging(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Merge PDF</CardTitle>
                    <CardDescription>Combine multiple PDF files into one single document.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">


                    <Dropzone
                        onFilesSelected={handleFilesSelected}
                        accept="application/pdf"
                        multiple={true}
                        className="h-48"
                    />

                    {files.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Selected Files ({files.length})</h3>
                                <Button variant="ghost" size="sm" onClick={() => setFiles([])} className="text-destructive hover:text-destructive h-auto p-0">Clear All</Button>
                            </div>

                            <div className="space-y-2">
                                {files.map((file, i) => (
                                    <div key={`${file.name}-${i}`} className="flex items-center gap-3 p-3 bg-muted/40 border rounded-md group">
                                        <div className="h-8 w-8 bg-background rounded-md flex items-center justify-center border shrink-0">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => moveFile(i, 'up')}
                                                disabled={i === 0}
                                                className="h-7 w-7 text-muted-foreground"
                                            >
                                                <ArrowUp className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => moveFile(i, 'down')}
                                                disabled={i === files.length - 1}
                                                className="h-7 w-7 text-muted-foreground"
                                            >
                                                <ArrowDown className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeFile(i)}
                                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 ml-1"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm flex items-center gap-2">
                            <X className="h-4 w-4" /> {error}
                        </div>
                    )}

                    {downloadUrl && (
                        <div className="p-4 bg-primary/10 border border-primary/20 rounded-md flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-primary">PDF Merged Successfully!</p>
                                <a
                                    href={downloadUrl}
                                    download={`merged-${new Date().getTime()}.pdf`}
                                    className="text-sm text-foreground/80 hover:text-foreground hover:underline flex items-center gap-1 mt-1 font-medium"
                                >
                                    <FileType2 className="h-4 w-4" /> Download Merged PDF
                                </a>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleMerge}
                        disabled={files.length < 2 || merging}
                        className="w-full"
                        size="lg"
                    >
                        {merging ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Merging PDFs...
                            </>
                        ) : (
                            <>
                                <FileType2 className="mr-2 h-4 w-4" />
                                Merge {files.length} Files
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
