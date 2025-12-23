"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const navConfig = [
    {
        title: "Documents",
        items: [
            { title: "PDF Builder", href: "/tools/pdf" },
            { title: "Merge PDF", href: "/tools/pdf-merger" },
            { title: "Word to PDF", href: "/tools/word-to-pdf" },
            { title: "Split PDF", href: "/tools/split-pdf" },
            { title: "Rotate PDF", href: "/tools/rotate-pdf" },
            { title: "Organize PDF", href: "/tools/organize-pdf" },
            { title: "PDF to JPG", href: "/tools/pdf-to-jpg" },
            { title: "Page Numbers", href: "/tools/page-numbers" },
            { title: "Watermark", href: "/tools/watermark" },
        ],
    },
    {
        title: "Images",
        items: [
            { title: "Converter", href: "/tools/image-converter" },
            { title: "Resizer", href: "/tools/image-resizer" },
            { title: "Compressor", href: "/tools/image-compressor" },
            { title: "Background Remover", href: "/tools/background-remover" },
        ],
    },
    {
        title: "Media",
        items: [
            { title: "Converter", href: "/tools/converter" },
            { title: "Chopper", href: "/tools/chopper" },
            { title: "Compressor", href: "/tools/compressor" },
        ],
    },
];

export function MainNav() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center justify-between px-4">
                <div className="flex items-center">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="font-bold inline-block">IbuForge</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-4 text-sm font-medium">
                        {navConfig.map((group) => (
                            <DropdownMenu key={group.title}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 gap-1 p-0 px-2 text-sm font-medium text-foreground/60 hover:text-foreground data-[state=open]:text-foreground">
                                        {group.title}
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuLabel>{group.title} Tools</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {group.items.map((item) => (
                                        <DropdownMenuItem key={item.href} asChild>
                                            <Link href={item.href} className="w-full cursor-pointer">
                                                {item.title}
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ))}

                        <Link
                            href="/changelog"
                            className="transition-colors hover:text-foreground/80 text-foreground/60 w-max px-2"
                        >
                            Changelog
                        </Link>
                    </nav>
                </div>

                {/* Mobile Menu Trigger */}
                <div className="md:hidden">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <SheetHeader>
                                <SheetTitle className="text-left font-bold">IbuForge</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col space-y-4 py-4">
                                <Link
                                    href="/"
                                    onClick={() => setIsOpen(false)}
                                    className="text-sm font-medium transition-colors hover:text-primary"
                                >
                                    Home
                                </Link>
                                <Accordion type="single" collapsible className="w-full">
                                    {navConfig.map((group) => (
                                        <AccordionItem key={group.title} value={group.title}>
                                            <AccordionTrigger className="text-sm">{group.title}</AccordionTrigger>
                                            <AccordionContent>
                                                <div className="flex flex-col space-y-2 pl-4">
                                                    {group.items.map((item) => (
                                                        <Link
                                                            key={item.href}
                                                            href={item.href}
                                                            onClick={() => setIsOpen(false)}
                                                            className={cn(
                                                                "text-sm transition-colors hover:text-primary py-1",
                                                                pathname === item.href ? "text-foreground font-medium" : "text-muted-foreground"
                                                            )}
                                                        >
                                                            {item.title}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                                <Link
                                    href="/changelog"
                                    onClick={() => setIsOpen(false)}
                                    className="text-sm font-medium transition-colors hover:text-primary py-2 border-t"
                                >
                                    Changelog
                                </Link>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
