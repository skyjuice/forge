"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/dropzone";
import { AlertCircle, Download, FileType2, Loader2, ArrowRight } from "lucide-react";


export default function SplitPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [ranges, setRanges] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const handleSplit = async () => {
        if (!file || !ranges) return;

        setLoading(true);
        setError(null);
        setDownloadUrl(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("ranges", ranges);

        try {
            const res = await fetch("/api/tools/pdf/split", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();
                // Try parsing JSON error
                try {
                    const json = JSON.parse(text);
                    throw new Error(json.error || "Split failed");
                } catch {
                    throw new Error(text || "Split failed");
                }
            }

            const data = await res.json();
            setDownloadUrl(data.url);
        } catch (err: any) {
            setError(err.message || "Something went wrong during processing.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-3xl mx-auto py-12 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Split PDF</h1>
                <p className="text-muted-foreground">
                    Extract pages or split your PDF into multiple files.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upload PDF</CardTitle>
                    <CardDescription>
                        Select a PDF file to split.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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

                    {file && (
                        <div className="bg-muted/50 p-4 rounded-lg flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded">
                                <FileType2 className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                                Change
                            </Button>
                        </div>
                    )}

                    {file && (
                        <div className="space-y-4 pt-4 border-t">
                            <div className="space-y-2">
                                <Label htmlFor="ranges">Page Ranges</Label>
                                <Input
                                    id="ranges"
                                    placeholder="e.g. 1-5, 8, 11-13"
                                    value={ranges}
                                    onChange={(e) => setRanges(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Separate ranges with commas. Example: <b>1-5, 8</b> will create two files: one with pages 1 to 5, and another with page 8.
                                </p>
                            </div>

                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            {downloadUrl ? (
                                <Button className="w-full" asChild size="lg">
                                    <a href={downloadUrl} download>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Split PDF(s)
                                    </a>
                                </Button>
                            ) : (
                                <Button
                                    className="w-full"
                                    onClick={handleSplit}
                                    disabled={loading || !ranges}
                                    size="lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Splitting...
                                        </>
                                    ) : (
                                        <>
                                            Split PDF <ArrowRight className="ml-2 h-4 w-4" />
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
