import { Metadata } from 'next';
import PageNumbersWrapper from "./wrapper";

export const metadata: Metadata = {
    title: 'Add Page Numbers - Number PDF Pages Free',
    description: 'Add page numbers to your PDF documents easily. Choose position and style. Secure client-side processing.',
};

export default function PageNumbersPage() {
    return <PageNumbersWrapper />;
}
