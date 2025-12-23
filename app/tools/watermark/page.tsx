import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Add Watermark - Protect PDFs with Text or Images',
    description: 'Stamp your PDF documents with custom text or image watermarks. Adjust opacity, rotation, and position.',
};

const WatermarkClient = dynamic(() => import("./client"), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading Watermark Tool...</p>
        </div>
    )
});

export default function WatermarkPage() {
    return <WatermarkClient />;
}
