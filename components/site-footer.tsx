

export function SiteFooter() {
    return (
        <footer className="border-t bg-muted/20">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <p>
                        &copy; 2025 IbuForge. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link href="/about" className="hover:text-foreground hover:underline underline-offset-4">
                            About
                        </Link>
                        <Link href="/changelog" className="hover:text-foreground hover:underline underline-offset-4">
                            Changelog
                        </Link>
                        <Link href="https://faizan.my" target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline underline-offset-4">
                            Contact
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
