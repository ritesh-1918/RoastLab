'use client';

import { useState } from 'react';
import { Save, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';

const DIMENSIONS = [
  'visual_design', 'copywriting', 'cta', 'ux_flow',
  'accessibility', 'trust_signals', 'mobile_experience', 'performance', 'seo',
];

const DIM_LABELS: Record<string, string> = {
  visual_design: 'Visual Design', copywriting: 'Copywriting', cta: 'CTA',
  ux_flow: 'UX Flow', accessibility: 'Accessibility', trust_signals: 'Trust Signals',
  mobile_experience: 'Mobile Experience', performance: 'Performance', seo: 'SEO',
};

interface Props {
  settings: { key: string; value: string; updated_at: string }[];
}

export function AdminPromptsPanel({ settings }: Props) {
  const getVal = (k: string) => settings.find(s => s.key === k)?.value ?? '';

  const [systemPrompt, setSystemPrompt] = useState(getVal('system_prompt'));
  const [dimPrompts, setDimPrompts] = useState<Record<string, string>>(
    Object.fromEntries(DIMENSIONS.map(d => [d, getVal(`prompt_${d}`)]))
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function save(key: string, value: string) {
    setSaving(key);
    try {
      const r = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (r.ok) { setSaved(key); setTimeout(() => setSaved(null), 2000); }
    } finally {
      setSaving(null);
    }
  }

  function reset(key: string) {
    if (key === 'system_prompt') setSystemPrompt('');
    else setDimPrompts(p => ({ ...p, [key.replace('prompt_', '')]: '' }));
    save(key, '');
  }

  const btnStyle = (active: boolean, color = '#E8334A') => ({
    display: 'inline-flex', alignItems: 'center' as const, gap: 5,
    padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
    border: 'none', cursor: 'pointer',
    background: active ? color : '#1E1E28',
    color: active ? '#fff' : '#8B8BA3',
  });

  return (
    <div style={{ padding: '20px 22px' }}>
      <p style={{ fontSize: 12, color: '#4A4A62', margin: '0 0 20px', lineHeight: 1.6 }}>
        Override AI prompts live. Leave blank to use defaults from code.
        Changes apply to next audit immediately — no redeploy needed.
      </p>

      {/* System prompt */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#BF5AF2', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            System Prompt (ROASTBOT personality)
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={btnStyle(false)} onClick={() => reset('system_prompt')}><RotateCcw size={10} /> Reset</button>
            <button style={btnStyle(saved === 'system_prompt', '#32D74B')} onClick={() => save('system_prompt', systemPrompt)} disabled={saving === 'system_prompt'}>
              <Save size={10} />
              {saved === 'system_prompt' ? 'Saved!' : saving === 'system_prompt' ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
        <textarea
          value={systemPrompt}
          onChange={e => setSystemPrompt(e.target.value)}
          placeholder="Leave blank to use default ROASTBOT 9000 system prompt from code…"
          style={{ width: '100%', minHeight: 120, background: '#09090B', border: '1px solid #27273A', borderRadius: 8, padding: '10px 12px', fontSize: 11, color: '#FAFAFA', fontFamily: 'monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
        />
      </div>

      {/* Per-dimension prompt overrides */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#4A4A62', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
          Dimension Prompt Overrides
        </p>
        {DIMENSIONS.map(dim => {
          const key = `prompt_${dim}`;
          const isOpen = expanded === dim;
          return (
            <div key={dim} style={{ marginBottom: 8, border: '1px solid #1E1E28', borderRadius: 8, overflow: 'hidden' }}>
              <button
                onClick={() => setExpanded(isOpen ? null : dim)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#0D0D14', border: 'none', cursor: 'pointer', color: '#FAFAFA', fontSize: 12, fontWeight: 600 }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isOpen ? <ChevronDown size={12} style={{ color: '#4A4A62' }} /> : <ChevronRight size={12} style={{ color: '#4A4A62' }} />}
                  {DIM_LABELS[dim]}
                  {dimPrompts[dim] && <span style={{ fontSize: 9, color: '#32D74B', border: '1px solid #32D74B44', padding: '0 5px', borderRadius: 99, letterSpacing: '0.06em' }}>OVERRIDE</span>}
                </span>
              </button>
              {isOpen && (
                <div style={{ padding: '12px 14px', background: '#09090B', borderTop: '1px solid #1E1E28' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 8 }}>
                    <button style={btnStyle(false)} onClick={() => reset(key)}><RotateCcw size={10} /> Reset</button>
                    <button style={btnStyle(saved === key, '#32D74B')} onClick={() => save(key, dimPrompts[dim])} disabled={saving === key}>
                      <Save size={10} />
                      {saved === key ? 'Saved!' : saving === key ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                  <textarea
                    value={dimPrompts[dim]}
                    onChange={e => setDimPrompts(p => ({ ...p, [dim]: e.target.value }))}
                    placeholder={`Override the ${DIM_LABELS[dim]} analysis prompt… leave blank to use default.`}
                    style={{ width: '100%', minHeight: 90, background: '#111117', border: '1px solid #27273A', borderRadius: 6, padding: '8px 10px', fontSize: 11, color: '#FAFAFA', fontFamily: 'monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
