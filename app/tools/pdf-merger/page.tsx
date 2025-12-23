import { Metadata } from 'next';
import PdfMergerWrapper from "./wrapper";

export const metadata: Metadata = {
    title: 'Merge PDF - Combine PDF Files for Free',
    description: 'Merge multiple PDF files into one document securely in your browser. No file uploads required. Free, fast, and private.',
};

export default function PdfMergerPage() {
    return <PdfMergerWrapper />;
}
