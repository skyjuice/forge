
import { useState, useEffect, useRef, useCallback } from 'react';
import { createWorker, Worker } from 'tesseract.js';

export interface OCRStatus {
    status: 'idle' | 'initializing' | 'recognizing' | 'complete' | 'error';
    progress: number;
    text?: string;
    error?: string;
}

export function useOCR() {
    const [status, setStatus] = useState<OCRStatus>({ status: 'idle', progress: 0 });
    const workerRef = useRef<Worker | null>(null);

    const cleanup = useCallback(async () => {
        if (workerRef.current) {
            await workerRef.current.terminate();
            workerRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    const recognize = useCallback(async (imageFile: File | string, language = 'eng') => {
        setStatus({ status: 'initializing', progress: 0 });

        try {
            // Re-create worker if needed (Tesseract recommends new workers for clean state, or reusing if careful)
            if (!workerRef.current) {
                // We use default CDN paths for now which works well with CSP (jsdelivr)
                const worker = await createWorker('eng', 1, {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setStatus(prev => ({
                                ...prev,
                                status: 'recognizing',
                                progress: m.progress * 100
                            }));
                        }
                    }
                });
                workerRef.current = worker;
            }

            setStatus({ status: 'recognizing', progress: 0 });

            // If language changed, we might need to load it? 
            // createWorker('eng') handles it initial. 
            // For multi-lang support we would need to call worker.loadLanguage() and worker.initialize()

            const result = await workerRef.current.recognize(imageFile);

            setStatus({
                status: 'complete',
                progress: 100,
                text: result.data.text
            });

            return result.data.text;

        } catch (err: any) {
            console.error("OCR Error:", err);
            setStatus({ status: 'error', progress: 0, error: err.message || "Failed to process image" });
        }
    }, []);

    return { status, recognize, cleanup };
}
