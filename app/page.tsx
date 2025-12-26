import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileMusic, Scissors, FileType2, FileText, Minimize2, Images, Files, Ungroup, RotateCw, LayoutGrid, FileImage, Hash, Stamp, RefreshCcw, Scaling, Eraser, Braces, FileCode, Database, Diff, Key, Shield, Sparkles, Languages, Smile, Mic, ScanText, QrCode } from "lucide-react";

interface Tool {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    cta: string;
}

interface ToolGroup {
    id: string;
    label: string;
    tools: Tool[];
}

export default function Page() {
    const groups: ToolGroup[] = [
        {
            id: "documents",
            label: "Document Tools",
            tools: [
                {
                    title: "JPG to PDF",
                    description: "Convert images (JPG, PNG) to PDF.",
                    icon: <Images className="h-10 w-10 text-primary" />,
                    href: "/tools/pdf",
                    cta: "JPG to PDF",
                },
                {
                    title: "Merge PDF",
                    description: "Combine multiple PDF files into one.",
                    icon: <Files className="h-10 w-10 text-primary" />,
                    href: "/tools/pdf-merger",
                    cta: "Merge PDF",
                },
                {
                    title: "Split PDF",
                    description: "Extract pages or split your PDF into multiple files.",
                    icon: <Ungroup className="h-10 w-10 text-primary" />,
                    href: "/tools/split-pdf",
                    cta: "Split PDF",
                },
                {
                    title: "Rotate PDF",
                    description: "Rotate specific pages or the entire document permanently.",
                    icon: <RotateCw className="h-10 w-10 text-primary" />,
                    href: "/tools/rotate-pdf",
                    cta: "Rotate PDF",
                },
                {
                    title: "Organize PDF",
                    description: "Sort, delete, and rotate pages of your PDF file.",
                    icon: <LayoutGrid className="h-10 w-10 text-primary" />,
                    href: "/tools/organize-pdf",
                    cta: "Organize PDF",
                },
                {
                    title: "PDF to JPG",
                    description: "Convert PDF pages to high-quality JPG images.",
                    icon: <FileImage className="h-10 w-10 text-primary" />,
                    href: "/tools/pdf-to-jpg",
                    cta: "Convert to JPG",
                },
                {
                    title: "Page Numbers",
                    description: "Add page numbers into your PDF with ease.",
                    icon: <Hash className="h-10 w-10 text-primary" />,
                    href: "/tools/page-numbers",
                    cta: "Add Numbers",
                },
                {
                    title: "Add Watermark",
                    description: "Stamp your documents with text or images.",
                    icon: <Stamp className="h-10 w-10 text-primary" />,
                    href: "/tools/watermark",
                    cta: "Watermark PDF",
                },
            ],
        },
        {
            id: "ai",
            label: "AI Power Tools",
            tools: [
                {
                    title: "AI Summarizer",
                    description: "Summarize long text instantly.",
                    icon: <Sparkles className="h-10 w-10 text-primary" />,
                    href: "/tools/ai/summarizer",
                    cta: "Summarize Text",
                },
                {
                    title: "AI Transcriber",
                    description: "Convert audio to text privately.",
                    icon: <Mic className="h-10 w-10 text-primary" />,
                    href: "/tools/ai/transcriber",
                    cta: "Transcribe Audio",
                },
                {
                    title: "AI Translator",
                    description: "Translate text privately on-device.",
                    icon: <Languages className="h-10 w-10 text-primary" />,
                    href: "/tools/ai/translator",
                    cta: "Translate Text",
                },
                {
                    title: "Sentiment Analysis",
                    description: "Detect emotion and tone in text.",
                    icon: <Smile className="h-10 w-10 text-primary" />,
                    href: "/tools/ai/sentiment",
                    cta: "Analyze Sentiment",
                },
            ],
        },
        {
            id: "images",
            label: "Image Tools",
            tools: [
                {
                    title: "Image to Text (OCR)",
                    description: "Extract text from screenshots and photos.",
                    icon: <ScanText className="h-10 w-10 text-primary" />,
                    href: "/tools/ocr",
                    cta: "Extract Text",
                },
                {
                    title: "Image Converter",
                    description: "Convert images between JPG, PNG, and WebP.",
                    icon: <RefreshCcw className="h-10 w-10 text-primary" />,
                    href: "/tools/image-converter",
                    cta: "Convert Image",
                },
                {
                    title: "Image Resizer",
                    description: "Resize images by pixel dimensions or percentage.",
                    icon: <Scaling className="h-10 w-10 text-primary" />,
                    href: "/tools/image-resizer",
                    cta: "Resize Image",
                },
                {
                    title: "Image Compressor",
                    description: "Compress images efficiently in browser.",
                    icon: <Minimize2 className="h-10 w-10 text-primary" />,
                    href: "/tools/image-compressor",
                    cta: "Compress Image",
                },
                {
                    title: "Background Remover",
                    description: "Remove background or make it white.",
                    icon: <Eraser className="h-10 w-10 text-primary" />,
                    href: "/tools/background-remover",
                    cta: "Remove Background",
                },
            ],
        },
        {
            id: "media",
            label: "Media Tools",
            tools: [
                {
                    title: "Converter",
                    description: "Convert video and audio files to different formats.",
                    icon: <FileMusic className="h-10 w-10 text-primary" />,
                    href: "/tools/converter",
                    cta: "Convert Media",
                },
                {
                    title: "Chopper",
                    description: "Split long recordings into manageable chunks.",
                    icon: <Scissors className="h-10 w-10 text-primary" />,
                    href: "/tools/chopper",
                    cta: "Slice Media",
                },
                {
                    title: "Compressor",
                    description: "Reduce file size of videos and audio.",
                    icon: <Minimize2 className="h-10 w-10 text-primary" />,
                    href: "/tools/compressor",
                    cta: "Compress Media",
                },
            ],
        },
        {
            id: "dev",
            label: "Developer Tools",
            tools: [
                {
                    title: "QR Code Studio",
                    description: "Generate and scan QR codes.",
                    icon: <QrCode className="h-10 w-10 text-primary" />,
                    href: "/tools/qr-code",
                    cta: "Open Studio",
                },
                {
                    title: "JSON Formatter",
                    description: "Prettify, minify, and validate JSON data.",
                    icon: <Braces className="h-10 w-10 text-primary" />,
                    href: "/tools/dev/json-formatter",
                    cta: "Format JSON",
                },
                {
                    title: "XML Formatter",
                    description: "Prettify, minify, and validate XML data.",
                    icon: <FileCode className="h-10 w-10 text-primary" />,
                    href: "/tools/dev/xml-formatter",
                    cta: "Format XML",
                },
                {
                    title: "Base64 Converter",
                    description: "Encode and decode Base64 text instantly.",
                    icon: <FileCode className="h-10 w-10 text-primary" />,
                    href: "/tools/dev/base64",
                    cta: "Base64 Tool",
                },
                {
                    title: "JWT Debugger",
                    description: "Decode and inspect JSON Web Tokens.",
                    icon: <Key className="h-10 w-10 text-primary" />,
                    href: "/tools/dev/jwt-debugger",
                    cta: "Debug JWT",
                },
                {
                    title: "SQL Formatter",
                    description: "Format ugly SQL queries to be readable.",
                    icon: <Database className="h-10 w-10 text-primary" />,
                    href: "/tools/dev/sql-formatter",
                    cta: "Format SQL",
                },
                {
                    title: "Diff Checker",
                    description: "Compare two text blocks for differences.",
                    icon: <Diff className="h-10 w-10 text-primary" />,
                    href: "/tools/dev/diff-checker",
                    cta: "Compare Text",
                },
            ],
        },

    ];

    return (
        <div className="space-y-12">
            <section className="space-y-4">
                <h1 className="text-3xl font-extrabold tracking-tight lg:text-5xl">IbuForge</h1>
                <p className="text-lg lg:text-xl text-muted-foreground">
                    Internal tools for your daily workflows.
                </p>
            </section>

            {groups.map((group) => (
                <section key={group.id} className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                        <h2 className="text-2xl font-semibold tracking-tight">{group.label}</h2>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {group.tools.map((tool) => (
                            <Card key={tool.href} className="flex flex-col hover:bg-muted/50 transition-colors">
                                <CardHeader>
                                    <div className="mb-4">{tool.icon}</div>
                                    <CardTitle>{tool.title}</CardTitle>
                                    <CardDescription>{tool.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="mt-auto">
                                    <Link href={tool.href} passHref>
                                        <Button className="w-full group">
                                            {tool.cta}
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}