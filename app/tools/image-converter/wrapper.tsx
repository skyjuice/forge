"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const ImageConverterClient = dynamic(() => import("./client"), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading Image Converter...</p>
        </div>
    )
});

export default function ImageConverterWrapper() {
    return <ImageConverterClient />;
}
