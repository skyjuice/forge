import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://ibuforge.com';

    // Core pages
    const routes = [
        '',
        '/about',
        '/changelog',
        '/tools/converter',
        '/tools/chopper',
        '/tools/compressor',
        '/tools/pdf', // JPG to PDF
        '/tools/word-to-pdf',
        '/tools/pdf-merger',
        '/tools/split-pdf',
        '/tools/rotate-pdf',
        '/tools/organize-pdf',
        '/tools/pdf-to-jpg',
        '/tools/page-numbers',
        '/tools/watermark',
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
    }));
}
