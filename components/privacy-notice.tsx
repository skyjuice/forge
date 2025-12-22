import { AlertTriangle } from "lucide-react";

export interface PrivacyNoticeProps {
    mode?: "server" | "client";
}

export function PrivacyNotice({ mode = "server" }: PrivacyNoticeProps) {
    return (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-900">
                <p className="font-medium">Privacy Notice</p>
                {mode === "server" ? (
                    <p className="mt-1 text-amber-800/90">
                        For your security, uploaded files are deleted immediately after processing.
                        Processed files are deleted immediately after you download them.
                        <strong> Download links are one-time use only.</strong>
                    </p>
                ) : (
                    <p className="mt-1 text-amber-800/90">
                        For your security, files are processed entirely within your browser.
                        They are not uploaded to any server.
                    </p>
                )}
            </div>
        </div>
    );
}
