"use client";

import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Linkedin, Link2, Check } from "lucide-react";
import { useState, useEffect } from "react";

export function SocialShare({ url = "https://ibuforge.com", title = "Check out IbuForge - Free PDF & Media Tools" }: { url?: string, title?: string }) {
    const [copied, setCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState(url);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setShareUrl(window.location.href);
        }
    }, []);

    const handleShare = (platform: "twitter" | "facebook" | "linkedin") => {
        const text = encodeURIComponent(title);
        const u = encodeURIComponent(shareUrl);

        let link = "";
        switch (platform) {
            case "twitter":
                link = `https://twitter.com/intent/tweet?url=${u}&text=${text}`;
                break;
            case "facebook":
                link = `https://www.facebook.com/sharer/sharer.php?u=${u}`;
                break;
            case "linkedin":
                link = `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
                break;
        }

        window.open(link, '_blank', 'noopener,noreferrer');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium pr-2 text-muted-foreground hidden sm:inline-block">Share:</span>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => handleShare("twitter")}
                className="h-8 w-8 rounded-full hover:bg-sky-500/10 hover:text-sky-500"
                title="Share on Twitter"
            >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => handleShare("facebook")}
                className="h-8 w-8 rounded-full hover:bg-blue-600/10 hover:text-blue-600"
                title="Share on Facebook"
            >
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => handleShare("linkedin")}
                className="h-8 w-8 rounded-full hover:bg-blue-700/10 hover:text-blue-700"
                title="Share on LinkedIn"
            >
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                title="Copy Link"
            >
                {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                <span className="sr-only">Copy Link</span>
            </Button>
        </div>
    );
}
