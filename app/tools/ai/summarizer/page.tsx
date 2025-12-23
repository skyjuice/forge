"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { FileText, Sparkles, AlertCircle, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAI } from "@/hooks/use-ai";

export default function SummarizerPage() {
    const [input, setInput] = useState("");
    const { result, run } = useAI();

    // Model: DistilBART-CNN-6-6 (80MB quantized) is good for summarization
    const MODEL = 'Xenova/distilbart-cnn-6-6';

    const handleSummarize = () => {
        if (!input.trim()) return;
        run('summarization', MODEL, input);
    };

    const copyToClipboard = () => {
        if (!result.output) return;
        const text = Array.isArray(result.output) ? result.output[0].summary_text : result.output.summary_text;
        navigator.clipboard.writeText(text);
        toast.success("Summary copied!");
    };

    const isLoading = result.status === 'loading' || result.status === 'processing';
    const progress = result.progress;

    return (
        <div className="container mx-auto max-w-5xl py-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Sparkles className="h-8 w-8 text-primary" />
                    AI Summarizer
                </h1>
                <p className="text-muted-foreground">
                    Summarize long text instantly using on-device AI. Private & Offline.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Input */}
                <Card className="flex flex-col h-[500px]">
                    <CardHeader>
                        <CardTitle className="text-base">Input Text</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 relative">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste long article, email, or report here..."
                            className="h-full w-full resize-none border-0 focus-visible:ring-0 p-4 font-mono text-sm leading-relaxed"
                        />
                    </CardContent>
                </Card>

                {/* Output */}
                <Card className="flex flex-col h-[500px] bg-muted/30 relative overflow-hidden">
                    <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0 z-10">
                        <CardTitle className="text-base">Summary</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button size="sm" onClick={handleSummarize} disabled={!input || isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                Summarize
                            </Button>
                            <Button size="icon" variant="secondary" onClick={copyToClipboard} disabled={!result.output}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-4 relative z-10 overflow-auto">
                        {isLoading && progress?.status === 'progress' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-20 space-y-4 p-4 text-center">
                                <p className="font-medium text-sm">Downloading AI Model...</p>
                                <Progress value={progress.progress} className="w-[60%]" />
                                <p className="text-xs text-muted-foreground">{progress.file} ({Math.round(progress.loaded! / 1024 / 1024)}MB / {Math.round(progress.total! / 1024 / 1024)}MB)</p>
                                <p className="text-xs text-muted-foreground">This only happens once.</p>
                            </div>
                        )}
                        {isLoading && (!progress || progress.status === 'done') && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <span className="text-sm font-medium">Generating Summary...</span>
                                </div>
                            </div>
                        )}

                        {result.error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                                <span>{result.error}</span>
                            </div>
                        )}

                        {result.output ? (
                            <div className="prose dark:prose-invert text-sm leading-relaxed">
                                {Array.isArray(result.output) ? result.output[0].summary_text : result.output.summary_text}
                            </div>
                        ) : (
                            !isLoading && <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                                Summary will appear here...
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
