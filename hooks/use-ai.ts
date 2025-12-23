
import { useState, useEffect, useRef, useCallback } from 'react';

export interface AIResult {
    status: 'idle' | 'loading' | 'processing' | 'complete' | 'error';
    progress?: {
        status: string; // 'initiate', 'download', 'progress', 'done'
        name: string;
        file: string;
        progress?: number;
        loaded?: number;
        total?: number;
    };
    output?: any;
    error?: string;
}

export function useAI(workerPath: string = '/lib/ai.worker.js') {
    const workerRef = useRef<Worker | null>(null);
    const [result, setResult] = useState<AIResult>({ status: 'idle' });

    useEffect(() => {
        // Initialize worker
        if (!workerRef.current) {
            // Need to construct worker from file
            // Since app/lib/ai.worker.js is not served as static in Next.js App Router easily without copying,
            // we will assume the caller handles the worker file placement or we use a blob?
            // Actually, best way in App Router is to put worker in `public/` or import as url.
            // For now, let's assume it IS served at `workerPath`.
            // User put file in `app/lib/ai.worker.js` but that won't be accessible as `/lib/ai.worker.js` by browser.
            // I need to MOV it to `public/ai-worker.js` in a next step.
            // I'll assume it's at /ai-worker.js
            workerRef.current = new Worker(new URL('/ai-worker.js', window.location.origin));

            workerRef.current.onmessage = (event) => {
                const { status, data, output, error } = event.data;

                if (status === 'progress') {
                    setResult(prev => ({
                        ...prev,
                        status: 'loading',
                        progress: data
                    }));
                } else if (status === 'complete') {
                    setResult({ status: 'complete', output });
                } else if (status === 'error') {
                    setResult({ status: 'error', error });
                }
            };
        }

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, [workerPath]);

    const run = useCallback((task: string, model: string, text: string, options: any = {}) => {
        setResult({ status: 'loading' });
        if (workerRef.current) {
            workerRef.current.postMessage({ task, model, text, ...options });
        }
    }, []);

    return { result, run };
}
