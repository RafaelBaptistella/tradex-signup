/**
 * Flow A ("a-guided") as laid out in César's canvas, lane A.
 * Signup has 6 steps (A-02 to A-07); A-01 is the welcome before step 1 ("step 0 of 6").
 * The connect part (A-09 to A-14) has its own "Step X of 5" tracker.
 */
export const SIGNUP_STEPS = 6;

export type StepKey = 'welcome' | 'account' | 'verify_email' | 'about_you' | 'your_plan' | 'why_connect' | 'exchange_choice';

export const STEPS: Record<StepKey, { number: number; node: string; path: string }> = {
  welcome:         { number: 0, node: 'A-01', path: '/' },
  account:         { number: 1, node: 'A-02', path: '/account' },
  verify_email:    { number: 2, node: 'A-03', path: '/verify' },
  about_you:       { number: 3, node: 'A-04', path: '/about' },
  your_plan:       { number: 4, node: 'A-05', path: '/plan' },
  why_connect:     { number: 5, node: 'A-06', path: '/why-connect' },
  exchange_choice: { number: 6, node: 'A-07', path: '/exchange' }
};

/** Screens not built yet, in flow order, so the prototype can still be clicked through. */
export const PLACEHOLDERS: Record<string, { node: string; title: string; step?: number; next: string }> = {
  explore:        { node: 'A-06 → Explore first', title: 'Where “Explore first” leads: to decide', next: '/exchange' },
};

export const BRANDS = ['tim', 'markus', 'lucas'] as const;
