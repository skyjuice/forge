"use client";

import { useState } from "react";
import { useOCR } from "@/hooks/use-ocr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { Loader2, FileImage, Copy, ScanText, RefreshCw, Download, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

export default function OCRPage() {
    const { status, recognize } = useOCR();
    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState("");

    const handleFileSelected = (files: File[]) => {
        if (files.length > 0) {
            const selectedFile = files[0];
            setFile(selectedFile);
            setExtractedText("");
            const url = URL.createObjectURL(selectedFile);
            setImageUrl(url);

            // Auto start? Maybe manual is better for feeling of control
        }
    };

    const handleProcess = async () => {
        if (!file) return;
        const text = await recognize(file);
        if (text) {
            setExtractedText(text);
            toast.success("Text extracted successfully!");
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(extractedText);
        toast.success("Text copied to clipboard");
    };

    const handleDownload = () => {
        const blob = new Blob([extractedText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `extracted-text-${file?.name || "image"}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container max-w-6xl mx-auto py-12 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Image to Text (OCR)</h1>
                <p className="text-muted-foreground">
                    Extract text from images instantaneously using on-device AI.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-250px)] min-h-[500px]">
                {/* Input Column */}
                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <CardTitle>Source Image</CardTitle>
                        <CardDescription>Upload a screenshot, photo, or scan.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-6">
                        {!file ? (
                            <div className="flex-1 flex flex-col">
                                <Dropzone
                                    accept="image/*"
                                    maxFiles={1}
                                    onFilesSelected={handleFileSelected}
                                    className="h-full min-h-[200px]"
                                />
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col gap-4">
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="bg-primary/10 p-2 rounded shrink-0">
                                            <FileImage className="h-5 w-5 text-primary" />
                                        </div>
                                        <p className="font-medium truncate">{file.name}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        setFile(null);
                                        setImageUrl(null);
                                        setExtractedText("");
                                    }} className="text-destructive hover:text-destructive shrink-0">
                                        Remove
                                    </Button>
                                </div>

                                {imageUrl && (
                                    <div className="relative flex-1 bg-black/5 dark:bg-black/20 rounded-lg border overflow-hidden flex items-center justify-center p-2">
                                        <img
                                            src={imageUrl}
                                            alt="Preview"
                                            className="max-w-full max-h-full object-contain shadow-sm rounded"
                                        />
                                    </div>
                                )}

                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleProcess}
                                    disabled={status.status === 'initializing' || status.status === 'recognizing'}
                                >
                                    {status.status === 'initializing' || status.status === 'recognizing' ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {status.status === 'initializing' ? 'Loading AI Model... ' : 'Extracting Text...'}
                                            {status.progress > 0 && Math.round(status.progress) + '%'}
                                        </>
                                    ) : (
                                        <>
                                            Extract Text <ScanText className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Output Column */}
                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <CardTitle>Extracted Text</CardTitle>
                        <CardDescription>Editable text result.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-[300px]">
                        <div className="relative flex-1">
                            <Textarea
                                className="absolute inset-0 resize-none font-mono text-sm leading-relaxed p-4 h-full"
                                placeholder="Text will appear here..."
                                value={extractedText}
                                onChange={(e) => setExtractedText(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleCopy}
                                disabled={!extractedText}
                            >
                                <Copy className="mr-2 h-4 w-4" /> Copy Text
                            </Button>
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={handleDownload}
                                disabled={!extractedText}
                            >
                                <Download className="mr-2 h-4 w-4" /> Download .txt
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
