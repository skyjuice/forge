import { Metadata } from 'next';
import ImageResizerWrapper from "./wrapper";

export const metadata: Metadata = {
    title: 'Image Resizer - Resize Images Online Free',
    description: 'Resize JPG, PNG, and WebP images by pixel dimensions. Maintain aspect ratio and resize batches securely in browser.',
};

export default function ImageResizerPage() {
    return <ImageResizerWrapper />;
}
