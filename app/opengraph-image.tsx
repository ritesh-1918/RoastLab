import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'RoastLab — AI Website Roaster';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#09090B',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Grid background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(232,51,74,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,51,74,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}/>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: '#E8334A', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
            🔥
          </div>
          <span style={{ fontSize: 64, fontWeight: 900, color: '#FAFAFA', letterSpacing: '-0.04em' }}>
            ROAST<span style={{ color: '#E8334A' }}>LAB</span>
          </span>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 28, color: '#8B8BA3', margin: '0 0 40px', textAlign: 'center', maxWidth: 700, lineHeight: 1.4 }}>
          AI roasts your website across 9 dimensions — zero mercy, pure receipts
        </p>

        {/* Score pills */}
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'Visual Design', score: 34, color: '#FF2D55' },
            { label: 'Copywriting', score: 51, color: '#FF9F0A' },
            { label: 'SEO', score: 28, color: '#FF2D55' },
          ].map(({ label, score, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#111117', border: '1px solid #1E1E28', borderRadius: 12, padding: '10px 18px' }}>
              <span style={{ fontSize: 16, color: '#8B8BA3' }}>{label}</span>
              <span style={{ fontSize: 20, fontWeight: 900, color }}>{score}/100</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
