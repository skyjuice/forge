
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { Loader2, Download, FileText, Trash2, Undo, Check, Move, Maximize2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { Document, Page, pdfjs } from 'react-pdf';
// @ts-ignore
import 'pdfjs-dist/build/pdf.worker.min.mjs';

import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function SignPdfClient() {
    const [file, setFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState(1.0);
    const [processing, setProcessing] = useState(false);

    // Signature
    const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
    const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [signatureImage, setSignatureImage] = useState<string | null>(null);
    const [typedName, setTypedName] = useState("");

    // Dragging & Resizing
    const [signaturePosition, setSignaturePosition] = useState({ x: 50, y: 50 });
    const [signatureSize, setSignatureSize] = useState({ width: 150, height: 75 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const resizeStartPos = useRef({ x: 0, y: 0, width: 0, height: 0 });
    const pdfPageRef = useRef<HTMLDivElement>(null);

    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    // Initialize signature canvas
    useEffect(() => {
        const canvas = signatureCanvasRef.current;
        if (canvas) {
            canvas.width = 400;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = "blue"; // Standard ink color
                ctx.lineWidth = 2;
                ctx.lineCap = "round";
            }
        }
    }, [signatureMode]);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const handleFiles = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setDownloadUrl(null);
            setPageNumber(1);
            setSignaturePosition({ x: 50, y: 50 });
            setSignatureSize({ width: 150, height: 75 });
        }
    };

    // Signature Drawing Logic
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = signatureCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        const { x, y } = getCoordinates(e, canvas);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = signatureCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoordinates(e, canvas);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };

    const clearSignature = () => {
        const canvas = signatureCanvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const saveSignature = () => {
        if (signatureMode === 'draw') {
            const canvas = signatureCanvasRef.current;
            if (canvas) {
                setSignatureImage(canvas.toDataURL());
            }
        } else {
            // Convert typed text to image
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.font = "italic 48px serif"; // Cursive-ish
                ctx.fillStyle = "blue";
                ctx.fillText(typedName, 20, 70);
                setSignatureImage(canvas.toDataURL());
            }
        }
    };

    // Dragging Logic
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);

        // Calculate the mouse/touch position relative to the viewport
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        // Store the offset from the element's current position to the mouse
        dragStartPos.current = {
            x: clientX - signaturePosition.x,
            y: clientY - signaturePosition.y
        };
    };

    // Resizing Logic
    const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        resizeStartPos.current = {
            x: clientX,
            y: clientY,
            width: signatureSize.width,
            height: signatureSize.height
        };
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging && !isResizing) return;

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        if (isDragging && pdfPageRef.current) {
            const containerRect = pdfPageRef.current.getBoundingClientRect();

            let newX = clientX - dragStartPos.current.x;
            let newY = clientY - dragStartPos.current.y;

            // Boundary constraints
            newX = Math.max(0, Math.min(newX, containerRect.width - signatureSize.width));
            newY = Math.max(0, Math.min(newY, containerRect.height - signatureSize.height));

            setSignaturePosition({ x: newX, y: newY });
        } else if (isResizing) {
            const deltaX = clientX - resizeStartPos.current.x;
            // Lock aspect ratio logic can be skipped for freedom or enforced.
            // Let's allow free resizing for now, or just width based aspect ratio lock to keep it simple.

            // Let's implement width aspect ratio lock
            const newWidth = Math.max(50, resizeStartPos.current.width + deltaX);
            const aspectRatio = resizeStartPos.current.width / resizeStartPos.current.height;
            const newHeight = newWidth / aspectRatio;

            setSignatureSize({ width: newWidth, height: newHeight });
        }
    };

    const handleEnd = () => {
        setIsDragging(false);
        setIsResizing(false);
    };


    const handleSignPdf = async () => {
        if (!file || !signatureImage) return;
        setProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // Embed the signature image
            const signatureImageBytes = await fetch(signatureImage).then(res => res.arrayBuffer());
            const signatureImageEmbed = await pdfDoc.embedPng(signatureImageBytes);

            // Get the current page
            const pages = pdfDoc.getPages();
            const currentPageIndex = pageNumber - 1;
            const page = pages[currentPageIndex];

            // Calculate final position
            const visualPage = pdfPageRef.current;
            if (!visualPage) throw new Error("PDF page not rendered");

            const { width: visualWidth } = visualPage.getBoundingClientRect();
            const { width: pdfWidth, height: pdfHeight } = page.getSize();

            // Scale factors
            const scaleX = pdfWidth / visualWidth;
            const scaleY = pdfHeight / (visualPage.getBoundingClientRect().height);

            const finalWidth = signatureSize.width * scaleX;
            const finalHeight = signatureSize.height * scaleY;

            // Coordinate conversion
            const pdfX = signaturePosition.x * scaleX;
            // pdfY is bottom-up
            const pdfY = pdfHeight - (signaturePosition.y * scaleY) - finalHeight;

            page.drawImage(signatureImageEmbed, {
                x: pdfX,
                y: pdfY,
                width: finalWidth,
                height: finalHeight,
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);

        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 select-none"
            onMouseMove={handleMove as any}
            onMouseUp={handleEnd}
            onTouchMove={handleMove as any}
            onTouchEnd={handleEnd}
        >
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Sign PDF</h1>
                <p className="text-muted-foreground">
                    Create your signature and drag it to the desired position.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: PDF Viewer */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="h-full">
                        <CardContent className="p-4 min-h-[500px] flex flex-col items-center justify-center bg-muted/20 relative">
                            {!file ? (
                                <Dropzone onFilesSelected={handleFiles} accept=".pdf" maxFiles={1} className="h-64 w-full" />
                            ) : (
                                <div className="w-full flex flex-col items-center gap-4 relative">
                                    <div className="border rounded shadow-lg max-h-[80vh] overflow-auto relative bg-gray-500 p-4">
                                        <div className="relative inline-block" ref={pdfPageRef}>
                                            <Document
                                                file={file}
                                                onLoadSuccess={onDocumentLoadSuccess}
                                                loading={<div className="p-10"><Loader2 className="animate-spin" /></div>}
                                            >
                                                <Page
                                                    pageNumber={pageNumber}
                                                    scale={scale}
                                                    renderTextLayer={false}
                                                    renderAnnotationLayer={false}
                                                />
                                            </Document>

                                            {/* Draggable & Resizable Signature Overlay */}
                                            {signatureImage && (
                                                <div
                                                    className="absolute cursor-move z-10 border-2 border-blue-500 border-dashed hover:bg-blue-500/10 transition-colors group"
                                                    style={{
                                                        left: signaturePosition.x,
                                                        top: signaturePosition.y,
                                                        width: signatureSize.width,
                                                        height: signatureSize.height,
                                                    }}
                                                    onMouseDown={handleDragStart}
                                                    onTouchStart={handleDragStart}
                                                >
                                                    {/* Move Handle Label */}
                                                    <div className="absolute -top-6 left-0 bg-blue-500 text-white text-[10px] px-1 rounded flex items-center opacity-70 group-hover:opacity-100 transition-opacity">
                                                        <Move className="h-3 w-3 mr-1" /> Drag & Resize
                                                    </div>

                                                    {/* Image */}
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={signatureImage} alt="Signature" className="w-full h-full object-contain pointer-events-none" />

                                                    {/* Resize Handle */}
                                                    <div
                                                        className="absolute -bottom-2 -right-2 w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize flex items-center justify-center shadow-sm z-20"
                                                        onMouseDown={handleResizeStart}
                                                        onTouchStart={handleResizeStart}
                                                    >
                                                        <Maximize2 className="h-3 w-3 text-blue-500 transform rotate-90" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-2 bg-background border rounded-lg shadow-sm z-20">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                                            disabled={pageNumber <= 1}
                                        >
                                            Previous
                                        </Button>
                                        <span className="text-sm">
                                            Page {pageNumber} of {numPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                                            disabled={pageNumber >= numPages}
                                        >
                                            Next
                                        </Button>
                                        <div className="w-px h-4 bg-border" />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setFile(null)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Controls */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Signature</CardTitle>
                            <CardDescription>Create your signature to stamp.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Tabs value={signatureMode} onValueChange={(v: any) => setSignatureMode(v)}>
                                <TabsList className="w-full">
                                    <TabsTrigger value="draw" className="flex-1">Draw</TabsTrigger>
                                    <TabsTrigger value="type" className="flex-1">Type</TabsTrigger>
                                </TabsList>

                                <TabsContent value="draw" className="space-y-4">
                                    <div className="border rounded-md bg-white">
                                        <canvas
                                            ref={signatureCanvasRef}
                                            className="w-full h-32 touch-none cursor-crosshair"
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseLeave={stopDrawing}
                                            onTouchStart={startDrawing}
                                            onTouchMove={draw}
                                            onTouchEnd={stopDrawing}
                                        />
                                    </div>
                                    <Button variant="outline" size="sm" onClick={clearSignature} className="w-full">
                                        <Undo className="mr-2 h-4 w-4" /> Clear
                                    </Button>
                                </TabsContent>

                                <TabsContent value="type" className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <input
                                            type="text"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="John Doe"
                                            value={typedName}
                                            onChange={(e) => setTypedName(e.target.value)}
                                            style={{ fontFamily: 'serif', fontStyle: 'italic' }}
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <Button onClick={saveSignature} className="w-full" variant="secondary">
                                <Check className="mr-2 h-4 w-4" /> Use This Signature
                            </Button>

                            <p className="text-xs text-muted-foreground">
                                Click "Use This Signature" to place it on the PDF. Then drag and resize it.
                            </p>

                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Finish</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {downloadUrl ? (
                                <Button className="w-full" size="lg" asChild>
                                    <a href={downloadUrl} download={`signed_${file?.name}`}>
                                        <Download className="mr-2 h-4 w-4" /> Download Signed PDF
                                    </a>
                                </Button>
                            ) : (
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleSignPdf}
                                    disabled={!file || !signatureImage || processing}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="mr-2 h-4 w-4" /> Sign Document
                                        </>
                                    )}
                                </Button>
                            )}
                            <p className="text-xs text-muted-foreground text-center">
                                Tip: The signature will be placed exactly where you position it on the current page.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
