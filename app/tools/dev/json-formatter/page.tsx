"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, FileJson, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";

export default function JsonFormatterPage() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleFormat = () => {
        try {
            if (!input.trim()) {
                setOutput("");
                return;
            }
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, 2));
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setOutput("");
        }
    };

    const handleMinify = () => {
        try {
            if (!input.trim()) {
                setOutput("");
                return;
            }
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed));
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setOutput("");
        }
    };

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        toast.success("Copied to clipboard!");
    };

    return (
        <div className="container mx-auto max-w-[1400px] py-8 space-y-8 lg:h-[calc(100dvh-100px)] h-auto flex flex-col">
            <div className="space-y-2 shrink-0">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <FileJson className="h-8 w-8 text-primary" />
                    JSON Formatter
                </h1>
                <p className="text-muted-foreground">
                    Prettify, minify, and validate your JSON data.
                    <span className="text-xs ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-100">Client-Side (Private)</span>
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-4 flex-1 min-h-0">
                {/* Input */}
                <Card className="flex flex-col lg:h-full h-[500px] border-muted-foreground/20 shadow-sm overflow-hidden">
                    <CardHeader className="py-3 px-4 bg-muted/30 border-b flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Input JSON</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 relative h-full">
                        <Editor
                            height="100%"
                            defaultLanguage="json"
                            theme="vs-dark"
                            value={input}
                            onChange={(value) => setInput(value || "")}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                wordWrap: 'on',
                                automaticLayout: true,
                                padding: { top: 16, bottom: 16 },
                                scrollBeyondLastLine: false,
                            }}
                        />
                        {error && (
                            <div className="absolute bottom-4 left-4 right-4 bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 flex items-start gap-2 z-10 backdrop-blur-sm">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <span className="font-mono break-all">{error}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Output */}
                <Card className="flex flex-col lg:h-full h-[500px] border-muted-foreground/20 shadow-sm overflow-hidden">
                    <CardHeader className="py-3 px-4 bg-muted/30 border-b flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Output</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handleMinify} disabled={!input}>
                                Minify
                            </Button>
                            <Button size="sm" className="h-7 text-xs" onClick={handleFormat} disabled={!input}>
                                Format (Beautify)
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={copyToClipboard} disabled={!output} title="Copy Output">
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 h-full relative">
                        <div className="absolute inset-0">
                            <Editor
                                height="100%"
                                defaultLanguage="json"
                                theme="vs-dark"
                                value={output}
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    wordWrap: 'on',
                                    automaticLayout: true,
                                    padding: { top: 16, bottom: 16 },
                                    scrollBeyondLastLine: false,
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
