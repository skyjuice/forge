"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/dropzone";
import { Loader2, CheckCircle, FileType2, X, FileImage, AlertTriangle } from "lucide-react";

export default function PdfPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFilesSelected = (newFiles: File[]) => {
        setFiles((prev) => [...prev, ...newFiles]);
        setError(null);
        setDownloadUrl(null);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleCreatePdf = async () => {
        if (files.length === 0) return;

        setLoading(true);
        setError(null);
        setDownloadUrl(null);

        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        try {
            const res = await fetch("/api/tools/pdf", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error(await res.text());
            }

            const data = await res.json();
            setDownloadUrl(data.url);
        } catch (err: any) {
            setError(err.message || "Something went wrong during PDF creation.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* ... (header remains same) */}

            <Card>
                <CardHeader>
                    <CardTitle>Upload Images</CardTitle>
                    <CardDescription>Select JPG or PNG images to combine into a PDF.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">


                    <Dropzone
                        onFilesSelected={handleFilesSelected}
                        accept="image/png,image/jpeg,image/jpg"
                        multiple={true}
                    />

                    {files.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Selected Files ({files.length})</Label>
                                <Button variant="ghost" size="sm" onClick={() => setFiles([])} className="h-auto text-xs text-destructive hover:text-destructive">Clear All</Button>
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                {files.map((file, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-muted/40 border rounded-md text-sm">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <FileImage className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <span className="truncate">{file.name}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeFile(i)}>
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                            {error}
                        </div>
                    )}

                    {downloadUrl && (
                        <div className="p-4 bg-primary/10 border border-primary/20 rounded-md flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-primary">PDF Created!</p>
                                <a
                                    href={downloadUrl}
                                    download
                                    className="text-sm text-foreground/80 hover:text-foreground hover:underline flex items-center gap-1 mt-1"
                                >
                                    <FileType2 className="h-4 w-4" /> Download PDF
                                </a>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleCreatePdf}
                        disabled={files.length === 0 || loading}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating PDF...
                            </>
                        ) : (
                            <>
                                <FileType2 className="mr-2 h-4 w-4" />
                                Create PDF
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
