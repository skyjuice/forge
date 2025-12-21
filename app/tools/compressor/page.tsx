"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/dropzone";
import { Loader2, CheckCircle, Minimize2, X, FileVideo, AlertTriangle } from "lucide-react";

export default function CompressorPage() {
    const [file, setFile] = useState<File | null>(null);
    const [level, setLevel] = useState<string>("medium");
    const [loading, setLoading] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFilesSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(null);
            setDownloadUrl(null);
        }
    };

    const removeFile = () => {
        setFile(null);
        setDownloadUrl(null);
    };

    const handleCompress = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setDownloadUrl(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("level", level);

        try {
            const res = await fetch("/api/tools/compressor", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error(await res.text());
            }

            const data = await res.json();
            setDownloadUrl(data.url);
        } catch (err: any) {
            setError(err.message || "Something went wrong during compression.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* ... (header remains same) */}

            <Card>
                <CardHeader>
                    <CardTitle>Compression Settings</CardTitle>
                    <CardDescription>Upload media and select compression strength.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                        <div className="text-sm text-amber-900">
                            <p className="font-medium">Privacy Notice</p>
                            <p className="mt-1 text-amber-800/90">
                                For your security, uploaded files are deleted immediately after processing.
                                Processed files are deleted immediately after you download them.
                                <strong>Download links are one-time use only.</strong>
                            </p>
                        </div>
                    </div>

                    {!file ? (
                        <Dropzone
                            onFilesSelected={handleFilesSelected}
                            accept="video/*,audio/*"
                        />
                    ) : (
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                                <FileVideo className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="font-medium truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={removeFile}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="level">Compression Level</Label>
                        <Select onValueChange={setLevel} defaultValue={level}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low Compression (Best Quality)</SelectItem>
                                <SelectItem value="medium">Medium Compression (Balanced)</SelectItem>
                                <SelectItem value="high">High Compression (Smallest Size)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                            {error}
                        </div>
                    )}

                    {downloadUrl && (
                        <div className="p-4 bg-primary/10 border border-primary/20 rounded-md flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-primary">Compression Complete!</p>
                                <a
                                    href={downloadUrl}
                                    download
                                    className="text-sm text-foreground/80 hover:text-foreground hover:underline flex items-center gap-1 mt-1"
                                >
                                    <Minimize2 className="h-4 w-4" /> Download Compressed File
                                </a>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleCompress}
                        disabled={!file || loading}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Compressing...
                            </>
                        ) : (
                            <>
                                <Minimize2 className="mr-2 h-4 w-4" />
                                Compress Media
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
