/**
 * Prototype navigator: every screen of the A/B/C test, grouped the way César's canvas groups them.
 * Only flow A is built; Control is live today; B and C are listed so stakeholders see what's planned.
 */
export type Screen = { id: string; title: string; path?: string; note?: string };
export type Flow = { id: string; name: string; status: 'built' | 'progress' | 'live' | 'planned'; summary: string; screens: Screen[] };

export const FLOWS: Flow[] = [
  {
    id: 'A', name: 'A · Guided signup', status: 'built',
    summary: 'Signup changes only: people connect the exchange before entering, with much more guidance.',
    screens: [
      { id: 'A-01', title: 'Welcome · what you get', path: '/' },
      { id: 'A-02', title: 'Create account', path: '/account' },
      { id: 'A-03', title: 'Verify email', path: '/verify?email=alex@example.com' },
      { id: 'A-04', title: 'About you', path: '/about' },
      { id: 'A-05', title: 'Your plan', path: '/plan' },
      { id: 'A-06', title: 'Why connect an exchange', path: '/why-connect' },
      { id: 'A-07', title: 'Choose your exchange', path: '/exchange' },
      { id: 'A-09', title: 'Before you start', path: '/connect?exchange=bitunix' },
      { id: 'A-10', title: 'Step 1/5 · Open the exchange', path: '/connect/open?exchange=bitunix' },
      { id: 'A-11', title: 'Step 2/5 · Sign up on the exchange', path: '/connect/signup?exchange=bitunix' },
      { id: 'A-12', title: 'Step 3/5 · Verify your identity', path: '/connect/kyc?exchange=bitunix' },
      { id: 'A-13', title: 'Step 4/5 · Find your UID', path: '/connect/uid?exchange=bitunix' },
      { id: 'A-14', title: 'Step 5/5 · Paste your UID', path: '/connect/paste?exchange=bitunix' },
      { id: 'A-15', title: 'Checking', path: '/connect/checking?exchange=bitunix' },
      { id: 'A-17', title: 'Connected · what’s next', path: '/connected?exchange=bitunix' },
      { id: 'A-18', title: 'Dashboard · tour and checklist', path: '/dashboard?exchange=bitunix' }
    ]
  },
  {
    id: 'B', name: 'B · Connect right after entering', status: 'built',
    summary: 'No exchange in signup; it’s required as soon as people enter the platform.',
    screens: [
      { id: 'B-01', title: 'Create account (short)', path: '/b', note: 'Reuses A-02, 2 steps' },
      { id: 'B-02', title: 'Verify email', path: '/b/verify?email=alex@example.com', note: 'Reuses A-03, step 2 of 2' },
      { id: 'B-03', title: 'Dashboard + connect modal', path: '/b/dashboard' },
      { id: 'B-05', title: 'Connect · reuses A-07 to A-17', path: '/b/connect' },
      { id: 'B-06', title: 'Dashboard · not connected', path: '/b/dashboard?modal=0' },
      { id: 'B-07', title: 'Locked feature sheet', path: '/b/dashboard?modal=0', note: 'Tap any lock on B-06' },
      { id: 'B-08', title: 'Emails · day 1 + day 3', path: '/b/emails' },
      { id: 'B-09', title: 'Dashboard · fully unlocked', path: '/b/unlocked?exchange=bitunix' }
    ]
  },
  {
    id: 'C', name: 'C · Freemium 7 days', status: 'planned',
    summary: '7 free days of the free parts; then the freemium locks, but the account stays open.',
    screens: [
      { id: 'C-01', title: 'Create account (short)', note: 'Reuses B-01' },
      { id: 'C-03', title: 'Trial welcome' },
      { id: 'C-04', title: 'Dashboard · trial' },
      { id: 'C-09', title: 'Lock wall' },
      { id: 'C-11', title: 'Reactivation landing' },
      { id: 'C-13', title: 'Dashboard · fully unlocked' }
    ]
  },
  {
    id: 'CTRL', name: 'Control · Live today', status: 'live',
    summary: 'The current 5-step signup, unchanged. Only tracking events are added.',
    screens: [{ id: 'CTRL', title: 'Live signup on app.trade-x.de', note: 'Not rebuilt here' }]
  }
];

/** Screens outside the happy path: alternative states, overlays and emails. */
export const EXTRAS: { group: string; screens: Screen[] }[] = [
  {
    group: 'Exchange variants',
    screens: [
      { id: 'A-10', title: 'Open the exchange · Pionex', path: '/connect/open?exchange=pionex' },
      { id: 'A-11', title: 'Sign up · Pionex', path: '/connect/signup?exchange=pionex' },
      { id: 'A-12', title: 'ID check · Pionex', path: '/connect/kyc?exchange=pionex' },
      { id: 'A-13', title: 'Find your UID · Pionex', path: '/connect/uid?exchange=pionex' }
    ]
  },
  {
    group: 'Other states',
    screens: [
      { id: 'A-08b', title: 'Already have an account', path: '/exchange', note: 'Continue → “Yes, I already have one”' },
      { id: 'A-09', title: 'Before you start · fresh account', path: '/connect?exchange=bitunix&fresh=1' },
      { id: 'A-19', title: 'Didn’t work · not opened through TradeX', path: '/connect/failed?exchange=bitunix&reason=not_linked' },
      { id: 'A-19', title: 'Didn’t work · UID not found', path: '/connect/failed?exchange=pionex&reason=not_found' },
      { id: 'A-20', title: 'Help drawer', path: '/connect/kyc?exchange=bitunix', note: 'Open “Help” on any connect step' },
      { id: 'A-06', title: '“Explore first” (to decide)', path: '/explore' }
    ]
  },
  {
    group: 'Emails',
    screens: [
      { id: 'A-21', title: 'Resume emails · 1h, 24h, 72h', path: '/emails' },
      { id: 'B-08', title: 'Not connected · day 1 + day 3', path: '/b/emails' }
    ]
  }
];

/** Demo values that trigger the alternative states. */
export const DEMO_VALUES = [
  { where: 'A-02 email', value: 'taken@example.com', result: 'Email already has an account' },
  { where: 'A-03 code', value: '000000', result: 'Wrong code' },
  { where: 'A-03 code', value: '999999', result: 'Expired code' },
  { where: 'A-14 UID', value: '111111111', result: 'UID already used' },
  { where: 'A-14 UID', value: '222222222', result: 'Not opened through TradeX → A-19' }
];
