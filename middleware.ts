
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Security Headers
    // Content-Security-Policy: restrict sources to self and trusted CDNs (shared with client-side AI/FFmpeg)
    // We need to allow blobs for FFmpeg/Workers and unsafe-eval for Wasm/Monaco
    const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com blob:; 
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self' data:;
    worker-src 'self' blob:;
    connect-src 'self' https://cdn.jsdelivr.net https://unpkg.com https://huggingface.co https://*.huggingface.co blob: data:;
    media-src 'self' blob: data:;
    object-src 'none';
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

    // Rate Limiting Reminder (TODO: Implement actual rate limiting using Redis/KV)
    // For now, we rely on the fact that heavy tools are client-side.

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
    ],
};
