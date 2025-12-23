import { Metadata } from 'next';
import ImageConverterWrapper from "./wrapper";

export const metadata: Metadata = {
    title: 'Image Converter - JPG, PNG, WebP Converter',
    description: 'Convert images between JPG, PNG, and WebP formats for free in your browser. Batch conversion supported. No file uploads.',
};

export default function ImageConverterPage() {
    return <ImageConverterWrapper />;
}
