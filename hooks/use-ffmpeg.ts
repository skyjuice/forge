"use client";

import { useState, useRef, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

export function useFFmpeg() {
    const [loaded, setLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const ffmpegRef = useRef(new FFmpeg());
    const messageRef = useRef<HTMLParagraphElement | null>(null);

    const load = async () => {
        if (loaded) return;
        setIsLoading(true);
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
        const ffmpeg = ffmpegRef.current;

        ffmpeg.on("log", ({ message }) => {
            console.log(message);
        });

        try {
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
            });
            setLoaded(true);
        } catch (error) {
            console.error("Failed to load FFmpeg:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return { ffmpeg: ffmpegRef.current, loaded, load, isLoading };
}
