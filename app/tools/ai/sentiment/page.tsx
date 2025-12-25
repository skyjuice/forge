
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Smile } from "lucide-react";
import { useAIWorker } from "@/hooks/use-ai-worker";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function SentimentPage() {
    const [text, setText] = useState("");
    const { status, process } = useAIWorker();

    const handleAnalyze = () => {
        if (!text) return;
        process('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', text);
    };

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Sentiment Analysis</h1>
                <p className="text-muted-foreground">
                    Analyze the emotional tone of text.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Input Text</CardTitle>
                    <CardDescription>Enter text to analyze its sentiment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="I love using this amazing tool!"
                        className="min-h-[150px]"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />

                    <Button
                        onClick={handleAnalyze}
                        disabled={status.status === 'processing' || status.status === 'loading' || !text}
                        className="w-full"
                    >
                        {status.status === 'processing' || status.status === 'loading' ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {status.status === 'loading' ? 'Loading Model...' : 'Analyzing...'}
                            </>
                        ) : (
                            <>
                                <Smile className="mr-2 h-4 w-4" /> Analyze Sentiment
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
                            <h3 className="text-lg font-semibold">Result</h3>
                            {Array.isArray(status.output) && status.output.map((result: any, i: number) => (
                                <div key={i} className={cn(
                                    "p-6 rounded-lg border text-center space-y-2",
                                    result.label === 'POSITIVE' ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
                                )}>
                                    <div className={cn(
                                        "text-4xl font-bold",
                                        result.label === 'POSITIVE' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                    )}>
                                        {result.label}
                                    </div>
                                    <div className="text-muted-foreground">
                                        Confidence: <span className="font-mono font-medium">{(result.score * 100).toFixed(2)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
