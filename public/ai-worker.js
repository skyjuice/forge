
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';

// Skip local model checks since we are in browser
env.allowLocalModels = false;
env.useBrowserCache = true;

// Singleton to reuse pipelines
class PipelineSingleton {
    static task = null;
    static model = null;
    static instance = null;

    static async getInstance(task, model, progress_callback = null) {
        if (this.task !== task || this.model !== model) {
            this.task = task;
            this.model = model;
            this.instance = null;
        }

        if (this.instance === null) {
            this.instance = await pipeline(task, model, { progress_callback });
        }

        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { task, model, content } = event.data;

    let result = null;

    try {
        // Map abstract tasks to transformers.js pipelines
        let pipelineTask = task;
        if (task === 'inpainting') {
            pipelineTask = 'image-to-image'; // Use closest available pipeline
        }

        const classifier = await PipelineSingleton.getInstance(pipelineTask, model, (x) => {
            self.postMessage({ status: 'progress', ...x });
        });

        if (task === 'text-classification') {
            result = await classifier(content);
        } else if (task === 'summarization') {
            result = await classifier(content);
        } else if (task === 'translation') {
            if (typeof content === 'object') {
                result = await classifier(content.text, { ...content.options });
            } else {
                result = await classifier(content);
            }
        } else if (task === 'automatic-speech-recognition') {
            result = await classifier(content);
        } else if (task === 'inpainting') {
            // content: { image: string|Blob, mask: string|Blob }
            // For now, image-to-image pipelines usually just take the image. 
            // True inpainting models (InpaintPipeline) aren't standard in version 2.17 yet or use 'img2img'.
            // If the model supports masking, we pass it.
            result = await classifier(content.image, { mask_image: content.mask });
        }

        self.postMessage({ status: 'complete', output: result });

    } catch (e) {
        self.postMessage({ status: 'error', error: e.toString() });
    }
});
