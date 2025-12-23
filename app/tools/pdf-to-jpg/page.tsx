import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'PDF to JPG - Convert PDF Pages to Images',
    description: 'Convert PDF pages into high-quality JPG or PNG images. Select specific pages or convert all at once. Free and secure.',
};

const PdfToJpgClient = dynamic(() => import("./client"), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading PDF to JPG Tool...</p>
        </div>
    )
});

export default function PdfToJpgPage() {
    return <PdfToJpgClient />;
}
