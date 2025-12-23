"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Languages, Sparkles, AlertCircle, Copy, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAI } from "@/hooks/use-ai";

const LANGUAGES = [
    { code: "eng_Latn", name: "English" },
    { code: "spa_Latn", name: "Spanish" },
    { code: "fra_Latn", name: "French" },
    { code: "deu_Latn", name: "German" },
    { code: "zho_Hans", name: "Chinese (Simplified)" },
    { code: "jpn_Jpan", name: "Japanese" },
    { code: "rus_Cyrl", name: "Russian" },
    { code: "por_Latn", name: "Portuguese" },
    { code: "ita_Latn", name: "Italian" },
    { code: "hin_Deva", name: "Hindi" },
];

export default function TranslatorPage() {
    const [input, setInput] = useState("");
    const [sourceLang, setSourceLang] = useState("eng_Latn");
    const [targetLang, setTargetLang] = useState("spa_Latn");
    const { result, run } = useAI();

    // Model: NLLB-200 (600M param, distilled) - Supports 200 languages
    // NOTE: This is large (~600MB+ download)
    const MODEL = 'Xenova/nllb-200-distilled-600M';

    const handleTranslate = () => {
        if (!input.trim()) return;
        run('translation', MODEL, input, {
            source_lang: sourceLang,
            target_lang: targetLang
        });
    };

    const copyToClipboard = () => {
        if (!result.output) return;
        const text = Array.isArray(result.output) ? result.output[0].translation_text : result.output.translation_text;
        navigator.clipboard.writeText(text);
        toast.success("Translation copied!");
    };

    const isLoading = result.status === 'loading' || result.status === 'processing';
    const progress = result.progress;

    const swapLanguages = () => {
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
    }

    return (
        <div className="container mx-auto max-w-5xl py-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Languages className="h-8 w-8 text-primary" />
                    AI Translator
                </h1>
                <p className="text-muted-foreground">
                    Translate text privately.
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-100">Large Model (~600MB)</span>
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Input */}
                <Card className="flex flex-col h-[500px]">
                    <CardHeader className="py-4 flex flex-row items-center justify-between">
                        <Select value={sourceLang} onValueChange={setSourceLang}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Source Language" />
                            </SelectTrigger>
                            <SelectContent>
                                {LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={swapLanguages}>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 relative">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type text to translate..."
                            className="h-full w-full resize-none border-0 focus-visible:ring-0 p-4 font-mono text-sm leading-relaxed"
                        />
                    </CardContent>
                </Card>

                {/* Output */}
                <Card className="flex flex-col h-[500px] bg-muted/30 relative overflow-hidden">
                    <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0 z-10">
                        <Select value={targetLang} onValueChange={setTargetLang}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Target Language" />
                            </SelectTrigger>
                            <SelectContent>
                                {LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                            <Button size="sm" onClick={handleTranslate} disabled={!input || isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                Translate
                            </Button>
                            <Button size="icon" variant="secondary" onClick={copyToClipboard} disabled={!result.output}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-4 relative z-10 overflow-auto">
                        {isLoading && progress?.status === 'progress' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-20 space-y-4 p-4 text-center">
                                <p className="font-medium text-sm">Downloading NLLB Model...</p>
                                <Progress value={progress.progress} className="w-[60%]" />
                                <p className="text-xs text-muted-foreground">{progress.file} ({Math.round(progress.loaded! / 1024 / 1024)}MB / {Math.round(progress.total! / 1024 / 1024)}MB)</p>
                                <p className="text-xs text-muted-foreground font-semibold text-yellow-600 dark:text-yellow-400">This is a large download. Please be patient.</p>
                            </div>
                        )}
                        {isLoading && (!progress || progress.status === 'done') && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <span className="text-sm font-medium">Translating...</span>
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
                            <div className="prose dark:prose-invert text-base leading-relaxed font-medium">
                                {Array.isArray(result.output) ? result.output[0].translation_text : result.output.translation_text}
                            </div>
                        ) : (
                            !isLoading && <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                                Translation will appear here...
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
