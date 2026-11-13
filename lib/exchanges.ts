export type ExchangeId = 'bitunix' | 'pionex';

export type Exchange = {
  id: ExchangeId;
  name: string;
  pool: string;
  logo: { src: string; width: number; height: number };
  /** Plain-words comparison rows for A-07 (label → value). Only facts confirmed by César, Nov 11, 2026. */
  compare: { bestFor: string; welcome: string; extra: string };
};

export const EXCHANGES: Exchange[] = [
  {
    id: 'bitunix', name: 'Bitunix', pool: '$40,000',
    logo: { src: '/signup/ex-bitunix.svg', width: 28.5, height: 22.349 },
    compare: {
      bestFor: 'Getting started. Most TradeX members use it.',
      welcome: '$10 when you sign up, plus 20% on your deposit',
      extra: '20% lower trading fees'
    }
  },
  {
    id: 'pionex', name: 'Pionex', pool: '$25,000',
    logo: { src: '/signup/ex-pionex.png', width: 32, height: 32 },
    compare: {
      bestFor: 'Letting bots trade for you',
      welcome: '75 USDT after the ID check, plus up to 1,000 USDT on your deposit',
      extra: 'Free trading bots and a 100 USDT futures grid bonus'
    }
  }
];

export const exchangeById = (id: string | null) => EXCHANGES.find((e) => e.id === id);

/** Profile saved by A-04 (About you). Empty if A-04 was skipped; Bitunix is then the pick. */
export type Profile = { level?: string; goal?: string; current_exchange?: string };

export function readProfile(): Profile {
  try { return JSON.parse(sessionStorage.getItem('tx_profile') || '{}') as Profile; } catch { return {}; }
}

/** Our pick and the one-line reason shown on its badge. */
export function recommend(p: Profile): { id: ExchangeId; reason: string } {
  if (p.current_exchange === 'bitunix') return { id: 'pionex', reason: 'You don’t use it yet' };
  if (p.current_exchange === 'pionex') return { id: 'bitunix', reason: 'You don’t use it yet' };
  if (p.level === 'pro') return { id: 'bitunix', reason: 'Lowest fees for active traders' };
  return { id: 'bitunix', reason: 'Best for beginners' };
}

/**
 * Affiliate links and referral codes per brand. PLACEHOLDERS: the real links and codes come from
 * the partner dashboards (Tim's /register, ?brand=markus, ?brand=lucas). The prototype only opens the public sign-up page.
 */
export const AFFILIATE: Record<ExchangeId, { url: string; codes: Record<string, string> }> = {
  bitunix: { url: 'https://www.bitunix.com/register', codes: { tim: 'TRADEXTIM', markus: 'TRADEXMARKUS', lucas: 'TRADEXLUCAS' } },
  pionex: { url: 'https://www.pionex.com/', codes: { tim: 'TRADEXTIM', markus: 'TRADEXMARKUS', lucas: 'TRADEXLUCAS' } }
};

/** Box on a print as % of the image: left, top, width, height. */
export type PrintBox = [number, number, number, number];
export type Print = { desktop: string; mobile?: string; alt: string; mark: PrintBox; mobileMark?: PrintBox; masks?: PrintBox[]; mobileMasks?: PrintBox[] };

/** Partner sign-up form with the referral / invitation code field highlighted (English prints, Nov 2026). */
export const REGISTER_PRINT: Record<ExchangeId, { print: Print; field: string }> = {
  bitunix: {
    field: 'Invitation code (optional)',
    print: { desktop: '/signup/bitunix/register-desktop.jpg', mobile: '/signup/bitunix/register-mobile.jpg', alt: 'Bitunix sign-up form with the invitation code field', mark: [13, 37, 74, 13.5], mobileMark: [1.5, 49.5, 96.5, 16.5] }
  },
  pionex: {
    field: 'Referral code (optional)',
    // Phone print shows a test email and password; both are blurred.
    print: { desktop: '/signup/pionex/register-desktop.jpg', mobile: '/signup/pionex/register-mobile.jpg', alt: 'Pionex sign-up form with the referral code field', mark: [4.5, 55.5, 89, 11.5], mobileMark: [3.5, 55.5, 92, 11.5], mobileMasks: [[6.5, 33.5, 40, 5], [6.5, 46.5, 13, 5]] }
  }
};
