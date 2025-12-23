import { Metadata } from 'next';
import PdfToJpgWrapper from "./wrapper";

export const metadata: Metadata = {
    title: 'PDF to JPG - Convert PDF Pages to Images',
    description: 'Convert PDF pages into high-quality JPG or PNG images. Select specific pages or convert all at once. Free and secure.',
};

export default function PdfToJpgPage() {
    return <PdfToJpgWrapper />;
}
