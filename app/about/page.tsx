import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <Button asChild variant="ghost" className="mb-8 -ml-4" size="sm">
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Tools
                </Link>
            </Button>

            <div className="space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">About Forge</h1>
                    <p className="text-xl text-muted-foreground">
                        Simple, powerful tools focused on privacy and efficiency.
                    </p>
                </div>

                <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
                    <div className="p-6 bg-muted/30 rounded-lg border">
                        <h2 className="text-lg font-semibold mb-3 mt-0">Why this exists</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            This project is purely built based on a passion for solving my own day-to-day issues while working.
                            I wanted a set of reliable tools without the bloat, ads, or privacy concerns typical of free online converters.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Have a Request?</h2>
                        <p className="text-muted-foreground">
                            If you have any requests or a certain problem you want me to address,
                            I'm always looking for new ideas to expand the toolkit.
                        </p>

                        <div className="flex items-center gap-3 mt-4">
                            <Button asChild>
                                <a href="mailto:mohd@faizan.my">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Contact Us
                                </a>
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                or email at <span className="font-medium text-foreground">mohd@faizan.my</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
