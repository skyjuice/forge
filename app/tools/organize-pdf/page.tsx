import { Metadata } from 'next';
import OrganizePdfWrapper from "./wrapper";

export const metadata: Metadata = {
    title: 'Organize PDF - Rearrange, Delete, and Rotate Pages',
    description: 'Reorder pages, delete pages, or rotate specific pages in your PDF file. Client-side, secure, and free.',
};

export default function OrganizePdfPage() {
    return <OrganizePdfWrapper />;
}
