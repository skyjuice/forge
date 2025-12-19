"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, File, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DropzoneProps {
    onFilesSelected: (files: File[]) => void;
    className?: string;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
}

export function Dropzone({
    onFilesSelected,
    className,
    accept,
    multiple = false,
    maxFiles
}: DropzoneProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.types && e.dataTransfer.types.length > 0 && e.dataTransfer.types.indexOf('Files') !== -1) {
            setIsDragActive(true);
        }
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        // Prevent flickering when dragging over children
        if (e.currentTarget.contains(e.relatedTarget as Node)) {
            return;
        }

        setIsDragActive(false);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types && e.dataTransfer.types.length > 0 && e.dataTransfer.types.indexOf('Files') !== -1) {
            e.dataTransfer.dropEffect = 'copy';
            setIsDragActive(true); // Ensure active state persists
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files);
            // Validate accept type roughly if needed, or rely on parent to handle. 
            // For now, allow parent to validate or just pass through.

            handleFiles(droppedFiles);
        }
    };

    const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            handleFiles(selectedFiles);
        }
    };

    const handleFiles = (files: File[]) => {
        if (!multiple && files.length > 1) {
            onFilesSelected([files[0]]);
        } else {
            if (maxFiles && files.length > maxFiles) {
                onFilesSelected(files.slice(0, maxFiles));
            } else {
                onFilesSelected(files);
            }
        }
        // Reset input so same file can be selected again if needed (though usually controlled by parent state)
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
                "relative flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-lg cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:bg-muted/50",
                className
            )}
        >
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={accept}
                multiple={multiple}
                onChange={handleFileInput}
            />

            <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                <div className={cn("p-4 rounded-full bg-background transition-transform duration-200", isDragActive ? "scale-110" : "")}>
                    <Upload className={cn("h-8 w-8 text-muted-foreground", isDragActive && "text-primary")} />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-lg">
                        {isDragActive ? "Drop files here" : "Click or drag to upload"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {multiple
                            ? `Upload multiple files${accept ? ` (${accept})` : ''}`
                            : `Upload a file${accept ? ` (${accept})` : ''}`
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}
