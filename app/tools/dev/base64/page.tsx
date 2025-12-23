"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCode, Copy, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

export default function Base64Page() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [mode, setMode] = useState("encode");

    const process = (text: string, currentMode: string) => {
        setInput(text);
        if (!text) {
            setOutput("");
            return;
        }
        try {
            if (currentMode === "encode") {
                setOutput(btoa(text));
            } else {
                setOutput(atob(text));
            }
        } catch (e) {
            setOutput("Invalid Base64 string");
        }
    };

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        toast.success("Copied to clipboard!");
    };

    return (
        <div className="container mx-auto max-w-4xl py-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <FileCode className="h-8 w-8 text-primary" />
                    Base64 Converter
                </h1>
                <p className="text-muted-foreground">
                    Encode and decode Base64 strings securely.
                </p>
            </div>

            <Tabs defaultValue="encode" onValueChange={(val) => { setMode(val); process(input, val); }} className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="encode">Encode</TabsTrigger>
                        <TabsTrigger value="decode">Decode</TabsTrigger>
                    </TabsList>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Input ({mode === "encode" ? "Text" : "Base64"})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={input}
                                onChange={(e) => process(e.target.value, mode)}
                                placeholder={mode === "encode" ? "Type text to encode..." : "Paste Base64 to decode..."}
                                className="min-h-[300px] font-mono resize-none"
                            />
                        </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Output ({mode === "encode" ? "Base64" : "Text"})</CardTitle>
                            <Button size="icon" variant="ghost" onClick={copyToClipboard} disabled={!output}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={output}
                                readOnly
                                className="min-h-[300px] font-mono resize-none bg-transparent"
                            />
                        </CardContent>
                    </Card>
                </div>
            </Tabs>
        </div>
    );
}
