import type { Metadata } from 'next';
import CompressorWrapper from './wrapper';

export const metadata: Metadata = {
    title: 'Media Compressor - IbuForge',
    description: 'Compress audio and video files securely in your browser.',
};

export default function Page() {
    return <CompressorWrapper />;
}
