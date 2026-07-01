import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { checkRateLimit, getClientIp } from './rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests up to the free limit', () => {
    const ip = `ip-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(ip);
      expect(res.allowed).toBe(true);
    }
  });

  it('blocks the 6th request within the same 24h window', () => {
    const ip = `ip-${Math.random()}`;
    for (let i = 0; i < 5; i++) checkRateLimit(ip);
    const res = checkRateLimit(ip);
    expect(res.allowed).toBe(false);
    expect(res.remaining).toBe(0);
  });

  it('decrements remaining count on each allowed request', () => {
    const ip = `ip-${Math.random()}`;
    expect(checkRateLimit(ip).remaining).toBe(4);
    expect(checkRateLimit(ip).remaining).toBe(3);
    expect(checkRateLimit(ip).remaining).toBe(2);
  });

  it('resets the count after the 24h window elapses', () => {
    const ip = `ip-${Math.random()}`;
    for (let i = 0; i < 5; i++) checkRateLimit(ip);
    expect(checkRateLimit(ip).allowed).toBe(false);

    vi.advanceTimersByTime(24 * 60 * 60 * 1000 + 1);

    const res = checkRateLimit(ip);
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(4);
  });

  it('tracks separate IPs independently', () => {
    const ipA = `ip-a-${Math.random()}`;
    const ipB = `ip-b-${Math.random()}`;
    for (let i = 0; i < 5; i++) checkRateLimit(ipA);

    expect(checkRateLimit(ipA).allowed).toBe(false);
    expect(checkRateLimit(ipB).allowed).toBe(true);
  });
});

describe('getClientIp', () => {
  it('prefers x-forwarded-for and takes the first address', () => {
    const req = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    const req = new Request('https://example.com', {
      headers: { 'x-real-ip': '9.9.9.9' },
    });
    expect(getClientIp(req)).toBe('9.9.9.9');
  });

  it('falls back to "unknown" when no IP headers are present', () => {
    const req = new Request('https://example.com');
    expect(getClientIp(req)).toBe('unknown');
  });
});
