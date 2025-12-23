import { Metadata } from 'next';
import ImageCompressorWrapper from "./wrapper";

export const metadata: Metadata = {
    title: 'Image Compressor - Compress JPG, PNG Online',
    description: 'Reduce image file size instantly. Optimize images for the web securely in your browser without uploading.',
};

export default function ImageCompressorPage() {
    return <ImageCompressorWrapper />;
}
