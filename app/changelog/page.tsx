import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ChangelogPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl space-y-8">
            <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Changelog</h1>
                <p className="text-xl text-muted-foreground">all notable changes to IbuForge.</p>
            </div>


            <div className="space-y-8">

                {/* Version 1.6.0 */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-4">
                            <CardTitle className="text-2xl">v1.6.0</CardTitle>
                            <Badge variant="default">Latest</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">December 25, 2025</span>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">AI Power Tools & Security Hardening 🤖</h3>
                            <p className="text-muted-foreground text-sm">Introduced local, privacy-focused AI tools and hardened security.</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                                <li><strong>AI Summarizer:</strong> Summarize long texts client-side without data leaving your browser.</li>
                                <li><strong>AI Translator:</strong> Translate text between languages privately using Transformers.js.</li>
                                <li><strong>Sentiment Analysis:</strong> Detect positive or negative tones in text instantly.</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Security & Performance</h3>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                                <li><strong>Security Headers:</strong> Implemented strict Content-Security-Policy and HSTS.</li>
                                <li><strong>Scalable Architecture:</strong> Verified 100% client-side processing for heavy media tools.</li>
                                <li><strong>Mobile Optimization:</strong> Fixed layout issues for Page Numbering and Developer tools.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>


                {/* Version 1.5.0 */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-4">
                            <CardTitle className="text-2xl">v1.5.0</CardTitle>
                            <Badge variant="secondary">Previous</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">December 23, 2025</span>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Developer Experience Upgrade 🎨</h3>
                            <p className="text-muted-foreground text-sm">Upgraded standard text areas to professional code editors.</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                                <li><strong>Monaco Editor:</strong> Integrated the VS Code editor engine for JSON, SQL, and XML tools.</li>
                                <li><strong>Syntax Highlighting:</strong> Added rich color support (Dark Mode).</li>
                                <li><strong>XML Formatter:</strong> New tool to prettify and minify XML data.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Version 1.4.0 */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-4">
                            <CardTitle className="text-2xl">v1.4.0</CardTitle>
                            <Badge variant="secondary">Previous</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">December 23, 2025</span>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Developer Tools Suite 🛠️</h3>
                            <p className="text-muted-foreground text-sm">A new set of offline-capable tools designed for software developers.</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                                <li><strong>JSON Formatter:</strong> Prettify, minify, and validate JSON syntax.</li>
                                <li><strong>JWT Debugger:</strong> Inspect JSON Web Tokens without server calls.</li>
                                <li><strong>SQL Formatter:</strong> Format complex SQL queries for better readability.</li>
                                <li><strong>Diff Checker:</strong> Compare text blocks to spot differences instantly.</li>
                                <li><strong>Base64 Converter:</strong> Encode and decode Base64 strings.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Version 1.3.0 */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-4">
                            <CardTitle className="text-2xl">v1.3.0</CardTitle>
                            <Badge variant="secondary">Previous</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">December 23, 2025</span>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Major Privacy Upgrade</h3>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                                <li><strong>Client-Side Media Engine:</strong> The Media Converter, Chopper, and Compressor now run 100% in your browser using WebAssembly.</li>
                                <li><strong>Zero Server Uploads:</strong> Your audio and video files never leave your device, ensuring maximum privacy and speed.</li>
                                <li><strong>Corporate Proxy Compatible:</strong> Fixed timeouts and "Bad Response" errors for users behind strict firewalls (e.g., Skyhigh).</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Version 1.2.0 */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-4">
                            <CardTitle className="text-2xl">v1.2.0</CardTitle>
                            <Badge variant="secondary">Previous</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">December 23, 2025</span>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">New Features</h3>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                                <li><strong>Image Converter:</strong> Convert between JPG, PNG, and WebP formats securely.</li>
                                <li><strong>Image Resizer:</strong> Resize images by pixel or percentage with aspect ratio lock.</li>
                                <li><strong>Image Compressor:</strong> Reduce image file sizes directly in your browser.</li>
                                <li><strong>Background Remover:</strong> Remove image backgrounds or replace them with white using AI.</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Improvements</h3>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                                <li><strong>Mobile Navigation:</strong> Implemented a responsive "Burger Menu" for better mobile experience.</li>
                                <li><strong>Transparency Helper:</strong> Added a checkerboard pattern to visualize transparent backgrounds in result previews.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Version 1.1.0 */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-4">
                            <CardTitle className="text-2xl">v1.1.0</CardTitle>
                            <Badge variant="secondary">Previous</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">December 23, 2025</span>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">New Features</h3>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                                <li><strong>PDF to JPG:</strong> Convert PDF pages to high-quality images directly in your browser.</li>
                                <li><strong>JPG to PDF:</strong> Convert images to PDF with drag-and-drop reordering.</li>
                                <li><strong>Add Page Numbers:</strong> Add page numbers to PDFs with flexible positioning.</li>
                                <li><strong>Add Watermark:</strong> Secure documents with text or image watermarks.</li>
                                <li><strong>Rotate PDF:</strong> Rotate specific pages or entire documents.</li>
                                <li><strong>Organize PDF:</strong> Reorder, delete, and rotate pages within a PDF.</li>
                                <li><strong>Split PDF:</strong> Extract pages or split documents by custom ranges.</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Improvements</h3>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                                <li><strong>Dashboard:</strong> Optimized 5-column grid layout for larger screens.</li>
                                <li><strong>Privacy:</strong> Standardized privacy notice across all tools.</li>
                                <li><strong>UI:</strong> Updated icons for better visual distinction.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Version 1.0.0 */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-4">
                            <CardTitle className="text-2xl">v1.0.0</CardTitle>
                            <Badge variant="secondary">Initial Release</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">December 15, 2025</span>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Initial Launch</h3>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                                <li><strong>Media Tools:</strong> Converter, Chopper, Compressor.</li>
                                <li><strong>Document Tools:</strong> Word to PDF, Merge PDF.</li>
                                <li><strong>Admin Panel:</strong> Initial release of admin dashboard foundation.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
