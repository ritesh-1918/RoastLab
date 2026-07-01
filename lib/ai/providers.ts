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
  // Filter by key presence BEFORE constructing OpenAI clients — the SDK throws
  // synchronously on an empty apiKey, so building all 5 clients up front would
  // crash this function (and every caller) whenever any single key is unset.
  return [
    // Groq — only working reliable free vision model. Both keys use the same
    // model (llama-4-scout is Groq's ONLY vision model) to double free quota.
    {
      name: 'groq-1',
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_KEY_1 ?? '',
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    },
    {
      name: 'groq-2',
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_KEY_2 ?? '',
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    },
    // OpenRouter free vision models — verified free + image-capable (Nov 2026).
    // llama-4-*:free went paid; these are the current actually-free vision models.
    {
      name: 'openrouter-gemma',
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_KEY_1 ?? '',
      model: 'google/gemma-4-26b-a4b-it:free',
    },
    {
      name: 'openrouter-nemotron',
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_KEY_2 ?? '',
      model: 'nvidia/nemotron-nano-12b-v2-vl:free',
    },
    // Last resort — OpenRouter auto free router (picks any available free model)
    {
      name: 'openrouter-auto',
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_KEY_1 ?? '',
      model: 'openrouter/free',
    },
  ]
    .filter((p) => p.apiKey && p.apiKey.length > 10)
    .map((p) => ({
      name: p.name,
      client: makeClient(p.baseURL, p.apiKey),
      model: p.model,
      supportsVision: true,
    }));
}

/** True when worth trying next provider (rate limit, quota, server error, model not found, network). */
export function isRetryableError(err: unknown): boolean {
  if (err instanceof OpenAI.APIError) {
    // 403 = quota exhausted on free tier (OpenRouter free models)
    // 404 = model not found on this provider
    // 429 = rate limit
    // 5xx = server error
    return err.status === 403 || err.status === 404 || err.status === 429 || err.status >= 500;
  }
  // Network errors, timeouts, DNS failures — always retry next provider
  return true;
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
