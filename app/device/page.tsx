'use client';

/** Mobile view for stakeholders: the chosen screen inside a 390 × 844 phone frame. */
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function Device() {
  const params = useSearchParams();
  const path = params.get('path') || '/';
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#1b1b20' }}>
      <div style={{ padding: 12, borderRadius: 52, background: '#0a0a0c', boxShadow: '0 0 0 2px #2c2c33, 0 30px 80px rgba(0,0,0,.6)' }}>
        <iframe
          key={path} src={path} title="Phone preview"
          onLoad={(e) => {
            // Keep the address (and the navigator highlight) in step with clicks inside the phone.
            try {
              const l = e.currentTarget.contentWindow?.location;
              const now = l ? l.pathname + l.search : path;
              if (now !== path) window.history.replaceState(null, '', `/device?path=${encodeURIComponent(now)}`);
            } catch { /* cross-origin: leave as is */ }
          }}
          style={{ display: 'block', width: 390, height: 844, maxHeight: 'calc(100vh - 72px)', border: 0, borderRadius: 40, background: '#03060a' }}
        />
      </div>
    </main>
  );
}

export default function Page() {
  return <Suspense fallback={null}><Device /></Suspense>;
}
