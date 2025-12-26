
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { Loader2, Download, FileText, Minimize2, CheckCircle, AlertTriangle } from "lucide-react";
import { PDFDocument } from "pdf-lib";

export default function CompressPdfClient() {
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [stats, setStats] = useState<{ original: number, compressed: number } | null>(null);

    const handleFiles = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setDownloadUrl(null);
            setStats(null);
        }
    };

    const handleCompress = async () => {
        if (!file) return;
        setProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // PDF-Lib compression strategies for client-side:
            // 1. Remove optional content
            // 2. Remove metadata
            // 3. Garbage collection of unused objects (save usually does this)
            // 4. (Hard) Downsampling images - tricky without re-encoding library

            // We will do a generic "save" which often optimizes structure.
            // We can also try to remove some metadata.

            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords([]);
            pdfDoc.setProducer('');
            pdfDoc.setCreator('');

            // Save with object stream compression
            const compressedPdfBytes = await pdfDoc.save({ useObjectStreams: false });
            // NOTE: useObjectStreams: false sometimes results in larger files? 
            // Actually true is better for compression usually. Default is true.
            // Let's try explicit true.

            // Actually, pdf-lib doesn't have a "strong compress" like ghostscript.
            // We can only do "save".
            const optimizedBytes = await pdfDoc.save();

            const blob = new Blob([optimizedBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            setStats({
                original: file.size,
                compressed: blob.size
            });
            setDownloadUrl(url);

        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    const formatSize = (bytes: number) => {
        return (bytes / 1024 / 1024).toFixed(2) + " MB";
    };

    const getSavings = () => {
        if (!stats) return 0;
        const diff = stats.original - stats.compressed;
        if (diff <= 0) return 0;
        return Math.round((diff / stats.original) * 100);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Compress PDF</h1>
                <p className="text-muted-foreground">
                    Optimize PDF files locally to reduce size.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upload Document</CardTitle>
                    <CardDescription>
                        Note: Browser-based compression is limited. For maximum compression, server-side tools are recommended.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!file ? (
                        <Dropzone onFilesSelected={handleFiles} accept=".pdf" maxFiles={1} />
                    ) : (
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/40">
                            <div className="flex items-center gap-3">
                                <FileText className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="font-medium">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => { setFile(null); setDownloadUrl(null); }}>
                                Change
                            </Button>
                        </div>
                    )}

                    {stats && (
                        <div className={`p-4 rounded-lg flex items-center justify-between ${getSavings() > 0 ? "bg-green-500/10 text-green-700" : "bg-yellow-500/10 text-yellow-700"}`}>
                            <div className="flex items-center gap-3">
                                {getSavings() > 0 ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                                <div>
                                    <p className="font-medium">
                                        {getSavings() > 0 ? "Compression Successful" : "No Size Reduction"}
                                    </p>
                                    <p className="text-sm opacity-90">
                                        {formatSize(stats.original)} → {formatSize(stats.compressed)}
                                    </p>
                                </div>
                            </div>
                            <div className="text-2xl font-bold">
                                {getSavings() > 0 ? `-${getSavings()}%` : "0%"}
                            </div>
                        </div>
                    )}

                    {downloadUrl ? (
                        <Button className="w-full" size="lg" asChild>
                            <a href={downloadUrl} download={`compressed_${file?.name}`}>
                                <Download className="mr-2 h-4 w-4" /> Download Result
                            </a>
                        </Button>
                    ) : (
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleCompress}
                            disabled={!file || processing}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Optimizing...
                                </>
                            ) : (
                                <>
                                    <Minimize2 className="mr-2 h-4 w-4" /> Compress PDF
                                </>
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
