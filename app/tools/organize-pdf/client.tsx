"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { Loader2, RotateCw, Trash2, Download, ArrowRight, X, FileType2, RotateCcw } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

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

// Set worker source to CDN to avoid build issues with Next.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PageItem {
    id: string; // unique id for dnd
    originalIndex: number;
    rotation: number;
}

// Sortable Item Component
function SortablePage({ id, pageItem, onRemove, onRotate }: {
    id: string,
    pageItem: PageItem,
    onRemove: (id: string) => void,
    onRotate: (id: string) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : "auto",
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group touch-none">
            <div
                className="shadow-md rounded overflow-hidden bg-white border cursor-grab active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                <div style={{ transform: `rotate(${pageItem.rotation}deg)`, transition: 'transform 0.3s' }}>
                    <Page
                        pageNumber={pageItem.originalIndex + 1}
                        width={150}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        error={<div className="w-[150px] h-[200px] flex items-center justify-center text-xs text-red-500">Error</div>}
                        loading={<div className="w-[150px] h-[200px] flex items-center justify-center bg-gray-100"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>}
                    />
                </div>
            </div>

            {/* Overlay Actions */}
            <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6 rounded-full shadow-sm"
                    onClick={(e) => { e.stopPropagation(); onRemove(id); }}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>

            <div className="absolute bottom-1 right-1 flex flex-col gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-6 w-6 rounded-full shadow-sm"
                    onClick={(e) => { e.stopPropagation(); onRotate(id); }}
                >
                    <RotateCw className="h-3 w-3" />
                </Button>
            </div>

            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none">
                {pageItem.originalIndex + 1}
            </div>
        </div>
    );
}

export default function OrganizePdfClient() {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PageItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        const initialPages: PageItem[] = [];
        for (let i = 0; i < numPages; i++) {
            initialPages.push({
                id: `page-${i}`,
                originalIndex: i,
                rotation: 0
            });
        }
        setPages(initialPages);
    };

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setPages((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
        setActiveId(null);
    };

    const handleRemove = (id: string) => {
        setPages(prev => prev.filter(p => p.id !== id));
    };

    const handleRotate = (id: string) => {
        setPages(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, rotation: (p.rotation + 90) % 360 };
            }
            return p;
        }));
    };

    const handleProcess = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setDownloadUrl(null);

        const pageOrder = pages.map(p => ({
            index: p.originalIndex,
            rotation: p.rotation
        }));

        const formData = new FormData();
        formData.append("file", file);
        formData.append("pageOrder", JSON.stringify(pageOrder));

        try {
            const res = await fetch("/api/tools/pdf/organize", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error(await res.text() || "Organization failed");
            }

            const data = await res.json();
            setDownloadUrl(data.url);
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-6xl mx-auto py-12 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Organize PDF</h1>
                <p className="text-muted-foreground">
                    Sort, delete, and rotate pages of your PDF file.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Organize Pages</CardTitle>
                    <CardDescription>Drag and drop pages to reorder.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!file ? (
                        <Dropzone
                            accept=".pdf"
                            maxFiles={1}
                            onFilesSelected={(files) => {
                                if (files.length > 0) {
                                    setFile(files[0]);
                                    setDownloadUrl(null);
                                    setError(null);
                                    setPages([]);
                                }
                            }}
                        />
                    ) : (
                        <div className="space-y-6">
                            {/* Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="bg-primary/10 p-2 rounded">
                                        <FileType2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium truncate max-w-[150px] sm:max-w-xs">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{pages.length} pages selected</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-destructive hover:text-destructive">
                                    Remove File
                                </Button>
                            </div>

                            {/* Dnd Sortable Grid */}
                            <div className="bg-slate-100/50 dark:bg-slate-900/50 p-6 rounded-xl border min-h-[300px]">
                                {pages.length > 0 ? (
                                    <Document
                                        file={file}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        className="min-h-[300px]"
                                        loading={<div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>}
                                    >
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragStart={handleDragStart}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext items={pages.map(p => p.id)} strategy={rectSortingStrategy}>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                                    {pages.map((page) => (
                                                        <SortablePage
                                                            key={page.id}
                                                            id={page.id}
                                                            pageItem={page}
                                                            onRemove={handleRemove}
                                                            onRotate={handleRotate}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>

                                            <DragOverlay>
                                                {activeId ? (
                                                    <div className="shadow-2xl rounded opacity-80 cursor-grabbing bg-white border p-1">
                                                        <div className="w-[150px] h-[200px] bg-gray-200 flex items-center justify-center text-sm font-medium">
                                                            Moving...
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </DragOverlay>
                                        </DndContext>
                                    </Document>
                                ) : (
                                    <Document
                                        file={file}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        className="flex justify-center p-10"
                                        loading={<div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>}
                                    >
                                        {pages.length === 0 && !loading && "Loading pages..."}
                                    </Document>
                                )}
                            </div>

                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                                    <X className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            {downloadUrl ? (
                                <Button className="w-full" size="lg" asChild>
                                    <a href={downloadUrl} download>
                                        <Download className="mr-2 h-4 w-4" /> Download Organized PDF
                                    </a>
                                </Button>
                            ) : (
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleProcess}
                                    disabled={loading || pages.length === 0}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Organize <ArrowRight className="ml-2 h-4 w-4" />
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
