import type { Metadata } from 'next';
import ConverterWrapper from './wrapper';

export const metadata: Metadata = {
    title: 'Media Converter - IbuForge',
    description: 'Convert audio and video files securely in your browser.',
};

export default function Page() {
    return <ConverterWrapper />;
}
