'use client';

import { useRef } from 'react';
import s from './signup.module.css';

/** Six single-digit boxes (Figma 842:9279) with paste support, auto-advance and arrow keys. */
export default function CodeInput({ value, onChange, error, disabled, describedBy }: {
  value: string; onChange: (v: string) => void; error?: boolean; disabled?: boolean; describedBy?: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '');
  const focusBox = (i: number) => {
    const el = refs.current[Math.max(0, Math.min(5, i))];
    el?.focus(); el?.select();
  };
  const fill = (from: number, raw: string) => {
    const chars = value.padEnd(6, ' ').split('');
    raw.split('').forEach((d, k) => { if (from + k < 6) chars[from + k] = d; });
    const next = chars.join('').replace(/\s+$/, '');
    onChange(next.replace(/\s/g, ''));
    focusBox(from + raw.length);
  };

  return (
    <div className={s.code} role="group" aria-label="6-digit code" aria-describedby={describedBy}>
      {digits.map((d, i) => (
        <input
          key={i} ref={(el) => { refs.current[i] = el; }} id={`code-${i}`}
          className={`${s.codeBox} ${error ? s.codeBoxError : ''}`}
          inputMode="numeric" pattern="[0-9]*" autoComplete={i === 0 ? 'one-time-code' : 'off'} maxLength={6}
          value={d} placeholder="0" disabled={disabled} aria-label={`Digit ${i + 1} of 6`} aria-invalid={error || undefined}
          autoFocus={i === 0}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, '');
            if (!raw) { onChange(value.slice(0, i) + value.slice(i + 1)); return; }
            // One digit typed over an existing one arrives as two characters; keep the new one.
            fill(i, raw.length === 2 && d ? raw.slice(-1) : raw);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digits[i]) { e.preventDefault(); onChange(value.slice(0, Math.max(0, i - 1))); focusBox(i - 1); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); focusBox(i - 1); }
            if (e.key === 'ArrowRight') { e.preventDefault(); focusBox(i + 1); }
          }}
          onPaste={(e) => {
            const raw = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
            if (!raw) return;
            e.preventDefault();
            onChange(raw);
            focusBox(raw.length);
          }}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
