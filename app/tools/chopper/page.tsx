import type { Metadata } from 'next';
import ChopperWrapper from './wrapper';

export const metadata: Metadata = {
    title: 'Media Chopper - IbuForge',
    description: 'Split long audio and video recordings into segments securely in your browser.',
};

export default function Page() {
    return <ChopperWrapper />;
}
