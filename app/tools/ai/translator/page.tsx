
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Languages } from "lucide-react";
import { useAIWorker } from "@/hooks/use-ai-worker";
import { Progress } from "@/components/ui/progress";

const LANGUAGES = [
    { name: "English", code: "eng_Latn" },
    { name: "Malay", code: "zsm_Latn" },
    { name: "Chinese (Simplified)", code: "zho_Hans" },
    { name: "Spanish", code: "spa_Latn" },
    { name: "French", code: "fra_Latn" },
    { name: "German", code: "deu_Latn" },
    { name: "Japanese", code: "jpn_Jpan" },
];

export default function TranslatorPage() {
    const [text, setText] = useState("");
    const [sourceLang, setSourceLang] = useState("eng_Latn");
    const [targetLang, setTargetLang] = useState("zsm_Latn");
    const { status, process } = useAIWorker();

    const handleTranslate = () => {
        if (!text) return;
        process('translation', 'Xenova/nllb-200-distilled-600M', {
            text,
            options: {
                src_lang: sourceLang,
                tgt_lang: targetLang,
            }
        });
    };

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">AI Translator</h1>
                <p className="text-muted-foreground">
                    Translate text between languages privately in your browser.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Translation</CardTitle>
                    <CardDescription>Select languages and enter text.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">From</label>
                            <Select value={sourceLang} onValueChange={setSourceLang}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {LANGUAGES.map(lang => (
                                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">To</label>
                            <Select value={targetLang} onValueChange={setTargetLang}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {LANGUAGES.map(lang => (
                                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Textarea
                        placeholder="Enter text to translate..."
                        className="min-h-[150px]"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />

                    <Button
                        onClick={handleTranslate}
                        disabled={status.status === 'processing' || status.status === 'loading' || !text}
                        className="w-full"
                    >
                        {status.status === 'processing' || status.status === 'loading' ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {status.status === 'loading' ? 'Loading Model...' : 'Translating...'}
                            </>
                        ) : (
                            <>
                                <Languages className="mr-2 h-4 w-4" /> Translate
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
                            <div className="p-4 bg-muted rounded-md text-sm leading-relaxed">
                                {Array.isArray(status.output) ? status.output[0].translation_text : JSON.stringify(status.output)}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
