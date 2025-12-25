import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://ibuforge.com';

    // Core pages
    const routes = [
        '',
        '/about',
        '/changelog',
        '/tools/converter',
        '/tools/image-resizer',
        '/tools/image-compressor',
        '/tools/background-remover',
        '/tools/pdf', // JPG to PDF
        '/tools/word-to-pdf',
        '/tools/pdf-merger',
        '/tools/split-pdf',
        '/tools/rotate-pdf',
        '/tools/organize-pdf',
        '/tools/pdf-to-jpg',
        '/tools/page-numbers',
        '/tools/watermark',
        // AI Tools
        '/tools/ai/summarizer',
        '/tools/ai/translator',
        '/tools/ai/sentiment',
        // Image Tools
        '/tools/image-converter',
        // Developer Tools
        '/tools/dev/json-formatter',
        '/tools/dev/xml-formatter',
        '/tools/dev/base64',
        '/tools/dev/jwt-debugger',
        '/tools/dev/sql-formatter',
        '/tools/dev/diff-checker',
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
    }));
}
