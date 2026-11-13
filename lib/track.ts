'use client';

/**
 * Signup events, named as in the TradeX signup tracking brief and César's canvas.
 * Every event carries variant, brand and, on step screens, step_number and step_name.
 * When PostHog is on the page (window.posthog), events go there; otherwise they are logged in development.
 */
import { BRANDS, STEPS, type StepKey } from './flow';

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    posthog?: { capture: (event: string, props?: Props) => void };
  }
}

/** Flag values from the canvas dev brief. Routes under /b and /c belong to flows B and C; everything else is flow A. */
const FLOW_KEY = 'tx_flow';
export type FlowId = 'a' | 'b' | 'c';

/** Set by each flow's entry screen (A-01, B-01, …) so shared screens know which flow they serve. */
export function setFlow(f: FlowId) {
  try { sessionStorage.setItem(FLOW_KEY, f); } catch { /* falls back to the route */ }
}

export function currentFlow(): FlowId {
  if (typeof window === 'undefined') return 'a';
  const p = window.location.pathname;
  if (p === '/b' || p.startsWith('/b/')) return 'b';
  if (p === '/c' || p.startsWith('/c/')) return 'c';
  try { const f = sessionStorage.getItem(FLOW_KEY); if (f === 'b' || f === 'c') return f; } catch { /* default */ }
  return 'a';
}

export function variant(): string {
  return { a: 'a-guided', b: 'b-softlock', c: 'c-freemium' }[currentFlow()];
}
const BRAND_KEY = 'tx_brand';

/** Reads ?brand= once (Tim's /register has none) and keeps it for the rest of the signup. */
export function rememberBrand(param: string | null) {
  if (typeof window === 'undefined') return;
  const b = (param || '').toLowerCase();
  try {
    if ((BRANDS as readonly string[]).includes(b)) sessionStorage.setItem(BRAND_KEY, b);
    else if (!sessionStorage.getItem(BRAND_KEY)) sessionStorage.setItem(BRAND_KEY, 'tim');
  } catch { /* storage blocked: brand falls back to tim */ }
}

export function brand(): string {
  try { return sessionStorage.getItem(BRAND_KEY) || 'tim'; } catch { return 'tim'; }
}

export function stepProps(key: StepKey): Props {
  return { step_number: STEPS[key].number, step_name: key };
}

export function track(event: string, props: Props = {}) {
  if (typeof window === 'undefined') return;
  const payload = { variant: variant(), brand: brand(), ...props };
  if (window.posthog) window.posthog.capture(event, payload);
  else if (process.env.NODE_ENV !== 'production') console.info('[track]', event, payload);
}
