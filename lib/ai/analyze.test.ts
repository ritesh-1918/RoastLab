import { describe, it, expect, vi, beforeEach } from 'vitest';

const createMock = vi.fn();

vi.mock('./providers', () => ({
  withFallback: async (fn: (provider: unknown) => Promise<unknown>) => {
    const provider = {
      name: 'test-provider',
      model: 'test-model',
      supportsVision: true,
      client: { chat: { completions: { create: createMock } } },
    };
    const result = await fn(provider);
    return { result, providerUsed: provider.name };
  },
}));

vi.mock('../db', () => ({
  getSetting: vi.fn(async () => null),
}));

import { runAudit } from './analyze';

function mockResponse(content: string) {
  createMock.mockResolvedValueOnce({ choices: [{ message: { content } }] });
}

beforeEach(() => {
  createMock.mockReset();
});

describe('runAudit', () => {
  it('clamps an out-of-range score into 0-100', async () => {
    mockResponse(JSON.stringify({
      dimension: 'visual_design',
      score: 150,
      summary: 'summary',
      findings: [],
    }));

    const result = await runAudit({
      imageBase64: 'abc',
      mimeType: 'image/png',
      dimensions: ['visual_design'],
    });

    expect(result.dimensions[0].score).toBe(100);
    expect(result.overallScore).toBe(100);
  });

  it('clamps a negative score to 0', async () => {
    mockResponse(JSON.stringify({
      dimension: 'copywriting',
      score: -20,
      summary: 'summary',
      findings: [],
    }));

    const result = await runAudit({
      imageBase64: 'abc',
      mimeType: 'image/png',
      dimensions: ['copywriting'],
    });

    expect(result.dimensions[0].score).toBe(0);
  });

  it('rounds a fractional score', async () => {
    mockResponse(JSON.stringify({
      dimension: 'cta',
      score: 72.6,
      summary: 'summary',
      findings: [],
    }));

    const result = await runAudit({
      imageBase64: 'abc',
      mimeType: 'image/png',
      dimensions: ['cta'],
    });

    expect(result.dimensions[0].score).toBe(73);
  });

  it('strips markdown code fences before parsing JSON', async () => {
    mockResponse('```json\n' + JSON.stringify({
      dimension: 'seo',
      score: 60,
      summary: 'summary',
      findings: [],
    }) + '\n```');

    const result = await runAudit({
      imageBase64: 'abc',
      mimeType: 'image/png',
      dimensions: ['seo'],
    });

    expect(result.dimensions[0].score).toBe(60);
  });

  it('falls back to a safe default result when the model returns invalid JSON', async () => {
    mockResponse('this is not json at all');

    const result = await runAudit({
      imageBase64: 'abc',
      mimeType: 'image/png',
      dimensions: ['accessibility'],
    });

    expect(result.dimensions[0]).toMatchObject({
      dimension: 'accessibility',
      score: 50,
    });
    expect(result.dimensions[0].findings).toHaveLength(1);
  });

  it('falls back to a safe default when the model returns empty content', async () => {
    mockResponse('');

    const result = await runAudit({
      imageBase64: 'abc',
      mimeType: 'image/png',
      dimensions: ['performance'],
    });

    expect(result.dimensions[0].score).toBe(50);
  });

  it('averages scores across multiple dimensions for the overall score', async () => {
    mockResponse(JSON.stringify({ dimension: 'visual_design', score: 80, summary: '', findings: [] }));
    mockResponse(JSON.stringify({ dimension: 'copywriting', score: 40, summary: '', findings: [] }));
    mockResponse(JSON.stringify({ dimension: 'cta', score: 60, summary: '', findings: [] }));

    const result = await runAudit({
      imageBase64: 'abc',
      mimeType: 'image/png',
      dimensions: ['visual_design', 'copywriting', 'cta'],
    });

    expect(result.overallScore).toBe(60);
  });

  it('returns overallScore 0 when no dimensions are requested', async () => {
    const result = await runAudit({
      imageBase64: 'abc',
      mimeType: 'image/png',
      dimensions: [],
    });

    expect(result.overallScore).toBe(0);
    expect(result.dimensions).toEqual([]);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('invokes onDimensionComplete with each dimension result and provider name', async () => {
    mockResponse(JSON.stringify({ dimension: 'mobile_experience', score: 55, summary: '', findings: [] }));
    const onDimensionComplete = vi.fn();

    await runAudit({
      imageBase64: 'abc',
      mimeType: 'image/png',
      dimensions: ['mobile_experience'],
      onDimensionComplete,
    });

    expect(onDimensionComplete).toHaveBeenCalledTimes(1);
    expect(onDimensionComplete).toHaveBeenCalledWith(
      expect.objectContaining({ dimension: 'mobile_experience', score: 55 }),
      'test-provider',
    );
  });
});
