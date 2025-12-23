import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Merge PDF - Combine PDF Files for Free',
    description: 'Merge multiple PDF files into one document securely in your browser. No file uploads required. Free, fast, and private.',
};

const PdfMergerClient = dynamic(() => import("./client"), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading Merge Tool...</p>
        </div>
    )
});

export default function PdfMergerPage() {
    return <PdfMergerClient />;
}
