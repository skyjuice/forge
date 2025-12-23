"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { Loader2, Download, X, FileImage, Trash2, ArrowRight } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageFile {
    id: string;
    file: File;
    preview: string;
}

function SortableImage({ image, onRemove }: { image: ImageFile, onRemove: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : "auto",
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group touch-none aspect-[3/4]">
            <div
                className="w-full h-full shadow-md rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border cursor-grab active:cursor-grabbing relative"
                {...attributes}
                {...listeners}
            >
                <img
                    src={image.preview}
                    alt={image.file.name}
                    className="w-full h-full object-contain p-2"
                />

                <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6 rounded-full shadow-sm"
                        onClick={(e) => { e.stopPropagation(); onRemove(image.id); }}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </div>
            <div className="text-xs text-center mt-1 truncate px-1 text-muted-foreground">
                {image.file.name}
            </div>
        </div>
    );
}

export default function JpgToPdfClient() {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleFilesSelected = (files: File[]) => {
        const newImages = files.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            preview: URL.createObjectURL(file)
        }));
        setImages(prev => [...prev, ...newImages]);
        setDownloadUrl(null);
    };

    const handleRemove = (id: string) => {
        setImages(prev => prev.filter(img => img.id !== id));
        setDownloadUrl(null);
    };

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setImages((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
        setActiveId(null);
    };

    const handleCreatePdf = async () => {
        if (images.length === 0) return;
        setLoading(true);

        try {
            const pdfDoc = await PDFDocument.create();

            for (const img of images) {
                const buffer = await img.file.arrayBuffer();
                let pdfImage;

                if (img.file.type === 'image/jpeg' || img.file.type === 'image/jpg') {
                    pdfImage = await pdfDoc.embedJpg(buffer);
                } else if (img.file.type === 'image/png') {
                    pdfImage = await pdfDoc.embedPng(buffer);
                } else {
                    // Fallback or skip? Try PNG if unsure (e.g. unknown type but accepted)
                    try {
                        pdfImage = await pdfDoc.embedPng(buffer);
                    } catch {
                        // If fail, try JPG
                        pdfImage = await pdfDoc.embedJpg(buffer);
                    }
                }

                if (!pdfImage) continue;

                const { width, height } = pdfImage;

                // Create page matching image dimensions
                const page = pdfDoc.addPage([width, height]);
                page.drawImage(pdfImage, {
                    x: 0,
                    y: 0,
                    width,
                    height,
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
        } catch (error) {
            console.error("PDF Creation failed", error);
            // Handle error state if needed
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-6xl mx-auto py-12 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">JPG to PDF</h1>
                <p className="text-muted-foreground">
                    Convert your images to a single PDF document. Drag and drop to reorder.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Image to PDF Converter</CardTitle>
                    <CardDescription>Support for JPG and PNG images.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Dropzone
                        onFilesSelected={handleFilesSelected}
                        accept=".jpg,.jpeg,.png"
                        multiple={true}
                    />

                    {images.length > 0 && (
                        <div className="space-y-6">
                            {/* Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded">
                                        <FileImage className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium">{images.length} images selected</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setImages([])} className="text-destructive hover:text-destructive">
                                    Clear All
                                </Button>
                            </div>

                            {/* Sortable Grid */}
                            <div className="bg-slate-100/50 dark:bg-slate-900/50 p-6 rounded-xl border min-h-[200px]">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext items={images.map(i => i.id)} strategy={rectSortingStrategy}>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                            {images.map((img) => (
                                                <SortableImage
                                                    key={img.id}
                                                    image={img}
                                                    onRemove={handleRemove}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>

                                    <DragOverlay>
                                        {activeId ? (
                                            <div className="bg-white/80 p-2 rounded border shadow-xl w-[150px] h-[200px] flex items-center justify-center">
                                                Moving...
                                            </div>
                                        ) : null}
                                    </DragOverlay>
                                </DndContext>
                            </div>

                            {downloadUrl ? (
                                <Button className="w-full" size="lg" asChild>
                                    <a href={downloadUrl} download="converted.pdf">
                                        <Download className="mr-2 h-4 w-4" /> Download PDF
                                    </a>
                                </Button>
                            ) : (
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleCreatePdf}
                                    disabled={loading || images.length === 0}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating PDF...
                                        </>
                                    ) : (
                                        <>
                                            Convert to PDF <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
