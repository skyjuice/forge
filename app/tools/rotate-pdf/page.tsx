import { Metadata } from 'next';
import RotatePdfWrapper from "./wrapper";

export const metadata: Metadata = {
    title: 'Rotate PDF - Rotate PDF Pages Free',
    description: 'Rotate individual pages or entire PDF documents permanently. Client-side processing ensures your privacy.',
};

export default function RotatePdfPage() {
    return <RotatePdfWrapper />;
}
