import Link from "next/link";
import { Coffee, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
    return (
        <footer className="border-t bg-muted/20">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground text-center max-w-4xl mx-auto">
                    <p className="font-medium text-foreground mb-1">Privacy & Security Notice</p>
                    <p>
                        We prioritize your data privacy. For server-side tools (Converter, Chopper, Compressor, Word to PDF), files are <strong>deleted immediately</strong> after processing.
                        For client-side tools (Merge, Split, PDF Builder), files are processed entirely within your browser and <strong>never uploaded</strong> to our servers.
                    </p>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground text-center md:text-left">
                        <p>
                            Built with <Heart className="inline-block h-4 w-4 text-red-500 fill-current mx-1 mb-0.5" /> by{" "}
                            <Link href="https://faizan.my" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:underline">
                                Skyjuice
                            </Link>
                        </p>
                        <span className="hidden md:inline text-muted-foreground/30">•</span>
                        <Link href="/about" className="hover:text-foreground hover:underline underline-offset-4">
                            About
                        </Link>
                        <span className="hidden md:inline text-muted-foreground/30">•</span>
                        <Link href="/changelog" className="hover:text-foreground hover:underline underline-offset-4">
                            Changelog
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="gap-2">
                            <Link href="https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=perwaja@gmail.com&item_name=Support%20IbuForge&currency_code=USD" target="_blank" rel="noopener noreferrer">
                                <svg viewBox="0 0 125 33" className="h-6" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PayPal">
                                    <path d="M46.211 6.749h-6.839a.95.95 0 00-.939.802l-2.766 17.537a.57.57 0 00.564.66h3.297a.95.95 0 00.94-.803l.746-4.725h4.975c3.782 0 6.713-1.838 7.438-6.438.307-1.956-.168-3.486-1.391-4.708-1.124-1.127-2.9-1.666-5.289-1.666H46.21zm.772 8.766h-1.696l1.09-6.915c.01-.06.062-.102.123-.102h1.49c1.93 0 2.924 1.01 2.502 3.68-.293 1.866-1.488 3.337-3.51 3.337zM20.6 6.749h-6.84a.95.95 0 00-.938.802l-2.767 17.537a.57.57 0 00.564.66h3.298a.95.95 0 00.939-.803l.745-4.725h4.975c3.782 0 6.713-1.838 7.439-6.438.307-1.956-.168-3.486-1.391-4.708-1.124-1.127-2.9-1.666-5.289-1.666H20.6zm.772 8.766H19.68l1.09-6.915c.01-.06.061-.102.122-.102h1.49c1.93 0 2.925 1.01 2.503 3.68-.293 1.866-1.489 3.337-3.51 3.337zM10.706 6.749H3.772a.948.948 0 00-.938.813L.005 24.97a.571.571 0 00.567.66h3.696a.95.95 0 00.938-.802l.608-3.697h1.692c3.55 0 6.33-1.442 7.185-5.266.386-1.725.106-3.167-.84-4.385C12.388 10.22 10.966 9.8 9.255 9.8h-1.65l.59-2.93a.11.11 0 01.107-.087h2.404c1.867 0 3.328 1.015 2.933 3.519-.387 2.454-1.918 3.543-3.953 3.543h-2.1l-.81 5.132a.19.19 0 01-.188.16h-3.23a.19.19 0 01-.19-.22l2.76-17.5a.189.189 0 01.188-.16h6.924c2.253 0 3.868.563 4.908 1.603 1.258 1.259 1.637 2.9 1.185 5.564-.448 2.656-1.832 5.09-4.832 6.095 1.393-.424 2.595-1.558 2.927-3.66.868-5.498-3.085-7.781-7.85-7.781z" fill="#003087" />
                                    <path d="M107.567 6.749h-3.655a.95.95 0 00-.938.783l-2.95 16.596a.57.57 0 00.564.671h3.181a.95.95 0 00.938-.784l2.95-16.595a.57.57 0 00-.564-.67zM97.098 6.749h-6.84a.95.95 0 00-.938.802l-2.766 17.537a.57.57 0 00.564.66h3.297a.95.95 0 00.94-.803l.746-4.725h4.975c3.782 0 6.713-1.838 7.439-6.438.307-1.956-.168-3.486-1.391-4.708-1.124-1.127-2.9-1.666-5.289-1.666H97.1zm.772 8.766H96.17l1.09-6.915c.01-.06.061-.102.122-.102h1.49c1.93 0 2.925 1.01 2.503 3.68-.293 1.866-1.488 3.337-3.51 3.337zM73.556 6.749h-3.79c-.454 0-.853.324-.925.772l-3.55 21.996a.57.57 0 00.564.66h3.407a.95.95 0 00.936-.78l.848-4.77h4.032c5.626 0 9.873-2.735 10.952-9.569.58-3.666-.69-6.282-3.166-7.592-1.748-.925-4.232-1.282-6.522-1.282H73.557zm1.612 8.914c-.604 3.824-3.195 4.304-5.698 4.304h-1.66l1.39-7.817h1.86c2.474 0 4.71.696 4.108 4.513z" fill="#003087" />
                                    <path d="M57.65 6.749l-4.474 24.87a.57.57 0 00.564.66h3.488a.95.95 0 00.938-.765l1.649-10.435 6.136-10.457a.95.95 0 00-.821-1.431h-3.743a.95.95 0 00-.814.46l-2.923 4.981z" fill="#003087" />
                                </svg>
                                <span>Support</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
