import { Metadata } from 'next';
import WatermarkWrapper from "./wrapper";

export const metadata: Metadata = {
    title: 'Add Watermark - Protect PDFs with Text or Images',
    description: 'Stamp your PDF documents with custom text or image watermarks. Adjust opacity, rotation, and position.',
};

export default function WatermarkPage() {
    return <WatermarkWrapper />;
}
