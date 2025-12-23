"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Heart, Sparkles, AlertCircle, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { useAI } from "@/hooks/use-ai";

export default function SentimentPage() {
    const [input, setInput] = useState("");
    const { result, run } = useAI();

    // Model: DistilBERT SST-2 (Small and fast)
    const MODEL = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';

    const handleAnalyze = () => {
        if (!input.trim()) return;
        run('text-classification', MODEL, input);
    };

    const isLoading = result.status === 'loading' || result.status === 'processing';
    const progress = result.progress;

    // Helper to extract label/score
    const prediction = result.output ? (Array.isArray(result.output) ? result.output[0] : result.output) : null;
    const isPositive = prediction?.label === 'POSITIVE';
    const score = prediction ? (prediction.score * 100) : 0;

    return (
        <div className="container mx-auto max-w-4xl py-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Heart className="h-8 w-8 text-primary" />
                    AI Sentiment Analysis
                </h1>
                <p className="text-muted-foreground">
                    Analyze the emotional tone of text.
                </p>
            </div>

            <Card className="min-h-[400px]">
                <CardHeader>
                    <CardTitle className="text-base">Input Text</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type something to parse its vibe..."
                        className="min-h-[150px] resize-none text-base p-4"
                    />

                    <div className="flex justify-end">
                        <Button onClick={handleAnalyze} disabled={!input || isLoading} className="w-full sm:w-auto">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                            Analyze Sentiment
                        </Button>
                    </div>

                    {/* Loading State */}
                    {isLoading && progress?.status === 'progress' && (
                        <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Downloading AI Model...</span>
                                <span>{Math.round(progress.progress || 0)}%</span>
                            </div>
                            <Progress value={progress.progress} className="h-2" />
                        </div>
                    )}

                    {/* Error */}
                    {result.error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                            <span>{result.error}</span>
                        </div>
                    )}

                    {/* Result */}
                    {prediction && !isLoading && (
                        <div className="p-6 bg-muted/30 rounded-xl border flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center space-y-2">
                                <h3 className="text-lg font-medium text-muted-foreground">Detected Sentiment</h3>
                                <div className={`flex items-center gap-3 text-4xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                    {isPositive ? <ThumbsUp className="h-10 w-10" /> : <ThumbsDown className="h-10 w-10" />}
                                    {prediction.label}
                                </div>
                            </div>

                            <div className="w-full max-w-md space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>Confidence</span>
                                    <span>{score.toFixed(1)}%</span>
                                </div>
                                <Progress
                                    value={score}
                                    className={`h-3 ${isPositive ? 'bg-green-100 dark:bg-green-900/30 [&>div]:bg-green-600' : 'bg-red-100 dark:bg-red-900/30 [&>div]:bg-red-600'}`}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
