"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Key, Copy, AlertCircle, CheckCircle } from "lucide-react";
import { jwtDecode } from "jwt-decode";
// import { useToast } from "@/hooks/use-toast"; // Unused if no copy

export default function JwtDebuggerPage() {
    const [token, setToken] = useState("");
    const [header, setHeader] = useState<any>(null);
    const [payload, setPayload] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        if (!token.trim()) {
            setHeader(null);
            setPayload(null);
            setError(null);
            setIsValid(false);
            return;
        }

        try {
            const decodedHeader = jwtDecode(token, { header: true });
            const decodedPayload = jwtDecode(token);

            setHeader(decodedHeader);
            setPayload(decodedPayload);
            setError(null);
            setIsValid(true);
        } catch (e) {
            setError("Invalid JWT Token format");
            setIsValid(false);
            setHeader(null);
            setPayload(null);
        }
    }, [token]);

    return (
        <div className="container mx-auto max-w-5xl py-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Key className="h-8 w-8 text-primary" />
                    JWT Debugger
                </h1>
                <p className="text-muted-foreground">
                    Decode and inspect JSON Web Tokens without sending them to any server.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Input */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Encoded Token</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Paste your JWT here (eyJ...)"
                            className="min-h-[200px] font-mono break-all"
                        />
                        {error && (
                            <div className="mt-4 bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}
                        {isValid && (
                            <div className="mt-4 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm p-3 rounded-md border border-green-200 dark:border-green-900 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Valid JWT Structure
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Output */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="py-3 bg-muted/30">
                            <CardTitle className="text-sm font-mono text-muted-foreground">HEADER: Algorithm & Type</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <pre className="p-4 bg-slate-950 text-slate-50 overflow-x-auto text-sm font-mono min-h-[100px] rounded-b-lg">
                                {header ? JSON.stringify(header, null, 2) : "// Header will appear here"}
                            </pre>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="py-3 bg-muted/30">
                            <CardTitle className="text-sm font-mono text-muted-foreground">PAYLOAD: Data</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <pre className="p-4 bg-slate-950 text-purple-200 overflow-x-auto text-sm font-mono min-h-[200px] rounded-b-lg">
                                {payload ? JSON.stringify(payload, null, 2) : "// Payload will appear here"}
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
