export type ChangeType = 'feature' | 'improvement' | 'fix';

export interface ChangelogEntry {
    version: string;
    date: string;
    title: string;
    changes: {
        type: ChangeType;
        description: string;
    }[];
}

export const changelogData: ChangelogEntry[] = [
    {
        version: "1.2.0",
        date: "2025-12-23",
        title: "Performance & Stability Updates",
        changes: [
            {
                type: "improvement",
                description: "Optimized file uploads for Chopper, Compressor, and Converter tools to support large files via streaming."
            },
            {
                type: "fix",
                description: "Resolved build errors in the PDF Merger tool for smoother deployments."
            }
        ]
    },
    {
        version: "1.1.0",
        date: "2025-12-22",
        title: "PDF Tools Expansion",
        changes: [
            {
                type: "feature",
                description: "Introduced PDF Merger tool to combine multiple PDF documents."
            },
            {
                type: "feature",
                description: "Added Image to PDF Builder for converting images into a single PDF."
            },
            {
                type: "improvement",
                description: "Standardized Privacy Notices across all document tools for better transparency."
            }
        ]
    },
    {
        version: "1.0.0",
        date: "2025-12-15",
        title: "Initial Release",
        changes: [
            {
                type: "feature",
                description: "Launched IbuForge with core media and document tools."
            }
        ]
    }
];
