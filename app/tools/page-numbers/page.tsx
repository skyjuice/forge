import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Add Page Numbers - Number PDF Pages Free',
    description: 'Add page numbers to your PDF documents easily. Choose position and style. Secure client-side processing.',
};

const PageNumbersClient = dynamic(() => import("./client"), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading Tool...</p>
        </div>
    )
});

export default function PageNumbersPage() {
    return <PageNumbersClient />;
}
