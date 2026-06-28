/**
 * AI provider fallback chain.
 * All providers expose OpenAI-compatible API — single client, different baseURL + model.
 * On 429 (rate limit) or 5xx, automatically tries next provider.
 */

import OpenAI from 'openai';

export type Provider = {
  name: string;
  client: OpenAI;
  model: string;
  supportsVision: boolean;
};

function makeClient(baseURL: string, apiKey: string): OpenAI {
  return new OpenAI({ baseURL, apiKey, dangerouslyAllowBrowser: false });
}

/**
 * Ordered fallback chain.
 * Index 0 = primary; last index = last resort.
 * Add/remove entries here as keys change.
 */
export function getProviders(): Provider[] {
  return [
    {
      name: 'openrouter-1',
      client: makeClient('https://openrouter.ai/api/v1', process.env.OPENROUTER_KEY_1 ?? ''),
      model: 'google/gemini-flash-1.5',
      supportsVision: true,
    },
    {
      name: 'openrouter-2',
      client: makeClient('https://openrouter.ai/api/v1', process.env.OPENROUTER_KEY_2 ?? ''),
      model: 'google/gemini-flash-1.5',
      supportsVision: true,
    },
    {
      name: 'groq-1',
      client: makeClient('https://api.groq.com/openai/v1', process.env.GROQ_KEY_1 ?? ''),
      model: 'llama-3.2-11b-vision-preview',
      supportsVision: true,
    },
    {
      name: 'groq-2',
      client: makeClient('https://api.groq.com/openai/v1', process.env.GROQ_KEY_2 ?? ''),
      model: 'llama-3.2-11b-vision-preview',
      supportsVision: true,
    },
    {
      // Gemini via OpenAI-compatible endpoint (Google AI Studio key)
      name: 'gemini-1',
      client: makeClient(
        'https://generativelanguage.googleapis.com/v1beta/openai/',
        process.env.GEMINI_API_KEY ?? ''
      ),
      model: 'gemini-2.0-flash',
      supportsVision: true,
    },
  ].filter((p) => {
    // Skip providers with missing keys at runtime
    const key = p.client.apiKey;
    return key && key.length > 10;
  });
}

/** True when the error is a rate limit or server overload — worth retrying on next provider. */
export function isRetryableError(err: unknown): boolean {
  if (err instanceof OpenAI.APIError) {
    return err.status === 429 || err.status >= 500;
  }
  return false;
}

/**
 * Run fn with automatic fallback across providers.
 * Tries each provider in order; stops on first success.
 * Re-throws the last error if all providers fail.
 */
export async function withFallback<T>(
  fn: (provider: Provider) => Promise<T>
): Promise<{ result: T; providerUsed: string }> {
  const providers = getProviders();
  let lastErr: unknown;

  for (const provider of providers) {
    try {
      const result = await fn(provider);
      return { result, providerUsed: provider.name };
    } catch (err) {
      lastErr = err;
      if (isRetryableError(err)) {
        console.warn(`[ai] ${provider.name} rate-limited or error, trying next...`);
        continue;
      }
      // Non-retryable (auth error, bad request) — fail fast
      throw err;
    }
  }

  throw lastErr;
}
