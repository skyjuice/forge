import { Metadata } from 'next';
import BackgroundRemoverWrapper from "./wrapper";

export const metadata: Metadata = {
    title: 'Background Remover - Remove Image Background Free',
    description: 'Remove backgrounds from images instantly. Make backgrounds transparent or replace with white color securely in your browser.',
};

export default function BackgroundRemoverPage() {
    return <BackgroundRemoverWrapper />;
}
