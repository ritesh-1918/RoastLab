'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Globe, Upload, X } from 'lucide-react';

export function QuickAuditInput() {
  const [tab, setTab] = useState<'url' | 'screenshot'>('url');
  const [url, setUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadData, setUploadData] = useState<{ base64: string; mimeType: string; name: string } | null>(null);
  const router = useRouter();

  function handleAnalyze() {
    const trimmed = url.trim();
    if (!trimmed) return;
    const target = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    router.push(`/analyze?url=${encodeURIComponent(target)}&tier=full`);
  }

  function handleStartRoasting() {
    if (!uploadData) return;
    sessionStorage.setItem('roastlab_upload', JSON.stringify(uploadData));
    router.push('/analyze?upload=1&tier=full');
  }

  function clearFile() {
    setPreviewUrl(null);
    setUploadData(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#09090B', border: '1px solid #1E1E28', borderRadius: 8, padding: 4 }}>
        {([
          { key: 'url', label: 'URL', Icon: Globe },
          { key: 'screenshot', label: 'Screenshot', Icon: Upload },
        ] as const).map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); clearFile(); setUrl(''); }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              padding: '7px 12px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background: tab === key ? '#1E1E28' : 'transparent',
              color: tab === key ? '#FAFAFA' : '#52526A',
              transition: 'all 150ms',
            }}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* URL tab */}
      {tab === 'url' && (
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: '#09090B', border: '1px solid #27273A', borderRadius: 8, padding: '0 14px' }}>
            <span style={{ fontSize: 12, color: '#4A4A62', fontFamily: 'var(--font-geist-mono), monospace' }}>https://</span>
            <input
              type="url"
              placeholder="yoursite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#FAFAFA', padding: '11px 0', fontFamily: 'var(--font-geist-mono), monospace' }}
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!url.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 18px', background: url.trim() ? '#E8334A' : '#27273A', color: url.trim() ? '#fff' : '#52526A', borderRadius: 8, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '-0.01em', minHeight: 42, border: 'none', cursor: url.trim() ? 'pointer' : 'not-allowed', transition: 'background 150ms' }}
          >
            Analyze <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Screenshot tab */}
      {tab === 'screenshot' && (
        previewUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#09090B', border: '1px solid #27273A', borderRadius: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid #27273A', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 12, color: '#8B8BA3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadData?.name}</span>
            <button onClick={clearFile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52526A', padding: 4 }}><X size={14} /></button>
            <button
              onClick={handleStartRoasting}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: '#E8334A', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Roast it <ArrowRight size={13} />
            </button>
          </div>
        ) : (
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '28px 24px', background: '#09090B', border: '1px dashed #27273A', borderRadius: 8, cursor: 'pointer' }}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                if (f) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const dataUrl = reader.result as string;
                    setPreviewUrl(dataUrl);
                    setUploadData({ base64: dataUrl.split(',')[1], mimeType: f.type, name: f.name });
                  };
                  reader.readAsDataURL(f);
                }
              }}
            />
            <Upload size={20} style={{ color: '#4A4A62' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#8B8BA3', margin: 0 }}>Drop screenshot or click to browse</p>
              <p style={{ fontSize: 11, color: '#4A4A62', margin: '3px 0 0' }}>JPG, PNG, WebP — Figma mocks, live pages, competitor UIs</p>
            </div>
          </label>
        )
      )}
    </div>
  );
}
