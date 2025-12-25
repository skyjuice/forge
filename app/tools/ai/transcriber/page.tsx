"use client";

import { useState, useRef } from "react";
import { useAIWorker } from "@/hooks/use-ai-worker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dropzone } from "@/components/ui/dropzone";
import { Loader2, Mic, FileAudio, Download, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export default function TranscriberPage() {
    const { status, process } = useAIWorker();
    const [file, setFile] = useState<File | null>(null);
    const [transcript, setTranscript] = useState("");
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const handleFileSelected = (files: File[]) => {
        if (files.length > 0) {
            const selectedFile = files[0];
            setFile(selectedFile);
            setTranscript("");

            // Create object URL for preview
            const url = URL.createObjectURL(selectedFile);
            setAudioUrl(url);
        }
    };

    const handleTranscribe = async () => {
        if (!file) return;
        setTranscript("");
        toast.info("Decoding audio (this may take a moment)...");

        try {
            const arrayBuffer = await file.arrayBuffer();

            // Standard AudioContext to decode the file
            // Note: We use the prefix for legacy Safari if needed, though most support AudioContext now
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            // OfflineAudioContext to resample to 16000Hz (Whisper requirement)
            const offlineCtx = new OfflineAudioContext(1, audioBuffer.duration * 16000, 16000);
            const source = offlineCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(offlineCtx.destination);
            source.start();

            const resampledBuffer = await offlineCtx.startRendering();
            const pcmData = resampledBuffer.getChannelData(0);

            // Send raw float data to worker
            process("automatic-speech-recognition", "Xenova/whisper-tiny", pcmData);

        } catch (e) {
            console.error("Audio decoding failed", e);
            toast.error("Failed to decode audio. Please try another file.");
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(transcript);
        toast.success("Transcript copied to clipboard");
    };

    const handleDownload = () => {
        const blob = new Blob([transcript], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transcript-${file?.name || "audio"}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Transcript downloaded");
    };

    // Helper to format progress message
    const getProgressMessage = () => {
        if (status.status === 'loading') {
            return `Loading AI Model... ${status.progress ? Math.round(status.progress) + '%' : ''}`;
        }
        if (status.status === 'processing') {
            return "Transcribing audio... (This may take a while)";
        }
        return "";
    };

    // Update transcript when complete
    if (status.status === 'complete' && status.output && status.output.text && status.output.text !== transcript) {
        setTranscript(status.output.text);
    }

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">AI Audio Transcriber</h1>
                <p className="text-muted-foreground">
                    Convert audio to text privately in your browser using OpenAI Whisper.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Input Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Source Audio</CardTitle>
                        <CardDescription>Upload an audio or video file.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {!file ? (
                            <Dropzone
                                accept="audio/*,video/*"
                                maxFiles={1}
                                onFilesSelected={handleFileSelected}
                                className="h-64"
                            />
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="bg-primary/10 p-2 rounded shrink-0">
                                            <FileAudio className="h-5 w-5 text-primary" />
                                        </div>
                                        <p className="font-medium truncate">{file.name}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        setFile(null);
                                        setAudioUrl(null);
                                        setTranscript("");
                                    }} className="text-destructive hover:text-destructive shrink-0">
                                        Remove
                                    </Button>
                                </div>

                                {audioUrl && (
                                    <audio controls className="w-full">
                                        <source src={audioUrl} />
                                        Your browser does not support the audio element.
                                    </audio>
                                )}

                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleTranscribe}
                                    disabled={status.status === 'loading' || status.status === 'processing'}
                                >
                                    {status.status === 'loading' || status.status === 'processing' ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="mr-2 h-4 w-4" /> Start Transcription
                                        </>
                                    )}
                                </Button>

                                {(status.status === 'loading' || status.status === 'processing') && (
                                    <div className="space-y-2">
                                        <Progress value={status.status === 'loading' ? status.progress : undefined} className="h-2" />
                                        <p className="text-xs text-center text-muted-foreground animate-pulse">
                                            {getProgressMessage()}
                                        </p>
                                    </div>
                                )}

                                {status.status === 'error' && (
                                    <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-md">
                                        Error: {status.error}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Output Section */}
                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <CardTitle>Transcript</CardTitle>
                        <CardDescription>Generated text will appear here.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-[300px]">
                        <div className="relative flex-1">
                            <Textarea
                                className="absolute inset-0 resize-none font-mono text-sm leading-relaxed"
                                placeholder="Transcription output..."
                                value={transcript}
                                readOnly
                            />
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleCopy}
                                disabled={!transcript}
                            >
                                <Copy className="mr-2 h-4 w-4" /> Copy
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleDownload}
                                disabled={!transcript}
                            >
                                <Download className="mr-2 h-4 w-4" /> Download
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
