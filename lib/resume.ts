/**
 * A-21 · Resume emails. People who stop mid-connect get up to three emails that bring them back to the exact step.
 * Steps follow the connect tracker (A-09 = 0, A-10 to A-14 = 1–5).
 */
export const CONNECT_ROUTES: { step: number; name: string; path: string }[] = [
  { step: 0, name: 'Before you start', path: '/connect' },
  { step: 1, name: 'Open the exchange through TradeX', path: '/connect/open' },
  { step: 2, name: 'Sign up on the exchange', path: '/connect/signup' },
  { step: 3, name: 'Verify your identity', path: '/connect/kyc' },
  { step: 4, name: 'Find your UID', path: '/connect/uid' },
  { step: 5, name: 'Paste your UID', path: '/connect/paste' }
];

export type EmailId = 'connect_resume_1h' | 'connect_resume_24h' | 'connect_resume_72h';

export const EMAILS: { id: EmailId; delay: string }[] = [
  { id: 'connect_resume_1h', delay: '1 hour after they stop' },
  { id: 'connect_resume_24h', delay: '24 hours after they stop' },
  { id: 'connect_resume_72h', delay: '72 hours after they stop' }
];

/** Deep link the emails use. UTM tags follow the canvas dev brief. */
export const resumeLink = (email: EmailId, step: number, exchange: string) =>
  `/resume?step=${step}&exchange=${exchange}&email=${email}&utm_source=email&utm_campaign=${email}`;
