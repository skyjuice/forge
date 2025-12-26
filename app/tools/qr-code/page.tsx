"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Download, Copy, Scan, QrCode, Upload, RefreshCw, X, Camera } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function QRCodePage() {
    const [mode, setMode] = useState<"generate" | "scan">("generate");

    // Generator State
    const [qrValue, setQrValue] = useState("https://ibuforge.com");
    const [qrSize, setQrSize] = useState(256);
    const [fgColor, setFgColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [logoSize, setLogoSize] = useState(24);
    const canvasRef = useRef<HTMLDivElement>(null);

    // Scanner State
    const [scanResult, setScanResult] = useState<string | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // Scanner Lifecycle
    useEffect(() => {
        if (mode === "scan" && !scannerRef.current) {
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                supportedScanTypes: [Html5QrcodeSupportedFormats.QR_CODE]
            };

            // Html5QrcodeScanner constructor takes element ID
            // We need to wait for render.
            setTimeout(() => {
                try {
                    const scanner = new Html5QrcodeScanner(
                        "reader",
                        config,
                         /* verbose= */ false
                    );

                    scanner.render(
                        (decodedText) => {
                            setScanResult(decodedText);
                            toast.success("QR Code detected!");
                            // Optional: stop scanning after success?
                            // scanner.clear();
                        },
                        (error) => {
                            // console.warn(error);
                        }
                    );
                    scannerRef.current = scanner;
                } catch (e) {
                    console.error("Scanner init error", e);
                }
            }, 100);
        }

        return () => {
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
                } catch (e) {
                    // ignore
                }
                scannerRef.current = null;
            }
        };
    }, [mode]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setLogoUrl(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const downloadQRCode = (extension: "png" | "svg") => {
        if (!canvasRef.current) return;

        if (extension === "svg") {
            const svg = canvasRef.current.querySelector("svg");
            if (!svg) return;
            const svgData = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `qrcode.svg`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            const canvas = canvasRef.current.querySelector("canvas");
            if (!canvas) return;
            const url = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = url;
            a.download = `qrcode.png`;
            a.click();
        }
        toast.success(`Downloaded as ${extension.toUpperCase()}`);
    };

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">QR Code Studio</h1>
                <p className="text-muted-foreground">
                    Generate custom QR codes and scan them privately.
                </p>
            </div>

            <Tabs defaultValue="generate" onValueChange={(v) => setMode(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] mx-auto mb-8">
                    <TabsTrigger value="generate">Generate</TabsTrigger>
                    <TabsTrigger value="scan">Scan</TabsTrigger>
                </TabsList>

                <TabsContent value="generate" className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuration</CardTitle>
                                <CardDescription>Customize your QR code.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Content (URL or Text)</Label>
                                    <Textarea
                                        value={qrValue}
                                        onChange={(e) => setQrValue(e.target.value)}
                                        placeholder="https://example.com"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Size ({qrSize}px)</Label>
                                        <Slider
                                            value={[qrSize]}
                                            onValueChange={(v) => setQrSize(v[0])}
                                            min={128}
                                            max={512}
                                            step={16}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Foreground</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={fgColor}
                                                onChange={(e) => setFgColor(e.target.value)}
                                                className="w-12 p-1 h-10"
                                            />
                                            <Input
                                                value={fgColor}
                                                onChange={(e) => setFgColor(e.target.value)}
                                                className="flex-1 font-mono uppercase"
                                                maxLength={7}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Background</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={bgColor}
                                                onChange={(e) => setBgColor(e.target.value)}
                                                className="w-12 p-1 h-10"
                                            />
                                            <Input
                                                value={bgColor}
                                                onChange={(e) => setBgColor(e.target.value)}
                                                className="flex-1 font-mono uppercase"
                                                maxLength={7}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle>Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col items-center justify-center gap-8 min-h-[300px]">
                                <div className="p-4 border rounded-lg bg-white/5" ref={canvasRef}>
                                    {/* Render both but hide one to enable download of specific format if needed */}
                                    {/* Actually common practice is just use Canvas for PNG and SVG for SVG download */}
                                    {/* qrcode.react renders one or the other based on prop */}

                                    {/* Visual Preview */}
                                    <QRCodeCanvas
                                        value={qrValue}
                                        size={qrSize}
                                        fgColor={fgColor}
                                        bgColor={bgColor}
                                        includeMargin
                                    />

                                    {/* Hidden SVG for download purposes */}
                                    <div className="hidden">
                                        <QRCodeSVG
                                            value={qrValue}
                                            size={qrSize}
                                            fgColor={fgColor}
                                            bgColor={bgColor}
                                            includeMargin
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full">
                                    <Button variant="outline" className="flex-1" onClick={() => downloadQRCode('svg')}>
                                        Download SVG
                                    </Button>
                                    <Button className="flex-1" onClick={() => downloadQRCode('png')}>
                                        <Download className="mr-2 h-4 w-4" /> Download PNG
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="scan">
                    <Card>
                        <CardHeader>
                            <CardTitle>Scanner</CardTitle>
                            <CardDescription>Use your camera to scan a QR code.</CardDescription>
                        </CardHeader>
                        <CardContent className="max-w-md mx-auto space-y-6">
                            <div id="reader" className="overflow-hidden rounded-lg border bg-black/5 dark:bg-black/20"></div>

                            {scanResult && (
                                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-center space-y-4">
                                    <p className="font-medium text-lg text-primary break-all">{scanResult}</p>
                                    <Button onClick={() => {
                                        navigator.clipboard.writeText(scanResult);
                                        toast.success("Copied to clipboard");
                                    }} variant="outline" size="sm">
                                        <Copy className="mr-2 h-4 w-4" /> Copy Content
                                    </Button>
                                </div>
                            )}

                            {!scanResult && (
                                <p className="text-sm text-center text-muted-foreground flex items-center justify-center gap-2">
                                    <Camera className="h-4 w-4" /> Ensure camera permissions are allowed.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
