
import { pipeline, env } from '@xenova/transformers';

// Skip local check to download from Hugging Face Hub
env.allowLocalModels = false;
env.useBrowserCache = true;

// Singleton to hold the pipeline
class PipelineSingleton {
    static task = null;
    static model = null;
    static instance = null;

    static async getInstance(task, model, progressCallback = null) {
        if (this.task !== task || this.model !== model) {
            this.instance = null;
            this.task = task;
            this.model = model;
        }
        if (this.instance === null) {
            this.instance = await pipeline(task, model, {
                progress_callback: progressCallback,
            });
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { task, model, text, source_lang, target_lang } = event.data;

    // Callback to send progress back to main thread
    const progressCallback = (data) => {
        self.postMessage({
            status: 'progress',
            data: data
        });
    }

    try {
        const pipe = await PipelineSingleton.getInstance(task, model, progressCallback);

        let output;
        if (task === 'summarization') {
            // Summarization specific args
            output = await pipe(text, { max_new_tokens: 100 });
        } else if (task === 'translation') {
            // Translation specific args
            output = await pipe(text, { src_lang: source_lang, tgt_lang: target_lang });
        } else if (task === 'text-classification') {
            output = await pipe(text);
        } else {
            output = await pipe(text);
        }

        self.postMessage({
            status: 'complete',
            output: output
        });
    } catch (e) {
        self.postMessage({
            status: 'error',
            error: e.message
        });
    }
});
