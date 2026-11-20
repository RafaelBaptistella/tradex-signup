/**
 * Prototype navigator: every screen of the A/B/C test, grouped the way César's canvas groups them.
 * Flows A, B and C are built; Control is live today.
 */
/** variants: extra links shown as chips under the row (e.g. one per trial day). */
export type Screen = { id: string; title: string; path?: string; note?: string; variants?: { label: string; path: string }[] };
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
      { id: 'B-03', title: 'Dashboard + connect paywall', path: '/b/dashboard?modal=1' },
      { id: 'B-05', title: 'Connect · reuses A-07 to A-17', path: '/b/connect' },
      { id: 'B-06', title: 'Dashboard · not connected', path: '/b/dashboard?modal=0' },
      { id: 'B-07', title: 'Locked feature paywall', path: '/b/dashboard?modal=0&sheet=cashback', note: 'Or tap any lock on B-06',
        variants: [['cashback', 'Monthly rewards'], ['ranking', 'Ranking']].map(([k, l]) => ({ label: l, path: `/b/dashboard?modal=0&sheet=${k}` })) },
      { id: 'B-08', title: 'Emails · day 1 + day 3', path: '/b/emails' },
      { id: 'B-09', title: 'Dashboard · fully unlocked', path: '/b/unlocked?exchange=bitunix' }
    ]
  },
  {
    id: 'C', name: 'C · Freemium 7 days', status: 'built',
    summary: '7 free days of the free parts; then the freemium locks, but the account stays open.',
    screens: [
      { id: 'C-01', title: 'Create account (short)', path: '/c', note: 'Reuses B-01, trial copy' },
      { id: 'C-02', title: 'Verify email', path: '/c/verify?email=alex@example.com', note: 'Reuses A-03, step 2 of 2' },
      { id: 'C-03', title: 'Trial welcome · day 1 modal', path: '/c/welcome', note: 'Over the trial dashboard' },
      // C-04: one screen per trial day, each with the modal that opens on the first visit of that day.
      ...([
        [1, 'Welcome (C-03)'], [2, 'Beginner course'], [3, 'Live trading on Discord'], [4, 'Halfway · D3 nudge'],
        [5, 'Prize pools'], [6, 'Two days left · D5 nudge'], [7, 'Last day · D6 nudge']
      ] as const).map(([d, t]) => ({
        id: 'C-04', title: `Day ${d} · ${t}`, path: `/c/dashboard?day=${d}&modal=1`,
        variants: [{ label: 'With modal', path: `/c/dashboard?day=${d}&modal=1` }, { label: 'Dashboard only', path: `/c/dashboard?day=${d}&modal=0` }]
      })),
      { id: 'C-05', title: 'Locked feature paywall · trial copy', path: '/c/dashboard?day=2&sheet=cashback', note: 'Or tap any lock on C-04',
        variants: [['cashback', 'Monthly rewards'], ['ranking', 'Ranking'], ['courses', 'Advanced courses']].map(([k, l]) => ({ label: l, path: `/c/dashboard?day=2&sheet=${k}` })) },
      { id: 'C-06', title: 'Trial emails · D0, D5, D6', path: '/c/emails' },
      { id: 'C-07', title: 'In-app nudges · sidebar trial card', path: '/c/dashboard?day=4&modal=0', note: 'The day modals are under C-04',
        variants: [
          { label: 'D3 · day 4', path: '/c/dashboard?day=4&modal=0' },
          { label: 'D5 · day 6', path: '/c/dashboard?day=6&modal=0' },
          { label: 'D6 · day 7', path: '/c/dashboard?day=7&modal=0' }
        ] },
      { id: 'C-08', title: 'Day 8 · not connected', path: '/c/dashboard?day=8', note: 'Backend check; opens the lock wall' },
      { id: 'C-09', title: 'Lock wall paywall', path: '/c/locked', note: 'Over the locked platform' },
      { id: 'C-10', title: 'Reactivation emails · D8, D14, D30', path: '/c/emails/reactivation' },
      { id: 'C-11', title: 'Reactivation landing', path: '/c/back?email=reactivation_d8', note: 'Where every C-10 email lands',
        variants: [
          { label: 'Signed in', path: '/c/back?email=reactivation_d8' },
          { label: 'Session expired', path: '/c/back?email=reactivation_d8&session=expired' }
        ] },
      { id: 'C-12', title: 'Connect · reuses A-07 to A-17', path: '/c/connect' },
      { id: 'C-13', title: 'Dashboard · fully unlocked', path: '/c/unlocked?exchange=bitunix' }
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
      { id: 'A-09', title: 'Before you start · fresh account', path: '/connect?exchange=bitunix&fresh=1' },
      { id: 'A-19', title: 'Didn’t work · not opened through TradeX', path: '/connect/failed?exchange=bitunix&reason=not_linked' },
      { id: 'A-19', title: 'Didn’t work · UID not found', path: '/connect/failed?exchange=pionex&reason=not_found' },
      { id: 'A-20', title: 'Help drawer', path: '/connect/kyc?exchange=bitunix', note: 'Open “Help” on any connect step' },
      { id: 'EU', title: 'Prize pool rules (draft)', path: '/prize-pool-rules', note: 'Linked from the EU risk lines' }
    ]
  },
  {
    group: 'New feature (wireframe)',
    screens: [
      { id: 'ADV', title: 'Advent Calendar · sponsored by Kraken', path: '/advent', note: 'Sidebar → Advent Calendar event card',
        variants: [{ label: 'V1 · Bento', path: '/advent' }, { label: 'V2 · Equal cards', path: '/advent?layout=grid' }, { label: 'V3 · Carousel', path: '/advent?layout=carousel' }, { label: 'Stream off air', path: '/advent?live=0' }] },
      { id: 'ADV', title: 'Advent Calendar · Kraken connected, ticket taken', path: '/advent?kraken=1&ticket=1',
        variants: [{ label: 'V1 · Bento', path: '/advent?kraken=1&ticket=1' }, { label: 'V2 · Equal cards', path: '/advent?kraken=1&ticket=1&layout=grid' }, { label: 'V3 · Carousel', path: '/advent?kraken=1&ticket=1&layout=carousel' }] }
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
