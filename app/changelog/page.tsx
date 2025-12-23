import { changelogData } from "@/lib/changelog-data";
import { ChangelogItem } from "@/components/changelog-item";
import { Sparkles } from "lucide-react";

export default function ChangelogPage() {
    return (
        <div className="container max-w-4xl mx-auto py-12 px-4">
            <div className="text-center space-y-4 mb-12">
                <div className="flex items-center justify-center gap-2 text-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Sparkles className="h-6 w-6" />
                    <span className="font-semibold tracking-wide uppercase text-sm">What's New</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight lg:text-6xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
                    Changelog
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Stay updated with the latest features, improvements, and fixes to IbuForge.
                </p>
            </div>

            <div className="prose dark:prose-invert max-w-none">
                <div className="relative border-l border-muted/40 ml-4 md:ml-8 pl-8 pb-12 space-y-12">
                    {/* Timeline connector visual adjustment could go here, but simple list is fine for now */}

                    {changelogData.map((entry) => (
                        <div key={entry.version} className="relative">
                            {/* Dot on the timeline */}
                            <div className="absolute -left-[41px] md:-left-[41px] top-6 h-5 w-5 rounded-full border-4 border-background bg-primary shadow-sm z-10 hidden md:block" />

                            <ChangelogItem entry={entry} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center mt-12 text-sm text-muted-foreground">
                <p>Showing mostly recent updates. Older history is not displayed.</p>
            </div>
        </div>
    );
}
