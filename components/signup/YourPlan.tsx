'use client';

/**
 * Flow A · A-05 · Your plan (step 4 of 6).
 * Canvas requirements: personalized benefit list from the A-04 answers (e.g. beginners see courses first),
 * rank 1 → 10 path preview. (The cashback estimate was removed: rewards come from the monthly leaderboard, not a share of fees.)
 * Event: guided_plan_viewed.
 */
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepHeader, PrimaryButton, HelpButton, Lines, Disclosure, styles as s } from './parts';
import { useEU } from '@/lib/compliance';
import { SIGNUP_STEPS } from '@/lib/flow';
import { readProfile, type Profile } from '@/lib/exchanges';
import { stepProps, track } from '@/lib/track';

const P = stepProps('your_plan');

type Item = { key: string; title: string; text: string };
const ITEMS: Record<string, Item> = {
  courses: { key: 'courses', title: '70h+ of courses', text: 'Start with the basics and move to advanced strategies at your own pace.' },
  cashback: { key: 'cashback', title: 'Monthly rewards for top traders', text: 'Your trading volume puts you on the leaderboard, and the top traders share a prize pool.' },
  community: { key: 'community', title: 'Discord + daily live trading', text: 'Trade alongside the community and the coaches every day.' }
};

/** Order by goal ('cashback' = the leaderboard-rewards goal); beginners always get courses first. */
function planFor(p: Profile): Item[] {
  const order = p.goal === 'cashback' ? ['cashback', 'courses', 'community']
    : p.goal === 'community' ? ['community', 'courses', 'cashback']
    : ['courses', 'community', 'cashback'];
  if (p.level === 'new' && order.indexOf('courses') > order.indexOf('cashback')) {
    order.splice(order.indexOf('courses'), 1); order.splice(order.indexOf('cashback'), 0, 'courses');
  }
  return order.map((k) => ITEMS[k]);
}

const HEADLINE: Record<string, string> = {
  new: 'Your plan to start trading',
  some: 'Your plan to trade with more confidence',
  pro: 'Your plan to earn more from your trading'
};

/** EU rules: no promise to "earn more" from trading. */
const HEADLINE_EU: Record<string, string> = { ...HEADLINE, pro: 'Your plan to grow as a trader' };

/** EU rules: no signal group (may count as investment advice) and no funded challenges until legal confirms them. */
const UNLOCKS_EU = [
  { at: 1, text: 'Courses, community and the leaderboard' },
  { at: 4, text: 'Trading indicators and tools' },
  { at: 7, text: 'Live trading sessions with the coaches' },
  { at: 10, text: 'Strategy call with Tim' }
];

/** Rank path preview. Which rank unlocks what is not confirmed yet, so unlocks are shown as examples along the path. */
const UNLOCKS = [
  { at: 1, text: 'Courses, community and the leaderboard' },
  { at: 4, text: 'Trading indicators and tools' },
  { at: 7, text: 'Signal group and live calls' },
  { at: 10, text: 'Strategy call with Tim and funded challenges' }
];


export default function YourPlan() {
  const router = useRouter();
  const eu = useEU();
  const [profile, setProfile] = useState<Profile>({});
  const viewed = useRef(false);

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    const p = readProfile();
    setProfile(p);
    track('signup_step_viewed', P);
    track('guided_plan_viewed', { ...P, level: p.level, goal: p.goal });
  }, []);

  const plan = planFor(profile);

  return (
    <main className={s.centerPage}>
      <div className={s.mountains} aria-hidden><div className={s.noise} /></div>
      <div className={s.grid} aria-hidden />

      <div className={s.centerMain}>
        <StepHeader step={4} total={SIGNUP_STEPS} onBack={() => router.push('/about')} />

        <div className={`${s.centerContent} ${s.medium}`}>
          <div className={s.intro}>
            <h1 className={s.title}>{(eu ? HEADLINE_EU : HEADLINE)[profile.level || ''] || 'Your plan on TradeX'}</h1>
            <p className={s.lead}>Based on your answers, this is where we’d start.</p>
          </div>

          <section className={s.planBlock} aria-labelledby="plan-first">
            <h2 id="plan-first" className={s.questionLabel}>First for you</h2>
            <ol className={s.planList}>
              {plan.map((it, i) => (
                <li key={it.key} className={s.welcomeCard}>
                  <b className={s.planNum}>{i + 1}</b>
                  <div>
                    <h3 className={s.welcomeCardTitle}>{it.title}</h3>
                    <p className={s.welcomeCardText}>{it.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className={s.planBlock} aria-labelledby="plan-path">
            <h2 id="plan-path" className={s.questionLabel}>Your path: rank 1 to 10</h2>
            <div className={s.planCard}>
              <ol className={s.path}>
                {(eu ? UNLOCKS_EU : UNLOCKS).map((u, i) => (
                  <li key={u.at} className={i === 0 ? s.pathOn : ''} aria-current={i === 0 ? 'step' : undefined}>
                    <span className={s.pathMark} aria-hidden />
                    <span className={s.unlockAt}>Rank {u.at}</span>
                    <span className={s.pathText}>{u.text}</span>
                  </li>
                ))}
              </ol>
              <p className={s.hint}><Lines text={eu ? 'You start at rank 1. Your trading volume moves you up. These unlocks are examples and can change.' : 'You start at rank 1. Your trading volume moves you up.'} /></p>
            </div>
          </section>

          <div className={s.choiceActions}>
            <PrimaryButton onClick={() => router.push('/why-connect')}>Continue</PrimaryButton>
            {eu && <Disclosure />}
          </div>
        </div>

        <div className={s.spacer} aria-hidden />
      </div>

      <HelpButton stepKey="your_plan">
        <h2>What is this plan?</h2>
        <p>A starting point based on your three answers. Everything on TradeX stays open to you; this only decides what we show you first.</p>
      </HelpButton>
    </main>
  );
}
