import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import OpenAI from 'openai';
import { isRetryableError, withFallback, getProviders, type Provider } from './providers';

function apiError(status: number): InstanceType<typeof OpenAI.APIError> {
  return Object.assign(Object.create(OpenAI.APIError.prototype), { status });
}

const ALL_KEY_VARS = ['GROQ_KEY_1', 'GROQ_KEY_2', 'OPENROUTER_KEY_1', 'OPENROUTER_KEY_2'];

beforeEach(() => {
  for (const key of ALL_KEY_VARS) vi.stubEnv(key, '');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('isRetryableError', () => {
  it('retries on 429 (rate limit)', () => {
    expect(isRetryableError(apiError(429))).toBe(true);
  });

  it('retries on 403 (quota exhausted)', () => {
    expect(isRetryableError(apiError(403))).toBe(true);
  });

  it('retries on 404 (model not found)', () => {
    expect(isRetryableError(apiError(404))).toBe(true);
  });

  it('retries on 5xx server errors', () => {
    expect(isRetryableError(apiError(500))).toBe(true);
    expect(isRetryableError(apiError(503))).toBe(true);
  });

  it('does not retry on 400 (bad request)', () => {
    expect(isRetryableError(apiError(400))).toBe(false);
  });

  it('does not retry on 401 (auth error)', () => {
    expect(isRetryableError(apiError(401))).toBe(false);
  });

  it('retries on non-APIError (network/timeout/DNS failures)', () => {
    expect(isRetryableError(new Error('ECONNRESET'))).toBe(true);
    expect(isRetryableError('some string')).toBe(true);
    expect(isRetryableError(undefined)).toBe(true);
  });
});

describe('getProviders', () => {
  it('never throws when every API key is missing (regression: empty apiKey used to crash the OpenAI client constructor)', () => {
    expect(() => getProviders()).not.toThrow();
    expect(getProviders()).toEqual([]);
  });

  it('skips providers with a short/placeholder key but keeps ones with a real key', () => {
    vi.stubEnv('GROQ_KEY_1', 'short');
    vi.stubEnv('GROQ_KEY_2', 'a-real-looking-groq-key-1234567890');

    const providers = getProviders();

    expect(providers.map((p) => p.name)).toEqual(['groq-2']);
  });

  it('returns providers in priority order (groq before openrouter)', () => {
    vi.stubEnv('GROQ_KEY_1', 'a-real-looking-groq-key-1234567890');
    vi.stubEnv('OPENROUTER_KEY_1', 'a-real-looking-openrouter-key-1234567890');

    const providers = getProviders();

    expect(providers.map((p) => p.name)).toEqual(['groq-1', 'openrouter-gemma', 'openrouter-auto']);
  });
});

describe('withFallback', () => {
  beforeEach(() => {
    vi.stubEnv('GROQ_KEY_1', 'a-real-looking-groq-key-1234567890');
    vi.stubEnv('GROQ_KEY_2', 'another-real-looking-groq-key-1234567890');
  });

  it('returns the result and provider name on first-provider success', async () => {
    const fn = vi.fn(async (p: Provider) => `ok-from-${p.name}`);

    const { result, providerUsed } = await withFallback(fn);

    expect(result).toBe('ok-from-groq-1');
    expect(providerUsed).toBe('groq-1');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('falls back to the next provider on a retryable error', async () => {
    const fn = vi.fn(async (p: Provider) => {
      if (p.name === 'groq-1') throw apiError(429);
      return `ok-from-${p.name}`;
    });

    const { result, providerUsed } = await withFallback(fn);

    expect(result).toBe('ok-from-groq-2');
    expect(providerUsed).toBe('groq-2');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('fails fast on a non-retryable error without trying later providers', async () => {
    const fn = vi.fn(async (p: Provider) => {
      if (p.name === 'groq-1') throw apiError(401);
      return `ok-from-${p.name}`;
    });

    await expect(withFallback(fn)).rejects.toMatchObject({ status: 401 });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws the last error when every provider fails', async () => {
    const fn = vi.fn(async (p: Provider) => {
      throw apiError(p.name === 'groq-1' ? 429 : 500);
    });

    await expect(withFallback(fn)).rejects.toMatchObject({ status: 500 });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws undefined when there are no providers available at all', async () => {
    vi.stubEnv('GROQ_KEY_1', '');
    vi.stubEnv('GROQ_KEY_2', '');
    const fn = vi.fn(async () => 'unreachable');

    await expect(withFallback(fn)).rejects.toBeUndefined();
    expect(fn).not.toHaveBeenCalled();
  });
});
