
import { useState, useEffect, useRef, useCallback } from 'react';

export interface WorkerStatus {
    status: 'idle' | 'loading' | 'processing' | 'complete' | 'error';
    progress?: number;
    file?: string;
    output?: any;
    error?: string;
}

export function useAIWorker(workerPath: string = '/ai-worker.js') {
    const workerRef = useRef<Worker | null>(null);
    const [status, setStatus] = useState<WorkerStatus>({ status: 'idle' });

    useEffect(() => {
        if (!workerRef.current) {
            workerRef.current = new Worker(workerPath, { type: 'module' });

            workerRef.current.addEventListener('message', (e) => {
                const { status, file, progress, output, error } = e.data;

                if (status === 'progress') {
                    setStatus(prev => ({
                        ...prev,
                        status: 'loading',
                        progress,
                        file
                    }));
                } else if (status === 'complete') {
                    setStatus({ status: 'complete', output });
                } else if (status === 'error') {
                    setStatus({ status: 'error', error });
                }
            });
        }

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, [workerPath]);

    const process = useCallback((task: string, model: string, content: any) => {
        if (workerRef.current) {
            setStatus({ status: 'processing', progress: 0 });
            workerRef.current.postMessage({ task, model, content });
        }
    }, []);

    return { status, process };
}
