"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Diff, AlertCircle } from "lucide-react";
import * as diff from "diff";

export default function DiffCheckerPage() {
    const [original, setOriginal] = useState("");
    const [modified, setModified] = useState("");
    const [diffResult, setDiffResult] = useState<diff.Change[] | null>(null);

    const handleCompare = () => {
        const changes = diff.diffLines(original, modified);
        setDiffResult(changes);
    };

    return (
        <div className="container mx-auto max-w-6xl py-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Diff className="h-8 w-8 text-primary" />
                    Diff Checker
                </h1>
                <p className="text-muted-foreground">
                    Compare two text blocks and highlight the differences.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-4 lg:h-[600px] h-auto">
                <Card className="flex flex-col lg:h-full h-[300px]">
                    <CardHeader className="py-2 px-4 border-b bg-muted/20">
                        <CardTitle className="text-sm font-medium">Original Text</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <Textarea
                            value={original}
                            onChange={(e) => setOriginal(e.target.value)}
                            placeholder="Paste original text..."
                            className="h-full w-full resize-none border-0 focus-visible:ring-0 p-4 font-mono text-sm leading-relaxed"
                        />
                    </CardContent>
                </Card>
                <Card className="flex flex-col lg:h-full h-[300px]">
                    <CardHeader className="py-2 px-4 border-b bg-muted/20">
                        <CardTitle className="text-sm font-medium">Modified Text</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <Textarea
                            value={modified}
                            onChange={(e) => setModified(e.target.value)}
                            placeholder="Paste modified text..."
                            className="h-full w-full resize-none border-0 focus-visible:ring-0 p-4 font-mono text-sm leading-relaxed"
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-center">
                <Button onClick={handleCompare} size="lg" className="px-8">
                    Compare Text
                </Button>
            </div>

            {diffResult && (
                <Card>
                    <CardHeader className="py-3 bg-muted/30 border-b">
                        <CardTitle className="text-sm font-medium">Comparison Result</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="font-mono text-sm overflow-x-auto p-4 bg-background min-h-[200px] whitespace-pre-wrap">
                            {diffResult.map((part, index) => {
                                let bgClass = "bg-transparent";
                                let textClass = "text-foreground";
                                let prefix = "  ";

                                if (part.added) {
                                    bgClass = "bg-green-100 dark:bg-green-900/40";
                                    textClass = "text-green-800 dark:text-green-200";
                                    prefix = "+ ";
                                } else if (part.removed) {
                                    bgClass = "bg-red-100 dark:bg-red-900/40";
                                    textClass = "text-red-800 dark:text-red-200";
                                    prefix = "- ";
                                }

                                return (
                                    <div key={index} className={`${bgClass} ${textClass}`}>
                                        {part.value}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
