'use client';

/**
 * Prototype navigator for stakeholders: an admin-style panel on every screen.
 * Lists the A/B/C flows and Control, screens outside the happy path (variants, states, emails),
 * a desktop / phone view switch and the demo values. Hidden inside the phone frame and with ?clean=1 (for prints).
 * Toggle with the "Prototype" pill or the P key.
 */
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FLOWS, EXTRAS, DEMO_VALUES, type Screen } from '@/lib/prototypeMap';
import n from './navigator.module.css';

export default function Navigator() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [tab, setTab] = useState<'flows' | 'more' | 'demo'>('flows');

  const current = pathname + (params.toString() ? `?${params}` : '');
  const inDevice = pathname === '/device';

  useEffect(() => {
    let framed = false;
    try { framed = window.self !== window.top; } catch { framed = true; }
    setHidden(framed || params.get('clean') === '1');
  }, [params]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
      if (e.key === 'p' || e.key === 'P') setOpen((o) => !o);
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (hidden) return null;

  /** The page currently shown, whether full screen or inside the phone frame. */
  const shownPath = inDevice ? (params.get('path') || '/') : current;
  // Several rows can share a route (C-04, C-05 and C-07 are all /c/dashboard), so an exact match (with its query) wins;
  // otherwise the row whose route matches is highlighted.
  const allPaths = [...FLOWS, ...EXTRAS].flatMap((g) => g.screens.flatMap((s) => [s.path, ...(s.variants ?? []).map((v) => v.path)]));
  const exact = allPaths.includes(shownPath);
  const isCurrent = (path?: string) => !!path && (exact ? path === shownPath : path.split('?')[0] === shownPath.split('?')[0]);

  const go = (path: string) => {
    router.push(inDevice ? `/device?path=${encodeURIComponent(path)}` : path);
    if (window.matchMedia('(max-width: 720px)').matches) setOpen(false);
  };
  const setView = (view: 'desktop' | 'phone') => {
    if (view === 'phone' && !inDevice) router.push(`/device?path=${encodeURIComponent(current)}`);
    if (view === 'desktop' && inDevice) router.push(shownPath);
  };
  const row = (s: Screen, i: number) => {
    const disabled = !s.path;
    const onVariant = s.variants?.some((v) => isCurrent(v.path));
    return (
      <li key={`${s.id}-${i}`}>
        <button type="button" className={`${n.row} ${isCurrent(s.path) || onVariant ? n.rowOn : ''}`} disabled={disabled} onClick={() => s.path && go(s.path)} aria-current={isCurrent(s.path) ? 'page' : undefined}>
          <span className={n.id}>{s.id}</span>
          <span className={n.title}>{s.title}{s.note && <small>{s.note}</small>}</span>
        </button>
        {s.variants && (
          <div className={n.variants} role="group" aria-label={`${s.id} variants`}>
            {s.variants.map((v) => (
              <button key={v.path} type="button" className={`${n.chip} ${isCurrent(v.path) ? n.chipOn : ''}`} onClick={() => go(v.path)} aria-current={isCurrent(v.path) ? 'page' : undefined}>{v.label}</button>
            ))}
          </div>
        )}
      </li>
    );
  };

  return (
    <>
      <button type="button" className={n.pill} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="proto-nav">
        <span className={n.dot} aria-hidden />Prototype
      </button>

      {open && (
        <aside id="proto-nav" className={n.panel} aria-label="Prototype navigator">
          <div className={n.head}>
            <div>
              <p className={n.kicker}>TradeX signup test · prototype</p>
              <h2>Navigator</h2>
            </div>
            <button type="button" className={n.close} onClick={() => setOpen(false)} aria-label="Close navigator">×</button>
          </div>

          <div className={n.view} role="group" aria-label="View">
            <button type="button" aria-pressed={!inDevice} onClick={() => setView('desktop')}>Desktop</button>
            <button type="button" aria-pressed={inDevice} onClick={() => setView('phone')}>Mobile</button>
          </div>

          <div className={n.tabs} role="tablist">
            {([['flows', 'Flows'], ['more', 'Out of flow'], ['demo', 'Demo values']] as const).map(([k, l]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>

          <div className={n.body}>
            {tab === 'flows' && FLOWS.map((f) => (
              <section key={f.id} className={n.group}>
                <div className={n.groupHead}>
                  <h3>{f.name}</h3>
                  <span className={`${n.status} ${n['st_' + f.status]}`}>{f.status === 'built' ? 'Built' : f.status === 'progress' ? 'In progress' : f.status === 'live' ? 'Live' : 'Planned'}</span>
                </div>
                <p className={n.summary}>{f.summary}</p>
                <ol className={n.list}>{f.screens.map(row)}</ol>
              </section>
            ))}

            {tab === 'more' && EXTRAS.map((g) => (
              <section key={g.group} className={n.group}>
                <div className={n.groupHead}><h3>{g.group}</h3></div>
                <ul className={n.list}>{g.screens.map(row)}</ul>
              </section>
            ))}

            {tab === 'demo' && (
              <section className={n.group}>
                <p className={n.summary}>Type these values to see the other states. Anything else follows the happy path.</p>
                <ul className={n.demo}>
                  {DEMO_VALUES.map((d) => (
                    <li key={d.value}><span>{d.where}</span><code>{d.value}</code><span>{d.result}</span></li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div className={n.foot}>
            <span>Press P to show or hide</span>
          </div>
        </aside>
      )}
    </>
  );
}
