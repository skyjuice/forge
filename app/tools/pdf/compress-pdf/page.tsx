
import { Metadata } from "next";
import CompressPdfClient from "./client";

export const metadata: Metadata = {
    title: "Compress PDF | IbuForge",
    description: "Reduce PDF file size securely in your browser.",
};

export default function CompressPdfPage() {
    return <CompressPdfClient />;
}
