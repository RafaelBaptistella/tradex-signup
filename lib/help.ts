/**
 * A-20 · Help drawer content per connect step (A-09 to A-14). `{ex}` is replaced by the exchange name.
 * Answers only use facts we have from the partner prints and César's notes.
 */
export type HelpStep = 'connect_prepare' | 'connect_open' | 'connect_signup' | 'connect_kyc' | 'connect_find_uid' | 'connect_uid';

export const HELP: Record<HelpStep, { number: number; name: string; video: string; faq: { q: string; a: string }[] }> = {
  connect_prepare: {
    number: 0, name: 'Before you start', video: 'What you need before you start',
    faq: [
      { q: 'I don’t have my ID right now', a: 'No problem. You can do the first two steps now and the ID check later. We save where you stopped.' },
      { q: 'Which email should I use?', a: 'Any email you can open now that has no {ex} account yet. {ex} sends a code to it.' },
      { q: 'Do I need to deposit money?', a: 'Not to connect. You only need a deposit when you want to trade.' }
    ]
  },
  connect_open: {
    number: 1, name: 'Open {ex} through TradeX', video: 'Opening {ex} with the TradeX link',
    faq: [
      { q: 'The {ex} page didn’t open', a: 'Your browser may have blocked the new tab. Allow pop-ups for TradeX, or use “Open {ex} again”.' },
      { q: 'The code field is empty', a: 'Copy the TradeX code on this page and paste it in the code field on {ex}. Without it, the account isn’t linked to TradeX.' },
      { q: 'I opened {ex} without the TradeX button', a: 'Close that tab and use the button on this page, so {ex} knows you came from TradeX.' }
    ]
  },
  connect_signup: {
    number: 2, name: 'Sign up on {ex}', video: 'Signing up on {ex}, screen by screen',
    faq: [
      { q: 'No code from {ex}', a: 'Check your spam folder, or ask {ex} for a new code on their page.' },
      { q: '“Email already registered”', a: 'That email already has a {ex} account. Use another email address.' },
      { q: 'My password isn’t accepted', a: 'Use 8 to 40 characters with numbers, upper and lower case letters and a symbol.' }
    ]
  },
  connect_kyc: {
    number: 3, name: 'Verify your identity', video: 'The {ex} ID check, step by step',
    faq: [
      { q: 'My photo was rejected', a: 'Take it again in good light, with all four corners of the ID in the frame and no glare.' },
      { q: 'The face check failed', a: 'Look straight at the camera, take off glasses or a hat, and make sure your face is well lit.' },
      { q: 'It says “under review”', a: 'That’s fine. You can continue: your UID is ready already.' }
    ]
  },
  connect_find_uid: {
    number: 4, name: 'Find your UID', video: 'Where to find your {ex} UID',
    faq: [
      { q: 'I can’t find my UID', a: 'Make sure you’re signed in to the {ex} account you just opened through TradeX. The UID is in the profile menu, under your email.' },
      { q: 'I only see asterisks', a: 'Tap the copy icon: it copies the full number. The eye icon shows it.' }
    ]
  },
  connect_uid: {
    number: 5, name: 'Paste your UID', video: 'Pasting your UID',
    faq: [
      { q: 'Not sure it’s the right number?', a: 'Go back one step to see where the UID is. It’s only numbers, and it’s not your email or the TradeX code.' },
      { q: '“Already connected to another account”', a: 'That UID is linked to another TradeX account. Log in there if it’s yours, or talk to us.' }
    ]
  }
};

/** Placeholder until we have the real support channel link. */
export const DISCORD_SUPPORT = 'https://discord.com';

export const fill = (s: string, ex: string) => s.replaceAll('{ex}', ex);
