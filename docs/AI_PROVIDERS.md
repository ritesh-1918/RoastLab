# AI Providers

RoastLab uses a 5-provider fallback chain to maximize uptime and reduce latency.

## Fallback Order

```
openrouter-1 → openrouter-2 → groq-1 → groq-2 → gemini-1
```

If a provider fails (rate limit, timeout, invalid response), the next one is tried automatically.

## Provider Details

| # | Provider | Model | Speed | Notes |
|---|----------|-------|-------|-------|
| 1 | OpenRouter (key 1) | GPT-4V / Claude Sonnet | Medium | Best quality, vision support |
| 2 | OpenRouter (key 2) | GPT-4V / Claude Sonnet | Medium | Fallback key |
| 3 | Groq (key 1) | Llama 3.2 Vision | Fast | Very fast inference |
| 4 | Groq (key 2) | Llama 3.2 Vision | Fast | Fallback key |
| 5 | Gemini | Gemini 1.5 Flash | Medium | Google fallback |

## Architecture

Each dimension is analyzed independently. The same provider chain is used per dimension, but failures on one dimension don't restart the chain for others.

## Adding a Provider

In `lib/ai/analyze.ts`, add to the `PROVIDERS` array:

```typescript
{
  name: "my-provider",
  async call(prompt: string, imageUrl?: string): Promise<AnalysisResult> {
    // ... provider-specific API call
  }
}
```

## Scoring Calibration

The AI is prompted to score calibrated against real-world SaaS sites:

- Linear, Stripe, Vercel: 72–85 range
- Typical startup landing page: 45–65
- Poorly designed site: 25–45
- Actively broken: <25

This prevents the model from deflating all scores toward 25–50.
