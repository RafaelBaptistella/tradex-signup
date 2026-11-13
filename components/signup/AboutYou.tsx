'use client';

/**
 * Flow A · A-04 · About you (step 3 of 6).
 * Canvas requirements: 2-3 quick questions to personalize the next screens: experience level
 * (new / some / pro), goal (learn, cashback, community), already trade on an exchange? which one.
 * Event: profile_answered {level, goal, current_exchange}.
 * Answers are kept for the session (tx_profile) and drive the A-07 recommendation and A-05.
 */
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepHeader, PrimaryButton, HelpButton, styles as s } from './parts';
import { SIGNUP_STEPS } from '@/lib/flow';
import { stepProps, track } from '@/lib/track';
import type { Profile } from '@/lib/exchanges';
import { VERIFIED_KEY } from './VerifyEmail';

type Q = { key: keyof Profile; label: string; options: { value: string; title: string; hint?: string }[] };

const QUESTIONS: Q[] = [
  { key: 'level', label: 'How much have you traded?', options: [
    { value: 'new', title: 'I’m new', hint: 'Never or hardly ever' },
    { value: 'some', title: 'A bit', hint: 'A few trades so far' },
    { value: 'pro', title: 'A lot', hint: 'I trade regularly' }
  ] },
  { key: 'goal', label: 'What do you want from TradeX first?', options: [
    { value: 'learn', title: 'Learn to trade' },
    { value: 'cashback', title: 'Earn cashback' },
    { value: 'community', title: 'Trade with others' }
  ] },
  { key: 'current_exchange', label: 'Do you already trade on an exchange?', options: [
    { value: 'none', title: 'Not yet' },
    { value: 'bitunix', title: 'Bitunix' },
    { value: 'pionex', title: 'Pionex' },
    { value: 'other', title: 'Another one' }
  ] }
];

const P = stepProps('about_you');

export default function AboutYou() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Profile>({});
  const viewed = useRef(false);

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    track('signup_step_viewed', P);
    try { setAnswers(JSON.parse(sessionStorage.getItem('tx_profile') || '{}')); } catch { /* start empty */ }
  }, []);

  // Back always lands on step 2, which shows the confirmed state instead of sending a new code.
  const back = () => {
    let email = '';
    try { email = sessionStorage.getItem(VERIFIED_KEY) || ''; } catch { /* no email known */ }
    router.push(email ? '/verify?email=' + encodeURIComponent(email) : '/account');
  };

  const done = QUESTIONS.every((q) => answers[q.key]);

  const submit = () => {
    if (!done) return;
    try { sessionStorage.setItem('tx_profile', JSON.stringify(answers)); } catch { /* recommendation falls back to the default */ }
    track('profile_answered', { ...P, level: answers.level, goal: answers.goal, current_exchange: answers.current_exchange });
    router.push('/plan');
  };

  return (
    <main className={s.centerPage}>
      <div className={s.mountains} aria-hidden><div className={s.noise} /></div>
      <div className={s.grid} aria-hidden />

      <div className={s.centerMain}>
        <StepHeader step={3} total={SIGNUP_STEPS} onBack={back} />

        <div className={`${s.centerContent} ${s.medium}`}>
          <div className={s.intro}>
            <h1 className={s.title}>A bit about you</h1>
            <p className={s.lead}>Three quick taps, so TradeX shows you what fits you first.</p>
          </div>

          {QUESTIONS.map((q) => (
            <fieldset key={q.key} className={s.question}>
              <legend className={s.questionLabel}>{q.label}</legend>
              <div className={`${s.choices} ${q.options.length === 4 ? s.choices4 : ''}`}>
                {q.options.map((o) => {
                  const on = answers[q.key] === o.value;
                  return (
                    <label key={o.value} className={`${s.choice} ${on ? s.choiceOn : ''}`}>
                      <input type="radio" className="sr-only" name={q.key} value={o.value} checked={on}
                        onChange={() => setAnswers((a) => ({ ...a, [q.key]: o.value }))} />
                      <b>{o.title}</b>
                      {o.hint && <span>{o.hint}</span>}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <div className={s.choiceActions}>
            <PrimaryButton onClick={submit} disabled={!done}>Continue</PrimaryButton>
            <p className={s.hint}>{done ? 'You can come back and change these.' : `${QUESTIONS.filter((q) => !answers[q.key]).length} left to answer`}</p>
          </div>
        </div>

        <div className={s.spacer} aria-hidden />
      </div>

      <HelpButton stepKey="about_you">
        <h2>Why do we ask?</h2>
        <p>Your answers decide which courses and rewards we show you first, and which exchange we suggest. Nothing is shared with the exchange.</p>
      </HelpButton>
    </main>
  );
}
