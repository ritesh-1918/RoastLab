import { describe, it, expect } from 'vitest';
import { scoreColor, scoreVerdict } from './email';

describe('scoreColor', () => {
  it('is green at and above 70', () => {
    expect(scoreColor(70)).toBe('#32D74B');
    expect(scoreColor(100)).toBe('#32D74B');
  });

  it('is yellow between 45 and 69', () => {
    expect(scoreColor(45)).toBe('#FFD60A');
    expect(scoreColor(69)).toBe('#FFD60A');
  });

  it('is red below 45', () => {
    expect(scoreColor(44)).toBe('#FF2D55');
    expect(scoreColor(0)).toBe('#FF2D55');
  });
});

describe('scoreVerdict', () => {
  it('returns the top verdict at and above 75', () => {
    expect(scoreVerdict(75)).toBe('Actually fire 🔥');
    expect(scoreVerdict(100)).toBe('Actually fire 🔥');
  });

  it('returns the "mid" verdict between 60 and 74', () => {
    expect(scoreVerdict(60)).toBe('Mid but salvageable 😐');
    expect(scoreVerdict(74)).toBe('Mid but salvageable 😐');
  });

  it('returns the "what is this" verdict between 40 and 59', () => {
    expect(scoreVerdict(40)).toBe('bestie WHAT IS THIS 💀');
    expect(scoreVerdict(59)).toBe('bestie WHAT IS THIS 💀');
  });

  it('returns the "disaster" verdict between 20 and 39', () => {
    expect(scoreVerdict(20)).toBe("it's giving disaster 🚨");
    expect(scoreVerdict(39)).toBe("it's giving disaster 🚨");
  });

  it('returns the emergency verdict below 20', () => {
    expect(scoreVerdict(19)).toBe('Call 911 immediately ☠️');
    expect(scoreVerdict(0)).toBe('Call 911 immediately ☠️');
  });
});
