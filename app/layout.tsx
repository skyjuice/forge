import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/main-nav";
import { SiteFooter } from "@/components/site-footer";

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ibuforge.com'),
  title: {
    default: 'IbuForge - Free Secure Online PDF & Media Tools',
    template: '%s | IbuForge',
  },
  description: "A Swiss-Army knife for your digital workflow. Merge, Split, Rotate, and Convert PDFs and Media files securely in your browser. No file uploads needed.",
  keywords: [
    "pdf tools", "merge pdf", "split pdf", "jpg to pdf", "pdf to jpg",
    "add watermark", "page numbers", "rotate pdf",
    "video converter", "audio compressor",
    "client-side pdf", "secure pdf tools", "ibuforge"
  ],
  authors: [{ name: "Skyjuice", url: "https://faizan.my" }],
  creator: "Skyjuice",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ibuforge.com',
    siteName: 'IbuForge',
    title: 'IbuForge - Free Secure Online PDF & Media Tools',
    description: 'Process your documents and media locally. Fast, private, and free.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'IbuForge - Your All-in-One Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IbuForge - Free Secure Online Tools',
    description: 'Secure client-side PDF and media tools. No uploads, just speed.',
    creator: '@ibuforge', // Update if actual handle exists
    images: ['/opengraph-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background font-sans`}
      >
        <MainNav />
        <main className="container mx-auto py-6 px-4 flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
