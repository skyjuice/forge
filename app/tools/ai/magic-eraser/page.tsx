
import { Metadata } from "next";
import MagicEraserClient from "./client";

export const metadata: Metadata = {
    title: "Magic Eraser (AI Object Remover) | IbuForge",
    description: "Remove unwanted objects from images using AI in your browser.",
};

export default function MagicEraserPage() {
    return <MagicEraserClient />;
}
