import Link from "next/link";
import { Coffee, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
    return (
        <footer className="border-t bg-muted/20">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                        Built with <Heart className="inline-block h-4 w-4 text-red-500 fill-current mx-1 mb-0.5" /> by{" "}
                        <span className="font-semibold text-foreground">Skyjuice</span>
                    </p>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="gap-2">
                            <Link href="https://www.buymeacoffee.com" target="_blank" rel="noopener noreferrer">
                                <Coffee className="h-4 w-4 text-orange-500" />
                                <span>Buy me a coffee</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
