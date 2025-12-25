
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { useAIWorker } from "@/hooks/use-ai-worker";
import { Progress } from "@/components/ui/progress";

export default function SummarizerPage() {
    const [text, setText] = useState("");
    const { status, process } = useAIWorker();

    const handleSummarize = () => {
        if (!text) return;
        process('summarization', 'Xenova/distilbart-cnn-6-6', text);
    };

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">AI Summarizer</h1>
                <p className="text-muted-foreground">
                    Summarize long text into concise summaries using local AI.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Input Text</CardTitle>
                    <CardDescription>Paste the text you want to summarize below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="Enter text to summarize..."
                        className="min-h-[200px]"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />

                    <Button
                        onClick={handleSummarize}
                        disabled={status.status === 'processing' || status.status === 'loading' || !text}
                        className="w-full"
                    >
                        {status.status === 'processing' || status.status === 'loading' ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {status.status === 'loading' ? 'Loading Model...' : 'Summarizing...'}
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" /> Summarize
                            </>
                        )}
                    </Button>

                    {status.status === 'loading' && (
                        <div className="space-y-2">
                            <div className="text-xs text-muted-foreground flex justify-between">
                                <span>Loading model: {status.file}</span>
                                <span>{status.progress ? Math.round(status.progress) : 0}%</span>
                            </div>
                            <Progress value={status.progress} />
                        </div>
                    )}

                    {status.status === 'error' && (
                        <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm">
                            Error: {status.error}
                        </div>
                    )}

                    {status.status === 'complete' && status.output && (
                        <div className="mt-8 space-y-2">
                            <h3 className="text-lg font-semibold">Summary</h3>
                            <div className="p-4 bg-muted rounded-md text-sm leading-relaxed">
                                {Array.isArray(status.output) ? status.output[0].summary_text : JSON.stringify(status.output)}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
