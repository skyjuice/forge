
import fs from 'fs';
import path from 'path';
import { FormData } from 'formdata-node';
import { fileFromPath } from 'formdata-node/file-from-path';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const ASSETS_DIR = path.join(process.cwd(), 'test_assets');

async function testCompressor() {
    console.log('Testing Compressor...');
    const form = new FormData();
    form.append('file', await fileFromPath(path.join(ASSETS_DIR, 'test_video.mp4')));
    form.append('level', 'medium');

    const res = await fetch(`${BASE_URL}/api/tools/compressor`, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`Compressor failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    console.log('Compressor Success:', data);
}

async function testChopper() {
    console.log('Testing Chopper...');
    const form = new FormData();
    form.append('file', await fileFromPath(path.join(ASSETS_DIR, 'test_audio.mp3')));
    form.append('minutes', '1');

    const res = await fetch(`${BASE_URL}/api/tools/chop`, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`Chopper failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    console.log('Chopper Success:', data);
}

async function testConverter() {
    console.log('Testing Converter...');
    const form = new FormData();
    form.append('file', await fileFromPath(path.join(ASSETS_DIR, 'test_video.mp4')));
    form.append('format', 'mp3');

    const res = await fetch(`${BASE_URL}/api/tools/convert`, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`Converter failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    console.log('Converter Success:', data);
}

async function run() {
    try {
        await testCompressor();
        await testChopper();
        await testConverter();
        console.log('ALL BACKEND TESTS PASSED');
    } catch (e) {
        console.error('TEST FAILED:', e);
        process.exit(1);
    }
}

run();
