'use client';

/**
 * Flow A · A-01 · Welcome · what you get (step 0 of 6).
 * Canvas requirements: benefit blocks (monthly leaderboard rewards, 70h+ courses, 10-rank system,
 * Discord + daily live trading, €0 platform fees), social proof (8,432 active traders),
 * progress bar at step 0 of 6, CTA "Kostenlos starten" (English UI: "Start for free").
 * Events: register_page_viewed {brand, utm_source, utm_campaign, ref_link}, guided_welcome_viewed.
 * Built in the centered 2FA layout (Figma 645:22899) with the exchange-card surfaces (Figma 498:4222).
 */
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StepHeader, PrimaryButton, HelpButton, Lines, Disclosure, styles as s } from './parts';
import { useEU } from '@/lib/compliance';
import { SIGNUP_STEPS } from '@/lib/flow';
import { setFlow, rememberBrand, stepProps, track } from '@/lib/track';

const BENEFITS = [
  // Icons from the Figma icon library (12:339): Trophy, Education, Skill-level--advanced, Forum, Currency--euro.
  { key: 'rewards', icon: 'trophy', title: 'Monthly rewards for top traders', text: 'Your trading volume puts you on the leaderboard. Each month, the top traders share a prize pool.' },
  { key: 'courses', icon: 'education', title: '70h+ of courses', text: 'From your first trade to advanced strategies, at your own pace.' },
  { key: 'ranks', icon: 'skill-level', title: '10 ranks to climb', text: 'Your volume moves you up. Each rank unlocks exclusive rewards, like tools and classes.' },
  { key: 'community', icon: 'forum', title: 'Discord + daily live trading', text: 'Trade alongside the community and the coaches every day.' },
  { key: 'fees', icon: 'currency-euro', title: '€0 platform fees', text: 'TradeX is free. You only pay the exchange’s usual fees.' }
];

/** Placeholder until marketing confirms the live number. */
const ACTIVE_TRADERS = '8,432';

export default function Welcome() {
  const router = useRouter();
  const eu = useEU();
  const params = useSearchParams();
  const viewed = useRef(false);

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    setFlow('a');
    rememberBrand(params.get('brand'));
    track('register_page_viewed', {
      ...stepProps('welcome'),
      utm_source: params.get('utm_source') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      ref_link: params.get('ref') || undefined
    });
    track('guided_welcome_viewed', stepProps('welcome'));
  }, [params]);

  // Leaving A-01 shows up as signup_step_viewed on A-02, so the CTA needs no event of its own.
  const start = () => router.push('/account');

  return (
    <main className={s.centerPage}>
      <div className={s.glow} aria-hidden><div className={s.noise} /></div>
      <div className={s.grid} aria-hidden />

      <div className={s.centerMain}>
        <StepHeader step={0} total={SIGNUP_STEPS} backHref="https://www.trade-x.de" />

        <div className={`${s.centerContent} ${s.wide}`}>
          <div className={s.centerIntro}>
            <Image src="/signup/logo-tradex.svg" alt="TradeX" width={98} height={24} priority />
            <h1 className={`${s.title} ${s.titleTop}`}>Trade, learn and get rewarded</h1>
            <p className={s.lead}>Everything you get with a free TradeX account.</p>
          </div>

          <ul className={s.welcomeGrid}>
            {BENEFITS.map((b, i) => (
              <li key={b.key} className={`${s.welcomeCard} ${i === 0 ? s.welcomeCardLead : ''}`}>
                <span className={s.iconTile}><Image src={`/signup/icons/${b.icon}.svg`} alt="" width={20} height={20} /></span>
                <div>
                  <h2 className={s.welcomeCardTitle}>{b.title}</h2>
                  <p className={s.welcomeCardText}><Lines text={b.text} /></p>
                </div>
              </li>
            ))}
          </ul>

          <div className={s.welcomeCta}>
            <p className={s.proof}><span className={s.proofDot} aria-hidden />{ACTIVE_TRADERS} active traders on TradeX</p>
            <PrimaryButton onClick={start}>Start for free</PrimaryButton>
            <p className={s.linkRow}><span>Already have an account?</span><a className={s.link} href="/login">Log in</a></p>
            {eu && <Disclosure />}
          </div>
        </div>

        <div className={s.spacer} aria-hidden />
      </div>

      <HelpButton stepKey="welcome">
        <h2>How does it work?</h2>
        <p>You create a free account, answer three quick questions and connect an exchange account opened through TradeX. We guide you through every step, and your progress is saved.</p>
      </HelpButton>
    </main>
  );
}
