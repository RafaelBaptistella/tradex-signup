/**
 * EU rules for the email previews (UWG §7, GDPR art. 6/7).
 * Marketing emails go only to people who ticked "Email me tips and reminders" at signup (tx_marketing).
 * Entering the 6-digit code sent to that address confirms it, which serves as the double opt-in (to confirm with legal).
 * Service notices (trial start, trial ending, access paused) go to everyone with an account.
 */
export type EmailKind = 'marketing' | 'service';

const KIND: Record<string, EmailKind> = {
  trial_d0: 'service', trial_d5: 'marketing', trial_d6: 'service',
  softlock_d1: 'marketing', softlock_d3: 'marketing',
  reactivation_d8: 'service', reactivation_d14: 'marketing', reactivation_d30: 'marketing',
  connect_resume_1h: 'marketing', connect_resume_24h: 'marketing', connect_resume_72h: 'marketing'
};

export const kindOf = (id: string): EmailKind => KIND[id] ?? 'marketing';

export const RULES_NOTE = 'EU rules: emails marked “Opt-in only” go only to people who ticked “Email me tips and reminders” at signup. Service notices go to everyone with an account.';

export const tag = (id: string) => (kindOf(id) === 'marketing' ? 'Opt-in only' : 'Service notice');

export const footer = (id: string) => (kindOf(id) === 'marketing'
  ? 'You get this email because you asked for TradeX tips and reminders.'
  : 'You get this service email because you have a TradeX account.');
