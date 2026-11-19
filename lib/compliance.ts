'use client';

/**
 * EU compliance switch (review of 17 Nov 2026, "Signup A/B/C: EU compliance review").
 * 'eu' = the screens changed to follow MiCA, GDPR / TDDDG and UWG; 'current' = the screens as they were before the review.
 * The prototype navigator flips it on any screen; ?rules=eu|current sets it from a link (for prints).
 * Kept in localStorage so the phone frame (an iframe) follows the switch too.
 */
import { useEffect, useState } from 'react';
import type { ExchangeId } from './exchanges';

const KEY = 'tx_rules';
const EVENT = 'tx-rules';
export type Rules = 'eu' | 'current';

export function rules(): Rules {
  if (typeof window === 'undefined') return 'eu';
  try { return localStorage.getItem(KEY) === 'current' ? 'current' : 'eu'; } catch { return 'eu'; }
}

export function setRules(r: Rules) {
  try { localStorage.setItem(KEY, r); } catch { /* switch lasts for this page only */ }
  window.dispatchEvent(new Event(EVENT));
}

/** True while the EU-compliant screens are on. Starts true on the server, then follows the switch. */
export function useEU(): boolean {
  const [eu, setEu] = useState(true);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('rules');
    if (p === 'eu' || p === 'current') try { localStorage.setItem(KEY, p); } catch { /* ignore */ }
    const read = () => setEu(rules() === 'eu');
    read();
    window.addEventListener(EVENT, read);
    window.addEventListener('storage', read);
    return () => { window.removeEventListener(EVENT, read); window.removeEventListener('storage', read); };
  }, []);
  return eu;
}

/**
 * MiCA: since 1 Jul 2026 only authorised providers may serve EU residents.
 * Bitunix isn't on ESMA's register (Nov 2026). Pionex serves the EU through its Irish entity.
 * Business decision (Nov 19, 2026): keep Bitunix open in EU mode for now, even without the licence. Legal risk accepted by TradeX.
 * Set bitunix to false to show it as "Not available in the EU yet" again; every screen follows this flag.
 * TO CONFIRM with legal before launch: both exchanges in the ESMA CASP register, and Pionex's EU affiliate link.
 */
export const EU_AVAILABLE: Record<ExchangeId, boolean> = { bitunix: true, pionex: true };
export const available = (id: ExchangeId, eu: boolean) => !eu || EU_AVAILABLE[id];
/** Exchanges people can open, in words: "Bitunix or Pionex", or only "Pionex" while Bitunix is off in the EU. */
export const openNames = (eu: boolean) => (available('bitunix', eu) ? 'Bitunix or Pionex' : 'Pionex');

/** Short disclosures shown wherever we ask people to trade or connect (EU mode). One sentence per line. */
export const RISK = 'Crypto trading is high risk. You can lose all the money you invest.';
export const COMMISSION = 'TradeX is free because the exchange pays us a share of your trading fees.';

/** Analytics consent (TDDDG §25): nothing is sent to PostHog until people accept. */
const CONSENT_KEY = 'tx_consent';
export type Consent = 'granted' | 'denied' | null;
export function consent(): Consent {
  try { const v = localStorage.getItem(CONSENT_KEY); return v === 'granted' || v === 'denied' ? v : null; } catch { return null; }
}
export function setConsent(v: Consent) {
  try { if (v) localStorage.setItem(CONSENT_KEY, v); else localStorage.removeItem(CONSENT_KEY); } catch { /* ask again next visit */ }
  window.dispatchEvent(new Event(EVENT));
}
