import { Metadata } from "next";
import SignPdfWrapper from "./wrapper";

export const metadata: Metadata = {
    title: "Sign PDF | IbuForge",
    description: "Sign PDF documents securely in your browser.",
};

export default function SignPdfPage() {
    return <SignPdfWrapper />;
}
