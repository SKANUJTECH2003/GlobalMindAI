// Model Manager - Ensures model is loaded before any generation
import { ModelManager as SDKModelManager } from '@runanywhere/web';

let isModelLoaded = false;
let loadingPromise: Promise<void> | null = null;

export class ModelManager {
  static async ensureModelLoaded(): Promise<void> {
    // If already loaded, return immediately
    if (isModelLoaded) return;

    // If already loading, wait for that promise
    if (loadingPromise) return loadingPromise;

    // Start loading
    loadingPromise = (async () => {
      try {
        const modelId = 'lfm2-350m-q4_k_m';
        
        // Check if model is already loaded
        const loadedModel = SDKModelManager.getLoadedModel();
        if (loadedModel?.id === modelId) {
          isModelLoaded = true;
          console.log('✅ Model already loaded');
          return;
        }
        
        // Load the model
        console.log('⏳ Loading LLM model...');
        await SDKModelManager.loadModel(modelId);
        isModelLoaded = true;
        console.log('✅ Model loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load model:', error);
        loadingPromise = null; // Reset so it can be retried
        throw new Error('Failed to load AI model. Please refresh and try again.');
      }
    })();

    return loadingPromise;
  }

  static isLoaded(): boolean {
    return isModelLoaded;
  }
}
