/**
 * Streaming Utilities
 * Optimized for browser responsiveness and performance
 */

export interface StreamingOptions {
  maxTokens?: number;
  temperature?: number;
  onProgress?: (progress: {
    tokensGenerated: number;
    totalTime: number;
    estimatedTimeRemaining: number;
  }) => void;
  timeoutMs?: number;
}

/**
 * Consume stream with browser yields to prevent UI freezing
 * @param stream AsyncIterable of tokens
 * @param options Streaming configuration
 * @returns Full generated text
 */
export async function consumeStreamWithYields(
  stream: AsyncIterable<string>,
  options: StreamingOptions = {}
): Promise<string> {
  const {
    onProgress,
    timeoutMs = 120000, // 2 minute timeout
  } = options;

  let fullResponse = '';
  let tokenCount = 0;
  const startTime = Date.now();
  let lastUpdateTime = startTime;
  let lastTokenCountAtUpdate = 0;
  const YIELD_INTERVAL_MS = 50; // Yield every 50ms
  const TOKENS_PER_BATCH = 5; // Accumulate 5 tokens before yielding

  try {
    for await (const token of stream) {
      // Check timeout
      const elapsed = Date.now() - startTime;
      if (elapsed > timeoutMs) {
        throw new Error(`Streaming timeout: exceeded ${timeoutMs}ms limit`);
      }

      fullResponse += token;
      tokenCount++;

      // Report progress at regular intervals
      const now = Date.now();
      const timeSinceUpdate = now - lastUpdateTime;
      const tokensSinceUpdate = tokenCount - lastTokenCountAtUpdate;

      if (
        timeSinceUpdate >= YIELD_INTERVAL_MS ||
        tokensSinceUpdate >= TOKENS_PER_BATCH
      ) {
        // Calculate throughput and estimate remaining time
        const avgTokensPerMs = tokenCount / (now - startTime);
        const estimatedTimeRemaining = Math.max(0, 500 / avgTokensPerMs); // Estimate for remaining tokens

        // Report progress
        if (onProgress) {
          try {
            onProgress({
              tokensGenerated: tokenCount,
              totalTime: now - startTime,
              estimatedTimeRemaining: Math.round(estimatedTimeRemaining),
            });
          } catch (progressError) {
            console.error('Progress callback error:', progressError);
          }
        }

        // CRITICAL: Yield to browser to prevent UI freeze
        // This allows React to render and browser to handle events
        await new Promise((resolve) => setTimeout(resolve, 0));

        lastUpdateTime = now;
        lastTokenCountAtUpdate = tokenCount;
      }
    }

    return fullResponse.trim();
  } catch (error) {
    // If error during streaming, return what we have so far (if substantial)
    if (tokenCount > 0 && fullResponse.length > 50) {
      console.warn('Streaming error but returning partial response:', error);
      return fullResponse.trim();
    }
    throw error;
  }
}

/**
 * Batch process items with browser yields to prevent blocking
 * @param items Items to process
 * @param processor Async function to process each item
 * @param onProgress Optional progress callback
 */
export async function processBatchWithYields<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  onProgress?: (progress: { completed: number; total: number }) => void
): Promise<R[]> {
  const results: R[] = [];
  const BATCH_SIZE = 3; // Process N items before yielding

  for (let i = 0; i < items.length; i++) {
    try {
      const result = await processor(items[i]);
      results.push(result);

      // Report progress
      if (onProgress && i % BATCH_SIZE === 0) {
        onProgress({
          completed: i + 1,
          total: items.length,
        });

        // Yield every batch
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    } catch (error) {
      console.error(`Error processing item ${i}:`, error);
      throw error;
    }
  }

  return results;
}

/**
 * Debounced UI update to prevent excessive re-renders
 * @param callback Function to call
 * @param delayMs Minimum time between calls
 */
export function createDebouncedUIUpdate(
  callback: () => void,
  delayMs: number = 100
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0;

  return () => {
    const now = Date.now();

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const timeSinceLastCall = now - lastCallTime;

    if (timeSinceLastCall >= delayMs) {
      // Enough time has passed, call immediately
      callback();
      lastCallTime = now;
    } else {
      // Schedule for later
      timeoutId = setTimeout(() => {
        callback();
        lastCallTime = Date.now();
        timeoutId = null;
      }, delayMs - timeSinceLastCall);
    }
  };
}

/**
 * Race against a timeout
 * @param promise Promise to race
 * @param timeoutMs Timeout in milliseconds
 * @param timeoutMessage Error message on timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> = undefined as any;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle);
  }
}
